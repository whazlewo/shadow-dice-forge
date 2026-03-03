import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Copy, LogOut, User } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Character = Tables<"characters">;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

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
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="font-display text-xl font-bold tracking-wider text-primary neon-glow-cyan">
            SR6 RUNNER VAULT
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-mono">
              <User className="inline h-3.5 w-3.5 mr-1" />
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold tracking-wide">Your Runners</h2>
          <Button onClick={createCharacter} className="font-display tracking-wider">
            <Plus className="h-4 w-4 mr-1" /> New Character
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-12">Loading characters...</p>
        ) : characters.length === 0 ? (
          <Card className="border-dashed border-2 border-border bg-card/30">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-muted-foreground text-lg">No characters yet.</p>
              <Button onClick={createCharacter} variant="outline" className="font-display tracking-wider">
                <Plus className="h-4 w-4 mr-1" /> Create Your First Runner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {characters.map((char) => (
              <Card
                key={char.id}
                className="border-border/50 bg-card/80 hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/character/${char.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="font-display text-lg tracking-wide group-hover:text-primary transition-colors">
                    {char.name}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {char.metatype} · Updated {new Date(char.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); duplicateCharacter(char); }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deleteCharacter(char.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
