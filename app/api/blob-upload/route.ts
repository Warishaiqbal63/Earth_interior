import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { blobConfigured } from "@/lib/blob";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/upload-rules";

/** Issues short-lived upload tokens so the admin's browser can send photos straight to Vercel Blob. */
export async function POST(request: Request): Promise<NextResponse> {
  if (!blobConfigured()) {
    return NextResponse.json({ error: "Image storage isn't connected yet." }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!(await requireAdmin())) throw new Error("unauthorized");
        if (!pathname.startsWith("products/")) throw new Error("bad-path");
        return {
          allowedContentTypes: ALLOWED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
        };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "unauthorized";
    return NextResponse.json(
      { error: unauthorized ? "You were signed out. Sign in again to upload photos." : "Upload could not start. Try again." },
      { status: unauthorized ? 401 : 400 },
    );
  }
}
