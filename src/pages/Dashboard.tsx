import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, LogOut, User, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { computeKarmaSummary } from "@/lib/karma";
import type { KarmaTransaction } from "@/types/karma";

type Character = Tables<"characters">;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const seedCharacters = async () => {
    setSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke("seed-characters");
      if (error) throw error;
      toast.success(data?.message || "Sample characters loaded!");
      fetchCharacters();
    } catch (err: any) {
      toast.error("Failed to seed: " + (err.message || err));
    } finally {
      setSeeding(false);
    }
  };

  const fetchCharacters = async () => {
    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      toast.error("Failed to load characters");
    } else {
      setCharacters(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const createCharacter = () => {
    navigate("/new-character");
  };

  const duplicateCharacter = async (char: Character) => {
    if (!user) return;
    const { id, created_at, updated_at, ...rest } = char;
    const { data, error } = await supabase
      .from("characters")
      .insert({ ...rest, user_id: user.id, name: `${char.name} (Copy)` })
      .select()
      .single();
    if (error) {
      toast.error("Failed to duplicate");
    } else {
      toast.success("Character duplicated");
      fetchCharacters();
    }
  };

  const deleteCharacter = async (id: string) => {
    const { error } = await supabase.from("characters").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Character deleted");
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="neon-glow-cyan font-display text-xl font-bold tracking-wider text-primary">
            SR6 RUNNER VAULT
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-muted-foreground">
              <User className="mr-1 inline h-3.5 w-3.5" />
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-wide">Your Runners</h2>
          <Button onClick={createCharacter} className="font-display tracking-wider">
            <Plus className="mr-1 h-4 w-4" /> New Character
          </Button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-muted-foreground">Loading characters...</p>
        ) : characters.length === 0 ? (
          <Card className="border-2 border-dashed border-border bg-card/30">
            <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
              <p className="text-lg text-muted-foreground">No characters yet.</p>
              <Button
                onClick={createCharacter}
                variant="outline"
                className="font-display tracking-wider"
              >
                <Plus className="mr-1 h-4 w-4" /> Create Your First Runner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((char) => {
              const portraitUrl = (char as any).portrait_url as string | null;
              return (
                <Card
                  key={char.id}
                  className="group cursor-pointer overflow-hidden border-border/50 bg-card/80 transition-all hover:border-primary/50"
                  onClick={() => navigate(`/character/${char.id}`)}
                >
                  <div className="flex">
                    {/* Portrait */}
                    <div className="m-3 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/30">
                      {portraitUrl ? (
                        <img
                          src={portraitUrl}
                          alt={char.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 py-3 pr-3">
                      <h3 className="truncate font-display text-lg tracking-wide transition-colors group-hover:text-primary">
                        {char.name}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        {char.metatype} ·{" "}
                        {(() => {
                          const k = computeKarmaSummary(
                            ((char as any).karma_ledger || []) as KarmaTransaction[]
                          );
                          return `Karma ${k.available}`;
                        })()}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground/60">
                        Updated {new Date(char.updated_at).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateCharacter(char);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCharacter(char.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
