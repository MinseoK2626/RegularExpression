# Pattern / Machine

An interactive exploration of **Regular Expressions → Finite Automata → String Recognition**. React, TypeScript, Vite, and SVG; matching runs entirely in the browser.

## Develop

Node.js 24 is verified. From the project root:

```sh
npm ci
npm test
npm run build
npm run dev -- --port 5173
```

`npm run preview` serves the production build. Deploy `dist/`, never the source root. In GitHub Settings → Pages, choose GitHub Actions. `.github/workflows/deploy.yml` tests, builds, verifies the compiled entry, and deploys on pushes to `main`. Relative asset URLs support repository subpaths.

## Architecture

- `src/engine.ts`: pure recursive parser, explicit ε-NFA construction, fixed-point epsilon closure, active-set simulation, and trace frames.
- `src/main.tsx`: project registry, SVG automaton, Run/Step/Reset, trace inspection, concise theory and implementation explanation. The source viewer imports the actual engine as text and highlights TypeScript.
- `src/engine.test.ts`: five tests, including 3,276 bounded comparisons with an independent regular-expression oracle.
- `reference/java/`: preserved Java implementation, including original attribution. This historical reference is outside the public assets and is not linked by the site. The browser implementation adapts its construction and simulation approach; these are standard formal-language concepts, not novel algorithms.

No PDF is included or deployed. No backend, credentials, external font service, DFA conversion, or DFA minimization is required or implemented. Future projects can add isolated engines and components through the project registry; no unimplemented projects are presented.

## Supported expression language

`a` means an ASCII lowercase letter, `d` a digit. `U` unions complete alternatives; adjacency concatenates; `*` repeats zero or more times. Groups contain only a/d, must be starred, and cannot nest. Matching covers the whole string, including empty strings. The UI limits expressions to 48 characters and input to 64 for readable diagrams. Unsupported syntax yields an inline error.

A frame is the initial epsilon closure or a post-character closure. Individual epsilon iterations are not animated. Input edges for the most recent character are highlighted; active states include all epsilon-reachable states. Diagram layout is a visualization layer, not part of recognition.

## Validation

`npm test` exercises the recognizer. `npm run build` checks TypeScript and builds the static app. Browser checks cover execution, reset, input errors, source inspection, and mobile overflow. Local build validation does not establish successful public deployment; check the GitHub Actions deployment result separately.
