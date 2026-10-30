# The Computation Notebook

An interactive regular-expression / ε-NFA portfolio, built from the supplied Regular Expressions assignment and Java coursework. React, TypeScript, Vite; all computation runs locally in the browser.

## Development

Node.js 24 is verified. From `/workspace/RegularExpression`:

```sh
npm ci
npm test
npm run build
npm run dev -- --port 5173
```

`npm run preview` serves the production build. Deploy `dist/` to a static host. No backend, credentials, or external font service is required.

## Structure

- `src/engine.ts`: pure machine construction and execution, separated from React.
- `src/engine.test.ts`: assignment examples, grammar, epsilon behavior, traces, and 3,276 bounded differential comparisons against an independent regex oracle.
- `src/main.tsx`: portfolio, project registry, NFA diagram, execution controls, source inspection.
- `public/original/`: supplied Java, Makefile and assignment PDF, byte-for-byte preserved. Instructor scaffolding and supplied implementation are distinguished on the page.

Add future projects to the project registry and extract their components into separate modules as the collection grows. No placeholder projects are represented as completed work.

## Semantics and boundaries

`a` means ASCII lowercase, `d` ASCII digit. Union applies to complete alternatives. Parenthesized groups contain only a/d and must be starred; no nested groups. Matching consumes the whole string. The web UI restricts expressions to 48 characters and inputs to 64 for readable traces. Initial and post-symbol epsilon closures are shown as snapshots; epsilon edges are rendered but individual closure iterations are not animated.

The port follows the supplied Java `star`, `union`, `concatenate`, and recursive parser, including the new accepting start used by star. IDs restart per browser compilation rather than using the Java process-global counter. It validates unsupported grammar before compilation. Empty test strings are supported in the browser, whereas the original CLI's `Scanner.next()` cannot read empty tokens. The original Java was inspected but not executed: this environment has a Java runtime without `javac`. Browser-port validation does not establish correctness of the unmodified Java implementation.

Original-source comments that say TODO are preserved. Reflection text describes implications of the supplied work, not unverified autobiographical claims.

## Validation

`npm test` runs five named tests. `npm run build` runs TypeScript checks and a production build. Chromium smoke validation covers stepping, running, accepting/rejecting strings, reset, highlighted original source, PDF delivery, and a 390 px mobile viewport. This is development validation, not proof of deployed availability.
