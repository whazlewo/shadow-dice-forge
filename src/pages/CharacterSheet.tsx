import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import type { SR6Attributes, SR6Skill, SR6Quality, SR6Contact, SR6RangedWeapon, SR6MeleeWeapon, SR6Armor, SR6Augmentation, SR6Gear, SR6PersonalInfo, AttributeSources } from "@/types/character";
import type { KarmaTransaction } from "@/types/karma";
import { computeKarmaSummary, attributeKarmaCost } from "@/lib/karma";

import { AttributesTab } from "@/components/character/AttributesTab";
import { SkillsTab } from "@/components/character/SkillsTab";
import { PersonalInfoTab } from "@/components/character/PersonalInfoTab";
import { QualitiesTab } from "@/components/character/QualitiesTab";
import { GenericListTab } from "@/components/character/GenericListTab";
import { EquippedGearTab } from "@/components/character/EquippedGearTab";
import { KarmaConfirmDialog, type KarmaConfirmRequest } from "@/components/character/KarmaConfirmDialog";

type Character = Tables<"characters">;

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [metatype, setMetatype] = useState("Human");
  const [karmaConfirm, setKarmaConfirm] = useState<KarmaConfirmRequest | null>(null);

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

  // Karma ledger helpers
  const karmaLedger = ((character as any)?.karma_ledger || []) as KarmaTransaction[];
  const karmaSummary = computeKarmaSummary(karmaLedger);

  const addKarmaTransaction = useCallback(async (tx: Omit<KarmaTransaction, "id" | "timestamp">) => {
    const newTx: KarmaTransaction = {
      ...tx,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    const newLedger = [...karmaLedger, newTx];
    setCharacter((prev) => prev ? { ...prev, karma_ledger: newLedger as any } : prev);
    await save({ karma_ledger: newLedger as any });
    return newTx;
  }, [karmaLedger, save]);

  const undoKarmaTransaction = useCallback(async (txId: string) => {
    const tx = karmaLedger.find((t) => t.id === txId);
    if (!tx || tx.undone) return;

    // Mark as undone
    const updatedLedger = karmaLedger.map((t) =>
      t.id === txId ? { ...t, undone: true } : t
    );

    // Add refund entry
    const refundTx: KarmaTransaction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: "refund",
      description: `Undo: ${tx.description}`,
      amount: tx.amount,
      related_field: tx.related_field,
    };
    const newLedger = [...updatedLedger, refundTx];

    // Revert the associated field change
    const updates: Partial<Character> = { karma_ledger: newLedger as any };

    if (tx.related_field && tx.previous_value !== undefined) {
      const [section, key] = tx.related_field.split(".");
      if (section === "attributes" && key) {
        const attrs = { ...((character?.attributes || {}) as any) };
        attrs[key] = tx.previous_value;
        updates.attributes = attrs;
      } else if (section === "skills") {
        // Restore full skills array from previous_value
        updates.skills = tx.previous_value as any;
      } else if (section === "qualities") {
        updates.qualities = tx.previous_value as any;
      }
    }

    setCharacter((prev) => prev ? { ...prev, ...updates } : prev);
    await save(updates);
    toast.success("Karma transaction undone");
  }, [karmaLedger, character, save]);

  // Karma-aware attribute update
  const handleAttributeChange = useCallback((newAttrs: SR6Attributes) => {
    const oldAttrs = (character?.attributes || {}) as unknown as SR6Attributes;

    // Find which attribute changed
    const coreAttrs = ["body", "agility", "reaction", "strength", "willpower", "logic", "intuition", "charisma", "edge", "magic", "resonance"] as const;
    let changedKey: string | null = null;
    let oldVal = 0;
    let newVal = 0;

    for (const key of coreAttrs) {
      const ov = Number(oldAttrs[key]) || 0;
      const nv = Number(newAttrs[key]) || 0;
      if (nv !== ov) {
        changedKey = key;
        oldVal = ov;
        newVal = nv;
        break;
      }
    }

    // If it's a raise (costs karma), show confirmation
    if (changedKey && newVal > oldVal) {
      const cost = attributeKarmaCost(newVal);
      const label = changedKey.charAt(0).toUpperCase() + changedKey.slice(1);
      setKarmaConfirm({
        description: `Raise ${label} from ${oldVal} → ${newVal} costs ${cost} karma (${newVal} × 5).`,
        cost,
        available: karmaSummary.available,
        onConfirm: () => {
          addKarmaTransaction({
            type: "spent",
            amount: cost,
            description: `Raise ${label} ${oldVal}→${newVal}`,
            related_field: `attributes.${changedKey}`,
            previous_value: oldVal,
          });
          updateField("attributes", newAttrs);
          setKarmaConfirm(null);
        },
        onCancel: () => setKarmaConfirm(null),
      });
    } else {
      // Non-karma change (decrease, essence, text fields, etc.)
      updateField("attributes", newAttrs);
    }
  }, [character, karmaSummary.available, addKarmaTransaction, updateField]);

  // Karma-aware skill update
  const handleSkillsChange = useCallback((newSkills: SR6Skill[], karmaInfo?: { description: string; cost: number; field: string }) => {
    if (karmaInfo) {
      const oldSkills = (character?.skills || []) as unknown as SR6Skill[];
      setKarmaConfirm({
        description: karmaInfo.description,
        cost: karmaInfo.cost,
        available: karmaSummary.available,
        onConfirm: () => {
          addKarmaTransaction({
            type: "spent",
            amount: karmaInfo.cost,
            description: karmaInfo.description,
            related_field: "skills",
            previous_value: oldSkills,
          });
          updateField("skills", newSkills);
          setKarmaConfirm(null);
        },
        onCancel: () => setKarmaConfirm(null),
      });
    } else {
      updateField("skills", newSkills);
    }
  }, [character, karmaSummary.available, addKarmaTransaction, updateField]);

  // Karma-aware quality update
  const handleQualitiesChange = useCallback((newQualities: SR6Quality[], karmaInfo?: { description: string; cost: number }) => {
    if (karmaInfo) {
      const oldQualities = (character?.qualities || []) as unknown as SR6Quality[];
      setKarmaConfirm({
        description: karmaInfo.description,
        cost: karmaInfo.cost,
        available: karmaSummary.available,
        onConfirm: () => {
          addKarmaTransaction({
            type: "spent",
            amount: karmaInfo.cost,
            description: karmaInfo.description,
            related_field: "qualities",
            previous_value: oldQualities,
          });
          updateField("qualities", newQualities);
          setKarmaConfirm(null);
        },
        onCancel: () => setKarmaConfirm(null),
      });
    } else {
      updateField("qualities", newQualities);
    }
  }, [character, karmaSummary.available, addKarmaTransaction, updateField]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  }

  if (!character) return null;

  const attributes = (character.attributes || {}) as unknown as SR6Attributes;
  const attributeSources = (character as any).attribute_sources as AttributeSources | undefined;
  const skills = (character.skills || []) as unknown as SR6Skill[];
  const qualities = (character.qualities || []) as unknown as SR6Quality[];
  const contacts = (character.contacts || []) as unknown as SR6Contact[];
  const personalInfo = (character.personal_info || {}) as unknown as SR6PersonalInfo;
  const augmentations = (character.augmentations || []) as unknown as SR6Augmentation[];
  const gear = (character.gear || []) as unknown as SR6Gear[];

  return (
    <div className="min-h-screen bg-background">
      <KarmaConfirmDialog request={karmaConfirm} />

      <Tabs defaultValue="core" className="w-full">
        {/* Fixed header with tabs */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="container flex h-11 items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => navigate("/")}>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => save({ name })}
              className="font-display text-sm font-bold tracking-wider bg-transparent border-none h-auto p-0 max-w-[160px] focus-visible:ring-0"
            />
            <span className="text-[10px] text-muted-foreground font-mono">|</span>
            <Input
              value={metatype}
              onChange={(e) => setMetatype(e.target.value)}
              onBlur={() => save({ metatype })}
              className="text-xs font-mono bg-transparent border-none h-auto p-0 max-w-[80px] focus-visible:ring-0 text-muted-foreground"
            />
            <div className="mx-1 h-4 w-px bg-border/50 shrink-0" />
            <TabsList className="flex h-auto gap-0 bg-transparent p-0">
              {["core", "weapons-gear", "vehicles", "spells", "adept", "other"].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="font-display text-[10px] tracking-wider uppercase px-2.5 py-1 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-sm data-[state=inactive]:text-muted-foreground">
                  {tab === "weapons-gear" ? "Gear" : tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {saving && <span className="text-[10px] text-neon-amber font-mono animate-pulse">Saving...</span>}
            </div>
          </div>
        </header>

      <main className="container py-4">

          <TabsContent value="core" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PersonalInfoTab
                info={personalInfo}
                onUpdate={(i) => updateField("personal_info", i)}
                name={name}
                metatype={metatype}
                onNameChange={setName}
                onMetatypeChange={setMetatype}
                onNameBlur={() => save({ name })}
                onMetatypeBlur={() => save({ metatype })}
                karmaLedger={karmaLedger}
                onKarmaUndo={undoKarmaTransaction}
                onAddKarmaTransaction={addKarmaTransaction}
              />
              <AttributesTab attributes={attributes} attributeSources={attributeSources} augmentations={augmentations} gear={gear} armor={(character.armor || []) as unknown as SR6Armor[]} qualities={qualities} onUpdate={handleAttributeChange} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkillsTab
                skills={skills}
                attributes={attributes}
                qualities={qualities}
                augmentations={augmentations}
                gear={gear}
                onUpdate={handleSkillsChange}
              />
              <EquippedGearTab
                rangedWeapons={(character.ranged_weapons || []) as unknown as SR6RangedWeapon[]}
                meleeWeapons={(character.melee_weapons || []) as unknown as SR6MeleeWeapon[]}
                armor={(character.armor || []) as unknown as SR6Armor[]}
                skills={skills}
                attributes={attributes}
                qualities={qualities}
                augmentations={augmentations}
                gear={gear}
              />
            </div>
            <GenericListTab
              title="Contacts"
              items={contacts}
              fields={["name", "loyalty", "connection", "notes"]}
              numericFields={["loyalty", "connection"]}
              readOnlyToggle
              onUpdate={(c) => updateField("contacts", c)}
            />
          </TabsContent>

          <TabsContent value="weapons-gear" className="space-y-6">
            <GenericListTab
              title="Ranged Weapons"
              items={(character.ranged_weapons || []) as any[]}
              fields={["name", "subtype", "dv", "ar", "fire_modes", "ammo"]}
              fieldLabels={{ subtype: "Category" }}
              fieldOptions={{ subtype: ["Automatics", "Hold-Outs", "Longarms", "Machine Pistols", "Pistols (Heavy)", "Pistols (Light)", "Shotguns", "Sniper Rifles", "Submachine Guns", "Tasers"] }}
              showEquipped
              showAccessories
              onUpdate={(w) => updateField("ranged_weapons", w)}
            />
            <GenericListTab
              title="Melee Weapons"
              items={(character.melee_weapons || []) as any[]}
              fields={["name", "subtype", "dv", "ar", "reach"]}
              fieldLabels={{ subtype: "Category" }}
              fieldOptions={{ subtype: ["Blades", "Clubs", "Unarmed Combat"] }}
              numericFields={["reach"]}
              showEquipped
              showAccessories
              onUpdate={(w) => updateField("melee_weapons", w)}
            />
            <GenericListTab
              title="Armor"
              items={(character.armor || []) as any[]}
              fields={["name", "subtype", "rating", "capacity", "modifications"]}
              fieldLabels={{ rating: "Defense Rating", subtype: "Type" }}
              fieldOptions={{ subtype: ["body", "helmet", "shield"] }}
              fieldDefaults={{ subtype: "body" }}
              numericFields={["rating", "capacity"]}
              showEquipped
              onUpdate={(a) => updateField("armor", a)}
            />
            <GenericListTab
              title="Augmentations"
              items={augmentations as any[]}
              fields={["name", "type", "essence_cost", "rating", "effects"]}
              fieldOptions={{ type: ["cyberware", "bioware", "cultured bioware", "nanotechnology", "geneware"] }}
              fieldDefaults={{ type: "cyberware" }}
              showDiceModifiers
              showEffects
              onUpdate={(a) => updateField("augmentations", a)}
            />
            <GenericListTab
              title="Gear"
              items={gear as any[]}
              fields={["name", "quantity", "notes"]}
              showEquipped
              showDiceModifiers
              showEffects
              onUpdate={(g) => updateField("gear", g)}
            />
            <GenericListTab
              title="Matrix Stats"
              items={[character.matrix_stats || {}] as any[]}
              fields={["device_rating", "attack", "sleaze", "data_processing", "firewall"]}
              onUpdate={(m) => updateField("matrix_stats", m[0] || {})}
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
      </main>
      </Tabs>
    </div>
  );
}

