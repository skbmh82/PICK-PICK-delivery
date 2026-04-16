import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET /api/stores/recent?ids=id1,id2,...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("ids") ?? "";
  const ids = raw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);

  if (ids.length === 0) {
    return NextResponse.json({ stores: [] });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, image_url, rating, delivery_fee, is_open")
    .in("id", ids)
    .eq("is_approved", true);

  if (error) {
    return NextResponse.json({ stores: [] });
  }

  return NextResponse.json({ stores: data ?? [] });
}
