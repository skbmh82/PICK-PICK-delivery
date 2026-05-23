import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PI_API_BASE = "https://api.minepi.com";

interface PiMeResponse {
  uid: string;
  username: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { accessToken: string; role?: string };
    const { accessToken } = body;
    const requestedRole   = ["user", "owner", "rider"].includes(body.role ?? "") ? body.role! : "user";
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken 필요" }, { status: 400 });
    }

    // 1. Pi API로 토큰 검증 → uid, username 획득
    // API 키 불필요 — accessToken 하나로 /v2/me 검증
    const piRes = await fetch(`${PI_API_BASE}/v2/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!piRes.ok) {
      return NextResponse.json({ error: "Pi 토큰 검증 실패" }, { status: 401 });
    }
    const piUser = await piRes.json() as PiMeResponse;
    const { uid: piUid, username: piUsername } = piUser;

    const admin = createAdminClient();
    const piEmail = `pi_${piUid}@pi.pickpick.app`;

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
      // 신규 Pi 사용자 — Supabase Auth 계정 생성
      const { data: authData, error: createError } = await admin.auth.admin.createUser({
        email: piEmail,
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

      // users 프로필 + 지갑 생성
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

    // 3. Magic link 생성
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type:  "magiclink",
      email: piEmail,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      return NextResponse.json({ error: "인증 토큰 생성 실패" }, { status: 500 });
    }

    // 4. 서버에서 직접 OTP 검증 → access_token / refresh_token 획득
    //    (Pi Browser WebView에서 클라이언트 verifyOtp가 실패하는 문제 우회)
    const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/verify`, {
      method:   "POST",
      redirect: "manual",
      headers: {
        "apikey":         supabaseAnonKey,
        "Content-Type":   "application/json",
      },
      body: JSON.stringify({
        token_hash: linkData.properties.hashed_token,
        type:       "magiclink",
      }),
    });

    if (verifyRes.status >= 300 && verifyRes.status < 400) {
      console.error("[pi-login] verify redirected:", verifyRes.headers.get("location"));
      return NextResponse.json({ error: "세션 생성 실패 (redirect)" }, { status: 500 });
    }
    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      console.error("[pi-login] verify error:", verifyRes.status, errText);
      return NextResponse.json({ error: `세션 생성 실패 (${verifyRes.status})` }, { status: 500 });
    }

    interface SupabaseSession {
      access_token?: string;
      refresh_token?: string;
    }
    let sessionData: SupabaseSession;
    try {
      sessionData = await verifyRes.json() as SupabaseSession;
    } catch {
      return NextResponse.json({ error: "세션 응답 형식 오류" }, { status: 500 });
    }

    if (!sessionData.access_token || !sessionData.refresh_token) {
      console.error("[pi-login] missing tokens:", JSON.stringify(sessionData).slice(0, 100));
      return NextResponse.json({ error: "세션 토큰 없음" }, { status: 500 });
    }

    const res = NextResponse.json({
      access_token:  sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      role,
    });

    res.cookies.set("pick-role", role, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24 * 7,
      path:     "/",
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
