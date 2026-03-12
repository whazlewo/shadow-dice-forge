import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

function toEditorContent(value: string | undefined): string {
  if (!value) return "";
  if (!value.includes("<")) {
    const escaped = value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return `<p>${escaped}</p>`;
  }
  return value;
}

const TIPTAP_PROSE_CLASSES =
  "[&_.tiptap]:outline-none [&_.tiptap]:leading-relaxed [&_.tiptap_p]:mb-4 [&_.tiptap_p:last-child]:mb-0 [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mt-6 [&_.tiptap_h1]:mb-3 [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-5 [&_.tiptap_h2]:mb-2 [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:mb-1 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:my-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:my-3 [&_.tiptap_li]:my-1 [&_.tiptap_li]:leading-relaxed [&_.tiptap_hr]:my-6 [&_.tiptap_hr]:border-border/40";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
  /** Use smaller, muted text (matches backstory preview styling) */
  muted?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  readOnly = false,
  minHeight = "min-h-[120px]",
  className,
  muted = false,
}: RichTextEditorProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const initialContent = toEditorContent(value);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (readOnly) return;
      const html = editor.getHTML();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(html), 300);
    },
  });

  useEffect(() => {
    if (editor) editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (editor && value !== undefined) {
      const content = toEditorContent(value);
      const current = editor.getHTML();
      if (content !== current) {
        editor.commands.setContent(content, { emitUpdate: false });
      }
    }
  }, [editor, value]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  if (!editor) return null;

  const tb = (action: () => boolean, active: string, attrs?: Record<string, number>) => ({
    onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
    onClick: () => action(),
    variant: (editor.isActive(active, attrs) ? "secondary" : "ghost") as "secondary" | "ghost",
    size: "icon" as const,
    className: "h-7 w-7",
    type: "button" as const,
  });

  return (
    <div className={cn("space-y-0", className)}>
      {!readOnly && (
        <BubbleMenu
          editor={editor}
          className="flex flex-wrap gap-0.5 rounded-lg border border-border bg-popover text-popover-foreground px-1 py-1 shadow-md"
        >
          <Button {...tb(() => editor.chain().focus().toggleBold().run(), "bold")}>
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button {...tb(() => editor.chain().focus().toggleItalic().run(), "italic")}>
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button {...tb(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), "heading", { level: 2 })}>
            <Heading2 className="h-3.5 w-3.5" />
          </Button>
          <Button {...tb(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), "heading", { level: 3 })}>
            <Heading3 className="h-3.5 w-3.5" />
          </Button>
          <Button {...tb(() => editor.chain().focus().toggleBulletList().run(), "bulletList")}>
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button {...tb(() => editor.chain().focus().toggleOrderedList().run(), "orderedList")}>
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
        </BubbleMenu>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          "notes-editor rich-text-editor rounded-md px-1 py-2 focus-within:bg-muted/5 transition-colors",
          minHeight,
          TIPTAP_PROSE_CLASSES,
          "[&_.tiptap]:outline-none",
          muted ? "[&_.tiptap]:min-h-[2.5rem]" : "[&_.tiptap]:min-h-[80px]",
          muted && "[&_.tiptap]:text-sm [&_.tiptap]:text-muted-foreground",
        )}
      />
    </div>
  );
}
