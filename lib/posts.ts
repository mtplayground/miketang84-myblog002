import "server-only";

import {
  PostStatus,
  Prisma,
  type PrismaClient,
  type Tag as PrismaTag,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const postWithTagsArgs = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: {
    tags: {
      include: {
        tag: true,
      },
      orderBy: {
        assignedAt: "asc",
      },
    },
  },
});

const tagWithCountArgs = Prisma.validator<Prisma.TagDefaultArgs>()({
  include: {
    _count: {
      select: {
        posts: true,
      },
    },
  },
});

type PostWithTags = Prisma.PostGetPayload<typeof postWithTagsArgs>;
type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export type TagInput =
  | string
  | {
      name: string;
      slug?: string;
    };

export type TagRecord = {
  createdAt: Date;
  id: string;
  name: string;
  postCount?: number;
  slug: string;
  updatedAt: Date;
};

export type PostRecord = {
  content: string;
  coverImageUrl: string | null;
  createdAt: Date;
  excerpt: string | null;
  id: string;
  publishedAt: Date | null;
  slug: string;
  status: PostStatus;
  tags: TagRecord[];
  title: string;
  updatedAt: Date;
};

export type ListPostsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: PostSortOption;
  status?: PostStatus | "all";
  tagSlug?: string;
};

export type ListAllPostsOptions = Omit<ListPostsOptions, "page" | "pageSize">;

export type ListPostsResult = {
  page: number;
  pageCount: number;
  pageSize: number;
  posts: PostRecord[];
  totalCount: number;
};

export type PostSortOption =
  | "created-desc"
  | "published-desc"
  | "title-asc"
  | "title-desc"
  | "updated-asc"
  | "updated-desc";

export type CreatePostInput = {
  content: string;
  coverImageUrl?: string | null;
  excerpt?: string | null;
  publishedAt?: Date | null | string;
  slug?: string;
  status?: PostStatus;
  tags?: TagInput[];
  title: string;
};

export type UpdatePostInput = {
  content?: string;
  coverImageUrl?: string | null;
  excerpt?: string | null;
  publishedAt?: Date | null | string;
  regenerateSlugFromTitle?: boolean;
  slug?: string | null;
  status?: PostStatus;
  tags?: TagInput[];
  title?: string;
};

type NormalizedTagInput = {
  name: string;
  slugBase: string;
};

function mapTagRecord(tag: PrismaTag, postCount?: number): TagRecord {
  return {
    createdAt: tag.createdAt,
    id: tag.id,
    name: tag.name,
    postCount,
    slug: tag.slug,
    updatedAt: tag.updatedAt,
  };
}

function mapPostRecord(post: PostWithTags): PostRecord {
  return {
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    createdAt: post.createdAt,
    excerpt: post.excerpt,
    id: post.id,
    publishedAt: post.publishedAt,
    slug: post.slug,
    status: post.status,
    tags: post.tags.map(({ tag }) => mapTagRecord(tag)),
    title: post.title,
    updatedAt: post.updatedAt,
  };
}

function normalizeRequiredString(value: string, fieldName: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalizedValue;
}

function normalizeNullableString(value: string | null | undefined) {
  if (typeof value !== "string") {
    return value ?? null;
  }

  const normalizedValue = value.trim();
  return normalizedValue || null;
}

function normalizeDateInput(value: Date | null | string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("publishedAt must be a valid date.");
    }

    return value;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("publishedAt must be a valid date.");
  }

  return parsedDate;
}

function slugify(value: string, fallback = "item") {
  const normalizedValue = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedValue || fallback;
}

function buildUniqueSlug(baseSlug: string, existingSlugs: string[]) {
  const normalizedBaseSlug = slugify(baseSlug);
  const existingSlugSet = new Set(existingSlugs);

  if (!existingSlugSet.has(normalizedBaseSlug)) {
    return normalizedBaseSlug;
  }

  let suffix = 2;

  while (existingSlugSet.has(`${normalizedBaseSlug}-${suffix}`)) {
    suffix += 1;
  }

  return `${normalizedBaseSlug}-${suffix}`;
}

async function resolveUniquePostSlug(
  client: DatabaseClient,
  value: string,
  excludePostId?: string,
) {
  const baseSlug = slugify(value, "post");
  const existingPosts = await client.post.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(excludePostId
        ? {
            id: {
              not: excludePostId,
            },
          }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  return buildUniqueSlug(
    baseSlug,
    existingPosts.map((post) => post.slug),
  );
}

async function resolveUniqueTagSlug(
  client: DatabaseClient,
  value: string,
  excludeTagId?: string,
) {
  const baseSlug = slugify(value, "tag");
  const existingTags = await client.tag.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
      ...(excludeTagId
        ? {
            id: {
              not: excludeTagId,
            },
          }
        : {}),
    },
    select: {
      slug: true,
    },
  });

  return buildUniqueSlug(
    baseSlug,
    existingTags.map((tag) => tag.slug),
  );
}

function normalizeTagInput(input: TagInput): NormalizedTagInput {
  if (typeof input === "string") {
    const normalizedName = normalizeRequiredString(input, "Tag name");
    return {
      name: normalizedName,
      slugBase: slugify(normalizedName, "tag"),
    };
  }

  const normalizedName = normalizeRequiredString(input.name, "Tag name");
  const slugSource = normalizeNullableString(input.slug) ?? normalizedName;

  return {
    name: normalizedName,
    slugBase: slugify(slugSource, "tag"),
  };
}

function normalizeTagInputs(inputs: TagInput[]) {
  const dedupedInputs = new Map<string, NormalizedTagInput>();

  for (const input of inputs) {
    const normalizedInput = normalizeTagInput(input);
    dedupedInputs.set(normalizedInput.slugBase, normalizedInput);
  }

  return [...dedupedInputs.values()];
}

async function syncTags(
  client: DatabaseClient,
  inputs: TagInput[] | undefined,
): Promise<TagRecord[]> {
  if (!inputs?.length) {
    return [];
  }

  const normalizedInputs = normalizeTagInputs(inputs);

  if (!normalizedInputs.length) {
    return [];
  }

  const requestedSlugs = normalizedInputs.map((input) => input.slugBase);
  const existingTags = await client.tag.findMany({
    where: {
      slug: {
        in: requestedSlugs,
      },
    },
  });

  const tagsBySlug = new Map(existingTags.map((tag) => [tag.slug, tag]));
  const resolvedTags: PrismaTag[] = [];

  for (const input of normalizedInputs) {
    const existingTag = tagsBySlug.get(input.slugBase);

    if (existingTag) {
      resolvedTags.push(existingTag);
      continue;
    }

    const uniqueSlug = await resolveUniqueTagSlug(client, input.slugBase);
    const createdTag = await client.tag.create({
      data: {
        name: input.name,
        slug: uniqueSlug,
      },
    });

    tagsBySlug.set(createdTag.slug, createdTag);
    resolvedTags.push(createdTag);
  }

  return resolvedTags
    .map((tag) => mapTagRecord(tag))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function normalizePagination(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safePageSize = Number.isFinite(pageSize)
    ? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
    : DEFAULT_PAGE_SIZE;

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize,
  };
}

function buildPostWhereClause(options: ListPostsOptions = {}): Prisma.PostWhereInput {
  const searchValue = normalizeNullableString(options.search);

  return {
    ...(options.status && options.status !== "all"
      ? {
          status: options.status,
        }
      : {}),
    ...(searchValue
      ? {
          OR: [
            {
              title: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              excerpt: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: searchValue,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
    ...(options.tagSlug
      ? {
          tags: {
            some: {
              tag: {
                slug: options.tagSlug,
              },
            },
          },
        }
      : {}),
  };
}

function buildPostOrderBy(sort: PostSortOption = "updated-desc") {
  switch (sort) {
    case "updated-asc":
      return [
        {
          updatedAt: "asc",
        },
      ] satisfies Prisma.PostOrderByWithRelationInput[];
    case "created-desc":
      return [
        {
          createdAt: "desc",
        },
      ] satisfies Prisma.PostOrderByWithRelationInput[];
    case "published-desc":
      return [
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ] satisfies Prisma.PostOrderByWithRelationInput[];
    case "title-asc":
      return [
        {
          title: "asc",
        },
      ] satisfies Prisma.PostOrderByWithRelationInput[];
    case "title-desc":
      return [
        {
          title: "desc",
        },
      ] satisfies Prisma.PostOrderByWithRelationInput[];
    case "updated-desc":
    default:
      return [
        {
          updatedAt: "desc",
        },
      ] satisfies Prisma.PostOrderByWithRelationInput[];
  }
}

function resolveStatusFields(
  nextStatus: PostStatus,
  publishedAtInput: Date | null | string | undefined,
  currentPublishedAt?: Date | null,
) {
  const normalizedPublishedAt = normalizeDateInput(publishedAtInput);

  if (nextStatus === PostStatus.PUBLISHED) {
    return {
      publishedAt: normalizedPublishedAt ?? currentPublishedAt ?? new Date(),
      status: PostStatus.PUBLISHED,
    };
  }

  return {
    publishedAt: null,
    status: PostStatus.DRAFT,
  };
}

export async function isPostSlugAvailable(
  slug: string,
  excludePostId?: string,
) {
  const normalizedSlug = slugify(slug, "post");
  const existingPost = await prisma.post.findFirst({
    where: {
      slug: normalizedSlug,
      ...(excludePostId
        ? {
            id: {
              not: excludePostId,
            },
          }
        : {}),
    },
    select: {
      id: true,
    },
  });

  return !existingPost;
}

export async function generateUniquePostSlug(
  titleOrSlug: string,
  excludePostId?: string,
) {
  return resolveUniquePostSlug(prisma, titleOrSlug, excludePostId);
}

export async function listPosts(
  options: ListPostsOptions = {},
): Promise<ListPostsResult> {
  const { page, pageSize, skip } = normalizePagination(
    options.page,
    options.pageSize,
  );
  const where = buildPostWhereClause(options);
  const orderBy = buildPostOrderBy(options.sort);

  const [totalCount, posts] = await prisma.$transaction([
    prisma.post.count({
      where,
    }),
    prisma.post.findMany({
      ...postWithTagsArgs,
      where,
      orderBy,
      skip,
      take: pageSize,
    }),
  ]);

  return {
    page,
    pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
    pageSize,
    posts: posts.map(mapPostRecord),
    totalCount,
  };
}

export async function listAllPosts(
  options: ListAllPostsOptions = {},
): Promise<PostRecord[]> {
  const posts = await prisma.post.findMany({
    ...postWithTagsArgs,
    where: buildPostWhereClause(options),
    orderBy: buildPostOrderBy(options.sort),
  });

  return posts.map(mapPostRecord);
}

export async function getPostById(postId: string) {
  const normalizedPostId = normalizeRequiredString(postId, "Post ID");
  const post = await prisma.post.findUnique({
    ...postWithTagsArgs,
    where: {
      id: normalizedPostId,
    },
  });

  return post ? mapPostRecord(post) : null;
}

export async function getPostBySlug(
  slug: string,
  options: {
    allowDraft?: boolean;
  } = {},
) {
  const normalizedSlug = normalizeRequiredString(slug, "Post slug");
  const post = await prisma.post.findUnique({
    ...postWithTagsArgs,
    where: {
      slug: normalizedSlug,
    },
  });

  if (!post) {
    return null;
  }

  if (!options.allowDraft && post.status !== PostStatus.PUBLISHED) {
    return null;
  }

  return mapPostRecord(post);
}

export async function listTags() {
  const tags = await prisma.tag.findMany({
    ...tagWithCountArgs,
    orderBy: [
      {
        name: "asc",
      },
    ],
  });

  return tags.map((tag) => mapTagRecord(tag, tag._count.posts));
}

export async function getTagBySlug(tagSlug: string) {
  const normalizedTagSlug = normalizeRequiredString(tagSlug, "Tag slug");
  const tag = await prisma.tag.findUnique({
    ...tagWithCountArgs,
    where: {
      slug: normalizedTagSlug,
    },
  });

  return tag ? mapTagRecord(tag, tag._count.posts) : null;
}

export async function createPost(input: CreatePostInput) {
  const normalizedTitle = normalizeRequiredString(input.title, "Title");
  const normalizedContent = normalizeRequiredString(input.content, "Content");
  const nextStatus = input.status ?? PostStatus.DRAFT;

  return prisma.$transaction(async (tx) => {
    const tags = await syncTags(tx, input.tags);
    const uniqueSlug = await resolveUniquePostSlug(
      tx,
      input.slug ?? normalizedTitle,
    );
    const statusFields = resolveStatusFields(nextStatus, input.publishedAt);

    const post = await tx.post.create({
      ...postWithTagsArgs,
      data: {
        content: normalizedContent,
        coverImageUrl: normalizeNullableString(input.coverImageUrl),
        excerpt: normalizeNullableString(input.excerpt),
        publishedAt: statusFields.publishedAt,
        slug: uniqueSlug,
        status: statusFields.status,
        tags: {
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
        title: normalizedTitle,
      },
    });

    return mapPostRecord(post);
  });
}

export async function updatePost(postId: string, input: UpdatePostInput) {
  const normalizedPostId = normalizeRequiredString(postId, "Post ID");

  return prisma.$transaction(async (tx) => {
    const existingPost = await tx.post.findUnique({
      ...postWithTagsArgs,
      where: {
        id: normalizedPostId,
      },
    });

    if (!existingPost) {
      throw new Error("Post not found.");
    }

    const nextTitle =
      input.title !== undefined
        ? normalizeRequiredString(input.title, "Title")
        : existingPost.title;
    const nextContent =
      input.content !== undefined
        ? normalizeRequiredString(input.content, "Content")
        : existingPost.content;
    const nextStatus = input.status ?? existingPost.status;
    const nextSlug =
      input.slug !== undefined
        ? input.slug === null
          ? await resolveUniquePostSlug(tx, nextTitle, normalizedPostId)
          : await resolveUniquePostSlug(
              tx,
              normalizeRequiredString(input.slug, "Slug"),
              normalizedPostId,
            )
        : input.regenerateSlugFromTitle
          ? await resolveUniquePostSlug(tx, nextTitle, normalizedPostId)
          : existingPost.slug;
    const tags = input.tags ? await syncTags(tx, input.tags) : null;
    const statusFields = resolveStatusFields(
      nextStatus,
      input.publishedAt,
      existingPost.publishedAt,
    );

    const post = await tx.post.update({
      ...postWithTagsArgs,
      where: {
        id: normalizedPostId,
      },
      data: {
        content: nextContent,
        coverImageUrl:
          input.coverImageUrl !== undefined
            ? normalizeNullableString(input.coverImageUrl)
            : existingPost.coverImageUrl,
        excerpt:
          input.excerpt !== undefined
            ? normalizeNullableString(input.excerpt)
            : existingPost.excerpt,
        publishedAt: statusFields.publishedAt,
        slug: nextSlug,
        status: statusFields.status,
        ...(tags
          ? {
              tags: {
                deleteMany: {},
                create: tags.map((tag) => ({
                  tagId: tag.id,
                })),
              },
            }
          : {}),
        title: nextTitle,
      },
    });

    return mapPostRecord(post);
  });
}

export async function deletePost(postId: string) {
  const normalizedPostId = normalizeRequiredString(postId, "Post ID");
  const deletedPost = await prisma.post.delete({
    ...postWithTagsArgs,
    where: {
      id: normalizedPostId,
    },
  });

  return mapPostRecord(deletedPost);
}

export async function publishPost(postId: string) {
  const normalizedPostId = normalizeRequiredString(postId, "Post ID");

  return prisma.$transaction(async (tx) => {
    const existingPost = await tx.post.findUnique({
      select: {
        publishedAt: true,
      },
      where: {
        id: normalizedPostId,
      },
    });

    if (!existingPost) {
      throw new Error("Post not found.");
    }

    const post = await tx.post.update({
      ...postWithTagsArgs,
      where: {
        id: normalizedPostId,
      },
      data: {
        publishedAt: existingPost.publishedAt ?? new Date(),
        status: PostStatus.PUBLISHED,
      },
    });

    return mapPostRecord(post);
  });
}

export async function unpublishPost(postId: string) {
  const normalizedPostId = normalizeRequiredString(postId, "Post ID");
  const post = await prisma.post.update({
    ...postWithTagsArgs,
    where: {
      id: normalizedPostId,
    },
    data: {
      publishedAt: null,
      status: PostStatus.DRAFT,
    },
  });

  return mapPostRecord(post);
}

export { PostStatus };
