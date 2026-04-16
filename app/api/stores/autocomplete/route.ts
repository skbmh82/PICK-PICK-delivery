import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/stores/autocomplete?q=검색어
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 1) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category")
    .eq("is_approved", true)
    .ilike("name", `%${q}%`)
    .limit(6);

  if (error) {
    return NextResponse.json({ suggestions: [] });
  }

  return NextResponse.json({ suggestions: data ?? [] });
}
