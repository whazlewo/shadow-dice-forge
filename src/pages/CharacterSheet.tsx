import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import type { SR6Attributes, SR6Skill, SR6Quality, SR6Contact, SR6RangedWeapon, SR6MeleeWeapon, SR6Armor, SR6MatrixStats, SR6Augmentation, SR6Gear, SR6Vehicle, SR6Spell, SR6AdeptPower, SR6OtherAbility, SR6Priorities, SR6PersonalInfo, SR6IdsLifestyles } from "@/types/character";
import { AttributesTab } from "@/components/character/AttributesTab";
import { SkillsTab } from "@/components/character/SkillsTab";
import { PersonalInfoTab } from "@/components/character/PersonalInfoTab";
import { QualitiesTab } from "@/components/character/QualitiesTab";
import { GenericListTab } from "@/components/character/GenericListTab";

type Character = Tables<"characters">;

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [metatype, setMetatype] = useState("Human");

  useEffect(() => {
    if (!id) return;
    supabase
      .from("characters")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          toast.error("Character not found");
          navigate("/");
          return;
        }
        setCharacter(data);
        setName(data.name);
        setMetatype(data.metatype || "Human");
        setLoading(false);
      });
  }, [id]);

  const save = useCallback(async (updates: Partial<Character>) => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase.from("characters").update(updates).eq("id", id);
    if (error) {
      toast.error("Save failed");
    }
    setSaving(false);
  }, [id]);

  const updateField = useCallback(async (field: string, value: any) => {
    setCharacter((prev) => prev ? { ...prev, [field]: value } : prev);
    await save({ [field]: value });
  }, [save]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!character) return null;

  const attributes = (character.attributes || {}) as unknown as SR6Attributes;
  const skills = (character.skills || []) as unknown as SR6Skill[];
  const qualities = (character.qualities || []) as unknown as SR6Quality[];
  const contacts = (character.contacts || []) as unknown as SR6Contact[];
  const personalInfo = (character.personal_info || {}) as unknown as SR6PersonalInfo;
  const augmentations = (character.augmentations || []) as unknown as SR6Augmentation[];
  const gear = (character.gear || []) as unknown as SR6Gear[];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => save({ name })}
            className="font-display text-lg font-bold tracking-wider bg-transparent border-none h-auto p-0 max-w-xs focus-visible:ring-0"
          />
          <span className="text-xs text-muted-foreground font-mono">|</span>
          <Input
            value={metatype}
            onChange={(e) => setMetatype(e.target.value)}
            onBlur={() => save({ metatype })}
            className="text-sm font-mono bg-transparent border-none h-auto p-0 max-w-[120px] focus-visible:ring-0 text-muted-foreground"
          />
          <div className="ml-auto flex items-center gap-2">
            {saving && <span className="text-xs text-neon-amber font-mono animate-pulse">Saving...</span>}
          </div>
        </div>
      </header>

      <main className="container py-4">
        <Tabs defaultValue="core" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-card/50 p-1 mb-4">
            {["core", "ranged", "melee", "armor", "matrix", "augmentations", "gear", "vehicles", "spells", "adept", "other"].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="font-display text-xs tracking-wider uppercase">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="core" className="space-y-6">
            <PersonalInfoTab info={personalInfo} onUpdate={(i) => updateField("personal_info", i)} />
            <AttributesTab attributes={attributes} onUpdate={(a) => updateField("attributes", a)} />
            <QualitiesTab qualities={qualities} onUpdate={(q) => updateField("qualities", q)} />
            <SkillsTab
              skills={skills}
              attributes={attributes}
              qualities={qualities}
              augmentations={augmentations}
              gear={gear}
              onUpdate={(s) => updateField("skills", s)}
            />
            <GenericListTab
              title="Contacts"
              items={contacts}
              fields={["name", "loyalty", "connection", "notes"]}
              onUpdate={(c) => updateField("contacts", c)}
            />
          </TabsContent>

          <TabsContent value="ranged">
            <GenericListTab
              title="Ranged Weapons"
              items={(character.ranged_weapons || []) as any[]}
              fields={["name", "dv", "ar", "fire_modes", "ammo", "accessories"]}
              onUpdate={(w) => updateField("ranged_weapons", w)}
            />
          </TabsContent>

          <TabsContent value="melee">
            <GenericListTab
              title="Melee Weapons"
              items={(character.melee_weapons || []) as any[]}
              fields={["name", "dv", "ar", "reach"]}
              onUpdate={(w) => updateField("melee_weapons", w)}
            />
          </TabsContent>

          <TabsContent value="armor">
            <GenericListTab
              title="Armor"
              items={(character.armor || []) as any[]}
              fields={["name", "rating", "capacity", "modifications"]}
              onUpdate={(a) => updateField("armor", a)}
            />
          </TabsContent>

          <TabsContent value="matrix">
            <GenericListTab
              title="Matrix Stats"
              items={[character.matrix_stats || {}] as any[]}
              fields={["device_rating", "attack", "sleaze", "data_processing", "firewall"]}
              onUpdate={(m) => updateField("matrix_stats", m[0] || {})}
            />
          </TabsContent>

          <TabsContent value="augmentations">
            <GenericListTab
              title="Augmentations"
              items={augmentations as any[]}
              fields={["name", "type", "essence_cost", "rating", "effects"]}
              onUpdate={(a) => updateField("augmentations", a)}
            />
          </TabsContent>

          <TabsContent value="gear">
            <GenericListTab
              title="Gear"
              items={gear as any[]}
              fields={["name", "quantity", "notes"]}
              onUpdate={(g) => updateField("gear", g)}
            />
          </TabsContent>

          <TabsContent value="vehicles">
            <GenericListTab
              title="Vehicles / Drones"
              items={(character.vehicles || []) as any[]}
              fields={["name", "handling", "speed", "body", "armor", "sensor", "pilot", "seats"]}
              onUpdate={(v) => updateField("vehicles", v)}
            />
          </TabsContent>

          <TabsContent value="spells">
            <GenericListTab
              title="Spells / Preparations / Rituals / Complex Forms"
              items={(character.spells || []) as any[]}
              fields={["name", "category", "type", "drain", "duration", "range", "effects"]}
              onUpdate={(s) => updateField("spells", s)}
            />
          </TabsContent>

          <TabsContent value="adept">
            <GenericListTab
              title="Adept Powers"
              items={(character.adept_powers || []) as any[]}
              fields={["name", "pp_cost", "effects"]}
              onUpdate={(a) => updateField("adept_powers", a)}
            />
          </TabsContent>

          <TabsContent value="other">
            <GenericListTab
              title="Other Abilities"
              items={(character.other_abilities || []) as any[]}
              fields={["name", "description"]}
              onUpdate={(o) => updateField("other_abilities", o)}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
