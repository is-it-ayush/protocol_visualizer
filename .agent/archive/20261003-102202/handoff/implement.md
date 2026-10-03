RUN 1
implementor: claude:claude-sonnet-5-5
mode: progressive
outcome: escalated at step 8; see .agent/checkpoint.md

PROGRESS (this plan):
- step 1: Add per-protocol packet field docs and a shared field color map. | files: src/protocols/fields.ts, tests/anatomy.test.tsx, tests/controlsStyle.test.ts, tests/dashboard.test.tsx, tests/fieldStyle.test.tsx, tests/fields.test.ts | commit: 9be19cd
- step 2: Define the Indian-palette Tailwind theme tokens and restyle the app shell. | files: src/App.tsx, src/index.css | commit: afa8950
- step 3: Redesign dashboard protocol cards with description, frame sketch and wire count. | files: src/pages/Dashboard.tsx, src/protocols/catalog.ts | commit: 80b7410
- step 4: Build the PacketAnatomy strip component. | files: src/components/PacketAnatomy.tsx | commit: 03bd1e1
- step 5: Lay out the protocol page with the anatomy strip above the waveform. | files: src/components/ProtocolView.tsx, src/pages/ProtocolPage.tsx | commit: 12d83fc
- step 6: Color waveform spans by field and show field meaning in the inspector. | files: src/components/FieldInspector.tsx, src/components/ProtocolView.tsx, src/components/Waveform.tsx | commit: d1b27a6
- step 7: Restyle config, payload, faults and playback controls with theme tokens. | files: src/components/ConfigPanel.tsx, src/components/PlaybackControls.tsx, src/components/ProtocolView.tsx | commit: 1d8108d
