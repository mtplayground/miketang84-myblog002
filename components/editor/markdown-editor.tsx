"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  startTransition,
} from "react";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Markdown } from "@tiptap/markdown";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageUp,
  Italic,
  Link2,
  List,
  ListOrdered,
  SquareCode,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  className?: string;
  description?: string;
  disabled?: boolean;
  initialMarkdown?: string;
  label?: string;
  name?: string;
  onChange?: (markdown: string) => void;
  uploadEndpoint?: string;
};

type ToolbarButtonProps = {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  title: string;
};

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

function ToolbarButton({
  active = false,
  children,
  disabled = false,
  onClick,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        buttonVariants({
          className:
            "h-9 min-w-9 px-3 text-xs font-semibold tracking-[0.14em] uppercase",
          variant: active ? "secondary" : "outline",
        }),
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

function normalizeInitialMarkdown(value: string | undefined) {
  return value?.trim() ? value : "";
}

async function uploadImageFile(file: File, uploadEndpoint: string) {
  const formData = new FormData();

  formData.set("file", file);

  const response = await fetch(uploadEndpoint, {
    body: formData,
    credentials: "same-origin",
    method: "POST",
  });

  const payload = (await response.json().catch(() => null)) as
    | {
        error?: string;
        url?: string;
      }
    | null;

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error ?? "Image upload failed.");
  }

  return payload.url;
}

export function MarkdownEditor({
  className,
  description,
  disabled = false,
  initialMarkdown,
  label = "Markdown editor",
  name,
  onChange,
  uploadEndpoint = "/api/admin/uploads",
}: MarkdownEditorProps) {
  const fieldId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [markdown, setMarkdown] = useState(
    normalizeInitialMarkdown(initialMarkdown),
  );
  const [linkError, setLinkError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const deferredMarkdown = useDeferredValue(markdown);
  const initialContent = normalizeInitialMarkdown(initialMarkdown);

  const emitChange = useEffectEvent((nextMarkdown: string) => {
    onChange?.(nextMarkdown);
  });

  const editor = useEditor({
    content: initialContent,
    contentType: "markdown",
    editorProps: {
      attributes: {
        class:
          "ProseMirror min-h-[320px] w-full px-5 py-5 text-[15px] leading-7 text-stone-900 focus:outline-none",
      },
    },
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
      }),
      Image.configure({
        allowBase64: false,
      }),
      Markdown.configure({
        markedOptions: {
          breaks: true,
          gfm: true,
        },
      }),
    ],
    immediatelyRender: false,
    onCreate({ editor }) {
      const nextMarkdown = editor.getMarkdown();
      setMarkdown(nextMarkdown);
      emitChange(nextMarkdown);
    },
    onUpdate({ editor }) {
      const nextMarkdown = editor.getMarkdown();

      startTransition(() => {
        setMarkdown(nextMarkdown);
      });
      emitChange(nextMarkdown);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextMarkdown = normalizeInitialMarkdown(initialMarkdown);

    if (nextMarkdown === editor.getMarkdown()) {
      return;
    }

    editor.commands.setContent(nextMarkdown, {
      contentType: "markdown",
    });
    setMarkdown(nextMarkdown);
  }, [editor, initialMarkdown]);

  const runEditorCommand = (command: (editor: Editor) => boolean) => {
    if (!editor || disabled) {
      return;
    }

    setLinkError(null);
    setUploadError(null);
    command(editor);
  };

  const handleSetLink = () => {
    if (!editor || disabled) {
      return;
    }

    const currentHref = editor.getAttributes("link").href as string | undefined;
    const nextHref = window.prompt("Enter a URL", currentHref ?? "https://");

    if (nextHref === null) {
      return;
    }

    const trimmedHref = nextHref.trim();

    if (!trimmedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkError(null);
      return;
    }

    try {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: trimmedHref,
        })
        .run();
      setLinkError(null);
    } catch {
      setLinkError("Please enter a valid link URL.");
    }
  };

  const handleImageButtonClick = () => {
    if (disabled || isUploadingImage) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleImageSelection = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !editor || disabled) {
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const uploadedUrl = await uploadImageFile(file, uploadEndpoint);
      editor
        .chain()
        .focus()
        .setImage({
          src: uploadedUrl,
        })
        .run();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label
          className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
          htmlFor={fieldId}
        >
          {label}
        </label>
        {description ? (
          <p className="text-sm leading-6 text-stone-600">{description}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-[1.6rem] border border-stone-300/70 bg-stone-50/95 shadow-[0_24px_72px_rgba(71,45,17,0.11)]">
        <div className="flex flex-wrap gap-2 border-b border-stone-300/70 bg-white/80 px-4 py-4">
          <ToolbarButton
            active={editor?.isActive("bold")}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleBold().run(),
              )
            }
            title="Bold"
          >
            <Bold className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("italic")}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleItalic().run(),
              )
            }
            title="Italic"
          >
            <Italic className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("heading", { level: 1 })}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleHeading({ level: 1 }).run(),
              )
            }
            title="Heading 1"
          >
            <Heading1 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("heading", { level: 2 })}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleHeading({ level: 2 }).run(),
              )
            }
            title="Heading 2"
          >
            <Heading2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("heading", { level: 3 })}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleHeading({ level: 3 }).run(),
              )
            }
            title="Heading 3"
          >
            <Heading3 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("bulletList")}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleBulletList().run(),
              )
            }
            title="Bullet list"
          >
            <List className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("orderedList")}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleOrderedList().run(),
              )
            }
            title="Ordered list"
          >
            <ListOrdered className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("link")}
            disabled={disabled}
            onClick={handleSetLink}
            title="Insert or edit link"
          >
            <Link2 className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("code")}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleCode().run(),
              )
            }
            title="Inline code"
          >
            <Code className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("codeBlock")}
            disabled={disabled}
            onClick={() =>
              runEditorCommand((instance) =>
                instance.chain().focus().toggleCodeBlock().run(),
              )
            }
            title="Code block"
          >
            <SquareCode className="size-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={disabled || isUploadingImage}
            onClick={handleImageButtonClick}
            title="Upload and insert image"
          >
            <ImageUp className="size-4" />
          </ToolbarButton>
          <input
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={handleImageSelection}
            ref={fileInputRef}
            type="file"
          />
        </div>

        <div
          className={cn(
            "bg-white/70",
            "[&_.ProseMirror]:min-h-[320px]",
            "[&_.ProseMirror_code]:rounded bg-stone-900/95 px-1.5 py-0.5 text-[0.92em] text-stone-100",
            "[&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-semibold",
            "[&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold",
            "[&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-semibold",
            "[&_.ProseMirror_img]:my-4 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-2xl [&_.ProseMirror_img]:border [&_.ProseMirror_img]:border-stone-300/70",
            "[&_.ProseMirror_ol]:my-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6",
            "[&_.ProseMirror_pre]:my-4 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-2xl [&_.ProseMirror_pre]:bg-stone-950 [&_.ProseMirror_pre]:px-4 [&_.ProseMirror_pre]:py-3 [&_.ProseMirror_pre]:text-stone-100",
            "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-stone-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            "[&_.ProseMirror_p]:my-3",
            "[&_.ProseMirror_ul]:my-4 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6",
            "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-4",
          )}
        >
          <EditorContent editor={editor} id={fieldId} />
        </div>
      </div>

      {linkError || uploadError ? (
        <div className="rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3 text-sm text-rose-800">
          {linkError ?? uploadError}
        </div>
      ) : null}

      {name ? (
        <textarea
          className="sr-only"
          name={name}
          readOnly
          value={markdown}
        />
      ) : null}

      <section className="overflow-hidden rounded-[1.6rem] border border-stone-300/70 bg-stone-900 text-stone-100 shadow-[0_20px_60px_rgba(22,15,8,0.24)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-300">
              Markdown output
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Serialized live from the current editor state.
            </p>
          </div>
          {isUploadingImage ? (
            <span className="text-xs font-medium text-stone-300">
              Uploading image...
            </span>
          ) : null}
        </div>
        <pre className="max-h-[320px] overflow-auto px-4 py-4 text-sm leading-6 whitespace-pre-wrap">
          {deferredMarkdown || "*Start writing to generate markdown output.*"}
        </pre>
      </section>
    </div>
  );
}
