#!/usr/bin/env node
/**
 * Generate multi-rating YAML entries for augmentations and miscellaneous gear.
 * Source: SR6 Core Rulebook City Edition: Seattle tables.
 *
 * Run: node scripts/generate-rated-entries.mjs [augmentations|misc]
 */

// ── Augmentation definitions ──────────────────────────────────────────────────

const LINEAR_AUGMENTATIONS = [
  // Headware (cyberware)
  {
    baseName: "Control Rig",
    aug_type: "cyberware",
    maxRating: 3,
    essenceFormula: (r) => r * 1,
    costFormula: (r) => r * 30000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} dice and +1 Edge when jumped in`,
    diceModifiers: () => [],
    description: "Harnesses middle brain for direct manipulation of rigged vehicles and drones. Built-in sim module, retractable datajack cable. When jumped in: Rating as dice pool bonus on vehicle tests, +1 Edge.",
  },
  {
    baseName: "Datalock",
    aug_type: "cyberware",
    maxRating: 12,
    essenceFormula: () => 0.1,
    costFormula: (r) => r * 1000,
    availability: "4",
    effectsTemplate: (r) => `Walking data safe, Device Rating = ${r}`,
    diceModifiers: () => [],
    description: "Special datajack popular with couriers and spies. Turns the bearer into a walking data safe. Protects data from unauthorized access. Not wireless; universal data connector only. Bearer has no mental access to the data.",
  },
  {
    baseName: "Olfactory booster",
    aug_type: "cyberware",
    maxRating: 3,
    essenceFormula: () => 0.2,
    costFormula: (r) => r * 4000,
    availability: "3",
    effectsTemplate: (r) => `Bonus Edge on scent Perception; cut-off for intense odors`,
    diceModifiers: () => [],
    description: "Cybersnout enhances, identifies, and records smells. Sense emotions in sweat, propellant, explosives. Cut-off ignores intense odors. Wireless: +rating dice to scent-based Perception.",
  },
  {
    baseName: "Skilljack",
    aug_type: "cyberware",
    maxRating: 6,
    essenceFormula: (r) => +(r * 0.1).toFixed(2),
    costFormula: (r) => r * 20000,
    availability: "4",
    effectsTemplate: (r) => `Run knowsofts/linguasofts as own skills; activesofts as Knowledge only; max ${r * 2} total skill ratings`,
    diceModifiers: () => [],
    description: "Interprets knowsofts and linguasofts for your brain. Activesofts only as Knowledge unless you have skillwires. Total skills ≤ rating x 2. Wireless: limit becomes rating x 4, Edge usable.",
  },
  {
    baseName: "Taste booster",
    aug_type: "cyberware",
    maxRating: 3,
    essenceFormula: () => 0.2,
    costFormula: (r) => r * 3000,
    availability: "3",
    effectsTemplate: (r) => `Bonus Edge on taste Perception; taste track in AR/VR`,
    diceModifiers: () => [],
    description: "Enhances taste buds like olfactory booster. Experience gustatory data in AR/VR. Wireless: +rating dice to taste-based Perception.",
  },
  {
    baseName: "Voice modulator",
    aug_type: "cyberware",
    maxRating: 3,
    essenceFormula: () => 0.2,
    costFormula: (r) => r * 5000,
    availability: "4(L)",
    effectsTemplate: (r) => `Perfect pitch, volume to 100dB, vocal impressions; Bonus Edge on sound-based Con`,
    diceModifiers: () => [],
    description: "Perfect pitch, vocal flexibility, volume to 100dB. Play back and imitate recorded voices. Wireless: +rating dice to sound-based Con.",
  },
  // Bodyware (cyberware)
  {
    baseName: "Dermal Plating",
    aug_type: "cyberware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.3).toFixed(2),
    costFormula: (r) => r * 4000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Defense Rating`,
    diceModifiers: () => [],
    description: "Subdermal armor plating. Each rating adds +1 to Defense Rating. Visible under skin in some metatypes.",
  },
  {
    baseName: "Muscle Replacement",
    aug_type: "cyberware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.7).toFixed(2),
    costFormula: (r) => r * 30000,
    availability: "3(L)",
    effectsTemplate: (r) => `+${r} Strength, +${r} Agility`,
    diceModifiers: (r) => [
      { attribute: "strength", value: r, source: "Muscle Replacement" },
      { attribute: "agility", value: r, source: "Muscle Replacement" },
    ],
    description: "Vat-grown synthetic muscles replace your own, with calcium treatments and skeletal reinforcement. Increases both Strength and Agility by rating. Cannot combine with muscle augmentation or muscle toner bioware.",
  },
  {
    baseName: "Reaction Enhancers",
    aug_type: "cyberware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.3).toFixed(2),
    costFormula: (r) => r * 15000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Reaction`,
    diceModifiers: (r) => [
      { attribute: "reaction", value: r, source: "Reaction Enhancers" },
    ],
    description: "Superconducting segments replace isolated vertebrae, boosting spinal signal speed. Adds +1 Reaction per rating. Incompatible with wired reflexes.",
  },
  // Bioware
  {
    baseName: "Adrenaline Pump",
    aug_type: "bioware",
    maxRating: 3,
    essenceFormula: (r) => +(r * 0.75).toFixed(2),
    costFormula: (r) => r * 55000,
    availability: "5(I)",
    effectsTemplate: (r) => `+${r} Strength, +${r} Agility, +${r} Reaction, +${r} Willpower when activated`,
    diceModifiers: () => [],
    description: "Emergency boost system. Physical and emotional stress can force activation. Each rating adds +1 Strength, Agility, Reaction, Willpower when active. Crash afterward.",
  },
  {
    baseName: "Bone Density Augmentation",
    aug_type: "bioware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.3).toFixed(2),
    costFormula: (r) => r * 5000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Physical condition monitor box${r > 1 ? "es" : ""}`,
    diceModifiers: () => [],
    description: "Denser bones. Adds a Physical condition monitor box per rating. Bioware alternative to Bone Lacing.",
  },
  {
    baseName: "Muscle Augmentation",
    aug_type: "bioware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.2).toFixed(2),
    costFormula: (r) => r * 31000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Strength`,
    diceModifiers: (r) => [
      { attribute: "strength", value: r, source: "Muscle Augmentation" },
    ],
    description: "Enhanced muscle mass. +1 Strength per rating. Cannot combine with muscle replacement cyberware. Often paired with Muscle Toner.",
  },
  {
    baseName: "Muscle Toner",
    aug_type: "bioware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.2).toFixed(2),
    costFormula: (r) => r * 32000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Agility`,
    diceModifiers: (r) => [
      { attribute: "agility", value: r, source: "Muscle Toner" },
    ],
    description: "Enhanced muscle fibers. +1 Agility per rating. Cannot combine with muscle replacement cyberware.",
  },
  {
    baseName: "Orthoskin",
    aug_type: "bioware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.25).toFixed(2),
    costFormula: (r) => r * 6000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Defense Rating`,
    diceModifiers: () => [],
    description: "Genetically enhanced skin with a composite of calcium and keratin. Adds +1 Defense Rating per rating. Bioware alternative to Dermal Plating.",
  },
  {
    baseName: "Tailored Pheromones",
    aug_type: "bioware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.2).toFixed(2),
    costFormula: (r) => r * 31000,
    availability: "4(L)",
    effectsTemplate: (r) => `+${r} Charisma`,
    diceModifiers: (r) => [
      { attribute: "charisma", value: r, source: "Tailored Pheromones" },
    ],
    description: "Bio-engineered pheromones. Makes you more likable and persuasive. +1 Charisma per rating. Invisible and undetectable by normal means. Popular with faces and infiltrators.",
  },
  // Cultured bioware
  {
    baseName: "Cerebral Booster",
    aug_type: "bioware",
    maxRating: 3,
    essenceFormula: (r) => +(r * 0.2).toFixed(2),
    costFormula: (r) => r * 31500,
    availability: "5",
    effectsTemplate: (r) => `+${r} Logic`,
    diceModifiers: (r) => [
      { attribute: "logic", value: r, source: "Cerebral Booster" },
    ],
    description: "Additional nervous tissue augments cerebral convolutions and gyri. +1 Logic per rating. Cultured bioware.",
  },
  {
    baseName: "Mnemonic Enhancer",
    aug_type: "bioware",
    maxRating: 3,
    essenceFormula: (r) => +(r * 0.1).toFixed(2),
    costFormula: (r) => r * 9000,
    availability: "5",
    effectsTemplate: (r) => `+${r} dice to Knowledge, Language, and memory tests`,
    diceModifiers: () => [],
    description: "Concentrated grey matter growth attached to memory centers. Adds rating as dice pool bonus to Knowledge, Language, and memory-related tests. Cultured bioware.",
  },
  {
    baseName: "Synaptic Booster",
    aug_type: "bioware",
    maxRating: 3,
    essenceFormula: (r) => +(r * 0.5).toFixed(2),
    costFormula: (r) => r * 95000,
    availability: "5(L)",
    effectsTemplate: (r) => `+${r} Reaction, +${r}d6 Initiative`,
    diceModifiers: (r) => [
      { attribute: "reaction", value: r, source: "Synaptic Booster" },
    ],
    description: "Broadened and replicated spinal cord nerve cells. Each rating provides +1 Reaction (with Initiative Score bonus) and 1 additional Initiative Die (with Minor Action). Cannot be combined with any other Reaction or Initiative enhancement.",
  },
];

// New augmentations not yet in YAML
const NEW_LINEAR_AUGMENTATIONS = [
  {
    baseName: "Internal Air Tank",
    aug_type: "cyberware",
    maxRating: 4,
    essenceFormula: () => 0.25,
    costFormula: (r) => r * 4500,
    availability: "2",
    effectsTemplate: (r) => `Internal air supply, capacity [${r}]`,
    diceModifiers: () => [],
    description: "An implanted air tank allows you to hold a supply of breathable air internally. The tank rating determines how many minutes of air it holds. Protects against inhalation-vector toxins while sealed.",
  },
  {
    baseName: "Skillwires",
    aug_type: "cyberware",
    maxRating: 6,
    essenceFormula: (r) => +(r * 0.1).toFixed(2),
    costFormula: (r) => r * 20000,
    availability: "4",
    effectsTemplate: (r) => `Run activesofts at rating ${r}; max rating ${r} per skill`,
    diceModifiers: () => [],
    description: "Neuromuscular controllers overlay the body's natural nervous system, capable of aiding or completely overriding muscle movements. Required to use activesofts as Active Skills (not just Knowledge). Maximum skill rating equals skillwires rating.",
  },
  {
    baseName: "Symbiotes",
    aug_type: "bioware",
    maxRating: 4,
    essenceFormula: (r) => +(r * 0.2).toFixed(2),
    costFormula: (r) => r * 3500,
    availability: "4",
    effectsTemplate: (r) => `+${r} to natural healing tests`,
    diceModifiers: () => [],
    description: "Tailored micro-organisms in your bloodstream greatly enhance healing. Add rating as dice pool bonus to natural healing tests. Must increase Lifestyle costs by 25% to keep them fed; if not fed, they die in a month.",
  },
  {
    baseName: "Synthacardium",
    aug_type: "bioware",
    maxRating: 3,
    essenceFormula: (r) => +(r * 0.1).toFixed(2),
    costFormula: (r) => r * 30000,
    availability: "3",
    effectsTemplate: (r) => `+${r} to cardiovascular-related Athletics tests`,
    diceModifiers: () => [],
    description: "Artificially enhanced myocardium allows cardiovascular functions to be performed more efficiently. Add rating as dice pool bonus to Athletics tests involving cardiovascular endurance (running, swimming, etc.).",
  },
  {
    baseName: "Toxin Extractor",
    aug_type: "bioware",
    maxRating: 6,
    essenceFormula: (r) => +(r * 0.2).toFixed(2),
    costFormula: (r) => r * 4800,
    availability: "4",
    effectsTemplate: (r) => `+${r} dice to Toxin Resistance tests`,
    diceModifiers: () => [],
    description: "A specially cultivated cluster of cells in your liver improves its filtering capabilities. Add rating as dice pool bonus to Toxin Resistance tests for ingested toxins.",
  },
  {
    baseName: "Tracheal Filter",
    aug_type: "bioware",
    maxRating: 6,
    essenceFormula: (r) => +(r * 0.1).toFixed(2),
    costFormula: (r) => r * 4500,
    availability: "4",
    effectsTemplate: (r) => `+${r} dice to Toxin Resistance vs inhalation toxins`,
    diceModifiers: () => [],
    description: "Implanted at the top of the trachea, this organ absorbs airborne impurities. Add rating as dice pool bonus to Toxin Resistance tests versus inhalation-vector toxins.",
  },
  {
    baseName: "Damage Compensator",
    aug_type: "bioware",
    maxRating: 12,
    essenceFormula: (r) => +(r * 0.1).toFixed(2),
    costFormula: (r) => r * 2000,
    availability: "5(L)",
    effectsTemplate: (r) => `Ignore ${r} damage box${r > 1 ? "es" : ""} before determining injury modifiers`,
    diceModifiers: () => [],
    description: "Cut-offs stored in nervous pathways block pain signals. Ignore a number of damage boxes (Physical, Stun, or combination) equal to rating before determining injury modifiers. Cultured bioware.",
  },
];

// Non-linear augmentations — each rating has unique stats
const NONLINEAR_AUGMENTATIONS = [
  {
    baseName: "Cyberjack",
    aug_type: "cyberware",
    ratings: [
      { rating: 1, essence_cost: 1, cost: 45000, availability: "3(L)", effects: "D/F 4/3, +1 Matrix Initiative; decker defense" },
      { rating: 2, essence_cost: 1.5, cost: 65000, availability: "3(L)", effects: "D/F 5/4, +1 Matrix Initiative; decker defense" },
      { rating: 3, essence_cost: 2, cost: 80000, availability: "3(L)", effects: "D/F 6/5, +1 Matrix Initiative; decker defense" },
      { rating: 4, essence_cost: 2.3, cost: 95000, availability: "4(L)", effects: "D/F 7/6, +2 Matrix Initiative; decker defense" },
      { rating: 5, essence_cost: 2.6, cost: 140000, availability: "5(L)", effects: "D/F 8/7, +2 Matrix Initiative; decker defense" },
      { rating: 6, essence_cost: 3, cost: 210000, availability: "6(L)", effects: "D/F 9/8, +2 Matrix Initiative; decker defense" },
    ],
    diceModifiers: () => [],
    description: "Harnesses brain for Matrix protocols. Primary defense against hacking. Functions as datajack. Enables special Matrix Edge Actions. Essential for deckers.",
  },
  {
    baseName: "Cybereyes",
    aug_type: "cyberware",
    ratings: [
      { rating: 1, essence_cost: 0.1, cost: 1000, availability: "2", effects: "Replacement eyes with capacity 1 for modifications" },
      { rating: 2, essence_cost: 0.2, cost: 4000, availability: "2", effects: "Replacement eyes with capacity 4 for modifications" },
      { rating: 3, essence_cost: 0.3, cost: 6000, availability: "3", effects: "Replacement eyes with capacity 8 for modifications" },
      { rating: 4, essence_cost: 0.4, cost: 10000, availability: "3", effects: "Replacement eyes with capacity 12 for modifications" },
      { rating: 5, essence_cost: 0.5, cost: 16000, availability: "3", effects: "Replacement eyes with capacity 16 for modifications" },
    ],
    diceModifiers: () => [],
    description: "Cybernetic replacement eyes. Rating indicates quality and capacity for add-ons like low-light, thermographic vision, or image link. Higher ratings allow more modifications. Essence cost increases with rating.",
  },
  {
    baseName: "Cyberears",
    aug_type: "cyberware",
    ratings: [
      { rating: 1, essence_cost: 0.1, cost: 1000, availability: "2", effects: "Replacement ears with capacity 1 for audio enhancements" },
      { rating: 2, essence_cost: 0.2, cost: 3000, availability: "2", effects: "Replacement ears with capacity 4 for audio enhancements" },
      { rating: 3, essence_cost: 0.3, cost: 4500, availability: "3", effects: "Replacement ears with capacity 8 for audio enhancements" },
      { rating: 4, essence_cost: 0.4, cost: 7500, availability: "3", effects: "Replacement ears with capacity 12 for audio enhancements" },
      { rating: 5, essence_cost: 0.5, cost: 11000, availability: "3", effects: "Replacement ears with capacity 16 for audio enhancements" },
    ],
    diceModifiers: () => [],
    description: "Cybernetic replacement ears. Rating indicates quality and capacity for add-ons like audio enhancement, spatial recognizer, or damper. Pairs well with cybereyes for full sensory suite.",
  },
  {
    baseName: "Wired Reflexes",
    aug_type: "cyberware",
    ratings: [
      { rating: 1, essence_cost: 1, cost: 40000, availability: "3(L)", effects: "+1 Reaction, +1d6 Initiative" },
      { rating: 2, essence_cost: 2, cost: 150000, availability: "3(L)", effects: "+2 Reaction, +2d6 Initiative" },
      { rating: 3, essence_cost: 3, cost: 250000, availability: "4(I)", effects: "+3 Reaction, +3d6 Initiative" },
      { rating: 4, essence_cost: 4, cost: 400000, availability: "6(I)", effects: "+4 Reaction, +4d6 Initiative" },
    ],
    diceModifiers: (r) => [
      { attribute: "reaction", value: r, source: "Wired Reflexes" },
    ],
    description: "Neural accelerator. Boosts reaction time and initiative. Each rating adds +1 Reaction and +1 Initiative Die. The classic street samurai upgrade.",
  },
];

// ── Miscellaneous definitions ─────────────────────────────────────────────────

const LINEAR_MISC = [
  {
    baseName: "Fake SIN",
    maxRating: 6,
    costFormula: (r) => r * 2500,
    availability: "4(I)",
    notesTemplate: (r) => {
      const labels = { 1: "Basic", 2: "Low quality", 3: "Average quality", 4: "Quality", 5: "High quality", 6: "Premium" };
      return `${labels[r]} fake identity`;
    },
    description: "A fake System Identification Number. Rating indicates quality—how well it holds up to scrutiny. Higher ratings cost more but stand up better to Matrix and authority checks. Essential for any runner operating in civilized areas.",
  },
  {
    baseName: "Fake license",
    maxRating: 6,
    costFormula: (r) => r * 200,
    availability: "4(I)",
    notesTemplate: (r) => `Rating ${r} fake permit for restricted items; rating vs verification`,
    description: "Fake license for restricted items and activities. Must be assigned to a fake SIN. Rating used against verification systems. Cannot exceed attached SIN's rating.",
  },
  {
    baseName: "Medkit",
    maxRating: 6,
    costFormula: (r) => r * 250,
    availabilityFormula: (r) => r <= 3 ? "2" : "3",
    notesTemplate: (r) => `+${r} dice to First Aid tests`,
    description: "Portable medical kit for field first aid. Rating indicates capability. Wireless bonus: Displays patient condition and provides guided instructions for treatment.",
  },
  {
    baseName: "Stim Patch",
    maxRating: 6,
    costFormula: (r) => r * 50,
    availability: "3",
    notesTemplate: (r) => `Removes ${r} Stun damage and cancels Dazed for ${r * 10} min; then take ${r + 1}S unresisted`,
    description: "Transdermal stimulant patch. Removes Stun damage equal to rating and cancels the Dazed Status. Effect lasts (rating x 10) minutes, then patient takes (rating+1) unresisted Stun damage.",
  },
  {
    baseName: "Headjammer",
    maxRating: 6,
    costFormula: (r) => r * 150,
    availability: "5(I)",
    notesTemplate: (r) => `Rating ${r} jammer for implanted devices`,
    description: "Neutralizes implanted commlinks and cyberdecks. Attaches to the location of the device and jams wireless signals. Removing without the key requires an Extended test.",
  },
  {
    baseName: "Jammer, area",
    maxRating: 6,
    costFormula: (r) => r * 200,
    availability: "4(L)",
    notesTemplate: (r) => `Rating ${r} area wireless jammer; -1 per 10m from center`,
    description: "Floods airwaves with jamming signals. Generates noise equal to Device Rating. Rating reduced by 1 for every 10 meters from center. Affects all devices in area.",
  },
  {
    baseName: "Jammer, directional",
    maxRating: 6,
    costFormula: (r) => r * 200,
    availability: "4(L)",
    notesTemplate: (r) => `Rating ${r} directional jammer; 30-degree spread, -1 per 30m`,
    description: "Directional jammer with 30-degree spread. Rating reduced by 1 for every 30 meters from center. More focused than area jammer.",
  },
  {
    baseName: "White Noise Generator",
    maxRating: 6,
    costFormula: (r) => r * 50,
    availability: "3",
    notesTemplate: (r) => `Jams audio surveillance, ${r}m radius; -${r} to eavesdropping Perception`,
    description: "Creates a field of random noise that inhibits audio surveillance. All Perception tests to overhear a conversation within (rating) meters receive a negative dice pool modifier equal to rating. Wireless: effective radius tripled.",
  },
  {
    baseName: "Contacts",
    maxRating: 3,
    costFormula: (r) => r * 200,
    availability: "2",
    notesTemplate: (r) => `Capacity ${r} for vision enhancements; nearly undetectable`,
    description: "Worn on eyes, nearly undetectable. Capacity for vision enhancements. Must be wireless. Capacity x 200¥.",
  },
  {
    baseName: "Glasses",
    maxRating: 4,
    costFormula: (r) => r * 100,
    availability: "1",
    notesTemplate: (r) => `Capacity ${r} for vision enhancements`,
    description: "Lightweight frames. Hard to distinguish from prescription or sunglasses. Capacity for vision enhancements. Capacity x 100¥.",
  },
  {
    baseName: "Goggles",
    maxRating: 6,
    costFormula: (r) => r * 50,
    availability: "1",
    notesTemplate: (r) => `Capacity ${r}; bulky, hard to dislodge`,
    description: "Strapped to head, difficult to dislodge. Wide array of vision enhancements. Capacity x 50¥.",
  },
  {
    baseName: "MapMaster Sensor Fob",
    maxRating: 6,
    costFormula: (r) => r * 300,
    availability: "3",
    notesTemplate: (r) => `Rating ${r}. Yearly subscription. +${r} dice to Outdoors navigation in mapped areas.`,
    description: "Horizon handheld LIDAR/ultrasound sensor that scans underground locations and matches against its MapMaster topological database. Adds rating as dice pool bonus to Outdoors tests involving navigation in mapped areas. Bonus halved in unmapped/newly excavated areas. Cost is rating x 300 nuyen per year.",
    source: "Core Rulebook (City Edition)",
  },
  {
    baseName: "Tranq Patch",
    maxRating: 12,
    costFormula: (r) => r * r * 10,
    availability: "3",
    notesTemplate: (r) => `Rating ${r} tranquilizer patch; Stun ${r}S(e) vs Body + Willpower`,
    description: "Transdermal tranquilizer. Apply to deliver a dose. Effects depend on target's Body + Willpower resistance. Higher ratings are increasingly expensive.",
    isNew: true,
  },
];

// ── YAML formatting helpers ───────────────────────────────────────────────────

function formatDiceModifiers(mods) {
  if (!mods || mods.length === 0) return "[]";
  const items = mods.map((m) => {
    const parts = [];
    if (m.attribute) parts.push(`attribute: "${m.attribute}"`);
    parts.push(`value: ${m.value}`);
    parts.push(`source: "${m.source}"`);
    if (m.requires_accessory) parts.push(`requires_accessory: "${m.requires_accessory}"`);
    return `{ ${parts.join(", ")} }`;
  });
  return `[${items.join(", ")}]`;
}

function generateAugEntry(name, rating, aug_type, essence_cost, cost, availability, effects, diceModifiers, description) {
  const lines = [
    `- name: ${name} (Rating ${rating})`,
    `  cost: ${cost}`,
    `  availability: "${availability}"`,
    `  aug_type: ${aug_type}`,
    `  essence_cost: ${essence_cost}`,
    `  rating: ${rating}`,
    `  effects: "${effects}"`,
    `  dice_modifiers: ${formatDiceModifiers(diceModifiers)}`,
    `  source: "Core Rulebook"`,
    `  description: "${description.replace(/"/g, '\\"')}"`,
  ];
  return lines.join("\n");
}

function generateMiscEntry(name, rating, cost, availability, notes, description, source) {
  const lines = [
    `- name: ${name} (Rating ${rating})`,
    `  cost: ${cost}`,
    `  availability: "${availability}"`,
    `  notes: "${notes}"`,
    `  dice_modifiers: []`,
    `  source: "${source || "Core Rulebook"}"`,
    `  description: "${description.replace(/"/g, '\\"')}"`,
  ];
  return lines.join("\n");
}

// ── Generation logic ──────────────────────────────────────────────────────────

function generateAugmentations() {
  const entries = [];

  // Linear augmentations — generate ratings 2+ (Rating 1 already exists)
  for (const def of LINEAR_AUGMENTATIONS) {
    for (let r = 2; r <= def.maxRating; r++) {
      entries.push(
        generateAugEntry(
          def.baseName, r, def.aug_type,
          def.essenceFormula(r), def.costFormula(r),
          def.availability,
          def.effectsTemplate(r), def.diceModifiers(r),
          def.description
        )
      );
    }
  }

  // New augmentations — generate ALL ratings (not yet in YAML)
  for (const def of NEW_LINEAR_AUGMENTATIONS) {
    for (let r = 1; r <= def.maxRating; r++) {
      entries.push(
        generateAugEntry(
          def.baseName, r, def.aug_type,
          def.essenceFormula(r), def.costFormula(r),
          def.availability,
          def.effectsTemplate(r), def.diceModifiers(r),
          def.description
        )
      );
    }
  }

  // Non-linear augmentations — generate ratings 2+ from lookup tables
  for (const def of NONLINEAR_AUGMENTATIONS) {
    for (const ratingData of def.ratings) {
      if (ratingData.rating === 1) continue; // Rating 1 already exists
      entries.push(
        generateAugEntry(
          def.baseName, ratingData.rating, def.aug_type,
          ratingData.essence_cost, ratingData.cost,
          ratingData.availability,
          ratingData.effects, def.diceModifiers(ratingData.rating),
          def.description
        )
      );
    }
  }

  return entries;
}

function generateMisc() {
  const entries = [];
  for (const def of LINEAR_MISC) {
    const startRating = def.isNew ? 1 : 2;
    for (let r = startRating; r <= def.maxRating; r++) {
      const avail = def.availabilityFormula ? def.availabilityFormula(r) : def.availability;
      entries.push(
        generateMiscEntry(
          def.baseName, r, def.costFormula(r), avail,
          def.notesTemplate(r), def.description,
          def.source
        )
      );
    }
  }
  return entries;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const mode = process.argv[2] || "all";
if (mode === "augmentations" || mode === "all") {
  console.log("# ═══ GENERATED AUGMENTATION ENTRIES ═══");
  console.log("# Paste these into augmentations.yaml, grouped with their Rating 1 counterparts\n");
  const augEntries = generateAugmentations();
  console.log(augEntries.join("\n\n"));
  console.log(`\n# Total: ${augEntries.length} entries generated`);
}
if (mode === "misc" || mode === "all") {
  console.log("\n\n# ═══ GENERATED MISCELLANEOUS ENTRIES ═══");
  console.log("# Paste these into miscellaneous.yaml, grouped with their existing counterparts\n");
  const miscEntries = generateMisc();
  console.log(miscEntries.join("\n\n"));
  console.log(`\n# Total: ${miscEntries.length} entries generated`);
}
