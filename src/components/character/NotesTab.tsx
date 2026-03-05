import { useState, useCallback, useEffect, useRef, memo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Plus, Trash2, ChevronDown, ChevronRight,
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Minus,
} from "lucide-react";

interface SessionNote {
  id: string;
  title: string;
  content: string;
  created_at: string;
  collapsed: boolean;
}

interface NotesTabProps {
  notes: SessionNote[];
  onUpdate: (notes: SessionNote[]) => void;
}

const NoteEditor = memo(function NoteEditor({
  note,
  onChange,
}: {
  note: SessionNote;
  onChange: (content: string) => void;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    content: note.content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(html), 300);
    },
  });

  // Sync content when switching notes
  useEffect(() => {
    if (editor) editor.commands.setContent(note.content || "");
  }, [note.id, editor]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  if (!editor) return null;

  const tb = (action: () => boolean, active: string, attrs?: Record<string, number>) => ({
    onMouseDown: (e: React.MouseEvent) => e.preventDefault(),
    onClick: () => action(),
    variant: editor.isActive(active, attrs) ? "secondary" as const : "ghost" as const,
    size: "icon" as const,
    className: "h-7 w-7",
    type: "button" as const,
  });

  return (
    <div className="space-y-0">
      <BubbleMenu
        editor={editor}
        className="flex flex-wrap gap-0.5 rounded-lg border border-border bg-popover text-popover-foreground px-1 py-1 shadow-md"
      >
        <Button {...tb(() => editor.chain().focus().toggleBold().run(), "bold")}><Bold className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleItalic().run(), "italic")}><Italic className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), "heading", { level: 2 })}><Heading2 className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), "heading", { level: 3 })}><Heading3 className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleBulletList().run(), "bulletList")}><List className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleOrderedList().run(), "orderedList")}><ListOrdered className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-3.5 w-3.5" /></Button>
      </BubbleMenu>
      <EditorContent
        editor={editor}
        className="notes-editor min-h-[200px] rounded-md px-1 py-2 focus-within:bg-muted/5 transition-colors [&_.tiptap]:outline-none [&_.tiptap]:min-h-[180px] [&_.tiptap]:leading-relaxed [&_.tiptap_p]:mb-4 [&_.tiptap_p:last-child]:mb-0 [&_.tiptap_h1]:text-2xl [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:mt-6 [&_.tiptap_h1]:mb-3 [&_.tiptap_h2]:text-xl [&_.tiptap_h2]:font-bold [&_.tiptap_h2]:mt-5 [&_.tiptap_h2]:mb-2 [&_.tiptap_h3]:text-lg [&_.tiptap_h3]:font-semibold [&_.tiptap_h3]:mt-4 [&_.tiptap_h3]:mb-1 [&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-6 [&_.tiptap_ul]:my-3 [&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-6 [&_.tiptap_ol]:my-3 [&_.tiptap_li]:my-1 [&_.tiptap_li]:leading-relaxed [&_.tiptap_hr]:my-6 [&_.tiptap_hr]:border-border/40"
      />
    </div>
  );
});

export function NotesTab({ notes, onUpdate }: NotesTabProps) {
  const [sessions, setSessions] = useState<SessionNote[]>(notes);

  // Sync from parent
  useEffect(() => setSessions(notes), [notes]);

  const commit = useCallback(
    (updated: SessionNote[]) => {
      setSessions(updated);
      onUpdate(updated);
    },
    [onUpdate],
  );

  const addSession = () => {
    const newSession: SessionNote = {
      id: crypto.randomUUID(),
      title: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
      content: "",
      created_at: new Date().toISOString(),
      collapsed: false,
    };
    commit([newSession, ...sessions]);
  };

  const deleteSession = (id: string) => {
    if (!confirm("Delete this session note?")) return;
    commit(sessions.filter((s) => s.id !== id));
  };

  const updateTitle = (id: string, title: string) => {
    commit(sessions.map((s) => (s.id === id ? { ...s, title } : s)));
  };

  const updateContent = (id: string, content: string) => {
    commit(sessions.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  const toggleCollapse = (id: string) => {
    commit(sessions.map((s) => (s.id === id ? { ...s, collapsed: !s.collapsed } : s)));
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto px-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-wider uppercase text-muted-foreground">Session Notes</h2>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addSession}>
          <Plus className="h-3 w-3" /> New Session
        </Button>
      </div>

      {sessions.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-12">No session notes yet. Click "New Session" to start.</p>
      )}

      {sessions.map((session) => (
        <Collapsible key={session.id} open={!session.collapsed} onOpenChange={() => toggleCollapse(session.id)}>
          <div className="group rounded-lg bg-muted/20 border border-border/20 hover:border-border/40 transition-colors">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/30 rounded-lg transition-colors">
                {session.collapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                <Input
                  value={session.title}
                  onChange={(e) => updateTitle(session.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Untitled"
                  className="font-display text-xs tracking-wider bg-transparent border-none h-auto p-0 focus-visible:ring-0 flex-1 placeholder:text-muted-foreground/50"
                />
                <span className="text-[10px] text-muted-foreground/60 font-mono shrink-0">
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                {!session.collapsed && (
                  <NoteEditor note={session} onChange={(c) => updateContent(session.id, c)} />
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
