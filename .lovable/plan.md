

## Add Info Hovers to Attribute Breakdown Table

Add a tooltip (using the existing `Tooltip` component) to each attribute name in the breakdown table, showing a short SR6 description of what that attribute represents.

### Changes

**`src/components/wizard/Step3Attributes.tsx`**:
1. Import `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` from `@/components/ui/tooltip` and `Info` icon from `lucide-react`.
2. Add an `ATTRIBUTE_DESCRIPTIONS` map with short descriptions for each attribute (Body, Agility, Reaction, Strength, Willpower, Logic, Intuition, Charisma, Edge).
3. In the breakdown table, wrap each attribute name cell content with a `Tooltip`. Show the attribute name plus a small `Info` icon as the trigger, and the description as the tooltip content.
4. Also add a tooltip to the Edge row.

### Attribute Descriptions (SR6)
- **Body**: Physical toughness, health, and resistance to damage.
- **Agility**: Fine motor skills, coordination, and physical precision.
- **Reaction**: Response time, reflexes, and ability to react quickly.
- **Strength**: Raw physical power and carrying capacity.
- **Willpower**: Mental resilience, discipline, and resistance to magic.
- **Logic**: Reasoning, memory, and analytical thinking.
- **Intuition**: Gut feelings, perception, and awareness.
- **Charisma**: Force of personality, social influence, and leadership.
- **Edge**: Luck, narrative favor, and the X-factor.

