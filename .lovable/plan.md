

## Add Base Karma Total to Qualities Step

The Qualities step (Step 3) currently shows positive karma spent, negative karma gained, and net karma from qualities — but it doesn't show the base 50 karma or the resulting total available for the next Karma step. The user has no way to see how their quality choices affect their overall karma budget.

### Change

**`src/components/wizard/Step3Qualities.tsx`**
- Add a badge showing the base karma (50) and a badge showing the total available karma (50 + net from qualities)
- This gives the user a clear picture: "I start with 50, my qualities give me +X, so I'll have Y karma to spend in Step 4"

The badge row will become: `Base: 50 | Positive: X spent | Negative: Y gained | Net: Z | Total Available: 50+Z`

