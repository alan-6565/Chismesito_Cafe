import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { uploadMenuPhoto } from "@/lib/menu-photos";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const form = await req.formData();
  const file = form.get("photo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing photo" }, { status: 400 });
  }

  const result = await uploadMenuPhoto(id, file);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const { error } = await supabaseAdmin.from("menu_items").update({ image_url: result.url }).eq("id", id);
  if (error) return NextResponse.json({ error: "Could not save photo" }, { status: 500 });

  return NextResponse.json({ imageUrl: result.url });
}
