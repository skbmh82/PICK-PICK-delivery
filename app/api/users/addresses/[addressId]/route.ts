import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const LABELS = ["집", "회사", "기타"] as const;

const UpdateAddressSchema = z.object({
  label:     z.enum(LABELS).optional(),
  address:   z.string().min(2).max(200).optional(),
  detail:    z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

// PATCH /api/users/addresses/[addressId] — 주소 수정 또는 기본 주소 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 본인 주소인지 확인
  const { data: existing } = await admin
    .from("user_addresses")
    .select("id, is_default")
    .eq("id", addressId)
    .eq("user_id", profile.id)
    .single();
  if (!existing) return NextResponse.json({ error: "주소를 찾을 수 없습니다" }, { status: 404 });

  const body   = await request.json().catch(() => null);
  const parsed = UpdateAddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { label, address, detail, isDefault } = parsed.data;

  // 기본 주소로 설정하는 경우 기존 기본 주소 해제
  if (isDefault === true) {
    await admin
      .from("user_addresses")
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq("user_id", profile.id);
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (label     !== undefined) updates.label      = label;
  if (address   !== undefined) updates.address    = address;
  if (detail    !== undefined) updates.detail     = detail || null;
  if (isDefault !== undefined) updates.is_default = isDefault;

  const { data: updated, error: updateErr } = await admin
    .from("user_addresses")
    .update(updates)
    .eq("id", addressId)
    .select("id, label, address, detail, is_default")
    .single();

  if (updateErr) {
    return NextResponse.json({ error: "주소 수정에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({
    address: {
      id:        updated.id,
      label:     updated.label,
      address:   updated.address,
      detail:    updated.detail ?? "",
      isDefault: updated.is_default,
    },
  });
}

// DELETE /api/users/addresses/[addressId] — 주소 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ addressId: string }> }
) {
  const { addressId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 본인 주소인지 확인
  const { data: existing } = await admin
    .from("user_addresses")
    .select("id, is_default")
    .eq("id", addressId)
    .eq("user_id", profile.id)
    .single();
  if (!existing) return NextResponse.json({ error: "주소를 찾을 수 없습니다" }, { status: 404 });

  const { error: deleteErr } = await admin
    .from("user_addresses")
    .delete()
    .eq("id", addressId);

  if (deleteErr) {
    return NextResponse.json({ error: "주소 삭제에 실패했습니다" }, { status: 500 });
  }

  // 삭제된 게 기본 주소였다면 가장 오래된 주소를 기본으로 승격
  if (existing.is_default) {
    const { data: oldest } = await admin
      .from("user_addresses")
      .select("id")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (oldest) {
      await admin
        .from("user_addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", oldest.id);
    }
  }

  return NextResponse.json({ ok: true });
}
