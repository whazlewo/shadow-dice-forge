import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";

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
                  <RichTextEditor
                    value={session.content}
                    onChange={(c) => updateContent(session.id, c)}
                    placeholder="Start writing..."
                    minHeight="min-h-[200px]"
                  />
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
}
