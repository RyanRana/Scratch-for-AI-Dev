Click any box for a deep-dive prompt on that piece. Here's the full written plan:

Phase 1 — Build the registry (once at startup)
File: registry.ts
Build four indexes from your BlockDefinition[] array: byId (primary Map for O(1) lookup), byCategory, byTag, and byPortType (both input and output). These never mutate at runtime — rebuild only when block definitions change.
Also pre-render a compressed manifest at startup: one line per block, ~80 tokens each. At 505 blocks that's ~40k tokens total. This is what goes into the LLM context.

Phase 2 — Retrieve + Decompose
File: assembler.ts
Two sub-steps here:
2a. Retrieval (optional but recommended): Embed the user's goal and each manifest line using a local embedding model (see locality section below). Pull top-K (~30–50) most relevant blocks. This shrinks the context from 40k tokens to ~4k and dramatically reduces the hallucination surface.
2b. Decomposition: Send to DeepSeek with a system prompt that:

Pastes only the retrieved manifest lines
Explicitly states "every blockId you emit must match an id from this list exactly"
Requires response as pure JSON with the AssemblyResponse schema — reasoning string, then pipeline.nodes[] and pipeline.connections[]

The reasoning field is important — let the model think freely there before committing to structured output. It dramatically improves accuracy.

Phase 3 — Validate + Compile
File: validator.ts + compiler.ts
Three validation gates before any code runs:

ID gate — every blockId in nodes must exist in registry.byId. Hard fail on unknown IDs.
Port gate — every connection's fromPort and toPort must exist on the resolved block definition.
Fuzzy recovery — before hard failing, run Levenshtein distance against all known IDs. If edit distance ≤ 3, auto-correct and log. If > 3, add to error list.

If errors remain after fuzzy recovery, feed them back to DeepSeek as a correction prompt ("the following blockIds don't exist, here are the closest matches, please revise"). Retry max 2 times.
On success, run Kahn's topological sort on the connection graph, then assemble: deduplicate imports into a Set, render each block's codeTemplate.body in topo order with variable bindings resolved from the connection map.

Can it run locally?
Yes, almost entirely. The only question is which model you use for decomposition.
ComponentLocal optionBlock registry + indexesPure TypeScript/Node — fully localManifest compressionPure TypeScript — fully localEmbedding model (for RAG)nomic-embed-text or all-MiniLM via Ollama — fully localVector storehnswlib-node or vectra — in-process, no server neededDecomposition LLMDeepSeek-R1 or V3 via Ollama — fully local, or DeepSeek API if you're okay with one external callFuzzy matchingfastest-levenshtein npm package — fully localValidation + compilationPure TypeScript — fully local