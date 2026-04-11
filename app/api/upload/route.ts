import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ALLOWED_TYPES   = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB
const BUCKET          = "pick-pick-image";

// POST /api/upload — 이미지 업로드 (Supabase Storage)
// form-data: file (이미지), folder (menu | store | profile)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "폼 데이터를 읽을 수 없습니다" }, { status: 400 });
  }

  const file   = formData.get("file")   as File | null;
  const folder = formData.get("folder") as string | null ?? "misc";

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "JPG, PNG, WEBP, GIF 형식만 업로드 가능합니다" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "파일 크기는 5MB 이하여야 합니다" }, { status: 400 });
  }

  // 내부 userId 조회
  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  const ext      = file.name.split(".").pop() ?? "jpg";
  const filename = `${folder}/${profile.id}/${Date.now()}.${ext}`;
  const bytes    = await file.arrayBuffer();

  // admin 클라이언트로 Storage 업로드 (RLS 우회)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: uploadData, error: uploadError } = await (admin as any).storage
    .from(BUCKET)
    .upload(filename, bytes, {
      contentType:  file.type,
      cacheControl: "3600",
      upsert:       false,
    });

  if (uploadError) {
    console.error("Storage 업로드 오류:", uploadError.message);
    // 버킷이 없는 경우 안내
    if (uploadError.message?.includes("not found") || uploadError.message?.includes("Bucket")) {
      return NextResponse.json(
        { error: `Supabase Storage 버킷 "${BUCKET}"이 없습니다. 대시보드에서 버킷을 먼저 생성해주세요.` },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "이미지 업로드에 실패했습니다" }, { status: 500 });
  }

  // 공개 URL 생성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: urlData } = (admin as any).storage
    .from(BUCKET)
    .getPublicUrl(uploadData.path);

  return NextResponse.json({ url: urlData.publicUrl });
}
