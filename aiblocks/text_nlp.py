"""
aiblocks.text_nlp — Text & NLP

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def tokenize(text=None, method='nltk_word', hf_model='bert-base-uncased', lowercase=False):
    """Split text into tokens using a configurable tokenizer (whitespace, word-level, or subword BPE)
    
    Dependencies: pip install nltk
    
    Args:
        text (text) (required): Input text to tokenize
    
    Parameters:
        method (select, default='nltk_word'): Tokenization method to use
        hf_model (string, default='bert-base-uncased'): HuggingFace model name for subword tokenization
        lowercase (boolean, default=False): 
    
    Returns:
        dict with keys:
            tokens (list): 
            count (number): 
    """
    _imports = ['import nltk', 'from nltk.tokenize import word_tokenize, wordpunct_tokenize']
    _code = '_text = {{inputs.text}}\nif {{params.lowercase}}:\n    _text = _text.lower()\n_method = "{{params.method}}"\nif _method == "nltk_word":\n    {{outputs.tokens}} = word_tokenize(_text)\nelif _method == "nltk_wordpunct":\n    {{outputs.tokens}} = wordpunct_tokenize(_text)\nelif _method == "spacy":\n    import spacy\n    _nlp = spacy.load("en_core_web_sm")\n    {{outputs.tokens}} = [tok.text for tok in _nlp(_text)]\nelif _method == "whitespace":\n    {{outputs.tokens}} = _text.split()\nelif _method == "hf":\n    from transformers import AutoTokenizer\n    _tok = AutoTokenizer.from_pretrained("{{params.hf_model}}")\n    {{outputs.tokens}} = _tok.tokenize(_text)\n{{outputs.count}} = len({{outputs.tokens}})'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.hf_model}}", str(hf_model))
    _code = _code.replace("{{params.lowercase}}", str(lowercase))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.tokens}}", "_out_tokens")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"tokens": _ns.get("_out_tokens"), "count": _ns.get("_out_count")}


def detokenize(tokens=None, method='treebank'):
    """Join a list of tokens back into a coherent text string
    
    Dependencies: pip install nltk
    
    Args:
        tokens (list) (required): List of tokens to join
    
    Parameters:
        method (select, default='treebank'): 
    
    Returns:
        text: 
    """
    _imports = ['from nltk.tokenize.treebank import TreebankWordDetokenizer']
    _code = 'if "{{params.method}}" == "treebank":\n    {{outputs.text}} = TreebankWordDetokenizer().detokenize({{inputs.tokens}})\n "else":\n    {{outputs.text}} = " ".join({{inputs.tokens}})'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{inputs.tokens}}", "tokens")
    _code = _code.replace("{{outputs.text}}", "_out_text")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tokens"] = tokens
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_text")


def chunk_text(text=None, chunk_size=512, chunk_overlap=64, separator='\\n\\n'):
    """Split text into fixed-size overlapping chunks for downstream processing or embedding
    
    Dependencies: pip install langchain
    
    Args:
        text (text) (required): 
    
    Parameters:
        chunk_size (number, default=512): Maximum characters per chunk
        chunk_overlap (number, default=64): Number of overlapping characters between consecutive chunks
        separator (string, default='\\n\\n'): Preferred split boundary (e.g. paragraph break)
    
    Returns:
        dict with keys:
            chunks (text_list): 
            count (number): 
    """
    _imports = ['from langchain.text_splitter import RecursiveCharacterTextSplitter']
    _code = '_splitter = RecursiveCharacterTextSplitter(\n    chunk_size={{params.chunk_size}},\n    chunk_overlap={{params.chunk_overlap}},\n    separators=["{{params.separator}}", "\\\\n", " ", ""]\n)\n{{outputs.chunks}} = _splitter.split_text({{inputs.text}})\n{{outputs.count}} = len({{outputs.chunks}})'
    
    _code = _code.replace("{{params.chunk_size}}", str(chunk_size))
    _code = _code.replace("{{params.chunk_overlap}}", str(chunk_overlap))
    _code = _code.replace("{{params.separator}}", str(separator))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.chunks}}", "_out_chunks")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"chunks": _ns.get("_out_chunks"), "count": _ns.get("_out_count")}


def sentence_split(text=None, method='nltk', language='english'):
    """Split text into individual sentences using NLTK Punkt or spaCy sentence segmentation
    
    Dependencies: pip install nltk
    
    Args:
        text (text) (required): 
    
    Parameters:
        method (select, default='nltk'): 
        language (string, default='english'): Language for sentence tokenizer
    
    Returns:
        dict with keys:
            sentences (text_list): 
            count (number): 
    """
    _imports = ['import nltk']
    _code = 'if "{{params.method}}" == "nltk":\n    from nltk.tokenize import sent_tokenize\n    {{outputs.sentences}} = sent_tokenize({{inputs.text}}, language="{{params.language}}")\n "else":\n    import spacy\n    _nlp = spacy.load("en_core_web_sm")\n    _doc = _nlp({{inputs.text}})\n    {{outputs.sentences}} = [sent.text.strip() for sent in _doc.sents]\n{{outputs.count}} = len({{outputs.sentences}})'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.language}}", str(language))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.sentences}}", "_out_sentences")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"sentences": _ns.get("_out_sentences"), "count": _ns.get("_out_count")}


def regex_extract(text=None, pattern='', flags=[], group=0):
    """Extract all matches of a regular expression pattern from text
    
    Args:
        text (text) (required): 
    
    Parameters:
        pattern (string, default=''): Python regular expression pattern
        flags (multiselect, default=[]): 
        group (number, default=0): Which capture group to return (0 = full match)
    
    Returns:
        dict with keys:
            matches (list): 
            count (number): 
    """
    _imports = ['import re']
    _code = '_flags = 0\nfor _f in {{params.flags}}:\n    _flags |= eval(_f)\n_compiled = re.compile(r"{{params.pattern}}", _flags)\nif {{params.group}} == 0:\n    {{outputs.matches}} = _compiled.findall({{inputs.text}})\n "else":\n    {{outputs.matches}} = [m.group({{params.group}}) for m in _compiled.finditer({{inputs.text}})]\n{{outputs.count}} = len({{outputs.matches}})'
    
    _code = _code.replace("{{params.pattern}}", str(pattern))
    _code = _code.replace("{{params.flags}}", str(flags))
    _code = _code.replace("{{params.group}}", str(group))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.matches}}", "_out_matches")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"matches": _ns.get("_out_matches"), "count": _ns.get("_out_count")}


def named_entity_recognition(text=None, method='spacy', spacy_model='en_core_web_sm', hf_model='dslim/bert-base-NER', entity_types=''):
    """Identify named entities (persons, organizations, locations, etc.) in text using spaCy or transformers
    
    Dependencies: pip install spacy
    
    Args:
        text (text) (required): 
    
    Parameters:
        method (select, default='spacy'): 
        spacy_model (string, default='en_core_web_sm'): spaCy model to load
        hf_model (string, default='dslim/bert-base-NER'): HuggingFace NER model
        entity_types (string, default=''): Comma-separated entity types to keep (empty = all)
    
    Returns:
        dict with keys:
            entities (list): List of {text, label, start, end} dicts
            count (number): 
    """
    _imports = ['import spacy']
    _code = '_method = "{{params.method}}"\nif _method == "spacy":\n    _nlp = spacy.load("{{params.spacy_model}}")\n    _doc = _nlp({{inputs.text}})\n    {{outputs.entities}} = [{"text": ent.text, "label": ent.label_, "start": ent.start_char, "end": ent.end_char} for ent in _doc.ents]\n "else":\n    from transformers import pipeline\n    _ner = pipeline("ner", model="{{params.hf_model}}", aggregation_strategy="simple")\n    _results = _ner({{inputs.text}})\n    {{outputs.entities}} = [{"text": r["word"], "label": r["entity_group"], "start": r["start"], "end": r["end"], "score": round(r["score"], 4)} for r in _results]\n_filter_types = [t.strip().upper() for t in "{{params.entity_types}}".split(",") if t.strip()]\nif _filter_types:\n    {{outputs.entities}} = [e for e in {{outputs.entities}} if e["label"] in _filter_types]\n{{outputs.count}} = len({{outputs.entities}})'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.spacy_model}}", str(spacy_model))
    _code = _code.replace("{{params.hf_model}}", str(hf_model))
    _code = _code.replace("{{params.entity_types}}", str(entity_types))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.entities}}", "_out_entities")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"entities": _ns.get("_out_entities"), "count": _ns.get("_out_count")}


def pos_tagging(text=None, method='spacy', spacy_model='en_core_web_sm'):
    """Assign part-of-speech tags to each token in the input text using spaCy or NLTK
    
    Dependencies: pip install spacy
    
    Args:
        text (text) (required): 
    
    Parameters:
        method (select, default='spacy'): 
        spacy_model (string, default='en_core_web_sm'): 
    
    Returns:
        list: List of {token, pos, tag} dicts
    """
    _imports = ['import spacy']
    _code = 'if "{{params.method}}" == "spacy":\n    _nlp = spacy.load("{{params.spacy_model}}")\n    _doc = _nlp({{inputs.text}})\n    {{outputs.tagged}} = [{"token": tok.text, "pos": tok.pos_, "tag": tok.tag_} for tok in _doc]\n "else":\n    import nltk\n    nltk.download(\'averaged_perceptron_tagger_eng\', quiet=True)\n    nltk.download(\'punkt_tab\', quiet=True)\n    from nltk.tokenize import word_tokenize\n    _tokens = word_tokenize({{inputs.text}})\n    _tagged = nltk.pos_tag(_tokens)\n    {{outputs.tagged}} = [{"token": tok, "pos": tag, "tag": tag} for tok, tag in _tagged]'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.spacy_model}}", str(spacy_model))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.tagged}}", "_out_tagged")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_tagged")


def dependency_parse(text=None, spacy_model='en_core_web_sm'):
    """Parse syntactic dependency structure of text, returning head-child relations for each token
    
    Dependencies: pip install spacy
    
    Args:
        text (text) (required): 
    
    Parameters:
        spacy_model (string, default='en_core_web_sm'): 
    
    Returns:
        list: List of {token, dep, head, head_pos} dicts
    """
    _imports = ['import spacy']
    _code = '_nlp = spacy.load("{{params.spacy_model}}")\n_doc = _nlp({{inputs.text}})\n{{outputs.deps}} = [{"token": tok.text, "dep": tok.dep_, "head": tok.head.text, "head_pos": tok.head.pos_} for tok in _doc]'
    
    _code = _code.replace("{{params.spacy_model}}", str(spacy_model))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.deps}}", "_out_deps")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_deps")


def coreference_resolution(text=None, spacy_model='en_core_web_sm'):
    """Resolve pronoun and noun phrase coreferences in text using spaCy with coreferee or neuralcoref
    
    Dependencies: pip install coreferee spacy
    
    Args:
        text (text) (required): 
    
    Parameters:
        spacy_model (string, default='en_core_web_sm'): 
    
    Returns:
        dict with keys:
            resolved_text (text): Text with pronouns replaced by their referents
            clusters (list): 
    """
    _imports = ['import spacy', 'import coreferee']
    _code = '_nlp = spacy.load("{{params.spacy_model}}")\n_nlp.add_pipe("coreferee")\n_doc = _nlp({{inputs.text}})\n{{outputs.clusters}} = []\nfor chain in _doc._.coref_chains:\n    _mentions = [_doc[mention[0]:mention[-1]+1].text for mention in chain]\n    {{outputs.clusters}}.append(_mentions)\n{{outputs.resolved_text}} = {{inputs.text}}\nfor chain in _doc._.coref_chains:\n    _main = chain.most_specific_mention_index\n    _main_span = chain[_main]\n    _main_text = _doc[_main_span[0]:_main_span[-1]+1].text\n    for i, mention in enumerate(chain):\n        if i != _main:\n            _mention_text = _doc[mention[0]:mention[-1]+1].text\n            {{outputs.resolved_text}} = {{outputs.resolved_text}}.replace(_mention_text, _main_text, 1)'
    
    _code = _code.replace("{{params.spacy_model}}", str(spacy_model))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.resolved_text}}", "_out_resolved_text")
    _code = _code.replace("{{outputs.clusters}}", "_out_clusters")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"resolved_text": _ns.get("_out_resolved_text"), "clusters": _ns.get("_out_clusters")}


def text_clean(text=None, strip_html=True, strip_urls=True, strip_emails=False, strip_punctuation=False, strip_numbers=False, normalize_whitespace=True):
    """Clean text by removing HTML tags, URLs, emails, special characters, and extra whitespace
    
    Args:
        text (text) (required): 
    
    Parameters:
        strip_html (boolean, default=True): 
        strip_urls (boolean, default=True): 
        strip_emails (boolean, default=False): 
        strip_punctuation (boolean, default=False): 
        strip_numbers (boolean, default=False): 
        normalize_whitespace (boolean, default=True): 
    
    Returns:
        text: 
    """
    _imports = ['import re']
    _code = '_t = {{inputs.text}}\nif {{params.strip_html}}:\n    _t = re.sub(r"<[^>]+>", "", _t)\nif {{params.strip_urls}}:\n    _t = re.sub(r"https?://\\\\S+|www\\\\.\\\\S+", "", _t)\nif {{params.strip_emails}}:\n    _t = re.sub(r"\\\\S+@\\\\S+\\\\.\\\\S+", "", _t)\nif {{params.strip_punctuation}}:\n    _t = re.sub(r"[^\\\\w\\\\s]", "", _t)\nif {{params.strip_numbers}}:\n    _t = re.sub(r"\\\\b\\\\d+\\\\b", "", _t)\nif {{params.normalize_whitespace}}:\n    _t = re.sub(r"\\\\s+", " ", _t).strip()\n{{outputs.cleaned}} = _t'
    
    _code = _code.replace("{{params.strip_html}}", str(strip_html))
    _code = _code.replace("{{params.strip_urls}}", str(strip_urls))
    _code = _code.replace("{{params.strip_emails}}", str(strip_emails))
    _code = _code.replace("{{params.strip_punctuation}}", str(strip_punctuation))
    _code = _code.replace("{{params.strip_numbers}}", str(strip_numbers))
    _code = _code.replace("{{params.normalize_whitespace}}", str(normalize_whitespace))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.cleaned}}", "_out_cleaned")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_cleaned")


def lowercase(text=None, unicode_normalize='none'):
    """Convert text to lowercase with optional Unicode normalization (NFKC/NFC)
    
    Dependencies: pip install unicodedata
    
    Args:
        text (text) (required): 
    
    Parameters:
        unicode_normalize (select, default='none'): Apply Unicode normalization before lowering
    
    Returns:
        text: 
    """
    _imports = ['import unicodedata']
    _code = '_t = {{inputs.text}}\nif "{{params.unicode_normalize}}" != "none":\n    _t = unicodedata.normalize("{{params.unicode_normalize}}", _t)\n{{outputs.lowered}} = _t.lower()'
    
    _code = _code.replace("{{params.unicode_normalize}}", str(unicode_normalize))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.lowered}}", "_out_lowered")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_lowered")


def remove_stopwords(tokens=None, language='english', extra_words=''):
    """Remove common stopwords from a list of tokens using NLTK or spaCy stop word lists
    
    Dependencies: pip install nltk
    
    Args:
        tokens (list) (required): 
    
    Parameters:
        language (string, default='english'): 
        extra_words (string, default=''): Additional comma-separated words to remove
    
    Returns:
        list: 
    """
    _imports = ['import nltk', 'from nltk.corpus import stopwords']
    _code = '_stop = set(stopwords.words("{{params.language}}"))\n_extra = {w.strip().lower() for w in "{{params.extra_words}}".split(",") if w.strip()}\n_stop.update(_extra)\n{{outputs.filtered}} = [t for t in {{inputs.tokens}} if t.lower() not in _stop]'
    
    _code = _code.replace("{{params.language}}", str(language))
    _code = _code.replace("{{params.extra_words}}", str(extra_words))
    _code = _code.replace("{{inputs.tokens}}", "tokens")
    _code = _code.replace("{{outputs.filtered}}", "_out_filtered")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tokens"] = tokens
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_filtered")


def stem(tokens=None, stemmer='snowball', language='english'):
    """Reduce words to their stem form using Porter, Snowball, or Lancaster stemmer
    
    Dependencies: pip install nltk
    
    Args:
        tokens (list) (required): 
    
    Parameters:
        stemmer (select, default='snowball'): 
        language (string, default='english'): Language for Snowball stemmer
    
    Returns:
        list: 
    """
    _imports = ['from nltk.stem import PorterStemmer, SnowballStemmer, LancasterStemmer']
    _code = '_name = "{{params.stemmer}}"\nif _name == "porter":\n    _stemmer = PorterStemmer()\nelif _name == "snowball":\n    _stemmer = SnowballStemmer("{{params.language}}")\n "else":\n    _stemmer = LancasterStemmer()\n{{outputs.stemmed}} = [_stemmer.stem(t) for t in {{inputs.tokens}}]'
    
    _code = _code.replace("{{params.stemmer}}", str(stemmer))
    _code = _code.replace("{{params.language}}", str(language))
    _code = _code.replace("{{inputs.tokens}}", "tokens")
    _code = _code.replace("{{outputs.stemmed}}", "_out_stemmed")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tokens"] = tokens
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_stemmed")


def lemmatize(tokens=None, method='spacy', spacy_model='en_core_web_sm'):
    """Reduce words to their dictionary (lemma) form using spaCy or NLTK WordNet
    
    Dependencies: pip install spacy
    
    Args:
        tokens (list) (required): 
    
    Parameters:
        method (select, default='spacy'): 
        spacy_model (string, default='en_core_web_sm'): 
    
    Returns:
        list: 
    """
    _imports = ['import spacy']
    _code = 'if "{{params.method}}" == "spacy":\n    _nlp = spacy.load("{{params.spacy_model}}")\n    _doc = _nlp(" ".join({{inputs.tokens}}))\n    {{outputs.lemmatized}} = [tok.lemma_ for tok in _doc]\n "else":\n    import nltk\n    nltk.download(\'wordnet\', quiet=True)\n    from nltk.stem import WordNetLemmatizer\n    _lem = WordNetLemmatizer()\n    {{outputs.lemmatized}} = [_lem.lemmatize(t) for t in {{inputs.tokens}}]'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.spacy_model}}", str(spacy_model))
    _code = _code.replace("{{inputs.tokens}}", "tokens")
    _code = _code.replace("{{outputs.lemmatized}}", "_out_lemmatized")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["tokens"] = tokens
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_lemmatized")


def language_detect(text=None, seed=42):
    """Detect the language of input text and return ISO 639-1 code with confidence score
    
    Dependencies: pip install langdetect
    
    Args:
        text (text) (required): 
    
    Parameters:
        seed (number, default=42): Seed for reproducible detection
    
    Returns:
        dict with keys:
            language (text): ISO 639-1 language code (e.g. 'en', 'fr')
            probabilities (list): List of {lang, prob} dicts
    """
    _imports = ['from langdetect import detect, detect_langs', 'from langdetect import DetectorFactory']
    _code = 'DetectorFactory.seed = {{params.seed}}\n{{outputs.language}} = detect({{inputs.text}})\n_probs = detect_langs({{inputs.text}})\n{{outputs.probabilities}} = [{"lang": str(p).split(":")[0], "prob": round(float(str(p).split(":")[1]), 4)} for p in _probs]'
    
    _code = _code.replace("{{params.seed}}", str(seed))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.language}}", "_out_language")
    _code = _code.replace("{{outputs.probabilities}}", "_out_probabilities")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"language": _ns.get("_out_language"), "probabilities": _ns.get("_out_probabilities")}


def translate(text=None, src_lang='en', tgt_lang='fr', model_type='marian', max_length=512):
    """Translate text between languages using Helsinki-NLP MarianMT or M2M-100 models
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        src_lang (string, default='en'): ISO 639-1 source language code
        tgt_lang (string, default='fr'): ISO 639-1 target language code
        model_type (select, default='marian'): 
        max_length (number, default=512): 
    
    Returns:
        text: 
    """
    _imports = ['from transformers import pipeline']
    _code = 'if "{{params.model_type}}" == "marian":\n    _model_name = f"Helsinki-NLP/opus-mt-{{params.src_lang}}-{{params.tgt_lang}}"\n    _translator = pipeline("translation", model=_model_name, max_length={{params.max_length}})\n    _result = _translator({{inputs.text}})\n    {{outputs.translated}} = _result[0]["translation_text"]\n "else":\n    from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer\n    _model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")\n    _tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")\n    _tokenizer.src_lang = "{{params.src_lang}}"\n    _encoded = _tokenizer({{inputs.text}}, return_tensors="pt", max_length={{params.max_length}}, truncation=True)\n    _generated = _model.generate(**_encoded, forced_bos_token_id=_tokenizer.get_lang_id("{{params.tgt_lang}}"))\n    {{outputs.translated}} = _tokenizer.batch_decode(_generated, skip_special_tokens=True)[0]'
    
    _code = _code.replace("{{params.src_lang}}", str(src_lang))
    _code = _code.replace("{{params.tgt_lang}}", str(tgt_lang))
    _code = _code.replace("{{params.model_type}}", str(model_type))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.translated}}", "_out_translated")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_translated")


def summarize_text(text=None, model='facebook/bart-large-cnn', max_length=150, min_length=30, do_sample=False):
    """Generate an abstractive or extractive summary of input text using transformers
    
    Dependencies: pip install transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        model (string, default='facebook/bart-large-cnn'): HuggingFace summarization model
        max_length (number, default=150): Maximum summary length in tokens
        min_length (number, default=30): Minimum summary length in tokens
        do_sample (boolean, default=False): Use sampling instead of greedy decoding
    
    Returns:
        text: 
    """
    _imports = ['from transformers import pipeline']
    _code = '_summarizer = pipeline("summarization", model="{{params.model}}")\n_result = _summarizer(\n    {{inputs.text}},\n    max_length={{params.max_length}},\n    min_length={{params.min_length}},\n    do_sample={{params.do_sample}}\n)\n{{outputs.summary}} = _result[0]["summary_text"]'
    
    _code = _code.replace("{{params.model}}", str(model))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.min_length}}", str(min_length))
    _code = _code.replace("{{params.do_sample}}", str(do_sample))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.summary}}", "_out_summary")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_summary")


def extract_keywords(text=None, method='yake', top_k=10, max_ngram=3):
    """Extract important keywords and keyphrases from text using TF-IDF, RAKE, or YAKE
    
    Dependencies: pip install yake
    
    Args:
        text (text) (required): 
    
    Parameters:
        method (select, default='yake'): 
        top_k (number, default=10): Number of keywords to return
        max_ngram (number, default=3): Maximum n-gram size for keyphrases
    
    Returns:
        list: List of {keyword, score} dicts
    """
    _imports = ['import yake']
    _code = '_method = "{{params.method}}"\nif _method == "yake":\n    _kw_extractor = yake.KeywordExtractor(n={{params.max_ngram}}, top={{params.top_k}})\n    _kws = _kw_extractor.extract_keywords({{inputs.text}})\n    {{outputs.keywords}} = [{"keyword": kw, "score": round(score, 4)} for kw, score in _kws]\nelif _method == "rake":\n    from rake_nltk import Rake\n    _r = Rake(max_length={{params.max_ngram}})\n    _r.extract_keywords_from_text({{inputs.text}})\n    _ranked = _r.get_ranked_phrases_with_scores()[:{{params.top_k}}]\n    {{outputs.keywords}} = [{"keyword": phrase, "score": round(score, 4)} for score, phrase in _ranked]\n "else":\n    from sklearn.feature_extraction.text import TfidfVectorizer\n    _vec = TfidfVectorizer(ngram_range=(1, {{params.max_ngram}}), max_features={{params.top_k}})\n    _X = _vec.fit_transform([{{inputs.text}}])\n    _names = _vec.get_feature_names_out()\n    _scores = _X.toarray()[0]\n    _pairs = sorted(zip(_names, _scores), key=lambda x: -x[1])[:{{params.top_k}}]\n    {{outputs.keywords}} = [{"keyword": kw, "score": round(float(s), 4)} for kw, s in _pairs]'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{params.max_ngram}}", str(max_ngram))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.keywords}}", "_out_keywords")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_keywords")


def sentiment_score(text=None, method='vader', hf_model='cardiffnlp/twitter-roberta-base-sentiment-latest'):
    """Compute sentiment polarity and label (positive / negative / neutral) using VADER or transformers
    
    Dependencies: pip install nltk
    
    Args:
        text (text) (required): 
    
    Parameters:
        method (select, default='vader'): 
        hf_model (string, default='cardiffnlp/twitter-roberta-base-sentiment-latest'): 
    
    Returns:
        dict with keys:
            label (text): Sentiment label (POSITIVE, NEGATIVE, NEUTRAL)
            score (number): Confidence score 0-1
            details (dict): 
    """
    _imports = ['import nltk']
    _code = 'if "{{params.method}}" == "vader":\n    from nltk.sentiment.vader import SentimentIntensityAnalyzer\n    _sia = SentimentIntensityAnalyzer()\n    _scores = _sia.polarity_scores({{inputs.text}})\n    {{outputs.details}} = _scores\n    _compound = _scores["compound"]\n    if _compound >= 0.05:\n        {{outputs.label}} = "POSITIVE"\n    elif _compound <= -0.05:\n        {{outputs.label}} = "NEGATIVE"\n "else":\n        {{outputs.label}} = "NEUTRAL"\n    {{outputs.score}} = round(abs(_compound), 4)\n "else":\n    from transformers import pipeline\n    _clf = pipeline("sentiment-analysis", model="{{params.hf_model}}")\n    _result = _clf({{inputs.text}})[0]\n    {{outputs.label}} = _result["label"]\n    {{outputs.score}} = round(_result["score"], 4)\n    {{outputs.details}} = _result'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.hf_model}}", str(hf_model))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.label}}", "_out_label")
    _code = _code.replace("{{outputs.score}}", "_out_score")
    _code = _code.replace("{{outputs.details}}", "_out_details")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"label": _ns.get("_out_label"), "score": _ns.get("_out_score"), "details": _ns.get("_out_details")}


def tfidf_vectorize(documents=None, max_features=10000, ngram_min=1, ngram_max=1, sublinear_tf=True, min_df=1):
    """Convert a corpus of documents into TF-IDF sparse vectors using scikit-learn
    
    Dependencies: pip install scikit-learn
    
    Args:
        documents (text_list) (required): List of text documents
    
    Parameters:
        max_features (number, default=10000): Maximum vocabulary size
        ngram_min (number, default=1): 
        ngram_max (number, default=1): 
        sublinear_tf (boolean, default=True): Apply sublinear TF scaling (1 + log(tf))
        min_df (number, default=1): Minimum document frequency for a term
    
    Returns:
        dict with keys:
            matrix (tensor): Sparse TF-IDF matrix (n_docs x n_features)
            feature_names (list): 
            vectorizer (model): 
    """
    _imports = ['from sklearn.feature_extraction.text import TfidfVectorizer']
    _code = '{{outputs.vectorizer}} = TfidfVectorizer(\n    max_features={{params.max_features}},\n    ngram_range=({{params.ngram_min}}, {{params.ngram_max}}),\n    sublinear_tf={{params.sublinear_tf}},\n    min_df={{params.min_df}}\n)\n{{outputs.matrix}} = {{outputs.vectorizer}}.fit_transform({{inputs.documents}})\n{{outputs.feature_names}} = list({{outputs.vectorizer}}.get_feature_names_out())'
    
    _code = _code.replace("{{params.max_features}}", str(max_features))
    _code = _code.replace("{{params.ngram_min}}", str(ngram_min))
    _code = _code.replace("{{params.ngram_max}}", str(ngram_max))
    _code = _code.replace("{{params.sublinear_tf}}", str(sublinear_tf))
    _code = _code.replace("{{params.min_df}}", str(min_df))
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{outputs.matrix}}", "_out_matrix")
    _code = _code.replace("{{outputs.feature_names}}", "_out_feature_names")
    _code = _code.replace("{{outputs.vectorizer}}", "_out_vectorizer")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["documents"] = documents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"matrix": _ns.get("_out_matrix"), "feature_names": _ns.get("_out_feature_names"), "vectorizer": _ns.get("_out_vectorizer")}


def bm25_score(documents=None, query=None, k1=1.5, b=0.75, top_k=10):
    """Rank documents against a query using the BM25 Okapi scoring algorithm
    
    Dependencies: pip install numpy rank_bm25
    
    Args:
        documents (text_list) (required): Corpus of text documents
        query (text) (required): 
    
    Parameters:
        k1 (number, default=1.5): Term frequency saturation parameter
        b (number, default=0.75): Document length normalization parameter
        top_k (number, default=10): Number of top results to return
    
    Returns:
        dict with keys:
            scores (list): BM25 scores per document
            ranked_indices (list): Document indices sorted by score descending
    """
    _imports = ['from rank_bm25 import BM25Okapi', 'import numpy as np']
    _code = '_tokenized_corpus = [doc.lower().split() for doc in {{inputs.documents}}]\n_bm25 = BM25Okapi(_tokenized_corpus, k1={{params.k1}}, b={{params.b}})\n_query_tokens = {{inputs.query}}.lower().split()\n{{outputs.scores}} = _bm25.get_scores(_query_tokens).tolist()\n{{outputs.ranked_indices}} = np.argsort({{outputs.scores}})[::-1][:{{params.top_k}}].tolist()'
    
    _code = _code.replace("{{params.k1}}", str(k1))
    _code = _code.replace("{{params.b}}", str(b))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    _code = _code.replace("{{outputs.ranked_indices}}", "_out_ranked_indices")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["documents"] = documents
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"scores": _ns.get("_out_scores"), "ranked_indices": _ns.get("_out_ranked_indices")}


def spell_check(text=None, method='pyspellchecker', language='en'):
    """Detect and correct misspelled words using pyspellchecker or TextBlob
    
    Dependencies: pip install spellchecker
    
    Args:
        text (text) (required): 
    
    Parameters:
        method (select, default='pyspellchecker'): 
        language (string, default='en'): Language for spell checking
    
    Returns:
        dict with keys:
            corrected (text): 
            corrections (list): List of {original, corrected} dicts
    """
    _imports = ['from spellchecker import SpellChecker']
    _code = 'if "{{params.method}}" == "pyspellchecker":\n    _spell = SpellChecker(language="{{params.language}}")\n    _words = {{inputs.text}}.split()\n    _misspelled = _spell.unknown(_words)\n    {{outputs.corrections}} = []\n    _corrected_words = []\n    for w in _words:\n        if w.lower() in _misspelled:\n            _fix = _spell.correction(w.lower()) or w\n            {{outputs.corrections}}.append({"original": w, "corrected": _fix})\n            _corrected_words.append(_fix)\n "else":\n            _corrected_words.append(w)\n    {{outputs.corrected}} = " ".join(_corrected_words)\n "else":\n    from textblob import TextBlob\n    _blob = TextBlob({{inputs.text}})\n    _fixed = _blob.correct()\n    {{outputs.corrected}} = str(_fixed)\n    {{outputs.corrections}} = [{"original": a, "corrected": b} for a, b in zip({{inputs.text}}.split(), str(_fixed).split()) if a != b]'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.language}}", str(language))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.corrected}}", "_out_corrected")
    _code = _code.replace("{{outputs.corrections}}", "_out_corrections")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"corrected": _ns.get("_out_corrected"), "corrections": _ns.get("_out_corrections")}


def disfluency_remove(text=None, fillers='um, uh, uhm, er, ah, like, you know, I mean, sort of, kind of, basically, actually, literally', case_sensitive=False):
    """Remove speech disfluencies (um, uh, like, you know) and filler words from text
    
    Args:
        text (text) (required): 
    
    Parameters:
        fillers (string, default='um, uh, uhm, er, ah, like, you know, I mean, sort of, kind of, basically, actually, literally'): Comma-separated filler words and phrases to remove
        case_sensitive (boolean, default=False): 
    
    Returns:
        dict with keys:
            cleaned (text): 
            removed_count (number): 
    """
    _imports = ['import re']
    _code = '_fillers = [f.strip() for f in "{{params.fillers}}".split(",") if f.strip()]\n_fillers.sort(key=len, reverse=True)\n_text = {{inputs.text}}\n_count = 0\n_flags = 0 if {{params.case_sensitive}} else re.IGNORECASE\nfor _filler in _fillers:\n    _pattern = r"\\\\b" + re.escape(_filler) + r"\\\\b[]?\\\\s*"\n    _matches = len(re.findall(_pattern, _text, flags=_flags))\n    _count += _matches\n    _text = re.sub(_pattern, "", _text, flags=_flags)\n{{outputs.cleaned}} = re.sub(r"\\\\s+", " ", _text).strip()\n{{outputs.removed_count}} = _count'
    
    _code = _code.replace("{{params.fillers}}", str(fillers))
    _code = _code.replace("{{params.case_sensitive}}", str(case_sensitive))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.cleaned}}", "_out_cleaned")
    _code = _code.replace("{{outputs.removed_count}}", "_out_removed_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"cleaned": _ns.get("_out_cleaned"), "removed_count": _ns.get("_out_removed_count")}


def word_count(text=None, count_whitespace=False):
    """Count words, characters, sentences, and paragraphs in text
    
    Dependencies: pip install nltk
    
    Args:
        text (text) (required): 
    
    Parameters:
        count_whitespace (boolean, default=False): Include whitespace in character count
    
    Returns:
        dict with keys:
            word_count (number): 
            char_count (number): 
            sentence_count (number): 
            paragraph_count (number): 
    """
    _imports = ['import nltk']
    _code = 'from nltk.tokenize import sent_tokenize\n_text = {{inputs.text}}\n{{outputs.word_count}} = len(_text.split())\n{{outputs.char_count}} = len(_text) if {{params.count_whitespace}} else len(_text.replace(" ", "").replace("\\\\n", "").replace("\\\\t", ""))\n{{outputs.sentence_count}} = len(sent_tokenize(_text))\n{{outputs.paragraph_count}} = len([p for p in _text.split("\\\\n\\\\n") if p.strip()])'
    
    _code = _code.replace("{{params.count_whitespace}}", str(count_whitespace))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.word_count}}", "_out_word_count")
    _code = _code.replace("{{outputs.char_count}}", "_out_char_count")
    _code = _code.replace("{{outputs.sentence_count}}", "_out_sentence_count")
    _code = _code.replace("{{outputs.paragraph_count}}", "_out_paragraph_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"word_count": _ns.get("_out_word_count"), "char_count": _ns.get("_out_char_count"), "sentence_count": _ns.get("_out_sentence_count"), "paragraph_count": _ns.get("_out_paragraph_count")}


def readability_score(text=None):
    """Compute readability metrics (Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, etc.) using textstat
    
    Dependencies: pip install textstat
    
    Args:
        text (text) (required): 
    
    Returns:
        dict with keys:
            flesch_ease (number): 
            flesch_grade (number): 
            gunning_fog (number): 
            all_scores (dict): 
    """
    _imports = ['import textstat']
    _code = '_text = {{inputs.text}}\n{{outputs.flesch_ease}} = textstat.flesch_reading_ease(_text)\n{{outputs.flesch_grade}} = textstat.flesch_kincaid_grade(_text)\n{{outputs.gunning_fog}} = textstat.gunning_fog(_text)\n{{outputs.all_scores}} = {\n    "flesch_reading_ease": {{outputs.flesch_ease}},\n    "flesch_kincaid_grade": {{outputs.flesch_grade}},\n    "gunning_fog": {{outputs.gunning_fog}},\n    "smog_index": textstat.smog_index(_text),\n    "coleman_liau_index": textstat.coleman_liau_index(_text),\n    "automated_readability_index": textstat.automated_readability_index(_text),\n    "dale_chall_readability_score": textstat.dale_chall_readability_score(_text),\n    "text_standard": textstat.text_standard(_text, float_output=False)\n}'
    
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.flesch_ease}}", "_out_flesch_ease")
    _code = _code.replace("{{outputs.flesch_grade}}", "_out_flesch_grade")
    _code = _code.replace("{{outputs.gunning_fog}}", "_out_gunning_fog")
    _code = _code.replace("{{outputs.all_scores}}", "_out_all_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"flesch_ease": _ns.get("_out_flesch_ease"), "flesch_grade": _ns.get("_out_flesch_grade"), "gunning_fog": _ns.get("_out_gunning_fog"), "all_scores": _ns.get("_out_all_scores")}

