const BYTES_PER_MEGABYTE = 1024 * 1024;

export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 5 * BYTES_PER_MEGABYTE;

export const ALLOWED_IMAGE_MIME_TYPES = {
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AllowedImageMimeType = keyof typeof ALLOWED_IMAGE_MIME_TYPES;

function isAllowedImageMimeType(
  mimeType: string,
): mimeType is AllowedImageMimeType {
  return mimeType in ALLOWED_IMAGE_MIME_TYPES;
}

export function validateImageUploadFile(file: File) {
  if (!file.size) {
    throw new Error("Image file must not be empty.");
  }

  if (file.size > MAX_IMAGE_UPLOAD_SIZE_BYTES) {
    throw new Error(
      `Image file must be ${MAX_IMAGE_UPLOAD_SIZE_BYTES / BYTES_PER_MEGABYTE}MB or smaller.`,
    );
  }

  if (!isAllowedImageMimeType(file.type)) {
    throw new Error(
      "Unsupported image type. Allowed types: image/jpeg, image/png, image/webp, image/gif.",
    );
  }

  return {
    contentType: file.type,
    extension: ALLOWED_IMAGE_MIME_TYPES[file.type],
    size: file.size,
  };
}

