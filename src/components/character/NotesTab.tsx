import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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

function NoteEditor({
  note,
  onChange,
}: {
  note: SessionNote;
  onChange: (content: string) => void;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const editor = useEditor({
    extensions: [StarterKit],
    content: note.content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onChange(html), 1000);
    },
  });

  // Sync content when switching notes
  useEffect(() => {
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content || "");
    }
  }, [note.id]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  if (!editor) return null;

  const tb = (action: () => boolean, active: string) => ({
    onClick: () => action(),
    variant: editor.isActive(active) ? "secondary" as const : "ghost" as const,
    size: "icon" as const,
    className: "h-7 w-7",
    type: "button" as const,
  });

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-0.5 border border-border/50 rounded-md p-1 bg-muted/30">
        <Button {...tb(() => editor.chain().focus().toggleBold().run(), "bold")}><Bold className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleItalic().run(), "italic")}><Italic className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), "heading")}><Heading2 className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), "heading")}><Heading3 className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleBulletList().run(), "bulletList")}><List className="h-3.5 w-3.5" /></Button>
        <Button {...tb(() => editor.chain().focus().toggleOrderedList().run(), "orderedList")}><ListOrdered className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-3.5 w-3.5" /></Button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm prose-invert max-w-none min-h-[200px] border border-border/50 rounded-md p-3 focus-within:ring-1 focus-within:ring-primary/50 [&_.tiptap]:outline-none [&_.tiptap]:min-h-[180px]"
      />
    </div>
  );
}

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm tracking-wider uppercase text-muted-foreground">Session Notes</h2>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={addSession}>
          <Plus className="h-3 w-3" /> New Session
        </Button>
      </div>

      {sessions.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">No session notes yet. Click "New Session" to start.</p>
      )}

      {sessions.map((session) => (
        <Collapsible key={session.id} open={!session.collapsed} onOpenChange={() => toggleCollapse(session.id)}>
          <div className="border border-border/50 rounded-lg bg-card/50">
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30 rounded-t-lg">
                {session.collapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                <Input
                  value={session.title}
                  onChange={(e) => updateTitle(session.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="font-display text-xs tracking-wider bg-transparent border-none h-auto p-0 focus-visible:ring-0 flex-1"
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
              <div className="px-3 pb-3">
                <NoteEditor note={session} onChange={(c) => updateContent(session.id, c)} />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
