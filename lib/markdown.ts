import "server-only";

import type { Schema } from "hast-util-sanitize";

import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const markdownSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ["target", "_blank"],
      ["rel", "nofollow noopener noreferrer"],
    ],
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ["className"],
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["loading", "lazy"],
      ["decoding", "async"],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      ["className"],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ["className"],
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "img",
  ],
};

export async function renderMarkdownToHtml(markdown: string) {
  const renderedFile = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight, {
      detect: true,
      ignoreMissing: true,
    })
    .use(rehypeSanitize, markdownSchema)
    .use(rehypeStringify)
    .process(markdown);

  return String(renderedFile);
}
