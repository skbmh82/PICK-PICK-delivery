import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET — 저장된 데이터 전체 조회
export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("pick_connection_test")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

// POST — 새 메시지 저장
export async function POST(req: Request) {
  const supabase = createServerClient();
  const { message } = await req.json() as { message: string };

  if (!message?.trim()) {
    return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("pick_connection_test")
    .insert({ message: message.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

// DELETE — 전체 초기화
export async function DELETE() {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("pick_connection_test")
    .delete()
    .neq("id", 0); // 전체 삭제

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
