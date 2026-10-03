DRAFT WRITTEN: 8 steps
Redraft: only step 08 changed (FILES now include src/components/FieldInspector.tsx; DO swaps gray-500/red-600/gray-700 for ink-soft/vermilion/ink tokens). Steps 01-07 and index.md restored verbatim from .agent/archive/20261003-102202 because plan dir only held summary.md.
Tests: tests/polish.test.ts unchanged (already bans default palette classes and hex in .tsx, consistent with step 08).
Validator check:
- Token names ink-soft, vermilion, ink exist in src/index.css as --color-*.
- Step 08 may need no edits to Minimap/NodeDiagram/Waveform/fields.ts if already clean.
