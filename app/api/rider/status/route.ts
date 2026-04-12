import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/rider/status — 라이더 현재 온라인 상태 + 이름
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ isActive: false, name: "라이더" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, name, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ isActive: false, name: "라이더" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: loc } = await (admin as any)
    .from("rider_locations")
    .select("is_active")
    .eq("rider_id", profile.id)
    .single();

  return NextResponse.json({
    isActive: loc?.is_active ?? false,
    name:     profile.name ?? "라이더",
  });
}
