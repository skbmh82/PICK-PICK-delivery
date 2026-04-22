import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PI_API_KEY  = process.env.PI_API_KEY ?? "";
const PI_API_BASE = "https://api.minepi.com";

interface PiMeResponse {
  uid: string;
  username: string;
}

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json() as { accessToken: string };
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken 필요" }, { status: 400 });
    }

    // 1. Pi API로 토큰 검증 → uid, username 획득
    const piRes = await fetch(`${PI_API_BASE}/v2/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Pi-App-Id": PI_API_KEY,
      },
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
    let role = "user";

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
          role:        "user",
        })
        .select("id")
        .single();

      if (newProfile?.id) {
        await admin.from("wallets").insert({ user_id: newProfile.id });
      }
    }

    // 3. Magic link 토큰 생성 → 클라이언트에서 verifyOtp로 세션 수립
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: piEmail,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      return NextResponse.json({ error: "인증 토큰 생성 실패" }, { status: 500 });
    }

    const res = NextResponse.json({
      email:        piEmail,
      hashed_token: linkData.properties.hashed_token,
      role,
    });

    res.cookies.set("pick-role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
