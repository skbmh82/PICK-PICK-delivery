import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PI_API_BASE = "https://api.minepi.com";

interface PiMeResponse {
  uid: string;
  username: string;
}

interface TokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  expires_at?: number;
  refresh_token?: string;
  user?: unknown;
}

function derivePassword(piUid: string): string {
  return createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(`pi:${piUid}`)
    .digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { accessToken: string; role?: string };
    const { accessToken } = body;
    const requestedRole = ["user", "owner", "rider"].includes(body.role ?? "") ? body.role! : "user";
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken 필요" }, { status: 400 });
    }

    // 1. Pi API로 토큰 검증
    const piRes = await fetch(`${PI_API_BASE}/v2/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!piRes.ok) {
      return NextResponse.json({ error: "Pi 토큰 검증 실패" }, { status: 401 });
    }
    const piUser = await piRes.json() as PiMeResponse;
    const { uid: piUid, username: piUsername } = piUser;

    const admin = createAdminClient();
    const piEmail    = `pi_${piUid}@pi.pickpick.app`;
    const piPassword = derivePassword(piUid);

    // 2. 기존 Pi 사용자 조회
    const { data: existingProfile } = await admin
      .from("users")
      .select("id, auth_id, role")
      .eq("pi_uid", piUid)
      .single();

    let authUserId: string;
    let role = requestedRole;

    if (existingProfile) {
      authUserId = existingProfile.auth_id as string;
      role = (existingProfile.role as string) ?? "user";
      await admin
        .from("users")
        .update({ pi_username: piUsername, updated_at: new Date().toISOString() })
        .eq("pi_uid", piUid);
    } else {
      const { data: authData, error: createError } = await admin.auth.admin.createUser({
        email:         piEmail,
        password:      piPassword,
        email_confirm: true,
        user_metadata: { pi_uid: piUid, pi_username: piUsername },
      });

      if (createError || !authData.user) {
        const { data: { users } } = await admin.auth.admin.listUsers();
        const found = users.find((u) => u.email === piEmail);
        if (!found) {
          return NextResponse.json({ error: "계정 생성 실패" }, { status: 500 });
        }
        authUserId = found.id;
      } else {
        authUserId = authData.user.id;
      }

      const { data: newProfile } = await admin
        .from("users")
        .insert({
          auth_id:     authUserId,
          name:        piUsername,
          pi_uid:      piUid,
          pi_username: piUsername,
          role:        requestedRole,
        })
        .select("id")
        .single();

      if (newProfile?.id) {
        await admin.from("wallets").insert({ user_id: newProfile.id });
      }
    }

    // 3. password 동기화 후 토큰 획득
    const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    await admin.auth.admin.updateUserById(authUserId, { password: piPassword });

    const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method:  "POST",
      headers: {
        "apikey":       serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: piEmail, password: piPassword }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("[pi-login] token error:", tokenRes.status, errText);
      let detail = errText;
      try { detail = JSON.stringify(JSON.parse(errText)); } catch { /* raw text */ }
      return NextResponse.json(
        { error: `세션 생성 실패 (${tokenRes.status}): ${detail.slice(0, 200)}` },
        { status: 500 },
      );
    }

    const tokenData = await tokenRes.json() as TokenResponse;

    if (!tokenData.access_token || !tokenData.refresh_token) {
      console.error("[pi-login] missing tokens:", JSON.stringify(tokenData).slice(0, 200));
      return NextResponse.json({ error: "토큰 없음" }, { status: 500 });
    }

    // 4. @supabase/ssr 쿠키 포맷으로 직접 세션 쿠키 설정
    //    - 저장 키: 'supabase.auth.token' (auth-js 기본값)
    //    - 인코딩: 'base64-' + base64url(JSON.stringify(session))  ← createBrowserClient 기본 cookieEncoding
    const sessionObj = {
      access_token:  tokenData.access_token,
      token_type:    tokenData.token_type  ?? "bearer",
      expires_in:    tokenData.expires_in  ?? 3600,
      expires_at:    tokenData.expires_at  ?? Math.round(Date.now() / 1000) + 3600,
      refresh_token: tokenData.refresh_token,
      user:          tokenData.user        ?? null,
    };
    const sessionJson    = JSON.stringify(sessionObj);
    const encodedSession = "base64-" + Buffer.from(sessionJson).toString("base64url");

    const jsonRes = NextResponse.json({ role });

    const cookieOpts = {
      httpOnly: false,   // 브라우저 supabase 클라이언트가 document.cookie로 읽어야 함
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax"   as const,
      maxAge:   60 * 60 * 24 * 7,
      path:     "/",
    };

    jsonRes.cookies.set("supabase.auth.token", encodedSession, cookieOpts);
    jsonRes.cookies.set("pick-role", role, { ...cookieOpts, httpOnly: true });

    return jsonRes;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
