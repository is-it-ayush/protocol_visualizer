GOAL: Redesign the UI (dashboard + protocol page) to a modern, clean look that explains each protocol's packet
and every field in it, tersely. Baseline is committed by the user; revert = git reset to it.

DECISIONS:
| decision | chosen | reason |
|---|---|---|
| Packet explanation | "Packet anatomy" strip above waveform, color-matched to waveform field spans | User choice B |
| Field docs | Static per-protocol data: field name, bits/width, one-line meaning, example | Terse, testable, extensible |
| Color mapping | One color per field name, shared by strip, waveform spans, chips, inspector | Maps frame to wires |
| Field detail | Click/hover block or span -> inspector shows meaning + live value | Reuses existing selection state |
| Styling | Tailwind utilities + @theme tokens only; no other CSS/UI libs | User requirement |
| Design language | Modern Indian: warm ivory surfaces, deep indigo ink, saffron/marigold, peacock teal, vermilion for errors | User requested; assumed palette |
| Motifs | Subtle CSS-only jaali/rangoli geometric patterns (gradients/SVG inline) on header/cards; restrained, clarity first | Flavor without hurting legibility |
| Waveform panel | Deep indigo dark canvas, field colors drawn from the Indian palette | Contrast for signals |
| Fonts | System font stack, no webfont download | No new deps, offline-safe |
| Scope | Dashboard cards + protocol page layout + waveform/inspector styling | Assumed, no veto |
| Logic | Encoders, playback, core types' existing fields unchanged | Keep diff small; 69 tests stay green |
| Tests | Existing tests green; new unit tests for field docs coverage + color map | Spec says Vitest |

PLAN:
1. Field docs module: per-protocol packet definition (fields, widths, meaning) for all 6 protocols + color map; must cover every fieldSpan name each encoder emits.
2. Design foundation: Tailwind @theme tokens (Indian palette, surfaces, type scale) in index.css; App shell/header restyle with subtle geometric motif.
3. Dashboard: protocol cards with name, one-line purpose, mini frame sketch, wire count.
4. PacketAnatomy component: frame as proportional colored blocks with name/width; click selects field; shows meaning line.
5. Protocol page layout: header, anatomy strip, waveform, controls/config as compact side/below panels, responsive.
6. Waveform/Minimap/NodeDiagram/FieldInspector restyle: spans use field colors, selected field highlighted, inspector shows meaning + value.
7. Config/payload/faults/playback controls restyle (clear labels, grouped, 44px touch targets kept).
8. Polish + responsive check, update any tests broken by markup changes (behavior assertions unchanged).

TESTABLE BY:
1. Vitest: every fieldSpan name from each encoder (happy path + faults) has a doc entry; colors defined.
2. Build passes; theme tokens defined in index.css and used by shell (no default gray-only classes, no non-Tailwind styling).
3. Vitest render: dashboard shows 6 cards each with description.
4. Vitest render: PacketAnatomy renders one block per doc field; click selects and shows meaning.
5. Vitest render: protocol page shows anatomy strip + waveform; build passes.
6. Vitest: selecting a field shows its meaning in inspector; span color equals map color.
7. Existing control tests (payload, faults, playback) still pass.
8. npm test and npm run build green.

OUT OF SCOPE: new protocols, encoder/timeline logic changes, theme toggle, webfonts, Devanagari/i18n text, new dependencies, i18n,
animation libraries.

OPEN: none
