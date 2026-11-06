export const javaNotes = [
  {
    "id": "buildNFA",
    "file": "Main.java",
    "title": "Recursive construction",
    "purpose": "An expression enters as a String; a mutable NFA leaves as the return value. I read this method as a structural decomposition: build smaller machines first, then apply the language operation that joins them.",
    "annotations": [
      [
        "exp.length() == 0",
        "The empty-expression base case",
        "The constructor creates one start state and no accepting states. This stops recursion, but it denotes the empty language, not the language containing ε. The browser rejects empty expressions; it still permits empty input strings."
      ],
      [
        "exp.contains(\"U\")",
        "Split complete alternatives",
        "For aaUddUda, split produces [aa, dd, da]. The first recursive result becomes the receiver. Each later result is imported through union(), so the accumulated machine recognizes progressively more alternatives. U is assumed never to occur inside a group."
      ],
      [
        "int finalState = nfa.addState()",
        "Distinguish before and after reading",
        "A new NFA already has a start. I need a second state to represent having consumed a symbol. addState() creates that state; addTransition(start, symbol, finalState) establishes the movement; addFinalState() separately declares that arriving there completes the pattern. Creation alone does not make a state accepting."
      ],
      [
        "exp.charAt(1) == '*'",
        "Apply repetition before the suffix",
        "For a*d, first build the a machine and apply star(). substring(2) is d, so buildNFA(\"d\") returns the suffix machine and concatenate() attaches it. Without a star, substring(1) removes just the first symbol. The suffix is built only when nonempty."
      ],
      [
        "exp.indexOf(')')",
        "Recurse inside a starred group",
        "For (ad)*d, locate the first closing parenthesis, recursively build ad, apply star(), and build the suffix after )*. indexOf is not a balanced-parenthesis parser. This code assumes nonnested groups and a mandatory star after the closing parenthesis."
      ]
    ],
    "correctness": "For valid expressions, each recursive call receives a shorter alternative, interior, or suffix. Symbol machines recognize one class; union, star, and concatenation preserve their respective language operations. Induction on this decomposition connects the returned machine to the expression.",
    "tradeoffs": "The parser is compact because it assumes a restricted grammar. It does not validate malformed input reliably. Repeated substring creation and union splitting can copy text; an explicit parser would offer better diagnostics and broader grammar. The browser validates a deliberately conservative subset before construction."
  },
  {
    "id": "acceptsString",
    "file": "NFA.java",
    "title": "Execute all possible paths",
    "purpose": "The input is a concrete string and the output is a boolean. The machine is fixed; currentStates is the set of all states reachable after the consumed prefix. transition() and epsilonTransition() implement one input update together.",
    "annotations": [
      [
        "currentStates.add(startState)",
        "Seed one state, then expand",
        "Start with {startState}, not every state. Initial ε-closure includes paths that consume nothing. This is essential for a starred pattern to accept the empty input."
      ],
      [
        "char translated = translateInput",
        "Translate characters into classes",
        "Lowercase ASCII letters become a and ASCII digits become d. Thus e in an input string is a letter, not an epsilon instruction: only transition labels use e for ε. Other characters remain unchanged and have no matching edges in valid machines."
      ],
      [
        "currentStates = transition",
        "Replace, rather than accumulate",
        "transition() visits every active state and unions all destinations for the translated symbol into a fresh HashSet. Old states are discarded unless reached again. A set keeps all valid paths while deduplicating paths that meet at the same state."
      ],
      [
        "currentStates = epsilonTransition(currentStates);",
        "Close before continuing",
        "The initial closure and each post-character closure restore the invariant: currentStates contains every endpoint reachable after exactly the consumed prefix, allowing any number of ε edges."
      ],
      [
        "for (int state : currentStates)",
        "Decide only after the loop",
        "Only after all characters are processed do I test whether any current state belongs to finalStates. For a*d and hello7, the letters can loop and 7 completes the digit suffix. For ad and a7b, an accepting state after a7 does not permit early success; b must also be consumed."
      ]
    ],
    "correctness": "The invariant is reachability after exactly i consumed characters. Initial closure establishes i = 0; a character transition followed by closure establishes i + 1. Therefore a nonempty intersection with finalStates after the full input is equivalent to the existence of an accepting path.",
    "tradeoffs": "This is set simulation, not path guessing or backtracking. It avoids enumerating every path, but repeated closure scans can revisit states. The browser stores all trace frames for inspection, which uses more memory than Java’s current-state-only execution."
  },
  {
    "id": "epsilonTransition",
    "file": "NFA.java",
    "title": "Reach a finite fixed point",
    "purpose": "This method takes a mutable set of states, expands it in place with every ε-reachable state, and returns that same set. It consumes no input. acceptsString() invokes it before reading and after each character transition.",
    "annotations": [
      [
        "while (true)",
        "Repeat discovery",
        "With q0 →ε q1 →ε q2 →ε q3 and initial {q0}, one pass finds only q1. Later passes discover q2 and q3. A final pass confirms that nothing new is reachable."
      ],
      [
        "HashSet<Integer> toAdd",
        "Separate discovery from mutation",
        "toAdd collects destinations while curStates is being iterated. Adding to curStates inside that for loop would risk concurrent modification. The temporary set also merges repeated discoveries."
      ],
      [
        "int initSize",
        "Remember the old size",
        "The algorithm never removes a state. Saving the size before expansion makes size equality a valid fixed-point test: if the size did not grow, no new member was introduced."
      ],
      [
        "curStates.addAll(toAdd)",
        "Merge and test convergence",
        "Union the discovered destinations into curStates. The original states stay reachable because zero ε moves are allowed. If the size is unchanged, break; otherwise scan the enlarged set again."
      ]
    ],
    "correctness": "The sequence of sets grows monotonically inside a finite state set Q. Every productive pass adds at least one member, so there are at most |Q| productive passes. On termination, every ε successor of every member is already present. Since only ε-reachable states were added, this is exactly the least closure.",
    "tradeoffs": "With expected constant-time hash lookup, a pass costs O(|Q| + |Eε|) in the worst case, and repeated scans give an O(|Q|(|Q| + |Eε|)) bound. A worklist could process each newly discovered state once. The current implementation favors a directly inspectable fixed-point loop."
  },
  {
    "id": "star",
    "file": "NFA.java",
    "title": "Accept zero or more repetitions",
    "purpose": "This operation mutates the receiver to recognize its old language repeated zero or more times. It creates a new start, adds ε entry and loop edges, and updates the accepting-state set.",
    "annotations": [
      [
        "int oldStart",
        "Keep the original entry",
        "Remember the old start before allocating a new state. The old entry is still the beginning of one repetition; the new entry represents the choice to perform zero repetitions."
      ],
      [
        "addTransition(newStart, 'e', oldStart)",
        "Enter without consuming input",
        "An ε edge lets the new start enter the original machine. Existing symbol edges stay intact, so one traversal still recognizes one original word."
      ],
      [
        "new HashSet<Integer>(finalStates)",
        "Copy the accepting set",
        "I copy the set rather than aliasing it. Later clearFinalStates() empties the original collection; an alias would also become empty. Each saved final receives an ε edge back to oldStart, allowing another repetition."
      ],
      [
        "oldFinals.add(newStart)",
        "Separate zero and positive repetition",
        "Add newStart to the saved finals, install it as the start, then replace the machine finals with the saved set. NewStart accepts ε immediately; retained old finals accept after one or more complete traversals."
      ]
    ],
    "correctness": "A path from the new start either consumes nothing and accepts there, or enters the original machine. Every return from an old final to oldStart begins another complete factor from the original language. Retaining the old finals allows the path to stop after any completed factor.",
    "tradeoffs": "The old final states are retained, unlike variants that introduce a separate final sink. Reapplying star can introduce redundant states and ε edges. State creation and graph mutation are simple here; no epsilon elimination or minimization is performed."
  },
  {
    "id": "union",
    "file": "NFA.java",
    "title": "Branch into either language",
    "purpose": "The receiver imports another independently built NFA and becomes their union. The argument is read, not rewritten. A fresh start branches to both machines, and a fresh final joins their exits.",
    "annotations": [
      [
        "int oldStart",
        "Save the receiver’s boundary",
        "Remember the receiver’s old start and copy its finals before the accepting set is replaced. These are the entry and exit points of the first alternative."
      ],
      [
        "for (int state : other.states)",
        "Import state identities before edges",
        "Import the other states with their existing IDs. The shared static ID counter gives independently constructed machines disjoint IDs. Renumbering states without rewriting edges would break connectivity."
      ],
      [
        "for (QSig qs : other.transitions.keySet())",
        "Copy every destination",
        "A QSig key represents a state-symbol pair. Its HashSet value may contain multiple destinations; copying just one would erase nondeterministic behavior. addTransition validates both endpoints and creates its own destination set."
      ],
      [
        "int newStart",
        "Create branch and join boundaries",
        "Allocate a new start and a new final. The start receives ε edges to both old starts. Every final from either alternative receives an ε edge to the new final. Thus either branch can finish without consuming a joining character."
      ],
      [
        "setStartState(newStart)",
        "Install the new machine boundary",
        "Set the fresh start, clear the receiver’s final set, and mark only the fresh final. The old finals remain ordinary states linked to the new exit."
      ]
    ],
    "correctness": "A successful path chooses an original machine through an ε edge, consumes a word recognized by that machine, and joins the common final. Conversely, every word recognized by either original machine has such a path. The language is exactly L(A) ∪ L(B).",
    "tradeoffs": "The import copies O(|QB| + |EB|) graph data and the join visits both accepting sets. Unique state IDs are a construction assumption. The provided QSig.equals uses Integer reference equality; after cached IDs are exceeded, distinct boxes can prevent transition lookup. The browser uses numeric edge records and does not reproduce this Java defect."
  },
  {
    "id": "concatenate",
    "file": "NFA.java",
    "title": "Connect complete components",
    "purpose": "The receiver becomes the first language followed by the argument’s language. It keeps its start, imports the second graph, links the old finals to the second start, and adopts only the second finals.",
    "annotations": [
      [
        "for (int state : other.states)",
        "Import existing states",
        "As with union, state IDs are preserved. The states must be present before addTransition checks their endpoints."
      ],
      [
        "for (QSig qs : other.transitions.keySet())",
        "Import the transition relation",
        "For each state-symbol key, copy every destination into the receiver. HashMap indexes a pair; HashSet represents all destinations for that pair, including multiple ε choices."
      ],
      [
        "for (int finalState : finalStates)",
        "Bridge completed prefixes",
        "Connect each first-machine final to other.startState with ε. A path may enter the second component only after finishing a word in the first. The bridge does not consume an extra character."
      ],
      [
        "clearFinalStates()",
        "Require the suffix to finish",
        "Remove the first component’s accepting status, then add the second component’s finals. Otherwise the combined machine could accept after the prefix without matching the suffix. For a*d, completing any number of letters is insufficient until a digit is read."
      ]
    ],
    "correctness": "Every accepting path consists of a path through the first machine, an ε bridge at a former final, and an accepting path through the second machine. This recognizes exactly strings xy with x ∈ L(A) and y ∈ L(B). Multiple possible split positions are retained by nondeterministic execution.",
    "tradeoffs": "The operation copies the second graph and adds one bridge per first final: O(|QB| + |EB| + |FA|) expected work under normal hash behavior. It mutates the receiver and assumes independently constructed operands. It does not optimize away ε bridges or safely define self-concatenation."
  }
] as const;
