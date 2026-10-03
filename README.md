# Protocol Visualizer

An interactive web app for exploring serial communication
protocols: **I2C, SPI, UART, CAN, LIN and RS-232**.

For each protocol it shows the message structure and fields,
draws the waveform, and simulates two entities exchanging
messages with configurable timing, payload and faults.


## How + Why

This project was designed and implemented with the help of
Claude Code acting as a director agent to draft the project
plan with human providing the initial requirements. The
plan was implemented at first by locally running implementor
agents, `qwen3.5:9b`, `Qwen3:8b` which both initially failed
due to their lack of capabilites. A last attempt was made
with `claude-sonnet-5-5` (Claude Code) acting as the
implementor agent which succeeded implementing the project
plan with almost no human intervention.

The project was designed to act as a testground for [Dual Agentic
Workflow](https://github.com/is-it-ayush/duo-agentic-workflow).

## Stack

Vite, React 19, TypeScript, D3, Tailwind CSS 4, React Router,
Vitest.

## Getting started

```sh
npm install
npm run dev       # start the dev server
npm test          # run unit tests (Vitest)
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
```

## Project layout

- `src/protocols/` – one module per protocol plus the shared catalog
- `src/core/` – bit helpers, timeline, playback and the protocol
registry
- `src/components/` – waveform, packet anatomy, field inspector,
config and playback controls
- `src/pages/` – dashboard and per-protocol pages
- `tests/` – unit tests

## Adding a protocol

Create a module in `src/protocols/`, then register it in
`src/protocols/index.ts` and the catalog.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE.md)
file for details.
