

# Shadowrun SR6 Character Sheet Manager

## Overview
A modern dashboard-style web app for creating, managing, and maintaining multiple Shadowrun 6th Edition character sheets, with cloud storage and automatic dice pool calculations.

## Authentication
- Email & password signup/login
- User profiles linked to characters

## Core Features

### 1. Character Management
- Dashboard listing all saved characters with name, metatype, and last-modified date
- Create new character, duplicate, or delete existing ones
- Each character opens into a tabbed detail view

### 2. Character Sheet Tabs
Each character will have the following sections as tabs or collapsible panels:

- **Priorities** – Priority table (A–E) selections for Metatype, Attributes, Magic/Resonance, Skills, Resources
- **Personal Info** – Name, metatype, ethnicity, age, sex, height, weight, street cred, notoriety, public awareness, karma, total karma
- **Attributes** – Body, Agility, Reaction, Strength, Willpower, Logic, Intuition, Charisma, Edge, Essence, Magic/Resonance with base + augmented values
- **Skills** – All active skills with rating, specializations, and expertise
- **Qualities** – Positive and negative qualities with karma cost and effects
- **IDs / Lifestyles / Currency** – SINs, licenses, lifestyle tier, nuyen tracking
- **Contacts** – Name, loyalty, connection, notes
- **Ranged Weapons** – Weapon stats (DV, AR, fire modes, ammo, accessories)
- **Melee Weapons** – Weapon stats (DV, AR, reach)
- **Armor** – Armor rating, capacity, modifications
- **Matrix Stats** – Device rating, Attack, Sleaze, Data Processing, Firewall, programs
- **Augmentations** – Cyberware/bioware with essence cost, rating, effects
- **Gear** – General equipment tracking
- **Vehicles/Drones** – Handling, speed, body, armor, sensor, pilot, seats
- **Spells / Preparations / Rituals / Complex Forms** – Type, drain, duration, range, effects
- **Adept Powers** – Power point cost, effects
- **Other Abilities** – Catch-all for anything not covered above

### 3. Dice Pool Calculator (Key Feature)
- For each skill, display a **detailed dice pool breakdown** showing:
  - Base attribute value
  - Skill rating
  - Bonuses/penalties from qualities
  - Gear modifiers (e.g., smartlink, augmentations)
  - Situational modifiers (wound, environmental, etc.)
  - **Total dice pool**
- Each modifier is shown as a labeled line item so users can see exactly where every die comes from
- Modifiers auto-update when gear, qualities, or augmentations change

### 4. Pre-built SR6 Reference Data (Hybrid)
- Pre-loaded lists for core attributes, skills, common qualities, and popular gear/weapons
- Users can add custom/homebrew entries to any category
- Searchable dropdowns when adding items

## Design
- **Modern dashboard** layout with a sidebar for character list and tabs for character sections
- **Dark cyberpunk theme** — dark background with neon accent colors (cyan/magenta highlights) to evoke the Shadowrun aesthetic while keeping the UI clean and readable
- Responsive for desktop and tablet use

## Backend (Supabase / Lovable Cloud)
- User authentication (email/password)
- Database tables for characters, attributes, skills, qualities, gear, weapons, contacts, etc., all linked to user accounts
- Row-level security so users can only access their own characters

