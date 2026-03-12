import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SAMPLE_CHARACTERS = [
  {
    name: "Razor",
    metatype: "Ork",
    priorities: { metatype: "C", attributes: "A", magic_resonance: "E", skills: "B", resources: "D" },
    attributes: {
      body: 7, agility: 5, reaction: 5, strength: 6,
      willpower: 3, logic: 2, intuition: 4, charisma: 2,
      edge: 3, essence: 2.7, magic: 0, resonance: 0,
    },
    skills: [
      { id: "s1", name: "Firearms", attribute: "agility", rating: 6, specialization: "Assault Rifles" },
      { id: "s2", name: "Close Combat", attribute: "agility", rating: 5, specialization: "Blades" },
      { id: "s3", name: "Athletics", attribute: "agility", rating: 4 },
      { id: "s4", name: "Perception", attribute: "intuition", rating: 3 },
      { id: "s5", name: "Stealth", attribute: "agility", rating: 3 },
      { id: "s6", name: "Piloting", attribute: "reaction", rating: 2 },
    ],
    qualities: [
      { id: "q1", name: "Toughness", type: "positive", karma_cost: 12, effects: "+1 Body for damage resistance" },
      { id: "q2", name: "Guts", type: "positive", karma_cost: 12, effects: "+2 dice to resist Intimidation" },
      { id: "q3", name: "Bad Rep", type: "negative", karma_cost: -8, effects: "+1 Notoriety" },
    ],
    augmentations: [
      { id: "a1", name: "Wired Reflexes 2", type: "cyberware", essence_cost: 3.0, rating: 2, effects: "+2 Reaction, +2d6 Initiative" },
      { id: "a2", name: "Smartlink", type: "cyberware", essence_cost: 0.2, rating: 0, effects: "Smartgun bonuses" },
      { id: "a3", name: "Cybereyes Rating 2", type: "cyberware", essence_cost: 0.1, rating: 2, effects: "Vision enhancements" },
    ],
    ranged_weapons: [
      { id: "rw1", name: "Ares Alpha", dv: "5P", ar: "4/10/6/-/-", fire_modes: "SA/BF/FA", ammo: "42(c)", equipped: true, accessories: [{ name: "Smartgun System (Internal)", ar_modifier: "+2/+2/+2/+2/+2" }] },
      { id: "rw2", name: "Ares Predator VI", dv: "3P", ar: "10/10/8/-/-", fire_modes: "SA", ammo: "15(c)", equipped: true, accessories: [{ name: "Smartgun System (Internal)", ar_modifier: "+2/+2/+2/+2/+2" }] },
    ],
    melee_weapons: [
      { id: "mw1", name: "Katana", dv: "4P", ar: "10/3/-/-/-", reach: 1, equipped: true },
    ],
    armor: [
      { id: "ar1", name: "Armor Jacket", rating: 4, capacity: 8, modifications: "", subtype: "body", equipped: true },
      { id: "ar2", name: "Ballistic Mask", rating: 2, capacity: 3, modifications: "", subtype: "helmet", equipped: true },
    ],
    gear: [
      { id: "g1", name: "Medkit Rating 6", quantity: 1, notes: "6 dice for First Aid", equipped: true },
      { id: "g2", name: "Stim Patch Rating 4", quantity: 3, notes: "Heals 4 boxes Stun", equipped: true },
    ],
    contacts: [
      { id: "c1", name: "Fixer Mike", loyalty: 3, connection: 4, notes: "Downtown Seattle" },
      { id: "c2", name: "Doc Wagon EMT", loyalty: 2, connection: 3, notes: "Patched me up more than once" },
    ],
    ids_lifestyles: { sins: [{ id: "sin1", name: "John Smith", rating: 4 }], licenses: [{ id: "l1", name: "Concealed Carry", rating: 4, sin_id: "sin1" }], lifestyles: [{ id: "ls1", name: "Middle", tier: "Middle", months_paid: 3 }], nuyen: 2340 },
    personal_info: { ethnicity: "Ork", age: 28, sex: "Male", height: "195cm", weight: "120kg", street_cred: 4, notoriety: 2, public_awareness: 0, description: "A heavily augmented ork street samurai with a no-nonsense attitude.", backstory: "Grew up in the Ork Underground, learned to fight before he could read." },
    karma_ledger: [{ id: "k1", type: "creation", amount: 50, description: "Starting Karma", timestamp: new Date().toISOString() }],
    vehicles: [],
    spells: [],
    adept_powers: [],
    other_abilities: [],
    notes: [{ id: "n1", title: "Session Notes", content: "First run went sideways. Need better recon next time." }],
    matrix_stats: { device_rating: 2, attack: 0, sleaze: 0, data_processing: 2, firewall: 2, programs: [] },
  },
  {
    name: "Pixel",
    metatype: "Human",
    priorities: { metatype: "E", attributes: "B", magic_resonance: "A", skills: "C", resources: "D" },
    attributes: {
      body: 2, agility: 3, reaction: 4, strength: 1,
      willpower: 5, logic: 6, intuition: 5, charisma: 3,
      edge: 4, essence: 6, magic: 0, resonance: 6,
    },
    skills: [
      { id: "s1", name: "Cracking", attribute: "logic", rating: 6, specialization: "Hacking" },
      { id: "s2", name: "Electronics", attribute: "logic", rating: 5, specialization: "Computer" },
      { id: "s3", name: "Perception", attribute: "intuition", rating: 3 },
      { id: "s4", name: "Stealth", attribute: "agility", rating: 2 },
      { id: "s5", name: "Tasking", attribute: "resonance", rating: 5 },
    ],
    qualities: [
      { id: "q1", name: "Analytical Mind", type: "positive", karma_cost: 3, effects: "+2 to Logic tests involving pattern recognition" },
      { id: "q2", name: "Social Stress", type: "negative", karma_cost: -8, effects: "Difficulty in large social situations" },
    ],
    ranged_weapons: [
      { id: "rw1", name: "Fichetti Security 600", dv: "2P", ar: "9/8/6/-/-", fire_modes: "SA", ammo: "30(c)", equipped: true },
    ],
    melee_weapons: [],
    armor: [
      { id: "ar1", name: "Lined Coat", rating: 3, capacity: 6, modifications: "", subtype: "body", equipped: true },
    ],
    augmentations: [],
    gear: [
      { id: "g1", name: "Hermes Chariot Commlink", quantity: 1, notes: "DR 4", equipped: true },
      { id: "g2", name: "Novatech Navigator", quantity: 1, notes: "Backup deck DR 3", equipped: false },
    ],
    contacts: [
      { id: "c1", name: "DataHaven Admin", loyalty: 4, connection: 5, notes: "Runs a private host" },
    ],
    ids_lifestyles: { sins: [{ id: "sin1", name: "Alex Park", rating: 2 }], licenses: [], lifestyles: [{ id: "ls1", name: "Low", tier: "Low", months_paid: 6 }], nuyen: 870 },
    personal_info: { ethnicity: "Human", age: 22, sex: "Non-binary", height: "165cm", weight: "55kg", street_cred: 2, notoriety: 0, public_awareness: 0, description: "Slight, pale, always distracted by data streams only they can see.", backstory: "Emerged as a technomancer at 16, been hiding it since." },
    karma_ledger: [{ id: "k1", type: "creation", amount: 50, description: "Starting Karma", timestamp: new Date().toISOString() }],
    spells: [],
    adept_powers: [],
    other_abilities: [{ id: "oa1", name: "Living Persona", description: "Can access the Matrix without a device" }],
    vehicles: [],
    notes: [],
    matrix_stats: { device_rating: 6, attack: 5, sleaze: 6, data_processing: 6, firewall: 5, programs: ["Exploit", "Stealth", "Toolbox"] },
  },
  {
    name: "Whisper",
    metatype: "Elf",
    priorities: { metatype: "B", attributes: "C", magic_resonance: "A", skills: "D", resources: "E" },
    attributes: {
      body: 2, agility: 5, reaction: 3, strength: 1,
      willpower: 5, logic: 4, intuition: 5, charisma: 6,
      edge: 3, essence: 6, magic: 6, resonance: 0,
    },
    skills: [
      { id: "s1", name: "Sorcery", attribute: "magic", rating: 6, specialization: "Spellcasting" },
      { id: "s2", name: "Conjuring", attribute: "magic", rating: 5 },
      { id: "s3", name: "Astral", attribute: "intuition", rating: 4 },
      { id: "s4", name: "Influence", attribute: "charisma", rating: 3, specialization: "Negotiation" },
      { id: "s5", name: "Perception", attribute: "intuition", rating: 3 },
    ],
    qualities: [
      { id: "q1", name: "Focused Concentration 3", type: "positive", karma_cost: 36, effects: "Sustain 3 spells without penalty" },
      { id: "q2", name: "Spirit Affinity (Fire)", type: "positive", karma_cost: 14, effects: "+2 dice for summoning/binding fire spirits" },
      { id: "q3", name: "Allergy (Silver, Moderate)", type: "negative", karma_cost: -12, effects: "Take damage from prolonged silver contact" },
    ],
    spells: [
      { id: "sp1", name: "Manabolt", category: "spell", type: "Combat", drain: "4", duration: "Instant", range: "LOS", effects: "Direct mana damage" },
      { id: "sp2", name: "Stunball", category: "spell", type: "Combat", drain: "4", duration: "Instant", range: "LOS (A)", effects: "Area stun damage" },
      { id: "sp3", name: "Improved Invisibility", category: "spell", type: "Illusion", drain: "4", duration: "Sustained", range: "LOS", effects: "Subject invisible to normal and technological senses" },
      { id: "sp4", name: "Heal", category: "spell", type: "Health", drain: "3", duration: "Permanent", range: "Touch", effects: "Heals physical damage" },
      { id: "sp5", name: "Detect Life", category: "spell", type: "Detection", drain: "3", duration: "Sustained", range: "Touch (A)", effects: "Detect living beings" },
      { id: "sp6", name: "Levitate", category: "spell", type: "Manipulation", drain: "4", duration: "Sustained", range: "LOS", effects: "Move target through the air" },
    ],
    ranged_weapons: [],
    melee_weapons: [{ id: "mw1", name: "Combat Knife", dv: "2P", ar: "8/2/-/-/-", reach: 0, equipped: true }],
    armor: [{ id: "ar1", name: "Armor Clothing", rating: 2, capacity: 4, modifications: "", subtype: "body", equipped: true }],
    augmentations: [],
    gear: [
      { id: "g1", name: "Power Focus Rating 2", quantity: 1, notes: "Bonded, +2 to Magic for drain resistance", equipped: true },
      { id: "g2", name: "Reagents", quantity: 20, notes: "For ritual spellcasting", equipped: true },
    ],
    contacts: [
      { id: "c1", name: "Talismonger", loyalty: 3, connection: 3, notes: "Supplies magical goods" },
      { id: "c2", name: "Street Doc (Awakened)", loyalty: 2, connection: 2, notes: "Understands magical injuries" },
    ],
    ids_lifestyles: { sins: [{ id: "sin1", name: "Elara Moonwhisper", rating: 3 }], licenses: [{ id: "l1", name: "Mage License", rating: 3, sin_id: "sin1" }], lifestyles: [{ id: "ls1", name: "Low", tier: "Low", months_paid: 2 }], nuyen: 450 },
    personal_info: { ethnicity: "Elf", age: 45, sex: "Female", height: "178cm", weight: "58kg", street_cred: 3, notoriety: 1, public_awareness: 1, description: "Ethereal presence, silver-white hair, eyes that shift color with the astral.", backstory: "Trained in a remote elven community, came to the sprawl seeking answers about a mentor spirit." },
    karma_ledger: [{ id: "k1", type: "creation", amount: 50, description: "Starting Karma", timestamp: new Date().toISOString() }],
    adept_powers: [],
    other_abilities: [],
    vehicles: [],
    notes: [],
    matrix_stats: { device_rating: 1, attack: 0, sleaze: 0, data_processing: 1, firewall: 1, programs: [] },
  },
  {
    name: "Silk",
    metatype: "Human",
    priorities: { metatype: "E", attributes: "B", magic_resonance: "D", skills: "A", resources: "C" },
    attributes: {
      body: 3, agility: 3, reaction: 3, strength: 2,
      willpower: 4, logic: 4, intuition: 5, charisma: 7,
      edge: 5, essence: 6, magic: 0, resonance: 0,
    },
    skills: [
      { id: "s1", name: "Influence", attribute: "charisma", rating: 6, specialization: "Negotiation" },
      { id: "s2", name: "Con", attribute: "charisma", rating: 6, specialization: "Impersonation" },
      { id: "s3", name: "Perception", attribute: "intuition", rating: 5 },
      { id: "s4", name: "Firearms", attribute: "agility", rating: 3, specialization: "Light Pistols" },
      { id: "s5", name: "Stealth", attribute: "agility", rating: 3, specialization: "Palming" },
      { id: "s6", name: "Electronics", attribute: "logic", rating: 2 },
    ],
    qualities: [
      { id: "q1", name: "First Impression", type: "positive", karma_cost: 12, effects: "+2 dice on social tests on first meeting" },
      { id: "q2", name: "Blandness", type: "positive", karma_cost: 8, effects: "Hard to describe or remember" },
      { id: "q3", name: "Distinctive Style", type: "negative", karma_cost: -5, effects: "When not in disguise, +2 to being identified" },
    ],
    ranged_weapons: [
      { id: "rw1", name: "Walther Palm Pistol", dv: "2P", ar: "8/4/-/-/-", fire_modes: "SS", ammo: "2(b)", equipped: true, notes: "Easily concealed" },
    ],
    melee_weapons: [],
    armor: [{ id: "ar1", name: "Actioneer Business Clothes", rating: 2, capacity: 4, modifications: "", subtype: "body", equipped: true }],
    augmentations: [],
    gear: [
      { id: "g1", name: "Disguise Kit", quantity: 1, notes: "Tools for quick costume changes", equipped: true },
      { id: "g2", name: "Micro-Transceiver", quantity: 1, notes: "Subvocal mic, earpiece", equipped: true },
      { id: "g3", name: "Fake SIN Rating 6", quantity: 1, notes: "Corporate exec identity", equipped: true },
    ],
    contacts: [
      { id: "c1", name: "Corporate Secretary", loyalty: 3, connection: 5, notes: "Access to meeting schedules" },
      { id: "c2", name: "Club Owner", loyalty: 4, connection: 4, notes: "Neutral ground for meets" },
      { id: "c3", name: "Lone Star Detective", loyalty: 2, connection: 4, notes: "Owes me a favor" },
    ],
    ids_lifestyles: { sins: [{ id: "sin1", name: "Victoria Sterling", rating: 6 }, { id: "sin2", name: "Jane Doe", rating: 2 }], licenses: [], lifestyles: [{ id: "ls1", name: "High", tier: "High", months_paid: 1 }], nuyen: 8200 },
    personal_info: { ethnicity: "Human", age: 34, sex: "Female", height: "170cm", weight: "62kg", street_cred: 5, notoriety: 0, public_awareness: 0, description: "Could be anyone. Forgettable face, perfect posture, designer clothes.", backstory: "Former corporate negotiator who went freelance after discovering her employer's darkest secrets." },
    karma_ledger: [{ id: "k1", type: "creation", amount: 50, description: "Starting Karma", timestamp: new Date().toISOString() }],
    spells: [],
    adept_powers: [],
    other_abilities: [],
    vehicles: [{ id: "v1", name: "Shin-Hyung", handling: "4/5", speed: "200", body: 7, armor: 6, sensor: 2, pilot: 1, seats: 4, notes: "Luxury sedan" }],
    notes: [],
    matrix_stats: { device_rating: 3, attack: 0, sleaze: 0, data_processing: 3, firewall: 3, programs: [] },
  },
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller is a real user
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Use service role to bypass RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const toInsert = SAMPLE_CHARACTERS.map((char) => ({
      ...char,
      user_id: userId,
    }));

    const { data, error } = await adminClient
      .from("characters")
      .insert(toInsert)
      .select("id, name");

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ message: `Seeded ${data.length} characters`, characters: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
