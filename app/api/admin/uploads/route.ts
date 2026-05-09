import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { validateImageUploadFile } from "@/lib/uploads";
import { uploadBufferToS3 } from "@/lib/s3";

const UPLOAD_FIELD_NAME = "file";

function createJsonError(message: string, status: number) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
    },
  );
}

function buildUploadKey(extension: string) {
  const datePrefix = new Date().toISOString().slice(0, 10).replaceAll("-", "/");
  return `uploads/${datePrefix}/${randomUUID()}.${extension}`;
}

function sanitizeFileName(fileName: string) {
  const trimmedFileName = fileName.trim();

  if (!trimmedFileName) {
    return "image";
  }

  return trimmedFileName.replace(/["\r\n]/g, "_");
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return createJsonError("Unauthorized.", 401);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
    return createJsonError(
      "Expected multipart/form-data with an image file.",
      400,
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return createJsonError("Invalid multipart form payload.", 400);
  }

  const fileValue = formData.get(UPLOAD_FIELD_NAME);

  if (!(fileValue instanceof File)) {
    return createJsonError(`Missing "${UPLOAD_FIELD_NAME}" file field.`, 400);
  }

  let validatedFile: ReturnType<typeof validateImageUploadFile>;

  try {
    validatedFile = validateImageUploadFile(fileValue);
  } catch (error) {
    return createJsonError(
      error instanceof Error ? error.message : "Invalid image upload.",
      400,
    );
  }

  try {
    const safeFileName = sanitizeFileName(fileValue.name);
    const uploadedObject = await uploadBufferToS3({
      body: Buffer.from(await fileValue.arrayBuffer()),
      cacheControl: "public, max-age=31536000, immutable",
      contentDisposition: `inline; filename="${safeFileName}"`,
      contentType: validatedFile.contentType,
      key: buildUploadKey(validatedFile.extension),
      metadata: {
        originalFileName: safeFileName,
      },
    });

    return NextResponse.json({
      key: uploadedObject.key,
      size: validatedFile.size,
      url: uploadedObject.url,
    });
  } catch (error) {
    console.error("Failed to upload admin image.", error);

    return createJsonError("Failed to store image.", 500);
  }
}
