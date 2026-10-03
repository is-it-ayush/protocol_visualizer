DRAFT WRITTEN: 8 steps
Redraft: only step 08 changed (FILES now includes tests/polish.test.ts). Steps 01-07 restored unchanged from archive 20261003-102550.
Test fixed: tests/polish.test.ts resolves src via join(fileURLToPath(import.meta.url), '..', '..', 'src'); assertions unchanged. Runs standalone: 4 pass.
Assumptions: working-tree src edits (FieldInspector, Minimap, NodeDiagram, Waveform, fields.ts) already satisfy polish test; vite.config.ts untouched.
Validator: 08 LOCK is tests/polish.test.ts; implementor must not modify it despite FILES listing.
