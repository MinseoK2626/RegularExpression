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
- `src/engine.test.ts`: seven tests, including 3,276 bounded comparisons with an independent regular-expression oracle.
- `reference/java/`: preserved Java implementation, including original attribution. This historical reference is outside the public assets and is not linked by the site. The browser implementation adapts its construction and simulation approach; these are standard formal-language concepts, not novel algorithms.

No PDF is included or deployed. No backend, credentials, external font service, DFA conversion, or DFA minimization is required or implemented. Future projects can add isolated engines and components through the project registry; no unimplemented projects are presented.

## Supported expression language

`a` means an ASCII lowercase letter, `d` a digit. `U` unions complete alternatives; adjacency concatenates; `*` repeats zero or more times. Groups contain only a/d, must be starred, and cannot nest. Matching covers the whole string, including empty strings. The UI limits expressions to 48 characters and input to 64 for readable diagrams. Unsupported syntax yields an inline error.

A frame is the initial epsilon closure or a post-character closure. Individual epsilon iterations are not animated. Input edges for the most recent character are highlighted; active states include all epsilon-reachable states. Diagram layout is a visualization layer, not part of recognition.

## Validation

`npm test` exercises the recognizer. `npm run build` checks TypeScript and builds the static app. Browser checks cover execution, reset, input errors, source inspection, and mobile overflow. Local build validation does not establish successful public deployment; check the GitHub Actions deployment result separately.

## Explore implementation

The Playground links six formal concepts to live machine data and excerpts extracted from `src/engine.ts?raw`. Named excerpt boundaries in that file identify actual executable lines; snippets are not duplicated. Every excerpt links to the full GitHub source. States and transitions are focusable buttons (Enter/Space); selection remains visible. Step selects character-transition details, while concept or graph selection can be changed independently during Run.

`compile(expression, onConstruction?)` optionally emits deep-copied snapshots after symbol, concatenation, union, and star operations. Omitting the callback preserves normal compilation without snapshot allocation. Snapshots depict recursive submachines in execution order, not a fabricated cumulative animation. Construction mode shares the primary diagram; Run/Step returns to execution.

Frames expose `before`, `moved`, `character`, and `symbol` alongside active states and edge indices. The panel uses these exact fields for before/after computation. Construction invariants and metadata are covered by two additional tests.


## Java study explorer and execution walkthrough

**Inside the Implementation** imports the six actual methods from `reference/java/Main.java` and `NFA.java` as raw source. Physical source line numbers and annotation anchors are checked by `npm test`. The original Java files remain unchanged.

Select a method and an annotation, or select a code line, to connect the source to its explanation. Construction examples are recorded from the real browser engine; they are recursive submachine snapshots. The `a*d` call tree distinguishes recursive calls from operations applied locally. **Trace the Machine** supports Previous/Next Step, Play/Pause, Reset, and a selectable execution table. Closure additions in the table mean `after − character destinations`; they are not individual closure iterations.

### Validation commands

```sh
npm test                 # engine, Java source anchors, closure, full-input rejection
npm run build            # TypeScript and production Vite build
npm run test:java         # requires Java + javac (JDK 21 or newer)
```

If only a Java runtime is available, `ECJ_JAR=/absolute/path/ecj.jar npm run test:java` uses the Eclipse Java compiler. Use an official Maven distribution and verify its published checksum. During this task ECJ 3.40.0 was verified and used with Java 21. Test output is generated in a temporary directory and removed afterward. No original Java source is patched.

Java comparison covers 3,293 valid expression/input cases, including empty inputs, letter `e`, rejection, stars, concatenation, and union. The original global counter is reset for each independent case so these checks isolate regex behavior. A separate regression reproduces the original `QSig.equals()` boxed-Integer identity defect at state ID 128. Numeric IDs beyond Java’s guaranteed Integer cache can make Java transition lookups fail; the browser’s numeric edge records preserve the intended language semantics rather than this defect. Parity is therefore asserted for the tested valid cases with low IDs, not for every possible execution history or malformed expression.

The browser accepts a conservative grammar: `a`, `d`, adjacency, `U`, symbol stars, and nonnested starred groups of a/d. It rejects malformed expressions that the Java constructor does not reliably validate. An empty Java expression creates a start with no finals (the empty language, not ε); the UI rejects an empty expression. Empty *input* is supported.

Browser regression checks can run with an installed Playwright module and Chromium:

```sh
npm run dev -- --port 5173 --strictPort
# In another terminal:
PLAYWRIGHT_MODULE=/path/to/playwright-core node tests/browser.cjs
```

The regression checks method navigation and annotations, live graph/state correspondence, step controls, no early acceptance, pause, trace navigation, construction navigation, invalid syntax, empty input, and page overflow at 390, 768, and 1440 pixels. `CHROMIUM_PATH` can override `/usr/bin/chromium`; `APP_URL` can override the local test target. Screenshots are written only when `SCREENSHOT_DIR` is set. No deployment is performed by these commands.
