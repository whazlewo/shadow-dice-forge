import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import type { SR6Attributes, SR6Skill, SR6Quality, SR6Contact, SR6RangedWeapon, SR6MeleeWeapon, SR6Armor, SR6Augmentation, SR6Gear, SR6PersonalInfo, AttributeSources } from "@/types/character";
import type { KarmaTransaction } from "@/types/karma";
import { computeKarmaSummary, attributeKarmaCost } from "@/lib/karma";
import { inferMagicType } from "@/lib/character-utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttributesTab } from "@/components/character/AttributesTab";
import { SkillsTab } from "@/components/character/SkillsTab";
import { PersonalInfoTab } from "@/components/character/PersonalInfoTab";
import { QualitiesTab } from "@/components/character/QualitiesTab";
import { GenericListTab } from "@/components/character/GenericListTab";
import { EquippedGearTab } from "@/components/character/EquippedGearTab";
import { KarmaConfirmDialog, type KarmaConfirmRequest } from "@/components/character/KarmaConfirmDialog";
import { NotesTab } from "@/components/character/NotesTab";

type Character = Tables<"characters">;

export default function CharacterSheet() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Portrait upload handler
  const handlePortraitUpload = useCallback(async (blob: Blob) => {
    if (!id || !user) return;
    const path = `${user.id}/${id}.webp`;

    // Delete old file if exists
    await supabase.storage.from("character-portraits").remove([path]);

    const { error: uploadError } = await supabase.storage
      .from("character-portraits")
      .upload(path, blob, { contentType: "image/webp", upsert: true });

    if (uploadError) {
      toast.error("Portrait upload failed");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("character-portraits")
      .getPublicUrl(path);

    const url = `${urlData.publicUrl}?t=${Date.now()}`;
    await updateField("portrait_url", url);
    toast.success("Portrait saved");
  }, [id, user, updateField]);

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

  const magicType = inferMagicType(character as any);
  const baseTabs = ["core", "notes", "weapons-gear", "vehicles"];
  const magicTabs: string[] = [];
  if (["full", "aspected", "mystic_adept"].includes(magicType)) magicTabs.push("spellcasting");
  if (["adept", "mystic_adept"].includes(magicType)) magicTabs.push("adept");
  if (magicType === "technomancer") magicTabs.push("complex-forms");
  const allTabs = [...baseTabs, ...magicTabs, "other"];

  const spells = (character.spells || []) as Array<{ id?: string; category?: string; [k: string]: unknown }>;
  const spellcastingItems = spells.filter((s) => s.category !== "complex_form");
  const complexFormItems = spells.filter((s) => s.category === "complex_form");

  const TAB_LABELS: Record<string, string> = {
    "weapons-gear": "Gear",
    spellcasting: "Spellcasting",
    adept: "Adept",
    "complex-forms": "Complex Forms",
  };

  return (
    <div className="min-h-screen bg-background">
      <KarmaConfirmDialog request={karmaConfirm} />

      <Tabs defaultValue="core" className="w-full">
        {/* Fixed header with tabs */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <div className="container relative flex h-11 items-center">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" onClick={() => navigate("/")}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => save({ name })}
                className="font-display text-sm font-bold tracking-wider bg-transparent border-none h-auto p-0 max-w-[160px] focus-visible:ring-0"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <TabsList className="flex h-auto gap-0 bg-transparent p-0 pointer-events-auto">
                {allTabs.map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="font-display text-[10px] tracking-wider uppercase px-2.5 py-1 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-sm data-[state=inactive]:text-muted-foreground">
                    {TAB_LABELS[tab] ?? tab.replace(/-/g, " ")}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="ml-auto flex items-center gap-2">
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
                portraitUrl={(character as any).portrait_url}
                onPortraitUpload={handlePortraitUpload}
              />
              <AttributesTab attributes={attributes} attributeSources={attributeSources} augmentations={augmentations} gear={gear} armor={(character.armor || []) as unknown as SR6Armor[]} qualities={qualities} onUpdate={handleAttributeChange} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <SkillsTab
                  skills={skills}
                  attributes={attributes}
                  qualities={qualities}
                  augmentations={augmentations}
                  gear={gear}
                  onUpdate={handleSkillsChange}
                />
                {(() => {
                  const idsLifestyles = (character as any).ids_lifestyles as { knowledge_skills?: string[] } | null;
                  const knowledgeSkills = idsLifestyles?.knowledge_skills ?? [];
                  if (knowledgeSkills.length === 0) return null;
                  return (
                    <Card className="border-border/50 bg-card/80">
                      <CardHeader className="pb-2">
                        <CardTitle className="font-display text-sm tracking-wide">Knowledge Skills</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {knowledgeSkills.map((name, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-xs font-mono"
                            >
                              {name || "—"}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })()}
              </div>
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

          <TabsContent value="notes" className="pt-4">
            <NotesTab
              notes={((character as any).notes || []) as any[]}
              onUpdate={(n) => updateField("notes", n)}
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
              referenceCategory="rangedWeapons"
              itemEditMode
              onUpdate={(w) => updateField("ranged_weapons", w)}
            />
            <GenericListTab
              title="Melee Weapons"
              items={(character.melee_weapons || []) as any[]}
              fields={["name", "subtype", "dv", "ar", "reach"]}
              fieldLabels={{ subtype: "Category" }}
              fieldOptions={{ subtype: ["Blades", "Clubs", "Unarmed", "Exotic"] }}
              numericFields={["reach"]}
              showEquipped
              showAccessories
              referenceCategory="meleeWeapons"
              itemEditMode
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
              referenceCategory="armor"
              itemEditMode
              onUpdate={(a) => updateField("armor", a)}
            />
            <GenericListTab
              title="Augmentations"
              items={augmentations as any[]}
              fields={["name", "type", "essence_cost", "rating"]}
              fieldWidths={{ name: "0 0 50%" }}
              fieldOptions={{ type: ["cyberware", "bioware", "cultured bioware", "nanotechnology", "geneware"] }}
              fieldDefaults={{ type: "cyberware" }}
              showDiceModifiers
              showEffects
              referenceCategory="augmentations"
              itemEditMode
              onUpdate={(a) => updateField("augmentations", a)}
            />
            <GenericListTab
              title="Gear"
              items={gear as any[]}
              fields={["name", "quantity", "notes"]}
              showEquipped
              showDiceModifiers
              showEffects
              referenceCategory="miscellaneous"
              itemEditMode
              onUpdate={(g) => updateField("gear", g)}
            />
            <GenericListTab
              title="Matrix Stats"
              items={[{ ...(typeof character.matrix_stats === "object" && character.matrix_stats ? character.matrix_stats : {}), id: (character.matrix_stats as any)?.id || "matrix" }] as any[]}
              fields={["device_rating", "attack", "sleaze", "data_processing", "firewall"]}
              itemEditMode
              onUpdate={(m) => updateField("matrix_stats", m[0] || {})}
            />
          </TabsContent>

          <TabsContent value="vehicles">
            <GenericListTab
              title="Vehicles / Drones"
              items={(character.vehicles || []) as any[]}
              fields={["name", "handling", "speed", "body", "armor", "sensor", "pilot", "seats"]}
              referenceCategory="vehicles"
              itemEditMode
              onUpdate={(v) => updateField("vehicles", v)}
            />
          </TabsContent>

          <TabsContent value="spellcasting">
            <GenericListTab
              title="Spells / Preparations / Rituals"
              items={spellcastingItems}
              fields={["name", "category", "type", "drain", "duration", "range", "effects"]}
              fieldOptions={{
                category: ["spell", "preparation", "ritual"],
                type: ["Combat", "Detection", "Health", "Illusion", "Manipulation"],
              }}
              fieldDefaults={{ category: "spell" }}
              magicReferenceCategories={["spells"]}
              itemEditMode
              onUpdate={(newSpells) =>
                updateField("spells", [...newSpells, ...complexFormItems])
              }
            />
          </TabsContent>

          <TabsContent value="complex-forms">
            <GenericListTab
              title="Complex Forms"
              items={complexFormItems}
              fields={["name", "category", "type", "drain", "duration", "range", "effects"]}
              fieldLabels={{ drain: "Fade" }}
              fieldOptions={{
                category: ["complex_form"],
                type: ["Complex Form"],
              }}
              fieldDefaults={{ category: "complex_form", type: "Complex Form" }}
              magicReferenceCategories={["complexForms"]}
              itemEditMode
              onUpdate={(newCF) =>
                updateField("spells", [...spellcastingItems, ...newCF])
              }
            />
          </TabsContent>

          <TabsContent value="adept">
            <GenericListTab
              title="Adept Powers"
              items={(character.adept_powers || []) as any[]}
              fields={["name", "pp_cost", "effects"]}
              numericFields={["pp_cost"]}
              magicReferenceCategory="adeptPowers"
              showDiceModifiers
              itemEditMode
              onUpdate={(a) => updateField("adept_powers", a)}
            />
          </TabsContent>

          <TabsContent value="other">
            <GenericListTab
              title="Other Abilities"
              items={(character.other_abilities || []) as any[]}
              fields={["name", "description"]}
              itemEditMode
              onUpdate={(o) => updateField("other_abilities", o)}
            />
          </TabsContent>
      </main>
      </Tabs>
    </div>
  );
}

