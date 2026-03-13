# Dice Pool Architecture

This document explains how dice pools are calculated in Shadow Dice Forge, catalogs every
Shadowrun 6th Edition factor that can affect them, identifies gaps between the rules and the
current implementation, and proposes a unified modifier architecture to close those gaps.

---

## 1. SR6 Dice Pool Formula (Rules Reference)

In SR6, nearly every test resolves by rolling a pool of six-sided dice. The size of that pool
depends on the type of test being made.

### Skill tests

```
Dice Pool = Attribute + Skill Rating + Modifiers
```

The linked attribute is defined per skill (e.g., Firearms uses Agility, Con uses Charisma).
Modifiers come from qualities, augmentations, gear, wound penalties, and situational factors.

### Weapon attack tests

```
Dice Pool = Attribute + Skill Rating + Modifiers + Specialization (+2) + Expertise (+3)
```

- Ranged weapons use **Agility + Firearms**.
- Melee weapons use **Agility + Close Combat** (or Exotic Weapons for exotic subtypes).
- Specialization bonus (+2) applies when the skill's specialization matches the weapon subtype.
- Expertise bonus (+3) applies when the skill's expertise matches the weapon subtype.
- Conditional modifiers (e.g., Smartgun wireless +1 dice pool) layer on top.

Note: firing modes (SA, BF, FA) modify **Attack Rating and DV**, not the dice pool. Wide
burst splits the dice pool between two targets but does not add/subtract from it. See the
firing mode table in Section 3.

### Defense tests

```
Dice Pool = Reaction + Intuition + situational modifiers
```

Combat Sense (adept power or spell) adds dice per level. Cover Status adds +1 per level
to both Defense Rating and the defense test dice pool.

### Damage resistance (Defense Rating)

```
Defense Rating = Body + Armor Rating + DR modifiers
```

Not a dice pool per se, but determines whether the attacker or defender gains Edge. Armor
stacking rules apply (one body armor + one helmet + one shield).

### Drain resistance

```
Dice Pool = Willpower + tradition-linked attribute
```

Hermetic: WIL + LOG. Shamanic: WIL + CHA. Used to resist Drain from spellcasting.

### Fade resistance (Technomancers)

```
Dice Pool = Willpower + Resonance (or Logic, varies by form)
```

### Initiative

```
Initiative Score = Reaction + Intuition + modifiers
Initiative Dice  = 1D6 + bonus dice (max 5D6 total)
```

### Derived stats (attribute pairs)

| Stat | Formula |
|------|---------|
| Composure | WIL + CHA |
| Judge Intentions | WIL + INT |
| Memory | LOG + WIL |
| Lift/Carry | STR + BOD (carry), ×2 (lift) |
| Movement | (REA + STR) / 2 m |

---

## 2. Current Implementation

The app has three distinct calculation paths.

### Path A: Skill and weapon dice pools

**Files:** `src/lib/dice-pool.ts`

**`calculateDicePool()`** computes the base pool for any skill test:

```
Total = Attribute + Skill Rating + sum(Modifiers)
```

It iterates `dice_modifiers` from these sources, filtering to only non-attribute modifiers
(`!mod.attribute`):

1. **Qualities** (`SR6Quality.dice_modifiers`)
2. **Augmentations** (`SR6Augmentation.dice_modifiers`)
3. **Gear** (`SR6Gear.dice_modifiers`)
4. **Adept Powers** (`SR6AdeptPower.dice_modifiers`, when `enabled !== false`)
5. **Active Spells** (`SR6Spell.dice_modifiers`, when spell/ritual is marked Active)
6. **Wound penalty** (flat negative from condition monitor)

Each modifier is also checked by `modifierApplies()`, which gates on `requires_accessory`:
if a modifier has `requires_accessory` set (e.g., `"Smartgun"` on the Smartlink augmentation),
it only applies when the weapon's accessories include a matching name (case-insensitive
substring match).

**`calculateWeaponPool()`** wraps `calculateDicePool()` and adds:

- **Specialization** (+2) when `skill.specialization === weaponSubtype`
- **Expertise** (+3) when `skill.expertise === weaponSubtype`

**Consumers:**

| Component | Context |
|-----------|---------|
| `PrimaryEquipmentBlock.tsx` | Core page primary weapon pool |
| `EquippedGearTab.tsx` | Pool pill on each equipped weapon |
| `SkillsTab.tsx` | Per-skill pool display |

### Path B: Derived stats (attribute modifiers)

**File:** `src/components/character/AttributesTab.tsx`

**`collectDiceModifiers(attrKey)`** scans qualities, augmentations, gear, adept powers, and
active spells for `dice_modifiers` where `mod.attribute === attrKey`. Used for:

- `defense_rating` — adds to BOD + armor for total DR
- `initiative` — flat bonus added to REA + INT
- `initiative_dice` — bonus D6 (capped at 5 total)
- Core attributes (`body`, `agility`, `reaction`, `strength`, etc.) — displayed in
  attribute tooltips

Respects `equipped === false` for gear filtering; augmentations are always treated as equipped.
Active spells contribute when marked "Active" (Sustained spells or rituals).

### Path C: Attack Rating display

**Files:** `src/components/character/PrimaryEquipmentBlock.tsx`, `src/lib/ar-utils.ts`

- Weapon base AR + accessory `ar_modifier` fields (e.g., `"+2/+2/+2/+2/+2"`)
- Computed via `accessoriesToARModifiers()` → `calculateModifiedAR()`
- Displayed on the Core page and Equipped Gear tab

### Wound penalty calculation

**File:** `src/lib/condition-monitor.ts`

```
Wound Modifier = -(floor(physical_damage / 3) + floor(stun_damage / 3))
```

Always negative (or zero). Applied to all tests except Damage Resistance (GM discretion).

---

## 3. Complete Modifier Source Catalog

Every data source and the modifiers it can contribute.

### Augmentations (`src/data/gear/augmentations.yaml`)

**Structured `dice_modifiers`:**

| Augmentation | Modifier | Field |
|---|---|---|
| Muscle Replacement | +1 STR | `{ attribute: "strength", value: 1 }` |
| Muscle Toner | +1 AGI | `{ attribute: "agility", value: 1 }` |
| Muscle Augmentation | +1 STR | `{ attribute: "strength", value: 1 }` |
| Wired Reflexes (R2) | +2 REA | `{ attribute: "reaction", value: 2 }` |
| Reaction Enhancers (R1) | +1 REA | `{ attribute: "reaction", value: 1 }` |
| Smartlink | +2 dice (requires Smartgun) | `{ value: 2, requires_accessory: "Smartgun" }` |
| Tailored Pheromones (R1) | +1 CHA | `{ attribute: "charisma", value: 1 }` |
| Cerebral Booster (R1) | +1 LOG | `{ attribute: "logic", value: 1 }` |

**Text-only effects (not yet structured as `dice_modifiers`):**

| Augmentation | Effect | Missing modifier |
|---|---|---|
| Wired Reflexes | +Xd6 Initiative | `{ attribute: "initiative_dice", value: X }` |
| Synaptic Booster | +Xd6 Initiative | `{ attribute: "initiative_dice", value: X }` |
| Dermal Plating | +X damage resistance | `{ attribute: "defense_rating", value: X }` |
| Orthoskin | +X damage resistance | `{ attribute: "defense_rating", value: X }` |
| Bone Lacing/Density | +1 Physical CM box, unarmed DV | Multiple effect types |
| Platelet Factory | +2 to First Aid (stabilizing) | `{ skill: "Biotech", value: 2 }` |
| Synthskin | +2 to Disguise | `{ skill: "Con", value: 2 }` (contextual) |

### Adept Powers (`src/data/magic/adept-powers.yaml`)

**Structured `dice_modifiers`:**

| Power | Modifier | Field |
|---|---|---|
| Improved Physical Attribute (AGI) | +1 AGI | `{ attribute: "agility", value: 1 }` |
| Improved Physical Attribute (STR) | +1 STR | `{ attribute: "strength", value: 1 }` |
| Improved Physical Attribute (BOD) | +1 BOD | `{ attribute: "body", value: 1 }` |
| Improved Physical Attribute (REA) | +1 REA | `{ attribute: "reaction", value: 1 }` |
| Improved Reflexes (1-4) | +1..4 REA | `{ attribute: "reaction", value: 1..4 }` |

**Text-only effects (not yet structured):**

| Power | Effect | Missing modifier type |
|---|---|---|
| Improved Reflexes (1-4) | +1..4 Initiative Dice | `{ attribute: "initiative_dice" }` |
| Combat Sense | +1 dice to defense tests per level | Defense dice modifier |
| Critical Strike | +1 DV with melee/unarmed per level | DV modifier |
| Enhanced Accuracy | +2 Attack Rating | AR modifier |
| Mystic Armor | +1 Armor (DR) per level | `{ attribute: "defense_rating" }` |
| Adrenaline Boost | +2 Initiative per level | `{ attribute: "initiative" }` |
| Improved Ability | +X to a chosen skill | `{ skill: "<chosen>", value: X }` |
| Pain Resistance | Condition monitor penalty shift | Condition monitor modifier |

### Qualities (on character data, no reference YAML)

- `dice_modifiers` array on `SR6Quality`
- Can target specific skills (`skill` field) or be universal
- Can gate on weapon accessories (`requires_accessory` field)

### Weapon Accessories (`src/data/gear/weapon-accessories.yaml`)

**Structured:**

| Field | Example | Used in |
|---|---|---|
| `ar_modifier` | `"+2/+2/+2/+2/+2"` | AR display via `calculateModifiedAR()` |

**Not structured:**

| Accessory | Effect | Status |
|---|---|---|
| Smartgun System (internal/external) | +1 dice pool (wireless) | Description text only |
| Smartgun System | +2 AR | Structured via `ar_modifier` |
| Bipod | +3 AR when prone (wireless) | `ar_modifier_wireless` stored, converted to `notes` |
| Laser sight | +2 AR (wireless) | `ar_modifier_wireless` stored, converted to `notes` |

The `WeaponAccessory` type has no `dice_modifiers` field. Accessories cannot contribute
dice pool bonuses.

#### Smartgun System and Smartlink — Detailed Breakdown

The smartgun/smartlink ecosystem is the most complex accessory interaction in SR6. It
involves a weapon accessory, a vision enhancement (or cyberware), a connection mode, and
conditional bonuses. Per the Core Rulebook (p. 260, 275):

**Smartgun System** (weapon accessory — internal or external):

| Benefit | Condition | Type |
|---|---|---|
| Camera, rangefinder, DNI fire controls | Always (with any connection) | Utility |
| Fire from cover with no attack penalties | Always (with any connection) | Situational |
| +2 Attack Rating (all range categories) | Requires Smartlink on the user | AR modifier |
| +1 dice pool bonus | **Wireless only** | Dice pool modifier |
| Bonus Minor Action (Reload/Change Mode) | **Wireless only** | Action economy |

**Smartlink** (vision enhancement in cybereyes, glasses, goggles, or contacts):

The Smartlink is the *user-side* component. It receives targeting data from the smartgun
and provides the range/ammo overlay. The Smartlink itself grants no dice pool or AR bonus
on its own — it enables the smartgun's +2 AR bonus.

**Connection modes:**

| Mode | Requirements | Bonuses Available |
|---|---|---|
| **Wired** | Smartlink in imaging device + cable to gun (via datajack or UAP) | +2 AR, fire from cover, DNI features |
| **Wireless** | Smartlink + DNI + wireless enabled on gun | All wired bonuses **plus** +1 dice pool, bonus Minor Action |

**Current data issue:** The Smartlink augmentation in `augmentations.yaml` has
`dice_modifiers: [{ value: 2, requires_accessory: "Smartgun" }]`, which models it as a
+2 *dice pool* bonus. Per the rules, Smartlink + Smartgun provides +2 *Attack Rating*,
not +2 dice pool. The only dice pool bonus in the system is the smartgun's own +1 when
wireless. This should be corrected: remove the dice pool modifier from Smartlink and
ensure the +2 AR is handled through the accessory's `ar_modifier` field (which it already
is).

### Firing Modes (AR and DV modifiers, not dice pool)

Firing modes modify Attack Rating and Damage Value, not the dice pool. They are relevant
to the AR display path (Path C) but do not feed into `calculateDicePool()`.

| Mode | AR Modifier | DV Modifier | Dice Pool Effect |
|---|---|---|---|
| SS (Single Shot) | None | None | None |
| SA (Semi-Automatic) | -2 | +1 | None |
| BF narrow (Burst Fire) | -4 | +2 | None |
| BF wide (Burst Fire) | SA mode per target | SA mode per target | Pool split between 2 targets |
| FA (Full Auto) | -6 | Area effect | Single roll vs multiple defenders |

### Situational Combat Modifiers

These modifiers arise during combat and are not tied to gear or character build. They are
relevant for a future "combat tracker" feature but are outside the scope of the static
character-sheet dice pool calculations.

**Cover Status (I-IV):**

| Level | Defense Rating Bonus | Defense Dice Pool Bonus | Attack Penalty (from Cover IV) |
|---|---|---|---|
| Cover I | +1 DR | +1 dice | — |
| Cover II | +2 DR | +2 dice | — |
| Cover III | +3 DR | +3 dice | — |
| Cover IV | +4 DR | +4 dice | -2 dice to attack |

Attacking from any level of Cover requires an extra Minor Action. Attacking from Cover IV
imposes a -2 dice pool penalty. The smartgun system negates the attack penalty from Cover.

**Take Aim:**

Cumulative +1 dice pool bonus per use, capped at the character's Willpower. Requires a
ready firearm, bow, or exotic ranged weapon.

**Status Effects with dice pool impact:**

| Status | Dice Pool Effect |
|---|---|
| Immobilized | -3 dice to all attacks; cannot use Reaction for defense |
| Deafened I-II | -3 per level to hearing tests |
| Deafened III | Auto-fail hearing tests |
| Fatigued I-III | Progressive penalties |
| Blinded I-III | Progressive vision penalties |
| Confused # | -# dice to all tests except Damage Resistance |
| Hobbled | Movement halved |

**Environment and Visibility:**

Environmental factors (light level, weather, etc.) are resolved through **Edge**, not dice
pool modifiers. If one combatant has a visibility advantage (e.g., low-light vision in dim
conditions), they gain a point of Edge. This feeds into the Edge economy, not the dice pool
engine.

### Active Spells (`character.spells` with `active === true`)

**Implemented.** Spells and rituals can be marked "Active" when currently in effect:

- **Sustained spells** (`duration === "Sustained"`): Show "Active" toggle; when checked, spell appears in Readied Equipment and contributes `dice_modifiers` to pool calculations.
- **Rituals** (all): Show "Active" toggle; rituals often last hours/days, so all support the toggle.

`SR6Spell` has optional `active?: boolean` and `dice_modifiers?: DiceModifier[]`. When a spell/ritual is Active, the user can add dice modifiers via the Dice Modifier Editor (e.g. net hits to DR for Armor, +REA/initiative_dice for Increase Reflexes). These modifiers feed into `calculateDicePool()`, `calculateWeaponPool()`, and `collectDiceModifiers()`.

| Spell | Effect (user enters via dice_modifiers) |
|---|---|
| Armor | `{ attribute: "defense_rating", value: <net hits> }` |
| Combat Sense | `{ attribute: "defense_dice", value: <net hits> }` |
| Increase Reflexes | `{ attribute: "reaction", value: X }`, `{ attribute: "initiative_dice", value: X }` |

### Armor (`src/data/gear/armor.yaml`)

- `rating` → contributes to Defense Rating in `computeDerived()`
- `subtype` → `"body"`, `"helmet"`, or `"shield"` for stacking rules
- No `dice_modifiers` field
- Some armor has wireless bonuses in description only (e.g., Chameleon Suit +2 DR wireless)

### Ranged Weapons (`src/data/gear/ranged-weapons.yaml`)

- `dv`, `ar`, `fire_modes`, `ammo` — combat stats, not dice pool modifiers
- `subtype` — used for specialization/expertise matching
- `accessories` — list of `WeaponAccessory` objects, used for AR modifiers and
  `requires_accessory` gating

### Melee Weapons (`src/data/gear/melee-weapons.yaml`)

- `dv`, `ar`, `reach` — combat stats
- `subtype` — used for specialization/expertise matching
- No `dice_modifiers`

### Miscellaneous Gear (`src/data/gear/miscellaneous.yaml`)

- `dice_modifiers` field exists on every entry but is always `[]`
- Effects described in `notes` only (e.g., Medkit Rating 6: +3 to First Aid tests)

### Electronics, Vehicles, Drones

No dice pool contributions in the current data model.

---

## 4. Identified Gaps

Gaps between SR6 rules and the current implementation, ordered by impact.

### Gap 1: Adept powers excluded from dice pool calculation

`calculateDicePool()` accepts qualities, augmentations, and gear — but **not** adept powers.
`collectDiceModifiers()` also omits them. The `SR6AdeptPower` type has a `dice_modifiers`
field and the YAML data populates it for Improved Physical Attribute and Improved Reflexes,
but these modifiers are never read by any calculation.

**Impact:** Adept characters get no attribute or skill bonuses from their powers.

### Gap 2: Weapon accessories cannot provide dice modifiers

The `WeaponAccessory` interface has `name`, `ar_modifier`, `notes`, and `description` — but
no `dice_modifiers`. The Smartgun System's +1 wireless dice pool bonus exists only in
description prose. `calculateDicePool()` treats `weaponAccessories` as a passive gate (for
`requires_accessory` checks) but never extracts modifiers from them.

**Impact:** Smartgun's own +1 wireless bonus is never applied.

### Gap 3: Initiative dice not structured

Wired Reflexes, Synaptic Booster, and Improved Reflexes all describe initiative dice bonuses
in their `effects` text but lack structured `dice_modifiers` entries with
`attribute: "initiative_dice"`. The `collectDiceModifiers("initiative_dice", ...)` call finds
nothing for these items.

**Impact:** Initiative dice display may be incorrect for augmented characters.

### Gap 4: Defense test dice not structured

Combat Sense (adept power) provides "+1 dice to defense tests per level" but has empty
`dice_modifiers: []`. There is no mechanism to apply defense-specific dice bonuses to
defense tests.

**Impact:** Adept defense bonuses are invisible.

### Gap 5: AR bonuses from adept powers not structured

Enhanced Accuracy provides "+2 Attack Rating with any weapon" but has no structured AR
modifier field. Adept powers have no way to contribute to AR calculations.

**Impact:** Adept AR bonuses are invisible.

### Gap 6: Armor DR bonuses from wireless

Chameleon Suit and similar armor items describe wireless DR bonuses in description text only.
There is no wireless toggle or structured `dice_modifiers` on armor.

**Impact:** Wireless armor bonuses cannot be surfaced.

### Gap 7: Miscellaneous gear effects not structured

Medkit (+3 to First Aid), Stim Patches, and other gear describe dice bonuses in `notes` but
have empty `dice_modifiers` arrays.

**Impact:** Gear situational bonuses are invisible to the pool calculator.

### Gap 8: Spell effects not modeled — ADDRESSED

Sustained spells and rituals can now be marked "Active" via a toggle. Active spells with
`dice_modifiers` (user-editable, e.g. for net hits) contribute to `calculateDicePool()`,
`calculateWeaponPool()`, and `collectDiceModifiers()`. Spells appear in Readied Equipment when
Active. The reference data (`spells.yaml`) does not pre-populate `dice_modifiers`; users add
them when activating a spell to reflect net hits or ritual effects.

### Gap 9: Smartlink data incorrectly models +2 AR as +2 dice pool

The Smartlink augmentation in `augmentations.yaml` has
`dice_modifiers: [{ value: 2, requires_accessory: "Smartgun" }]`, which provides a +2
dice pool bonus when the weapon has a Smartgun System. Per the rules, the Smartlink +
Smartgun interaction provides **+2 Attack Rating**, not +2 dice pool. The only dice pool
bonus is the Smartgun System's own **+1 wireless bonus** (requires wireless mode).

**Impact:** Smartlink users currently receive +2 dice pool instead of the correct +2 AR.
The dice pool bonus should be removed from Smartlink and the system should rely on the
smartgun accessory's existing `ar_modifier: "+2/+2/+2/+2/+2"` field (which is already
populated correctly).

### Gap 10: Cover Status dice pool bonuses not modeled

Cover Status (I-IV) provides both DR and defense dice pool bonuses, and Cover IV imposes
a -2 dice penalty on attacks. This is a combat-state modifier that depends on the
character's position, not their build.

**Impact:** Cannot reflect cover bonuses in displayed defense pools without a combat
tracker.

### Gap 11: Take Aim bonus not modeled

Take Aim provides a cumulative +1 dice pool bonus per use, capped by Willpower. This is
a combat action modifier.

**Impact:** Cannot reflect Take Aim accumulation without action tracking.

### Gap 12: Status effects with dice pool penalties not modeled

Several statuses (Immobilized -3, Confused -#, Deafened, Fatigued, Blinded) impose dice
pool penalties. These are transient combat states.

**Impact:** Status-based penalties cannot be surfaced without a status tracker.

### Gap 13: Edge bonuses not tracked

Many adept powers and qualities grant bonus Edge in specific situations (Danger Sense,
Kinesics, Improved Sense, Enhanced Perception). The app has no structured way to surface
these as reminders during play.

**Impact:** Players must remember Edge-granting abilities manually.

---

## 5. Proposed Unified Modifier Architecture

### Data flow diagram

```mermaid
flowchart TD
    subgraph sources [Modifier Sources]
        Q[Qualities]
        Aug[Augmentations]
        G[Gear]
        AP[Adept Powers]
        WA[Weapon Accessories]
        AS[Active Spells]
        SM[Situational Modifiers]
    end

    subgraph pool [Dice Pool Engine]
        CDP["calculateDicePool()"]
        CWP["calculateWeaponPool()"]
        CDM["collectDiceModifiers()"]
        CV["Constraint Validation"]
    end

    subgraph outputs [Outputs]
        SkillPool[Skill Test Pool]
        WeaponPool[Weapon Attack Pool]
        DefPool["Defense Test Pool"]
        DerivedStats["Derived Stats (Init, DR, etc.)"]
        ARDisplay[Attack Rating Display]
    end

    Q -->|"dice_modifiers"| CDP
    Aug -->|"dice_modifiers"| CDP
    G -->|"dice_modifiers"| CDP
    AP -->|"dice_modifiers (NEW)"| CDP
    WA -->|"dice_modifiers (NEW)"| CDP
    AS -->|"dice_modifiers"| CDP
    SM -->|"Cover, Take Aim, Status (FUTURE)"| CDP

    CDP --> CV
    CV --> CWP
    CWP --> WeaponPool
    CV --> SkillPool
    CV --> DefPool

    Q -->|"attribute modifiers"| CDM
    Aug -->|"attribute modifiers"| CDM
    G -->|"attribute modifiers"| CDM
    AP -->|"attribute modifiers (NEW)"| CDM
    AS -->|"attribute modifiers"| CDM
    CDM --> CV
    CV --> DerivedStats

    WA -->|"ar_modifier"| ARDisplay
```

### Proposed changes (priority order)

**Priority 1 — Add adept powers to `calculateDicePool` and `collectDiceModifiers`**

The `SR6AdeptPower` type already has `dice_modifiers`. The data is already populated in the
YAML. The only missing piece is passing adept powers into the calculation functions.

- Add `adeptPowers?: SR6AdeptPower[]` parameter to `calculateDicePool()`
- Iterate `adeptPowers` the same way as augmentations (with `modifierApplies()` gating)
- Add adept powers to `collectDiceModifiers()` scan list
- Thread `adeptPowers` through all consumers (`PrimaryEquipmentBlock`, `EquippedGearTab`,
  `SkillsTab`, `AttributesTab`)

**Priority 2 — Add `dice_modifiers` to `WeaponAccessory` type**

Allow accessories like Smartgun to carry structured dice modifiers.

- Add `dice_modifiers?: DiceModifier[]` to `WeaponAccessory` interface
- Update `calculateDicePool()` to iterate `weaponAccessories` for their own modifiers
  (in addition to using them as a gate for `requires_accessory`)
- Add `dice_modifiers` to the Smartgun entries in `weapon-accessories.yaml`
- Update `referenceToWeaponAccessory()` to carry `dice_modifiers` through

**Priority 3 — Populate missing structured `dice_modifiers` in YAML**

Fill in text-only effects as structured data:

- Wired Reflexes: add `{ attribute: "initiative_dice", value: X }`
- Synaptic Booster: add `{ attribute: "initiative_dice", value: X }`
- Improved Reflexes: add `{ attribute: "initiative_dice", value: X }`
- Combat Sense: add defense dice modifiers
- Mystic Armor: add `{ attribute: "defense_rating", value: X }`
- Adrenaline Boost: add `{ attribute: "initiative", value: X }`

**Priority 4 — Fix Smartlink/Smartgun data modeling**

The Smartlink augmentation currently provides `+2 dice pool` when a weapon has a Smartgun
System. Per SR6 rules, this should be `+2 Attack Rating`, not dice pool. The Smartgun
System accessory's `ar_modifier: "+2/+2/+2/+2/+2"` already handles the AR bonus correctly.

Changes:
- Remove the `dice_modifiers` entry from Smartlink in `augmentations.yaml`
- Add a `dice_modifiers` entry to the Smartgun System accessory (once `WeaponAccessory`
  supports it) with `{ value: 1, source: "Smartgun System", requires_wireless: true }`
- Update sample character data to remove the Smartlink dice modifier
- Document that the Smartgun's AR bonus applies when the user has **any** Smartlink
  (in cybereyes, glasses, goggles, or contacts) — this is a `requires_augmentation`
  gate rather than a `requires_accessory` gate, which is a new concept

**Priority 5 — Wireless toggle system**

The Smartgun System is the clearest motivating case: its +1 dice pool bonus and bonus
Minor Action only apply in wireless mode, while the +2 AR bonus applies in both wired
and wireless modes.

- Add `wireless?: boolean` to weapon accessories and certain gear items
- Add `requires_wireless?: boolean` to `DiceModifier`
- Only apply wireless-gated modifiers when the toggle is active
- Armor wireless bonuses (Chameleon Suit +2 DR, etc.) also need this toggle

**Priority 6 — Active spell tracking — IMPLEMENTED**

- Spells/rituals have `active?: boolean`; when true, they appear in Readied Equipment
- User adds `dice_modifiers` per active spell (e.g. net hits) via Dice Modifier Editor
- Active spells feed into `calculateDicePool()`, `calculateWeaponPool()`, and `collectDiceModifiers()`

**Priority 7 — Situational/combat modifier tracking (future)**

Combat-state modifiers that depend on the encounter, not the character build:
- Cover Status (I-IV): DR and defense dice pool bonuses
- Take Aim: cumulative +1 dice pool, capped by Willpower
- Status effects: Immobilized (-3 attack), Confused (-#), Deafened, etc.
- Called Shots: various situational modifiers

These require a "combat tracker" or encounter-mode feature and are not needed for the
static character sheet.

---

## 6. DiceModifier Schema Reference

### Current interface

```typescript
// src/types/character.ts
export interface DiceModifier {
  value: number;              // +/- modifier amount
  source: string;             // Display label (e.g., "Smartlink", "Wired Reflexes")
  skill?: string;             // Apply only to this skill's tests
  attribute?: string;         // Apply to this derived stat instead of skill tests
  requires_accessory?: string; // Gate: only when weapon has matching accessory
}
```

### Routing rules

The `attribute`, `skill`, and `pool_only` fields determine how a modifier is routed:

| `attribute` | `skill` | `pool_only` | Routing |
|---|---|---|---|
| set | — | false/unset | `collectDiceModifiers(attrKey)` for derived stat display **and** affects pools using that attribute |
| set | — | **true** | `calculateDicePool()` only: adds to dice pools that use the attribute, but does **not** affect derived stats (Initiative, DR, Condition Monitor, etc.) |
| not set | set | — | `calculateDicePool()`: applies only when computing that skill's pool |
| not set | not set | — | `calculateDicePool()`: applies to ALL skill pools (subject to `requires_accessory`) |

#### Pool-only vs. attribute-level modifiers

This distinction comes from the Attribute Boost adept power (Core Rulebook p. 160):

> "This only affects dice pools, so your Initiative rank, Condition Monitor, Defense
> Rating, and so forth is not changed."

Attribute Boost temporarily increases an attribute for **dice pool purposes only**. Unlike
Improved Physical Attribute (which raises the actual attribute and therefore affects all
derived stats), Attribute Boost only adds dice to pools that use the boosted attribute.

This requires a `pool_only?: boolean` field on `DiceModifier` to distinguish between:

- **Attribute-level modifiers** (Improved Physical Attribute, Muscle Replacement, etc.):
  raise the attribute value, affecting all calculations that reference it
- **Pool-only modifiers** (Attribute Boost): only add dice to pools using the attribute,
  without changing the attribute's displayed value or derived stats

### Supported `attribute` values

| Value | Used by | Effect |
|---|---|---|
| `body` | `AttributesTab` | Modifies Body attribute total |
| `agility` | `AttributesTab` | Modifies Agility attribute total |
| `reaction` | `AttributesTab` | Modifies Reaction attribute total |
| `strength` | `AttributesTab` | Modifies Strength attribute total |
| `willpower` | `AttributesTab` | Modifies Willpower attribute total |
| `logic` | `AttributesTab` | Modifies Logic attribute total |
| `intuition` | `AttributesTab` | Modifies Intuition attribute total |
| `charisma` | `AttributesTab` | Modifies Charisma attribute total |
| `defense_rating` | `computeDerived()` | Added to BOD + armor for total DR |
| `initiative` | `computeDerived()` | Flat bonus to REA + INT initiative score |
| `initiative_dice` | `computeDerived()` | Bonus D6 (capped at 5 total) |

### Conditional gating: `requires_accessory`

When set, the modifier only applies if the weapon being evaluated has an accessory whose
name contains the specified string (case-insensitive substring match).

```
modifierApplies(mod, weaponAccessories):
  if mod.requires_accessory is not set → always applies
  if weaponAccessories is empty        → does not apply
  otherwise                            → applies if any accessory name includes the string
```

Example: A hypothetical modifier `{ value: 1, requires_accessory: "Smartgun" }` would only
apply when the weapon has an accessory like "Smartgun System (Internal)".

Note: The Smartlink augmentation currently uses this pattern with `{ value: 2 }`, but this
is incorrect per the rules (see Gap 9). The corrected model would place the +1 dice pool
modifier on the Smartgun System accessory itself, gated by `requires_wireless: true`.

### Proposed additions to `DiceModifier`

| Field | Type | Purpose |
|---|---|---|
| `requires_wireless?: boolean` | boolean | Only apply when item's wireless toggle is on |
| `pool_only?: boolean` | boolean | Only affects dice pools, not derived stats (e.g., Attribute Boost) |
| `exclusion_group?: string` | string | Prevents stacking with other modifiers in the same group |
| `max_value?: number` | number | Cap this modifier's contribution (for 1.5x rules) |
| `defense_only?: boolean` | boolean | Only applies to defense tests (e.g., Combat Sense) |
| `requires_augmentation?: string` | string | Gate: only when character has matching augmentation (e.g., Smartgun AR requires Smartlink) |

---

## 7. Rules Constraints and Caps

SR6 imposes several limits on how modifiers stack and what values they can reach.

### 7.1 Augmented Maximum (+4 Cap) — Attributes

Each physical and mental attribute can receive a maximum of **+4 total** from all
augmentation sources combined (cyberware, bioware, adept powers, sustained spells).

Per Core Rulebook (p. 39):
> "...adjusted attribute can never be higher than their current attribute rank +4."

```
Augmented Maximum = Metatype Natural Maximum + 4
```

Examples using metatype data from `METATYPE_DATA` in `src/data/sr6-reference.ts`:

| Metatype | STR Max | Augmented STR Max |
|---|---|---|
| Human | 6 | 10 |
| Ork | 8 | 12 |
| Troll | 10 | 14 |
| Elf | 6 | 10 |
| Dwarf | 8 | 12 |

**Current status:** Not enforced. No code checks whether the sum of attribute-keyed
`dice_modifiers` from augmentations + adept powers exceeds +4. The metatype maximum data
is available but unused for this purpose.

### 7.2 Augmented Maximum (+4 Cap) — Skills

Skills are also subject to a +4 augmented cap. Per Core Rulebook (p. 64):
> "...augmented increase can never be more than +4."

This means the total bonus to a skill from all augmentation sources (Improved Ability,
gear, qualities, etc.) cannot exceed +4 above the character's natural skill rating.

**Current status:** Not enforced. The Improved Ability adept power (when structured) would
need to be checked against both the 1.5x cap (Section 7.5) and this +4 cap.

### 7.3 Initiative Dice Cap (5D6)

Maximum of 5 initiative dice total (base 1D6 + up to 4 bonus dice).

**Current status:** Enforced in `AttributesTab.tsx`:

```typescript
const totalInitDice = Math.min(1 + initDiceBonus, 5);
```

The tooltip also indicates when capping occurs.

### 7.4 Exclusive / Mutually Exclusive Augmentations

Certain augmentations are explicitly incompatible:

| Group | Members | Rule |
|---|---|---|
| Initiative/Reaction boost | Improved Reflexes, Wired Reflexes, Synaptic Booster, Move-by-Wire | "Cannot be combined with any other Initiative or Reaction boosts" |
| Strength augmentation | Muscle Replacement, Muscle Toner, Muscle Augmentation | Same attribute, different methods; do not stack |
| Damage resistance armor | Dermal Plating, Orthoskin | "Does not stack with worn armor for the same damage type" |

**Current status:** Not enforced. No exclusion group or `incompatible_with` field exists.
A character could equip conflicting augmentations and receive stacked bonuses without warning.

**Proposed:** Add an optional `exclusion_group?: string` field to augmentation entries or
`DiceModifier` entries, allowing the engine to detect conflicts and surface warnings.

### 7.5 Improved Ability Skill Cap (1.5x Natural Rating)

The Improved Ability adept power boosts a skill by its power level, but the boost cannot
exceed **1.5 times the character's natural skill rating** (rounded up) or the augmented
maximum, whichever is lower.

Example: A character with Firearms 4 can boost it by at most +6 (1.5 × 4) via Improved
Ability.

**Current status:** Not enforced. The power's `dice_modifiers` are currently empty `[]`
(not yet structured for dice pool contribution). When implemented, the cap will need to
compare the boost against the character's natural skill rating.

### 7.6 Improved Physical Attribute Cap (1.5x or Augmented Max)

The Improved Physical Attribute adept power boosts an attribute, capped at **1.5 times the
natural attribute rating** or the augmented maximum, whichever is lower.

**Current status:** Not enforced. The `dice_modifiers` provide flat values (e.g., `+1 AGI`)
without any cap check.

### 7.7 Dice Pool Floor (Minimum 0)

A dice pool can never go below zero, regardless of negative modifiers.

**Current status:** Enforced via `Math.max(0, total)` in both `calculateDicePool()` and
`calculateWeaponPool()`.

### 7.8 Armor Stacking (One Per Subtype)

Only one body armor + one helmet + one shield can contribute to Defense Rating simultaneously.

**Current status:** Enforced in `computeDerived()` in `AttributesTab.tsx`. The function
selects the best-rated item from each subtype (`body`, `helmet`, `shield`) and sums their
ratings.

### 7.9 Edge Gain Limits

- Maximum of **2 Edge gained per combat round** (general rule).
- Many abilities specify "only one Edge point per encounter" (Kinesics, Vocal Control,
  Improved Sense).
- These affect Edge economy rather than dice pool math.

**Current status:** Not tracked. Edge bonuses from powers and qualities exist only in
description text. A future "Edge reminder" or "Edge tracker" feature could surface these
during play, but this is low priority for the dice pool architecture.

### 7.10 Proposed Constraint Enforcement Pipeline

When computing a final dice pool or derived stat, modifiers should pass through a validation
pipeline after collection:

```mermaid
flowchart TD
    Raw[Raw Modifier Collection] --> PoolRoute{"Pool-only routing check"}
    PoolRoute -->|"pool_only=true"| PoolOnly["Add to dice pool only (skip derived stats)"]
    PoolRoute -->|"pool_only=false/unset"| AttrCap["Attribute Augmented Max Check (+4 cap)"]
    AttrCap --> SkillCap["Skill Augmented Max Check (+4 cap)"]
    SkillCap --> ExcGroup[Exclusion Group Check]
    ExcGroup --> RatingCap["Power Rating Cap (1.5x for Improved Ability/Attribute)"]
    RatingCap --> InitCap["Initiative Dice Cap (5D6)"]
    InitCap --> Floor["Floor Check (min 0)"]
    PoolOnly --> Floor
    Floor --> FinalPool[Final Dice Pool / Derived Stat]
```

Each stage:

1. **Pool-only routing** — Modifiers with `pool_only: true` (e.g., Attribute Boost) bypass
   the attribute-level constraint checks and add directly to dice pools without affecting
   displayed attribute values or derived stats.
2. **Attribute Augmented Max Check** — Sum all attribute modifiers from augmentations and
   adept powers; clamp to +4 above base. Requires metatype max from `METATYPE_DATA`.
3. **Skill Augmented Max Check** — Sum all skill modifiers from augmentation sources; clamp
   to +4 above the character's natural skill rating.
4. **Exclusion Group Check** — If multiple modifiers share the same `exclusion_group`, keep
   only the highest and warn the user about the conflict.
5. **Power Rating Cap** — For powers like Improved Ability and Improved Physical Attribute,
   clamp the bonus to 1.5x the natural rating (this is often more restrictive than the +4
   cap and is checked after it).
6. **Initiative Dice Cap** — Clamp total initiative dice to 5.
7. **Floor Check** — Ensure the final value is at least 0.

Warnings should be surfaced to the user in tooltips when a cap reduces their expected bonus.
