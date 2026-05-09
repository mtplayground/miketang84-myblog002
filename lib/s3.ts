import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import { loadS3Env, type S3Env } from "@/lib/env";

type EnvSource = Record<string, string | undefined>;

export type UploadBufferInput = {
  body: ArrayBuffer | Buffer | Uint8Array;
  cacheControl?: string;
  contentDisposition?: string;
  contentType: string;
  key: string;
  metadata?: Record<string, string>;
};

export type UploadedS3Object = {
  bucket: string;
  key: string;
  url: string;
};

let cachedClient: S3Client | undefined;

function getS3ClientConfig(env: S3Env) {
  return {
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    region: env.S3_REGION,
  };
}

function normalizeObjectKey(key: string) {
  const normalizedKey = key.replace(/^\/+/, "").trim();

  if (!normalizedKey) {
    throw new Error("S3 object key must not be empty.");
  }

  return normalizedKey;
}

function normalizeBody(body: UploadBufferInput["body"]) {
  if (body instanceof ArrayBuffer) {
    return new Uint8Array(body);
  }

  return body;
}

function buildPutObjectInput(
  env: S3Env,
  input: UploadBufferInput,
): PutObjectCommandInput {
  return {
    Body: normalizeBody(input.body),
    Bucket: env.S3_BUCKET,
    CacheControl: input.cacheControl,
    ContentDisposition: input.contentDisposition,
    ContentType: input.contentType,
    Key: normalizeObjectKey(input.key),
    Metadata: input.metadata,
  };
}

export function getS3Client(source: EnvSource = process.env) {
  const env = loadS3Env(source);

  if (source === process.env && cachedClient) {
    return cachedClient;
  }

  const client = new S3Client(getS3ClientConfig(env));

  if (source === process.env) {
    cachedClient = client;
  }

  return client;
}

export function resolvePublicS3Url(
  key: string,
  source: EnvSource = process.env,
) {
  const env = loadS3Env(source);
  const normalizedKey = normalizeObjectKey(key);
  const publicBaseUrl = env.S3_PUBLIC_URL.endsWith("/")
    ? env.S3_PUBLIC_URL
    : `${env.S3_PUBLIC_URL}/`;

  return new URL(normalizedKey, publicBaseUrl).toString();
}

export async function uploadBufferToS3(
  input: UploadBufferInput,
  source: EnvSource = process.env,
): Promise<UploadedS3Object> {
  const env = loadS3Env(source);
  const commandInput = buildPutObjectInput(env, input);
  const client = getS3Client(source);

  try {
    await client.send(new PutObjectCommand(commandInput));
  } catch (error) {
    throw new Error(
      `Failed to upload object "${commandInput.Key}" to bucket "${env.S3_BUCKET}".`,
      {
        cause: error,
      },
    );
  }

  return {
    bucket: env.S3_BUCKET,
    key: commandInput.Key ?? normalizeObjectKey(input.key),
    url: resolvePublicS3Url(commandInput.Key ?? input.key, source),
  };
}
