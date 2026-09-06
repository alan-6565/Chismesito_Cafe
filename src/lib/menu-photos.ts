import "server-only";
import { supabaseAdmin } from "./supabase";

const BUCKET = "menu-photos";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

let bucketReady: Promise<void> | null = null;

// Created on first use rather than requiring a manual Supabase dashboard
// step — public so menu photos can be served straight from Supabase's CDN
// without the app proxying every image request.
function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = supabaseAdmin.storage.getBucket(BUCKET).then(({ error }) => {
      if (error) {
        return supabaseAdmin.storage.createBucket(BUCKET, { public: true }).then(() => undefined);
      }
    });
  }
  return bucketReady;
}

export async function uploadMenuPhoto(
  itemId: string,
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: "Please upload a JPEG, PNG, or WebP image." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "Image is too large — please keep it under 5MB." };
  }

  await ensureBucket();

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Timestamped filename so replacing a photo gets a fresh URL instead of a
  // stale cached one at the same path.
  const path = `${itemId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "31536000" });

  if (uploadError) return { ok: false, error: "Upload failed, please try again." };

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
