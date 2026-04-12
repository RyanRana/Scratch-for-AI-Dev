import type { BlockDefinition } from "../types.js";

export const textNlpBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Tokenize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.tokenize",
    name: "Tokenize",
    category: "text-nlp",
    description: "Split text into tokens using a configurable tokenizer (whitespace, word-level, or subword BPE)",
    tags: ["tokenize", "tokens", "split", "nlp", "nltk", "spacy", "transformers"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true, description: "Input text to tokenize" },
    ],
    outputs: [
      { id: "tokens", name: "Tokens", type: "list", required: true },
      { id: "count", name: "Token Count", type: "number", required: true },
    ],
    parameters: [
      { id: "method", name: "Tokenizer", type: "select", default: "nltk_word", options: [{ label: "NLTK Word", value: "nltk_word" }, { label: "NLTK WordPunct", value: "nltk_wordpunct" }, { label: "spaCy", value: "spacy" }, { label: "Whitespace", value: "whitespace" }, { label: "HuggingFace AutoTokenizer", value: "hf" }], description: "Tokenization method to use" },
      { id: "hf_model", name: "HF Model Name", type: "string", default: "bert-base-uncased", description: "HuggingFace model name for subword tokenization", advanced: true },
      { id: "lowercase", name: "Lowercase First", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import nltk", "from nltk.tokenize import word_tokenize, wordpunct_tokenize"],
      setup: "nltk.download('punkt_tab', quiet=True)",
      body: `_text = {{inputs.text}}
if {{params.lowercase}}:
    _text = _text.lower()
_method = "{{params.method}}"
if _method == "nltk_word":
    {{outputs.tokens}} = word_tokenize(_text)
elif _method == "nltk_wordpunct":
    {{outputs.tokens}} = wordpunct_tokenize(_text)
elif _method == "spacy":
    import spacy
    _nlp = spacy.load("en_core_web_sm")
    {{outputs.tokens}} = [tok.text for tok in _nlp(_text)]
elif _method == "whitespace":
    {{outputs.tokens}} = _text.split()
elif _method == "hf":
    from transformers import AutoTokenizer
    _tok = AutoTokenizer.from_pretrained("{{params.hf_model}}")
    {{outputs.tokens}} = _tok.tokenize(_text)
{{outputs.count}} = len({{outputs.tokens}})`,
      outputBindings: { tokens: "tokens", count: "token_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Detokenize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.detokenize",
    name: "Detokenize",
    category: "text-nlp",
    description: "Join a list of tokens back into a coherent text string",
    tags: ["detokenize", "join", "tokens", "text", "nltk", "treebank"],
    inputs: [
      { id: "tokens", name: "Tokens", type: "list", required: true, description: "List of tokens to join" },
    ],
    outputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "treebank", options: [{ label: "TreebankWord Detokenizer", value: "treebank" }, { label: "Simple Space Join", value: "space" }] },
    ],
    codeTemplate: {
      imports: ["from nltk.tokenize.treebank import TreebankWordDetokenizer"],
      body: `if "{{params.method}}" == "treebank":
    {{outputs.text}} = TreebankWordDetokenizer().detokenize({{inputs.tokens}})
else:
    {{outputs.text}} = " ".join({{inputs.tokens}})`,
      outputBindings: { text: "detokenized_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Chunk Text
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.chunk-text",
    name: "Chunk Text",
    category: "text-nlp",
    description: "Split text into fixed-size overlapping chunks for downstream processing or embedding",
    tags: ["chunk", "split", "overlap", "window", "text", "langchain"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "chunks", name: "Chunks", type: "text_list", required: true },
      { id: "count", name: "Chunk Count", type: "number", required: true },
    ],
    parameters: [
      { id: "chunk_size", name: "Chunk Size (chars)", type: "number", default: 512, min: 50, max: 10000, step: 50, description: "Maximum characters per chunk" },
      { id: "chunk_overlap", name: "Overlap (chars)", type: "number", default: 64, min: 0, max: 2000, step: 16, description: "Number of overlapping characters between consecutive chunks" },
      { id: "separator", name: "Separator", type: "string", default: "\\n\\n", description: "Preferred split boundary (e.g. paragraph break)" },
    ],
    codeTemplate: {
      imports: ["from langchain.text_splitter import RecursiveCharacterTextSplitter"],
      body: `_splitter = RecursiveCharacterTextSplitter(
    chunk_size={{params.chunk_size}},
    chunk_overlap={{params.chunk_overlap}},
    separators=["{{params.separator}}", "\\n", " ", ""]
)
{{outputs.chunks}} = _splitter.split_text({{inputs.text}})
{{outputs.count}} = len({{outputs.chunks}})`,
      outputBindings: { chunks: "text_chunks", count: "chunk_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Sentence Split
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.sentence-split",
    name: "Sentence Split",
    category: "text-nlp",
    description: "Split text into individual sentences using NLTK Punkt or spaCy sentence segmentation",
    tags: ["sentence", "split", "segment", "nltk", "spacy", "punkt"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "sentences", name: "Sentences", type: "text_list", required: true },
      { id: "count", name: "Sentence Count", type: "number", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "nltk", options: [{ label: "NLTK Punkt", value: "nltk" }, { label: "spaCy", value: "spacy" }] },
      { id: "language", name: "Language", type: "string", default: "english", description: "Language for sentence tokenizer" },
    ],
    codeTemplate: {
      imports: ["import nltk"],
      setup: "nltk.download('punkt_tab', quiet=True)",
      body: `if "{{params.method}}" == "nltk":
    from nltk.tokenize import sent_tokenize
    {{outputs.sentences}} = sent_tokenize({{inputs.text}}, language="{{params.language}}")
else:
    import spacy
    _nlp = spacy.load("en_core_web_sm")
    _doc = _nlp({{inputs.text}})
    {{outputs.sentences}} = [sent.text.strip() for sent in _doc.sents]
{{outputs.count}} = len({{outputs.sentences}})`,
      outputBindings: { sentences: "sentences", count: "sentence_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Regex Extract
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.regex-extract",
    name: "Regex Extract",
    category: "text-nlp",
    description: "Extract all matches of a regular expression pattern from text",
    tags: ["regex", "regexp", "extract", "pattern", "match", "re"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "matches", name: "Matches", type: "list", required: true },
      { id: "count", name: "Match Count", type: "number", required: true },
    ],
    parameters: [
      { id: "pattern", name: "Regex Pattern", type: "string", default: "", placeholder: "\\b[A-Z][a-z]+\\b", description: "Python regular expression pattern" },
      { id: "flags", name: "Flags", type: "multiselect", default: [], options: [{ label: "Ignore Case", value: "re.IGNORECASE" }, { label: "Multiline", value: "re.MULTILINE" }, { label: "Dot All", value: "re.DOTALL" }] },
      { id: "group", name: "Capture Group", type: "number", default: 0, min: 0, description: "Which capture group to return (0 = full match)" },
    ],
    codeTemplate: {
      imports: ["import re"],
      body: `_flags = 0
for _f in {{params.flags}}:
    _flags |= eval(_f)
_compiled = re.compile(r"{{params.pattern}}", _flags)
if {{params.group}} == 0:
    {{outputs.matches}} = _compiled.findall({{inputs.text}})
else:
    {{outputs.matches}} = [m.group({{params.group}}) for m in _compiled.finditer({{inputs.text}})]
{{outputs.count}} = len({{outputs.matches}})`,
      outputBindings: { matches: "regex_matches", count: "match_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Named Entity Recognition
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.named-entity-recognition",
    name: "Named Entity Recognition",
    category: "text-nlp",
    description: "Identify named entities (persons, organizations, locations, etc.) in text using spaCy or transformers",
    tags: ["ner", "entity", "spacy", "transformers", "recognition", "person", "org", "gpe"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "entities", name: "Entities", type: "list", required: true, description: "List of {text, label, start, end} dicts" },
      { id: "count", name: "Entity Count", type: "number", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "spacy", options: [{ label: "spaCy", value: "spacy" }, { label: "HuggingFace NER", value: "hf" }] },
      { id: "spacy_model", name: "spaCy Model", type: "string", default: "en_core_web_sm", description: "spaCy model to load", advanced: true },
      { id: "hf_model", name: "HF Model", type: "string", default: "dslim/bert-base-NER", description: "HuggingFace NER model", advanced: true },
      { id: "entity_types", name: "Entity Types Filter", type: "string", default: "", placeholder: "PERSON, ORG, GPE", description: "Comma-separated entity types to keep (empty = all)", advanced: true },
    ],
    codeTemplate: {
      imports: ["import spacy"],
      body: `_method = "{{params.method}}"
if _method == "spacy":
    _nlp = spacy.load("{{params.spacy_model}}")
    _doc = _nlp({{inputs.text}})
    {{outputs.entities}} = [{"text": ent.text, "label": ent.label_, "start": ent.start_char, "end": ent.end_char} for ent in _doc.ents]
else:
    from transformers import pipeline
    _ner = pipeline("ner", model="{{params.hf_model}}", aggregation_strategy="simple")
    _results = _ner({{inputs.text}})
    {{outputs.entities}} = [{"text": r["word"], "label": r["entity_group"], "start": r["start"], "end": r["end"], "score": round(r["score"], 4)} for r in _results]
_filter_types = [t.strip().upper() for t in "{{params.entity_types}}".split(",") if t.strip()]
if _filter_types:
    {{outputs.entities}} = [e for e in {{outputs.entities}} if e["label"] in _filter_types]
{{outputs.count}} = len({{outputs.entities}})`,
      outputBindings: { entities: "entities", count: "entity_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. POS Tagging
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.pos-tagging",
    name: "POS Tagging",
    category: "text-nlp",
    description: "Assign part-of-speech tags to each token in the input text using spaCy or NLTK",
    tags: ["pos", "part-of-speech", "tagging", "grammar", "spacy", "nltk"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "tagged", name: "Tagged Tokens", type: "list", required: true, description: "List of {token, pos, tag} dicts" },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "spacy", options: [{ label: "spaCy", value: "spacy" }, { label: "NLTK", value: "nltk" }] },
      { id: "spacy_model", name: "spaCy Model", type: "string", default: "en_core_web_sm", advanced: true },
    ],
    codeTemplate: {
      imports: ["import spacy"],
      body: `if "{{params.method}}" == "spacy":
    _nlp = spacy.load("{{params.spacy_model}}")
    _doc = _nlp({{inputs.text}})
    {{outputs.tagged}} = [{"token": tok.text, "pos": tok.pos_, "tag": tok.tag_} for tok in _doc]
else:
    import nltk
    nltk.download('averaged_perceptron_tagger_eng', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    from nltk.tokenize import word_tokenize
    _tokens = word_tokenize({{inputs.text}})
    _tagged = nltk.pos_tag(_tokens)
    {{outputs.tagged}} = [{"token": tok, "pos": tag, "tag": tag} for tok, tag in _tagged]`,
      outputBindings: { tagged: "pos_tagged" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Dependency Parse
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.dependency-parse",
    name: "Dependency Parse",
    category: "text-nlp",
    description: "Parse syntactic dependency structure of text, returning head-child relations for each token",
    tags: ["dependency", "parse", "syntax", "tree", "spacy", "dep"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "deps", name: "Dependencies", type: "list", required: true, description: "List of {token, dep, head, head_pos} dicts" },
    ],
    parameters: [
      { id: "spacy_model", name: "spaCy Model", type: "string", default: "en_core_web_sm" },
    ],
    codeTemplate: {
      imports: ["import spacy"],
      body: `_nlp = spacy.load("{{params.spacy_model}}")
_doc = _nlp({{inputs.text}})
{{outputs.deps}} = [{"token": tok.text, "dep": tok.dep_, "head": tok.head.text, "head_pos": tok.head.pos_} for tok in _doc]`,
      outputBindings: { deps: "dep_parse" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. Coreference Resolution
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.coreference-resolution",
    name: "Coreference Resolution",
    category: "text-nlp",
    description: "Resolve pronoun and noun phrase coreferences in text using spaCy with coreferee or neuralcoref",
    tags: ["coreference", "coref", "pronoun", "resolution", "spacy", "anaphora"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "resolved_text", name: "Resolved Text", type: "text", required: true, description: "Text with pronouns replaced by their referents" },
      { id: "clusters", name: "Coreference Clusters", type: "list", required: true },
    ],
    parameters: [
      { id: "spacy_model", name: "spaCy Model", type: "string", default: "en_core_web_sm" },
    ],
    codeTemplate: {
      imports: ["import spacy", "import coreferee"],
      body: `_nlp = spacy.load("{{params.spacy_model}}")
_nlp.add_pipe("coreferee")
_doc = _nlp({{inputs.text}})
{{outputs.clusters}} = []
for chain in _doc._.coref_chains:
    _mentions = [_doc[mention[0]:mention[-1]+1].text for mention in chain]
    {{outputs.clusters}}.append(_mentions)
{{outputs.resolved_text}} = {{inputs.text}}
for chain in _doc._.coref_chains:
    _main = chain.most_specific_mention_index
    _main_span = chain[_main]
    _main_text = _doc[_main_span[0]:_main_span[-1]+1].text
    for i, mention in enumerate(chain):
        if i != _main:
            _mention_text = _doc[mention[0]:mention[-1]+1].text
            {{outputs.resolved_text}} = {{outputs.resolved_text}}.replace(_mention_text, _main_text, 1)`,
      outputBindings: { resolved_text: "resolved_text", clusters: "coref_clusters" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Text Clean
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.text-clean",
    name: "Text Clean",
    category: "text-nlp",
    description: "Clean text by removing HTML tags, URLs, emails, special characters, and extra whitespace",
    tags: ["clean", "preprocess", "html", "url", "whitespace", "normalize", "regex"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "cleaned", name: "Cleaned Text", type: "text", required: true },
    ],
    parameters: [
      { id: "strip_html", name: "Strip HTML", type: "boolean", default: true },
      { id: "strip_urls", name: "Strip URLs", type: "boolean", default: true },
      { id: "strip_emails", name: "Strip Emails", type: "boolean", default: false },
      { id: "strip_punctuation", name: "Strip Punctuation", type: "boolean", default: false },
      { id: "strip_numbers", name: "Strip Numbers", type: "boolean", default: false },
      { id: "normalize_whitespace", name: "Normalize Whitespace", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["import re"],
      body: `_t = {{inputs.text}}
if {{params.strip_html}}:
    _t = re.sub(r"<[^>]+>", "", _t)
if {{params.strip_urls}}:
    _t = re.sub(r"https?://\\S+|www\\.\\S+", "", _t)
if {{params.strip_emails}}:
    _t = re.sub(r"\\S+@\\S+\\.\\S+", "", _t)
if {{params.strip_punctuation}}:
    _t = re.sub(r"[^\\w\\s]", "", _t)
if {{params.strip_numbers}}:
    _t = re.sub(r"\\b\\d+\\b", "", _t)
if {{params.normalize_whitespace}}:
    _t = re.sub(r"\\s+", " ", _t).strip()
{{outputs.cleaned}} = _t`,
      outputBindings: { cleaned: "cleaned_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Lowercase
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.lowercase",
    name: "Lowercase",
    category: "text-nlp",
    description: "Convert text to lowercase with optional Unicode normalization (NFKC/NFC)",
    tags: ["lowercase", "lower", "case", "normalize", "unicode"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "lowered", name: "Lowercased Text", type: "text", required: true },
    ],
    parameters: [
      { id: "unicode_normalize", name: "Unicode Normalization", type: "select", default: "none", options: [{ label: "None", value: "none" }, { label: "NFC", value: "NFC" }, { label: "NFKC", value: "NFKC" }], description: "Apply Unicode normalization before lowering" },
    ],
    codeTemplate: {
      imports: ["import unicodedata"],
      body: `_t = {{inputs.text}}
if "{{params.unicode_normalize}}" != "none":
    _t = unicodedata.normalize("{{params.unicode_normalize}}", _t)
{{outputs.lowered}} = _t.lower()`,
      outputBindings: { lowered: "lowered_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Remove Stopwords
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.remove-stopwords",
    name: "Remove Stopwords",
    category: "text-nlp",
    description: "Remove common stopwords from a list of tokens using NLTK or spaCy stop word lists",
    tags: ["stopwords", "filter", "tokens", "nltk", "spacy", "remove"],
    inputs: [
      { id: "tokens", name: "Tokens", type: "list", required: true },
    ],
    outputs: [
      { id: "filtered", name: "Filtered Tokens", type: "list", required: true },
    ],
    parameters: [
      { id: "language", name: "Language", type: "string", default: "english" },
      { id: "extra_words", name: "Extra Stop Words", type: "string", default: "", placeholder: "also, furthermore", description: "Additional comma-separated words to remove" },
    ],
    codeTemplate: {
      imports: ["import nltk", "from nltk.corpus import stopwords"],
      setup: "nltk.download('stopwords', quiet=True)",
      body: `_stop = set(stopwords.words("{{params.language}}"))
_extra = {w.strip().lower() for w in "{{params.extra_words}}".split(",") if w.strip()}
_stop.update(_extra)
{{outputs.filtered}} = [t for t in {{inputs.tokens}} if t.lower() not in _stop]`,
      outputBindings: { filtered: "filtered_tokens" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Stem
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.stem",
    name: "Stem",
    category: "text-nlp",
    description: "Reduce words to their stem form using Porter, Snowball, or Lancaster stemmer",
    tags: ["stem", "stemming", "porter", "snowball", "lancaster", "nltk"],
    inputs: [
      { id: "tokens", name: "Tokens", type: "list", required: true },
    ],
    outputs: [
      { id: "stemmed", name: "Stemmed Tokens", type: "list", required: true },
    ],
    parameters: [
      { id: "stemmer", name: "Stemmer", type: "select", default: "snowball", options: [{ label: "Porter", value: "porter" }, { label: "Snowball", value: "snowball" }, { label: "Lancaster", value: "lancaster" }] },
      { id: "language", name: "Language", type: "string", default: "english", description: "Language for Snowball stemmer" },
    ],
    codeTemplate: {
      imports: ["from nltk.stem import PorterStemmer, SnowballStemmer, LancasterStemmer"],
      body: `_name = "{{params.stemmer}}"
if _name == "porter":
    _stemmer = PorterStemmer()
elif _name == "snowball":
    _stemmer = SnowballStemmer("{{params.language}}")
else:
    _stemmer = LancasterStemmer()
{{outputs.stemmed}} = [_stemmer.stem(t) for t in {{inputs.tokens}}]`,
      outputBindings: { stemmed: "stemmed_tokens" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Lemmatize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.lemmatize",
    name: "Lemmatize",
    category: "text-nlp",
    description: "Reduce words to their dictionary (lemma) form using spaCy or NLTK WordNet",
    tags: ["lemmatize", "lemma", "spacy", "wordnet", "nltk", "normalize"],
    inputs: [
      { id: "tokens", name: "Tokens", type: "list", required: true },
    ],
    outputs: [
      { id: "lemmatized", name: "Lemmatized Tokens", type: "list", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "spacy", options: [{ label: "spaCy", value: "spacy" }, { label: "NLTK WordNet", value: "wordnet" }] },
      { id: "spacy_model", name: "spaCy Model", type: "string", default: "en_core_web_sm", advanced: true },
    ],
    codeTemplate: {
      imports: ["import spacy"],
      body: `if "{{params.method}}" == "spacy":
    _nlp = spacy.load("{{params.spacy_model}}")
    _doc = _nlp(" ".join({{inputs.tokens}}))
    {{outputs.lemmatized}} = [tok.lemma_ for tok in _doc]
else:
    import nltk
    nltk.download('wordnet', quiet=True)
    from nltk.stem import WordNetLemmatizer
    _lem = WordNetLemmatizer()
    {{outputs.lemmatized}} = [_lem.lemmatize(t) for t in {{inputs.tokens}}]`,
      outputBindings: { lemmatized: "lemmatized_tokens" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Language Detect
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.language-detect",
    name: "Language Detect",
    category: "text-nlp",
    description: "Detect the language of input text and return ISO 639-1 code with confidence score",
    tags: ["language", "detect", "langdetect", "locale", "identify"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "language", name: "Language Code", type: "text", required: true, description: "ISO 639-1 language code (e.g. 'en', 'fr')" },
      { id: "probabilities", name: "Probabilities", type: "list", required: true, description: "List of {lang, prob} dicts" },
    ],
    parameters: [
      { id: "seed", name: "Random Seed", type: "number", default: 42, description: "Seed for reproducible detection", advanced: true },
    ],
    codeTemplate: {
      imports: ["from langdetect import detect, detect_langs", "from langdetect import DetectorFactory"],
      body: `DetectorFactory.seed = {{params.seed}}
{{outputs.language}} = detect({{inputs.text}})
_probs = detect_langs({{inputs.text}})
{{outputs.probabilities}} = [{"lang": str(p).split(":")[0], "prob": round(float(str(p).split(":")[1]), 4)} for p in _probs]`,
      outputBindings: { language: "detected_lang", probabilities: "lang_probs" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Translate
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.translate",
    name: "Translate",
    category: "text-nlp",
    description: "Translate text between languages using Helsinki-NLP MarianMT or M2M-100 models",
    tags: ["translate", "translation", "language", "marian", "m2m100", "transformers"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "translated", name: "Translated Text", type: "text", required: true },
    ],
    parameters: [
      { id: "src_lang", name: "Source Language", type: "string", default: "en", description: "ISO 639-1 source language code" },
      { id: "tgt_lang", name: "Target Language", type: "string", default: "fr", description: "ISO 639-1 target language code" },
      { id: "model_type", name: "Model Type", type: "select", default: "marian", options: [{ label: "MarianMT", value: "marian" }, { label: "M2M-100", value: "m2m100" }] },
      { id: "max_length", name: "Max Length", type: "number", default: 512, min: 32, max: 2048, advanced: true },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline"],
      body: `if "{{params.model_type}}" == "marian":
    _model_name = f"Helsinki-NLP/opus-mt-{{params.src_lang}}-{{params.tgt_lang}}"
    _translator = pipeline("translation", model=_model_name, max_length={{params.max_length}})
    _result = _translator({{inputs.text}})
    {{outputs.translated}} = _result[0]["translation_text"]
else:
    from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
    _model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
    _tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")
    _tokenizer.src_lang = "{{params.src_lang}}"
    _encoded = _tokenizer({{inputs.text}}, return_tensors="pt", max_length={{params.max_length}}, truncation=True)
    _generated = _model.generate(**_encoded, forced_bos_token_id=_tokenizer.get_lang_id("{{params.tgt_lang}}"))
    {{outputs.translated}} = _tokenizer.batch_decode(_generated, skip_special_tokens=True)[0]`,
      outputBindings: { translated: "translated_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Summarize Text
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.summarize-text",
    name: "Summarize Text",
    category: "text-nlp",
    description: "Generate an abstractive or extractive summary of input text using transformers",
    tags: ["summarize", "summary", "abstractive", "extractive", "bart", "t5", "transformers"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "summary", name: "Summary", type: "text", required: true },
    ],
    parameters: [
      { id: "model", name: "Model", type: "string", default: "facebook/bart-large-cnn", description: "HuggingFace summarization model" },
      { id: "max_length", name: "Max Length", type: "number", default: 150, min: 20, max: 1024, description: "Maximum summary length in tokens" },
      { id: "min_length", name: "Min Length", type: "number", default: 30, min: 5, max: 512, description: "Minimum summary length in tokens" },
      { id: "do_sample", name: "Sampling", type: "boolean", default: false, description: "Use sampling instead of greedy decoding" },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline"],
      body: `_summarizer = pipeline("summarization", model="{{params.model}}")
_result = _summarizer(
    {{inputs.text}},
    max_length={{params.max_length}},
    min_length={{params.min_length}},
    do_sample={{params.do_sample}}
)
{{outputs.summary}} = _result[0]["summary_text"]`,
      outputBindings: { summary: "summary_text" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. Extract Keywords
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.extract-keywords",
    name: "Extract Keywords",
    category: "text-nlp",
    description: "Extract important keywords and keyphrases from text using TF-IDF, RAKE, or YAKE",
    tags: ["keywords", "keyphrase", "tfidf", "rake", "yake", "extract"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "keywords", name: "Keywords", type: "list", required: true, description: "List of {keyword, score} dicts" },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "yake", options: [{ label: "YAKE", value: "yake" }, { label: "RAKE (NLTK)", value: "rake" }, { label: "TF-IDF Top Terms", value: "tfidf" }] },
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 100, description: "Number of keywords to return" },
      { id: "max_ngram", name: "Max N-gram Size", type: "number", default: 3, min: 1, max: 5, description: "Maximum n-gram size for keyphrases" },
    ],
    codeTemplate: {
      imports: ["import yake"],
      body: `_method = "{{params.method}}"
if _method == "yake":
    _kw_extractor = yake.KeywordExtractor(n={{params.max_ngram}}, top={{params.top_k}})
    _kws = _kw_extractor.extract_keywords({{inputs.text}})
    {{outputs.keywords}} = [{"keyword": kw, "score": round(score, 4)} for kw, score in _kws]
elif _method == "rake":
    from rake_nltk import Rake
    _r = Rake(max_length={{params.max_ngram}})
    _r.extract_keywords_from_text({{inputs.text}})
    _ranked = _r.get_ranked_phrases_with_scores()[:{{params.top_k}}]
    {{outputs.keywords}} = [{"keyword": phrase, "score": round(score, 4)} for score, phrase in _ranked]
else:
    from sklearn.feature_extraction.text import TfidfVectorizer
    _vec = TfidfVectorizer(ngram_range=(1, {{params.max_ngram}}), max_features={{params.top_k}})
    _X = _vec.fit_transform([{{inputs.text}}])
    _names = _vec.get_feature_names_out()
    _scores = _X.toarray()[0]
    _pairs = sorted(zip(_names, _scores), key=lambda x: -x[1])[:{{params.top_k}}]
    {{outputs.keywords}} = [{"keyword": kw, "score": round(float(s), 4)} for kw, s in _pairs]`,
      outputBindings: { keywords: "keywords" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Sentiment Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.sentiment-score",
    name: "Sentiment Score",
    category: "text-nlp",
    description: "Compute sentiment polarity and label (positive / negative / neutral) using VADER or transformers",
    tags: ["sentiment", "polarity", "opinion", "vader", "transformers", "analysis"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "label", name: "Label", type: "text", required: true, description: "Sentiment label (POSITIVE, NEGATIVE, NEUTRAL)" },
      { id: "score", name: "Score", type: "number", required: true, description: "Confidence score 0-1" },
      { id: "details", name: "Details", type: "dict", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "vader", options: [{ label: "VADER", value: "vader" }, { label: "HuggingFace", value: "hf" }] },
      { id: "hf_model", name: "HF Model", type: "string", default: "cardiffnlp/twitter-roberta-base-sentiment-latest", advanced: true },
    ],
    codeTemplate: {
      imports: ["import nltk"],
      setup: "nltk.download('vader_lexicon', quiet=True)",
      body: `if "{{params.method}}" == "vader":
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    _sia = SentimentIntensityAnalyzer()
    _scores = _sia.polarity_scores({{inputs.text}})
    {{outputs.details}} = _scores
    _compound = _scores["compound"]
    if _compound >= 0.05:
        {{outputs.label}} = "POSITIVE"
    elif _compound <= -0.05:
        {{outputs.label}} = "NEGATIVE"
    else:
        {{outputs.label}} = "NEUTRAL"
    {{outputs.score}} = round(abs(_compound), 4)
else:
    from transformers import pipeline
    _clf = pipeline("sentiment-analysis", model="{{params.hf_model}}")
    _result = _clf({{inputs.text}})[0]
    {{outputs.label}} = _result["label"]
    {{outputs.score}} = round(_result["score"], 4)
    {{outputs.details}} = _result`,
      outputBindings: { label: "sentiment_label", score: "sentiment_score", details: "sentiment_details" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. TF-IDF Vectorize
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.tfidf-vectorize",
    name: "TF-IDF Vectorize",
    category: "text-nlp",
    description: "Convert a corpus of documents into TF-IDF sparse vectors using scikit-learn",
    tags: ["tfidf", "vectorize", "sparse", "sklearn", "feature", "bow"],
    inputs: [
      { id: "documents", name: "Documents", type: "text_list", required: true, description: "List of text documents" },
    ],
    outputs: [
      { id: "matrix", name: "TF-IDF Matrix", type: "tensor", required: true, description: "Sparse TF-IDF matrix (n_docs x n_features)" },
      { id: "feature_names", name: "Feature Names", type: "list", required: true },
      { id: "vectorizer", name: "Vectorizer", type: "model", required: true },
    ],
    parameters: [
      { id: "max_features", name: "Max Features", type: "number", default: 10000, min: 100, max: 500000, description: "Maximum vocabulary size" },
      { id: "ngram_min", name: "Min N-gram", type: "number", default: 1, min: 1, max: 5 },
      { id: "ngram_max", name: "Max N-gram", type: "number", default: 1, min: 1, max: 5 },
      { id: "sublinear_tf", name: "Sublinear TF", type: "boolean", default: true, description: "Apply sublinear TF scaling (1 + log(tf))" },
      { id: "min_df", name: "Min Doc Freq", type: "number", default: 1, min: 1, description: "Minimum document frequency for a term", advanced: true },
    ],
    codeTemplate: {
      imports: ["from sklearn.feature_extraction.text import TfidfVectorizer"],
      body: `{{outputs.vectorizer}} = TfidfVectorizer(
    max_features={{params.max_features}},
    ngram_range=({{params.ngram_min}}, {{params.ngram_max}}),
    sublinear_tf={{params.sublinear_tf}},
    min_df={{params.min_df}}
)
{{outputs.matrix}} = {{outputs.vectorizer}}.fit_transform({{inputs.documents}})
{{outputs.feature_names}} = list({{outputs.vectorizer}}.get_feature_names_out())`,
      outputBindings: { matrix: "tfidf_matrix", feature_names: "tfidf_features", vectorizer: "tfidf_vectorizer" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. BM25 Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.bm25-score",
    name: "BM25 Score",
    category: "text-nlp",
    description: "Rank documents against a query using the BM25 Okapi scoring algorithm",
    tags: ["bm25", "ranking", "retrieval", "search", "okapi", "rank_bm25"],
    inputs: [
      { id: "documents", name: "Documents", type: "text_list", required: true, description: "Corpus of text documents" },
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "scores", name: "Scores", type: "list", required: true, description: "BM25 scores per document" },
      { id: "ranked_indices", name: "Ranked Indices", type: "list", required: true, description: "Document indices sorted by score descending" },
    ],
    parameters: [
      { id: "k1", name: "k1", type: "number", default: 1.5, min: 0.0, max: 3.0, step: 0.1, description: "Term frequency saturation parameter" },
      { id: "b", name: "b", type: "number", default: 0.75, min: 0.0, max: 1.0, step: 0.05, description: "Document length normalization parameter" },
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000, description: "Number of top results to return" },
    ],
    codeTemplate: {
      imports: ["from rank_bm25 import BM25Okapi", "import numpy as np"],
      body: `_tokenized_corpus = [doc.lower().split() for doc in {{inputs.documents}}]
_bm25 = BM25Okapi(_tokenized_corpus, k1={{params.k1}}, b={{params.b}})
_query_tokens = {{inputs.query}}.lower().split()
{{outputs.scores}} = _bm25.get_scores(_query_tokens).tolist()
{{outputs.ranked_indices}} = np.argsort({{outputs.scores}})[::-1][:{{params.top_k}}].tolist()`,
      outputBindings: { scores: "bm25_scores", ranked_indices: "bm25_ranked" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. Spell Check
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.spell-check",
    name: "Spell Check",
    category: "text-nlp",
    description: "Detect and correct misspelled words using pyspellchecker or TextBlob",
    tags: ["spell", "check", "correct", "typo", "spellchecker", "textblob"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "corrected", name: "Corrected Text", type: "text", required: true },
      { id: "corrections", name: "Corrections", type: "list", required: true, description: "List of {original, corrected} dicts" },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "pyspellchecker", options: [{ label: "pyspellchecker", value: "pyspellchecker" }, { label: "TextBlob", value: "textblob" }] },
      { id: "language", name: "Language", type: "string", default: "en", description: "Language for spell checking" },
    ],
    codeTemplate: {
      imports: ["from spellchecker import SpellChecker"],
      body: `if "{{params.method}}" == "pyspellchecker":
    _spell = SpellChecker(language="{{params.language}}")
    _words = {{inputs.text}}.split()
    _misspelled = _spell.unknown(_words)
    {{outputs.corrections}} = []
    _corrected_words = []
    for w in _words:
        if w.lower() in _misspelled:
            _fix = _spell.correction(w.lower()) or w
            {{outputs.corrections}}.append({"original": w, "corrected": _fix})
            _corrected_words.append(_fix)
        else:
            _corrected_words.append(w)
    {{outputs.corrected}} = " ".join(_corrected_words)
else:
    from textblob import TextBlob
    _blob = TextBlob({{inputs.text}})
    _fixed = _blob.correct()
    {{outputs.corrected}} = str(_fixed)
    {{outputs.corrections}} = [{"original": a, "corrected": b} for a, b in zip({{inputs.text}}.split(), str(_fixed).split()) if a != b]`,
      outputBindings: { corrected: "corrected_text", corrections: "spell_corrections" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 23. Disfluency Remove
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.disfluency-remove",
    name: "Disfluency Remove",
    category: "text-nlp",
    description: "Remove speech disfluencies (um, uh, like, you know) and filler words from text",
    tags: ["disfluency", "filler", "um", "uh", "clean", "speech", "transcript"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "cleaned", name: "Cleaned Text", type: "text", required: true },
      { id: "removed_count", name: "Removed Count", type: "number", required: true },
    ],
    parameters: [
      { id: "fillers", name: "Filler Words", type: "string", default: "um, uh, uhm, er, ah, like, you know, I mean, sort of, kind of, basically, actually, literally", description: "Comma-separated filler words and phrases to remove" },
      { id: "case_sensitive", name: "Case Sensitive", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["import re"],
      body: `_fillers = [f.strip() for f in "{{params.fillers}}".split(",") if f.strip()]
_fillers.sort(key=len, reverse=True)
_text = {{inputs.text}}
_count = 0
_flags = 0 if {{params.case_sensitive}} else re.IGNORECASE
for _filler in _fillers:
    _pattern = r"\\b" + re.escape(_filler) + r"\\b[,]?\\s*"
    _matches = len(re.findall(_pattern, _text, flags=_flags))
    _count += _matches
    _text = re.sub(_pattern, "", _text, flags=_flags)
{{outputs.cleaned}} = re.sub(r"\\s+", " ", _text).strip()
{{outputs.removed_count}} = _count`,
      outputBindings: { cleaned: "cleaned_text", removed_count: "disfluency_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 24. Word Count
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.word-count",
    name: "Word Count",
    category: "text-nlp",
    description: "Count words, characters, sentences, and paragraphs in text",
    tags: ["word", "count", "characters", "sentences", "paragraphs", "statistics"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "word_count", name: "Word Count", type: "number", required: true },
      { id: "char_count", name: "Character Count", type: "number", required: true },
      { id: "sentence_count", name: "Sentence Count", type: "number", required: true },
      { id: "paragraph_count", name: "Paragraph Count", type: "number", required: true },
    ],
    parameters: [
      { id: "count_whitespace", name: "Count Whitespace Chars", type: "boolean", default: false, description: "Include whitespace in character count" },
    ],
    codeTemplate: {
      imports: ["import nltk"],
      setup: "nltk.download('punkt_tab', quiet=True)",
      body: `from nltk.tokenize import sent_tokenize
_text = {{inputs.text}}
{{outputs.word_count}} = len(_text.split())
{{outputs.char_count}} = len(_text) if {{params.count_whitespace}} else len(_text.replace(" ", "").replace("\\n", "").replace("\\t", ""))
{{outputs.sentence_count}} = len(sent_tokenize(_text))
{{outputs.paragraph_count}} = len([p for p in _text.split("\\n\\n") if p.strip()])`,
      outputBindings: { word_count: "word_count", char_count: "char_count", sentence_count: "sentence_count", paragraph_count: "paragraph_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 25. Readability Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "text-nlp.readability-score",
    name: "Readability Score",
    category: "text-nlp",
    description: "Compute readability metrics (Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, etc.) using textstat",
    tags: ["readability", "flesch", "kincaid", "gunning", "fog", "textstat", "grade"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "flesch_ease", name: "Flesch Reading Ease", type: "number", required: true },
      { id: "flesch_grade", name: "Flesch-Kincaid Grade", type: "number", required: true },
      { id: "gunning_fog", name: "Gunning Fog Index", type: "number", required: true },
      { id: "all_scores", name: "All Scores", type: "dict", required: true },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["import textstat"],
      body: `_text = {{inputs.text}}
{{outputs.flesch_ease}} = textstat.flesch_reading_ease(_text)
{{outputs.flesch_grade}} = textstat.flesch_kincaid_grade(_text)
{{outputs.gunning_fog}} = textstat.gunning_fog(_text)
{{outputs.all_scores}} = {
    "flesch_reading_ease": {{outputs.flesch_ease}},
    "flesch_kincaid_grade": {{outputs.flesch_grade}},
    "gunning_fog": {{outputs.gunning_fog}},
    "smog_index": textstat.smog_index(_text),
    "coleman_liau_index": textstat.coleman_liau_index(_text),
    "automated_readability_index": textstat.automated_readability_index(_text),
    "dale_chall_readability_score": textstat.dale_chall_readability_score(_text),
    "text_standard": textstat.text_standard(_text, float_output=False)
}`,
      outputBindings: { flesch_ease: "flesch_ease", flesch_grade: "flesch_grade", gunning_fog: "gunning_fog", all_scores: "readability_scores" },
    },
  },
];
