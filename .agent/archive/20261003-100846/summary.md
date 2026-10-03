GOAL: Client-only Vite+React+TS app that visualizes I2C, SPI, UART, RS-232, CAN, LIN as animated bit-level
waveforms between 2 nodes, with user-set config/payload, playback control, and 1-2 toggleable faults per protocol.

DECISIONS:
| decision | chosen | reason |
|---|---|---|
| Visualization depth | Bit-level waveforms with field labels over time axis | User choice C; waveform is the distinguishing feature |
| Fault model | Happy path + 1-2 toggleable faults per protocol | User revised to option A |
| Node count | Exactly 2 (LIN: master + 1 slave) | No arbitration faults, so no third node |
| Interaction | Node A sends, node B replies, loops | "Back and forth" requirement |
| Timing | Protocol speed (baud/clock) + playback 0.1x-10x, pause, single-bit step | Real-time is invisible to humans |
| Payload input | Hex bytes; ASCII toggle for UART/RS-232 | Natural for byte protocols |
| Mobile waveform | Horizontal scroll, auto-follow playhead, pinch/zoom, field minimap | User choice A |
| Architecture | Protocol module: encode(config,msg,faults) -> {transitions, fieldSpans, events}; one registry file | Extensibility; pure fns are unit-testable |
| Stack | Vite latest, React, TS strict, D3 (scales/axes/zoom), Tailwind v4, React Router v7 | Stated stack |
| Routing/deploy | HashRouter, static build, GitHub Pages workflow | Works on any static host |
| Tests | Vitest unit tests on encoders, checksums, faults, playback reducer | Spec says Vitest unit tests |

FAULT CATALOG:
- I2C: address NACK, data NACK
- SPI: CPOL/CPHA mismatch corrupting sampled bits (all 4 modes selectable on happy path)
- UART: parity error, framing error (bad stop)
- RS-232: parity error, framing error (rendered at +/-V levels)
- CAN: CRC error, missing ACK -> both emit error frame (bit stuffing always encoded on happy path)
- LIN: checksum error, slave no-response (classic + enhanced checksum selectable)

PLAN:
1. Scaffold: Vite+React+TS, Tailwind v4, Router (HashRouter), Vitest, D3; dashboard + /protocol/:id route shell.
2. Core types + registry: Protocol interface, Timeline/FieldSpan/Event types, bit/hex utils.
3. Playback engine: pure reducer (play/pause/step/speed/seek) + hook driving a playhead over a timeline.
4. Waveform renderer: D3 multi-lane digital/analog-level waveform, field overlays, playhead, zoom/pan, auto-follow, minimap, node diagram.
5. Protocol detail page: config panel (speed, payload hex/ASCII, mode/options), fault toggles, field inspector on hover/tap.
6. UART + RS-232 encoders with parity/framing faults.
7. SPI encoder (4 modes) with mode-mismatch fault.
8. I2C encoder with address/data NACK.
9. CAN encoder: bit stuffing, CRC-15, ACK; CRC-error and missing-ACK faults -> error frame.
10. LIN encoder: break/sync/PID parity, classic+enhanced checksum; checksum-error and no-response faults.
11. Responsive polish + GitHub Pages deploy workflow.

TESTABLE BY:
1. `npm run build` and `npm test` pass; dashboard lists 6 protocols; route renders.
2. Unit tests: hex parse/format, bit helpers; registry returns all registered modules.
3. Reducer tests: step advances one bit, speed scales tick, seek clamps, pause halts.
4. Component test (jsdom): renders N lanes and field labels for a fixture timeline; playhead x matches time.
5. Component test: changing payload/fault props re-encodes; invalid hex shows error.
6. Unit tests: 0x55 8N1 bit sequence exact; parity/framing faults produce expected bits/events; RS-232 levels inverted +/-V.
7. Unit tests: each mode's MOSI/MISO sampling edge correct; mismatch yields expected corrupted byte.
8. Unit tests: start/stop/ACK bits exact; address NACK ends transfer with stop; data NACK flagged on correct byte.
9. Unit tests: CRC-15 matches a known reference frame; stuff bit after 5 equal bits; CRC/ACK faults emit error frame.
10. Unit tests: PID parity P0/P1 for known IDs; classic vs enhanced checksum match LIN 2.x examples; checksum fault + no-response event.
11. Build with base path succeeds; layout check at 375px has no page-level horizontal scroll (waveform scrolls internally).

OUT OF SCOPE: arbitration/multi-master, clock stretching, 3+ nodes, retransmission, backend, real hardware I/O, analog signal integrity/noise, protocols beyond the 6, i18n, accounts, E2E browser tests.

OPEN: none
