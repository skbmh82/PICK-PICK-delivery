import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/users/search?email=xxx — 이메일로 사용자 검색 (전송 대상 확인용)
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email || email.length < 3) {
    return NextResponse.json({ error: "이메일을 입력해주세요" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: found } = await admin
    .from("users")
    .select("id, name, email, profile_image")
    .eq("email", email)
    .neq("auth_id", user.id)   // 본인 제외
    .single();

  if (!found) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id:           found.id,
      name:         found.name,
      email:        found.email,
      profileImage: found.profile_image,
    },
  });
}
