DRAFT WRITTEN: 8 steps
Tests written (all new, in tests/): fields.test.ts, theme.test.ts, dashboard.test.tsx, anatomy.test.tsx, protocolPage.test.tsx, fieldStyle.test.tsx, controlsStyle.test.ts, polish.test.ts. Not yet run; each should fail pre-step.
Assumptions:
- Stale old plan files were already deleted in the working tree.
- fields.ts API (FIELD_DOCS, fieldDoc, fieldColor) and data-testid/data-color/data-field/data-selected names are mine; step files state them.
- Theme/controls/polish tests scan source for class names; brittle but the only way to test styling.
- Step 08 bans hex literals in .tsx, so Waveform/Minimap colors must come from fields.ts exports or Tailwind classes.
Validator check:
- fields.test enumerates span names via encode with faults and parity/stop variants; verify it covers all emitted names (SPI MOSI/MISO, CAN error-frame).
- Steps 05, 06, 07 all edit ProtocolView.tsx; order is fine.
- dashboard.test selector excludes card-desc/wires/sketch; check it is not too clever.
- Existing app.test getByText('I2C') must stay unique after step 03.
