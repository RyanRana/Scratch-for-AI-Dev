import type { BlockDefinition } from "../types.js";

export const embeddingsRetrievalBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Text Embed
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.text-embed",
    name: "Text Embed",
    category: "embeddings-retrieval",
    description: "Encode text into dense vector embeddings using sentence-transformers or OpenAI models",
    tags: ["embed", "embedding", "text", "sentence-transformers", "vector", "encode"],
    inputs: [
      { id: "texts", name: "Texts", type: "text_list", required: true, description: "List of texts to embed" },
    ],
    outputs: [
      { id: "embeddings", name: "Embeddings", type: "embedding_list", required: true, description: "Array of shape (n_texts, dim)" },
      { id: "dim", name: "Dimension", type: "number", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model", type: "string", default: "all-MiniLM-L6-v2", description: "Sentence-transformers model name" },
      { id: "normalize", name: "L2 Normalize", type: "boolean", default: true, description: "L2-normalize embeddings for cosine similarity" },
      { id: "batch_size", name: "Batch Size", type: "number", default: 64, min: 1, max: 1024, advanced: true },
      { id: "device", name: "Device", type: "select", default: "auto", options: [{ label: "Auto", value: "auto" }, { label: "CPU", value: "cpu" }, { label: "CUDA", value: "cuda" }], advanced: true },
    ],
    codeTemplate: {
      imports: ["from sentence_transformers import SentenceTransformer", "import numpy as np"],
      body: `_device = "{{params.device}}" if "{{params.device}}" != "auto" else None
_model = SentenceTransformer("{{params.model_name}}", device=_device)
{{outputs.embeddings}} = _model.encode(
    {{inputs.texts}},
    batch_size={{params.batch_size}},
    normalize_embeddings={{params.normalize}},
    show_progress_bar=True
)
{{outputs.dim}} = {{outputs.embeddings}}.shape[1]`,
      outputBindings: { embeddings: "text_embeddings", dim: "embedding_dim" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Image Embed
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.image-embed",
    name: "Image Embed",
    category: "embeddings-retrieval",
    description: "Encode images into dense vector embeddings using CLIP or other vision encoders",
    tags: ["embed", "image", "clip", "vision", "vector", "encode"],
    inputs: [
      { id: "images", name: "Images", type: "image_batch", required: true, description: "List of PIL images or file paths" },
    ],
    outputs: [
      { id: "embeddings", name: "Embeddings", type: "embedding_list", required: true },
      { id: "dim", name: "Dimension", type: "number", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model", type: "string", default: "clip-ViT-B-32", description: "Sentence-transformers CLIP model name" },
      { id: "normalize", name: "L2 Normalize", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from sentence_transformers import SentenceTransformer", "from PIL import Image", "import numpy as np"],
      body: `_model = SentenceTransformer("{{params.model_name}}")
_imgs = []
for _item in {{inputs.images}}:
    if isinstance(_item, str):
        _imgs.append(Image.open(_item).convert("RGB"))
    else:
        _imgs.append(_item)
{{outputs.embeddings}} = _model.encode(_imgs, normalize_embeddings={{params.normalize}}, show_progress_bar=True)
{{outputs.dim}} = {{outputs.embeddings}}.shape[1]`,
      outputBindings: { embeddings: "image_embeddings", dim: "embedding_dim" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Audio Embed
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.audio-embed",
    name: "Audio Embed",
    category: "embeddings-retrieval",
    description: "Encode audio signals into dense vector embeddings using CLAP or Wav2Vec2 models",
    tags: ["embed", "audio", "clap", "wav2vec", "vector", "encode"],
    inputs: [
      { id: "audio_paths", name: "Audio Paths", type: "list", required: true, description: "List of audio file paths" },
    ],
    outputs: [
      { id: "embeddings", name: "Embeddings", type: "embedding_list", required: true },
      { id: "dim", name: "Dimension", type: "number", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model", type: "string", default: "laion/larger_clap_general", description: "HuggingFace audio encoder model" },
      { id: "sampling_rate", name: "Sampling Rate", type: "number", default: 48000, min: 8000, max: 48000 },
    ],
    codeTemplate: {
      imports: ["from transformers import ClapModel, ClapProcessor", "import librosa", "import numpy as np"],
      body: `_model = ClapModel.from_pretrained("{{params.model_name}}")
_processor = ClapProcessor.from_pretrained("{{params.model_name}}")
_audios = []
for _path in {{inputs.audio_paths}}:
    _wav, _sr = librosa.load(_path, sr={{params.sampling_rate}})
    _audios.append(_wav)
_inputs = _processor(audios=_audios, return_tensors="pt", sampling_rate={{params.sampling_rate}})
import torch
with torch.no_grad():
    {{outputs.embeddings}} = _model.get_audio_features(**_inputs).numpy()
{{outputs.dim}} = {{outputs.embeddings}}.shape[1]`,
      outputBindings: { embeddings: "audio_embeddings", dim: "embedding_dim" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Multimodal Embed
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.multimodal-embed",
    name: "Multimodal Embed",
    category: "embeddings-retrieval",
    description: "Embed text and images into a shared vector space using CLIP for cross-modal similarity",
    tags: ["multimodal", "clip", "embed", "text", "image", "cross-modal"],
    inputs: [
      { id: "texts", name: "Texts", type: "text_list", required: false, description: "Optional list of texts" },
      { id: "images", name: "Images", type: "image_batch", required: false, description: "Optional list of PIL images or paths" },
    ],
    outputs: [
      { id: "text_embeddings", name: "Text Embeddings", type: "embedding_list", required: true },
      { id: "image_embeddings", name: "Image Embeddings", type: "embedding_list", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model", type: "string", default: "openai/clip-vit-base-patch32", description: "CLIP model from HuggingFace" },
      { id: "normalize", name: "L2 Normalize", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from transformers import CLIPModel, CLIPProcessor", "from PIL import Image", "import torch", "import numpy as np"],
      body: `_model = CLIPModel.from_pretrained("{{params.model_name}}")
_processor = CLIPProcessor.from_pretrained("{{params.model_name}}")
_texts = {{inputs.texts}} or []
_images_raw = {{inputs.images}} or []
_pil_images = [Image.open(im).convert("RGB") if isinstance(im, str) else im for im in _images_raw]
_inputs = _processor(text=_texts or None, images=_pil_images or None, return_tensors="pt", padding=True, truncation=True)
with torch.no_grad():
    _outputs = _model(**_inputs)
{{outputs.text_embeddings}} = np.array([]) if not _texts else _outputs.text_embeds.numpy()
{{outputs.image_embeddings}} = np.array([]) if not _pil_images else _outputs.image_embeds.numpy()
if {{params.normalize}} and {{outputs.text_embeddings}}.size:
    {{outputs.text_embeddings}} = {{outputs.text_embeddings}} / np.linalg.norm({{outputs.text_embeddings}}, axis=1, keepdims=True)
if {{params.normalize}} and {{outputs.image_embeddings}}.size:
    {{outputs.image_embeddings}} = {{outputs.image_embeddings}} / np.linalg.norm({{outputs.image_embeddings}}, axis=1, keepdims=True)`,
      outputBindings: { text_embeddings: "clip_text_emb", image_embeddings: "clip_image_emb" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Cross-Encoder Score
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.cross-encoder-score",
    name: "Cross-Encoder Score",
    category: "embeddings-retrieval",
    description: "Score query-document pairs using a cross-encoder model for high-accuracy relevance estimation",
    tags: ["cross-encoder", "rerank", "relevance", "score", "sentence-transformers"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
      { id: "documents", name: "Documents", type: "text_list", required: true },
    ],
    outputs: [
      { id: "scores", name: "Scores", type: "list", required: true, description: "Relevance scores per document" },
      { id: "ranked_indices", name: "Ranked Indices", type: "list", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model", type: "string", default: "cross-encoder/ms-marco-MiniLM-L-6-v2", description: "Cross-encoder model name" },
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000 },
    ],
    codeTemplate: {
      imports: ["from sentence_transformers import CrossEncoder", "import numpy as np"],
      body: `_ce = CrossEncoder("{{params.model_name}}")
_pairs = [[{{inputs.query}}, doc] for doc in {{inputs.documents}}]
_raw_scores = _ce.predict(_pairs)
{{outputs.scores}} = [round(float(s), 4) for s in _raw_scores]
{{outputs.ranked_indices}} = np.argsort(_raw_scores)[::-1][:{{params.top_k}}].tolist()`,
      outputBindings: { scores: "ce_scores", ranked_indices: "ce_ranked" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Cosine Similarity
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.cosine-similarity",
    name: "Cosine Similarity",
    category: "embeddings-retrieval",
    description: "Compute pairwise or query-to-corpus cosine similarity between embedding vectors",
    tags: ["cosine", "similarity", "distance", "compare", "numpy", "sklearn"],
    inputs: [
      { id: "embeddings_a", name: "Embeddings A", type: "embedding_list", required: true },
      { id: "embeddings_b", name: "Embeddings B", type: "embedding_list", required: true },
    ],
    outputs: [
      { id: "similarity_matrix", name: "Similarity Matrix", type: "tensor", required: true, description: "Matrix of shape (n_a, n_b)" },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics.pairwise import cosine_similarity", "import numpy as np"],
      body: `_a = np.array({{inputs.embeddings_a}})
_b = np.array({{inputs.embeddings_b}})
if _a.ndim == 1:
    _a = _a.reshape(1, -1)
if _b.ndim == 1:
    _b = _b.reshape(1, -1)
{{outputs.similarity_matrix}} = cosine_similarity(_a, _b)`,
      outputBindings: { similarity_matrix: "cosine_sim" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Dot Product
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.dot-product",
    name: "Dot Product",
    category: "embeddings-retrieval",
    description: "Compute dot product similarity between two sets of embedding vectors",
    tags: ["dot", "product", "inner", "similarity", "numpy"],
    inputs: [
      { id: "embeddings_a", name: "Embeddings A", type: "embedding_list", required: true },
      { id: "embeddings_b", name: "Embeddings B", type: "embedding_list", required: true },
    ],
    outputs: [
      { id: "scores", name: "Dot Product Scores", type: "tensor", required: true, description: "Matrix of shape (n_a, n_b)" },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["import numpy as np"],
      body: `_a = np.array({{inputs.embeddings_a}})
_b = np.array({{inputs.embeddings_b}})
if _a.ndim == 1:
    _a = _a.reshape(1, -1)
if _b.ndim == 1:
    _b = _b.reshape(1, -1)
{{outputs.scores}} = _a @ _b.T`,
      outputBindings: { scores: "dot_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Euclidean Distance
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.euclidean-distance",
    name: "Euclidean Distance",
    category: "embeddings-retrieval",
    description: "Compute pairwise Euclidean (L2) distances between two sets of embedding vectors",
    tags: ["euclidean", "distance", "l2", "metric", "numpy", "sklearn"],
    inputs: [
      { id: "embeddings_a", name: "Embeddings A", type: "embedding_list", required: true },
      { id: "embeddings_b", name: "Embeddings B", type: "embedding_list", required: true },
    ],
    outputs: [
      { id: "distances", name: "Distance Matrix", type: "tensor", required: true, description: "Matrix of shape (n_a, n_b)" },
    ],
    parameters: [],
    codeTemplate: {
      imports: ["from sklearn.metrics.pairwise import euclidean_distances", "import numpy as np"],
      body: `_a = np.array({{inputs.embeddings_a}})
_b = np.array({{inputs.embeddings_b}})
if _a.ndim == 1:
    _a = _a.reshape(1, -1)
if _b.ndim == 1:
    _b = _b.reshape(1, -1)
{{outputs.distances}} = euclidean_distances(_a, _b)`,
      outputBindings: { distances: "euclidean_dist" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. ANN Search (HNSW)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.ann-search-hnsw",
    name: "ANN Search (HNSW)",
    category: "embeddings-retrieval",
    description: "Perform approximate nearest neighbor search using FAISS HNSW index for fast retrieval",
    tags: ["ann", "hnsw", "faiss", "approximate", "nearest", "neighbor", "search"],
    inputs: [
      { id: "index_vectors", name: "Index Vectors", type: "embedding_list", required: true, description: "Vectors to build the index from" },
      { id: "query_vectors", name: "Query Vectors", type: "embedding_list", required: true, description: "Vectors to search for" },
    ],
    outputs: [
      { id: "indices", name: "Neighbor Indices", type: "list", required: true, description: "Indices of nearest neighbors per query" },
      { id: "distances", name: "Distances", type: "list", required: true },
    ],
    parameters: [
      { id: "k", name: "K Neighbors", type: "number", default: 10, min: 1, max: 1000 },
      { id: "M", name: "M (HNSW connections)", type: "number", default: 32, min: 4, max: 128, description: "Number of bi-directional links per element", advanced: true },
      { id: "ef_construction", name: "ef_construction", type: "number", default: 200, min: 16, max: 1000, description: "Size of dynamic candidate list during construction", advanced: true },
      { id: "ef_search", name: "ef_search", type: "number", default: 128, min: 16, max: 1000, description: "Size of dynamic candidate list during search", advanced: true },
    ],
    codeTemplate: {
      imports: ["import faiss", "import numpy as np"],
      body: `_db = np.array({{inputs.index_vectors}}, dtype="float32")
_queries = np.array({{inputs.query_vectors}}, dtype="float32")
if _queries.ndim == 1:
    _queries = _queries.reshape(1, -1)
_dim = _db.shape[1]
_index = faiss.IndexHNSWFlat(_dim, {{params.M}})
_index.hnsw.efConstruction = {{params.ef_construction}}
_index.hnsw.efSearch = {{params.ef_search}}
_index.add(_db)
{{outputs.distances}}, {{outputs.indices}} = _index.search(_queries, {{params.k}})
{{outputs.distances}} = {{outputs.distances}}.tolist()
{{outputs.indices}} = {{outputs.indices}}.tolist()`,
      outputBindings: { indices: "ann_indices", distances: "ann_distances" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Exact KNN Search
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.exact-knn-search",
    name: "Exact KNN Search",
    category: "embeddings-retrieval",
    description: "Perform exact K-nearest-neighbor search using FAISS flat index (brute-force, guaranteed recall)",
    tags: ["knn", "exact", "brute-force", "faiss", "nearest", "neighbor"],
    inputs: [
      { id: "index_vectors", name: "Index Vectors", type: "embedding_list", required: true },
      { id: "query_vectors", name: "Query Vectors", type: "embedding_list", required: true },
    ],
    outputs: [
      { id: "indices", name: "Neighbor Indices", type: "list", required: true },
      { id: "distances", name: "Distances", type: "list", required: true },
    ],
    parameters: [
      { id: "k", name: "K Neighbors", type: "number", default: 10, min: 1, max: 10000 },
      { id: "metric", name: "Metric", type: "select", default: "l2", options: [{ label: "L2 (Euclidean)", value: "l2" }, { label: "Inner Product", value: "ip" }] },
    ],
    codeTemplate: {
      imports: ["import faiss", "import numpy as np"],
      body: `_db = np.array({{inputs.index_vectors}}, dtype="float32")
_queries = np.array({{inputs.query_vectors}}, dtype="float32")
if _queries.ndim == 1:
    _queries = _queries.reshape(1, -1)
_dim = _db.shape[1]
if "{{params.metric}}" == "ip":
    _index = faiss.IndexFlatIP(_dim)
else:
    _index = faiss.IndexFlatL2(_dim)
_index.add(_db)
{{outputs.distances}}, {{outputs.indices}} = _index.search(_queries, {{params.k}})
{{outputs.distances}} = {{outputs.distances}}.tolist()
{{outputs.indices}} = {{outputs.indices}}.tolist()`,
      outputBindings: { indices: "knn_indices", distances: "knn_distances" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Vector DB Upsert
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.vector-db-upsert",
    name: "Vector DB Upsert",
    category: "embeddings-retrieval",
    description: "Upsert vectors with metadata into a Qdrant vector database collection",
    tags: ["vector", "database", "upsert", "insert", "qdrant", "store"],
    inputs: [
      { id: "embeddings", name: "Embeddings", type: "embedding_list", required: true },
      { id: "ids", name: "IDs", type: "list", required: true, description: "Unique point IDs (ints or UUIDs)" },
      { id: "payloads", name: "Payloads", type: "list", required: false, description: "List of metadata dicts" },
    ],
    outputs: [
      { id: "status", name: "Status", type: "text", required: true },
      { id: "count", name: "Upserted Count", type: "number", required: true },
    ],
    parameters: [
      { id: "collection_name", name: "Collection Name", type: "string", default: "my_collection" },
      { id: "url", name: "Qdrant URL", type: "string", default: "http://localhost:6333" },
      { id: "create_if_missing", name: "Auto-Create Collection", type: "boolean", default: true, description: "Create collection if it does not exist" },
      { id: "distance", name: "Distance Metric", type: "select", default: "Cosine", options: [{ label: "Cosine", value: "Cosine" }, { label: "Euclid", value: "Euclid" }, { label: "Dot", value: "Dot" }], advanced: true },
    ],
    codeTemplate: {
      imports: ["from qdrant_client import QdrantClient", "from qdrant_client.models import VectorParams, Distance, PointStruct", "import numpy as np"],
      body: `_client = QdrantClient(url="{{params.url}}")
_embeddings = np.array({{inputs.embeddings}})
_dim = _embeddings.shape[1]
if {{params.create_if_missing}}:
    _collections = [c.name for c in _client.get_collections().collections]
    if "{{params.collection_name}}" not in _collections:
        _client.create_collection(
            collection_name="{{params.collection_name}}",
            vectors_config=VectorParams(size=_dim, distance=Distance.{{params.distance}})
        )
_payloads = {{inputs.payloads}} or [{}] * len({{inputs.ids}})
_points = [
    PointStruct(id=_id, vector=_vec.tolist(), payload=_pay)
    for _id, _vec, _pay in zip({{inputs.ids}}, _embeddings, _payloads)
]
_client.upsert(collection_name="{{params.collection_name}}", points=_points)
{{outputs.count}} = len(_points)
{{outputs.status}} = f"Upserted {{{outputs.count}}} points to {{params.collection_name}}"`,
      outputBindings: { status: "upsert_status", count: "upsert_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Vector DB Query
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.vector-db-query",
    name: "Vector DB Query",
    category: "embeddings-retrieval",
    description: "Query a Qdrant vector database collection with an embedding vector to retrieve nearest neighbors",
    tags: ["vector", "database", "query", "search", "qdrant", "retrieve"],
    inputs: [
      { id: "query_vector", name: "Query Vector", type: "embedding", required: true },
    ],
    outputs: [
      { id: "results", name: "Results", type: "list", required: true, description: "List of {id, score, payload} dicts" },
      { id: "ids", name: "Result IDs", type: "list", required: true },
      { id: "scores", name: "Scores", type: "list", required: true },
    ],
    parameters: [
      { id: "collection_name", name: "Collection Name", type: "string", default: "my_collection" },
      { id: "url", name: "Qdrant URL", type: "string", default: "http://localhost:6333" },
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000 },
      { id: "score_threshold", name: "Score Threshold", type: "number", default: 0.0, min: 0.0, max: 1.0, step: 0.01, description: "Minimum score to include", advanced: true },
    ],
    codeTemplate: {
      imports: ["from qdrant_client import QdrantClient", "import numpy as np"],
      body: `_client = QdrantClient(url="{{params.url}}")
_query = np.array({{inputs.query_vector}}).tolist()
_hits = _client.search(
    collection_name="{{params.collection_name}}",
    query_vector=_query,
    limit={{params.top_k}},
    score_threshold={{params.score_threshold}} if {{params.score_threshold}} > 0 else None
)
{{outputs.results}} = [{"id": h.id, "score": round(h.score, 4), "payload": h.payload} for h in _hits]
{{outputs.ids}} = [h.id for h in _hits]
{{outputs.scores}} = [round(h.score, 4) for h in _hits]`,
      outputBindings: { results: "vdb_results", ids: "vdb_ids", scores: "vdb_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Hybrid Search
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.hybrid-search",
    name: "Hybrid Search",
    category: "embeddings-retrieval",
    description: "Combine dense vector search with sparse BM25 search using reciprocal rank fusion (RRF)",
    tags: ["hybrid", "search", "rrf", "dense", "sparse", "bm25", "fusion"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
      { id: "documents", name: "Documents", type: "text_list", required: true },
      { id: "embeddings", name: "Document Embeddings", type: "embedding_list", required: true },
      { id: "query_embedding", name: "Query Embedding", type: "embedding", required: true },
    ],
    outputs: [
      { id: "ranked_indices", name: "Ranked Indices", type: "list", required: true },
      { id: "scores", name: "Fusion Scores", type: "list", required: true },
    ],
    parameters: [
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000 },
      { id: "rrf_k", name: "RRF K Constant", type: "number", default: 60, min: 1, max: 200, description: "Reciprocal rank fusion constant" },
      { id: "dense_weight", name: "Dense Weight", type: "number", default: 0.5, min: 0.0, max: 1.0, step: 0.05, description: "Weight for dense scores (1 - weight = sparse weight)" },
    ],
    codeTemplate: {
      imports: ["from rank_bm25 import BM25Okapi", "from sklearn.metrics.pairwise import cosine_similarity", "import numpy as np"],
      body: `# Sparse scores (BM25)
_tokenized = [doc.lower().split() for doc in {{inputs.documents}}]
_bm25 = BM25Okapi(_tokenized)
_sparse_scores = _bm25.get_scores({{inputs.query}}.lower().split())
_sparse_rank = np.argsort(-_sparse_scores)

# Dense scores (cosine)
_q_emb = np.array({{inputs.query_embedding}}).reshape(1, -1)
_doc_embs = np.array({{inputs.embeddings}})
_dense_scores = cosine_similarity(_q_emb, _doc_embs)[0]
_dense_rank = np.argsort(-_dense_scores)

# Reciprocal Rank Fusion
_rrf_scores = np.zeros(len({{inputs.documents}}))
_k = {{params.rrf_k}}
_dw = {{params.dense_weight}}
for rank, idx in enumerate(_dense_rank):
    _rrf_scores[idx] += _dw / (rank + _k)
for rank, idx in enumerate(_sparse_rank):
    _rrf_scores[idx] += (1 - _dw) / (rank + _k)

{{outputs.ranked_indices}} = np.argsort(-_rrf_scores)[:{{params.top_k}}].tolist()
{{outputs.scores}} = [round(float(_rrf_scores[i]), 6) for i in {{outputs.ranked_indices}}]`,
      outputBindings: { ranked_indices: "hybrid_ranked", scores: "hybrid_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Rerank Results
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.rerank-results",
    name: "Rerank Results",
    category: "embeddings-retrieval",
    description: "Rerank a list of retrieved documents using a cross-encoder model for improved relevance ordering",
    tags: ["rerank", "cross-encoder", "relevance", "order", "sentence-transformers"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
      { id: "documents", name: "Documents", type: "text_list", required: true },
    ],
    outputs: [
      { id: "reranked_docs", name: "Reranked Documents", type: "text_list", required: true },
      { id: "reranked_indices", name: "Reranked Indices", type: "list", required: true },
      { id: "scores", name: "Scores", type: "list", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Model", type: "string", default: "cross-encoder/ms-marco-MiniLM-L-6-v2" },
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000 },
    ],
    codeTemplate: {
      imports: ["from sentence_transformers import CrossEncoder", "import numpy as np"],
      body: `_ce = CrossEncoder("{{params.model_name}}")
_pairs = [[{{inputs.query}}, doc] for doc in {{inputs.documents}}]
_scores = _ce.predict(_pairs)
_order = np.argsort(-np.array(_scores))[:{{params.top_k}}]
{{outputs.reranked_indices}} = _order.tolist()
{{outputs.reranked_docs}} = [{{inputs.documents}}[i] for i in _order]
{{outputs.scores}} = [round(float(_scores[i]), 4) for i in _order]`,
      outputBindings: { reranked_docs: "reranked_docs", reranked_indices: "reranked_indices", scores: "rerank_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Build Index
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.build-index",
    name: "Build Index",
    category: "embeddings-retrieval",
    description: "Build a FAISS index from a set of embedding vectors with configurable index type (Flat, IVF, HNSW)",
    tags: ["index", "faiss", "build", "ivf", "hnsw", "flat", "vector"],
    inputs: [
      { id: "embeddings", name: "Embeddings", type: "embedding_list", required: true },
    ],
    outputs: [
      { id: "index", name: "FAISS Index", type: "index", required: true },
      { id: "num_vectors", name: "Vector Count", type: "number", required: true },
    ],
    parameters: [
      { id: "index_type", name: "Index Type", type: "select", default: "flat", options: [{ label: "Flat (Exact)", value: "flat" }, { label: "IVF Flat", value: "ivf" }, { label: "HNSW", value: "hnsw" }] },
      { id: "metric", name: "Metric", type: "select", default: "l2", options: [{ label: "L2", value: "l2" }, { label: "Inner Product", value: "ip" }] },
      { id: "nlist", name: "IVF nlist", type: "number", default: 100, min: 1, max: 10000, description: "Number of Voronoi cells for IVF", advanced: true },
      { id: "M", name: "HNSW M", type: "number", default: 32, min: 4, max: 128, advanced: true },
    ],
    codeTemplate: {
      imports: ["import faiss", "import numpy as np"],
      body: `_vecs = np.array({{inputs.embeddings}}, dtype="float32")
_dim = _vecs.shape[1]
_type = "{{params.index_type}}"
_metric = faiss.METRIC_L2 if "{{params.metric}}" == "l2" else faiss.METRIC_INNER_PRODUCT
if _type == "flat":
    {{outputs.index}} = faiss.IndexFlatL2(_dim) if "{{params.metric}}" == "l2" else faiss.IndexFlatIP(_dim)
elif _type == "ivf":
    _quantizer = faiss.IndexFlatL2(_dim) if "{{params.metric}}" == "l2" else faiss.IndexFlatIP(_dim)
    {{outputs.index}} = faiss.IndexIVFFlat(_quantizer, _dim, {{params.nlist}}, _metric)
    {{outputs.index}}.train(_vecs)
elif _type == "hnsw":
    {{outputs.index}} = faiss.IndexHNSWFlat(_dim, {{params.M}}, _metric)
{{outputs.index}}.add(_vecs)
{{outputs.num_vectors}} = {{outputs.index}}.ntotal`,
      outputBindings: { index: "faiss_index", num_vectors: "index_size" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 16. Chunk & Embed Pipeline
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.chunk-embed-pipeline",
    name: "Chunk & Embed Pipeline",
    category: "embeddings-retrieval",
    description: "End-to-end pipeline that chunks text and embeds each chunk for RAG ingestion",
    tags: ["chunk", "embed", "pipeline", "rag", "ingest", "langchain", "sentence-transformers"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "chunks", name: "Chunks", type: "text_list", required: true },
      { id: "embeddings", name: "Chunk Embeddings", type: "embedding_list", required: true },
      { id: "count", name: "Chunk Count", type: "number", required: true },
    ],
    parameters: [
      { id: "chunk_size", name: "Chunk Size (chars)", type: "number", default: 512, min: 50, max: 10000 },
      { id: "chunk_overlap", name: "Overlap (chars)", type: "number", default: 64, min: 0, max: 2000 },
      { id: "embed_model", name: "Embedding Model", type: "string", default: "all-MiniLM-L6-v2" },
      { id: "normalize", name: "L2 Normalize", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from langchain.text_splitter import RecursiveCharacterTextSplitter", "from sentence_transformers import SentenceTransformer"],
      body: `_splitter = RecursiveCharacterTextSplitter(
    chunk_size={{params.chunk_size}},
    chunk_overlap={{params.chunk_overlap}}
)
{{outputs.chunks}} = _splitter.split_text({{inputs.text}})
_model = SentenceTransformer("{{params.embed_model}}")
{{outputs.embeddings}} = _model.encode(
    {{outputs.chunks}},
    normalize_embeddings={{params.normalize}},
    show_progress_bar=True
)
{{outputs.count}} = len({{outputs.chunks}})`,
      outputBindings: { chunks: "chunks", embeddings: "chunk_embeddings", count: "chunk_count" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 17. Sparse Retrieval (BM25)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.sparse-retrieval-bm25",
    name: "Sparse Retrieval (BM25)",
    category: "embeddings-retrieval",
    description: "Perform sparse lexical retrieval using BM25 Okapi scoring over a text corpus",
    tags: ["sparse", "retrieval", "bm25", "lexical", "rank_bm25", "search"],
    inputs: [
      { id: "documents", name: "Documents", type: "text_list", required: true },
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "top_docs", name: "Top Documents", type: "text_list", required: true },
      { id: "top_indices", name: "Top Indices", type: "list", required: true },
      { id: "scores", name: "Scores", type: "list", required: true },
    ],
    parameters: [
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000 },
      { id: "k1", name: "k1", type: "number", default: 1.5, min: 0.0, max: 3.0, step: 0.1 },
      { id: "b", name: "b", type: "number", default: 0.75, min: 0.0, max: 1.0, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["from rank_bm25 import BM25Okapi", "import numpy as np"],
      body: `_tokenized = [doc.lower().split() for doc in {{inputs.documents}}]
_bm25 = BM25Okapi(_tokenized, k1={{params.k1}}, b={{params.b}})
_query_tokens = {{inputs.query}}.lower().split()
_scores = _bm25.get_scores(_query_tokens)
_top_idx = np.argsort(-_scores)[:{{params.top_k}}]
{{outputs.top_indices}} = _top_idx.tolist()
{{outputs.top_docs}} = [{{inputs.documents}}[i] for i in _top_idx]
{{outputs.scores}} = [round(float(_scores[i]), 4) for i in _top_idx]`,
      outputBindings: { top_docs: "bm25_docs", top_indices: "bm25_indices", scores: "bm25_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 18. Dense + Sparse Fusion
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.dense-sparse-fusion",
    name: "Dense + Sparse Fusion",
    category: "embeddings-retrieval",
    description: "Fuse dense and sparse retrieval ranked lists using weighted reciprocal rank fusion or linear combination",
    tags: ["fusion", "dense", "sparse", "rrf", "linear", "combine", "hybrid"],
    inputs: [
      { id: "dense_scores", name: "Dense Scores", type: "list", required: true, description: "Per-document dense similarity scores" },
      { id: "sparse_scores", name: "Sparse Scores", type: "list", required: true, description: "Per-document sparse (BM25) scores" },
    ],
    outputs: [
      { id: "fused_indices", name: "Fused Ranked Indices", type: "list", required: true },
      { id: "fused_scores", name: "Fused Scores", type: "list", required: true },
    ],
    parameters: [
      { id: "method", name: "Fusion Method", type: "select", default: "rrf", options: [{ label: "Reciprocal Rank Fusion", value: "rrf" }, { label: "Linear Combination", value: "linear" }] },
      { id: "alpha", name: "Dense Weight (alpha)", type: "number", default: 0.5, min: 0.0, max: 1.0, step: 0.05, description: "Weight for dense scores; sparse = 1 - alpha" },
      { id: "rrf_k", name: "RRF K", type: "number", default: 60, min: 1, max: 200, advanced: true },
      { id: "top_k", name: "Top K", type: "number", default: 10, min: 1, max: 1000 },
    ],
    codeTemplate: {
      imports: ["import numpy as np"],
      body: `_dense = np.array({{inputs.dense_scores}}, dtype="float64")
_sparse = np.array({{inputs.sparse_scores}}, dtype="float64")
_n = len(_dense)
_method = "{{params.method}}"
if _method == "linear":
    # Min-max normalize each
    _d_min, _d_max = _dense.min(), _dense.max()
    _s_min, _s_max = _sparse.min(), _sparse.max()
    _d_norm = (_dense - _d_min) / (_d_max - _d_min + 1e-9)
    _s_norm = (_sparse - _s_min) / (_s_max - _s_min + 1e-9)
    _fused = {{params.alpha}} * _d_norm + (1 - {{params.alpha}}) * _s_norm
else:
    _dense_rank = np.argsort(-_dense)
    _sparse_rank = np.argsort(-_sparse)
    _fused = np.zeros(_n)
    _k = {{params.rrf_k}}
    for r, idx in enumerate(_dense_rank):
        _fused[idx] += {{params.alpha}} / (r + _k)
    for r, idx in enumerate(_sparse_rank):
        _fused[idx] += (1 - {{params.alpha}}) / (r + _k)
_order = np.argsort(-_fused)[:{{params.top_k}}]
{{outputs.fused_indices}} = _order.tolist()
{{outputs.fused_scores}} = [round(float(_fused[i]), 6) for i in _order]`,
      outputBindings: { fused_indices: "fused_indices", fused_scores: "fused_scores" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 19. Query Expansion
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.query-expansion",
    name: "Query Expansion",
    category: "embeddings-retrieval",
    description: "Expand a search query with synonyms and related terms using WordNet or an LLM to improve recall",
    tags: ["query", "expansion", "synonym", "wordnet", "recall", "rewrite"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "expanded_query", name: "Expanded Query", type: "text", required: true },
      { id: "added_terms", name: "Added Terms", type: "list", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "wordnet", options: [{ label: "WordNet Synonyms", value: "wordnet" }, { label: "Embedding Nearest Words", value: "embedding" }] },
      { id: "max_synonyms_per_word", name: "Max Synonyms per Word", type: "number", default: 2, min: 1, max: 10 },
      { id: "embed_model", name: "Embedding Model", type: "string", default: "all-MiniLM-L6-v2", description: "Model for embedding-based expansion", advanced: true },
    ],
    codeTemplate: {
      imports: ["import nltk", "from nltk.corpus import wordnet"],
      setup: "nltk.download('wordnet', quiet=True)\nnltk.download('omw-1.4', quiet=True)",
      body: `_query = {{inputs.query}}
_words = _query.lower().split()
{{outputs.added_terms}} = []
if "{{params.method}}" == "wordnet":
    for _word in _words:
        _syns = set()
        for _ss in wordnet.synsets(_word):
            for _lemma in _ss.lemmas():
                _name = _lemma.name().replace("_", " ")
                if _name.lower() != _word:
                    _syns.add(_name)
                if len(_syns) >= {{params.max_synonyms_per_word}}:
                    break
            if len(_syns) >= {{params.max_synonyms_per_word}}:
                break
        {{outputs.added_terms}}.extend(list(_syns))
else:
    from sentence_transformers import SentenceTransformer
    import numpy as np
    _model = SentenceTransformer("{{params.embed_model}}")
    _word_embs = _model.encode(_words)
    # Use model vocabulary to find nearest terms (simplified)
    _all_terms = list(set(_words))
    for _word in _words:
        _w_emb = _model.encode([_word])
        _sims = np.dot(_model.encode(_all_terms), _w_emb.T).flatten()
        _top = np.argsort(-_sims)[1:{{params.max_synonyms_per_word}}+1]
        {{outputs.added_terms}}.extend([_all_terms[i] for i in _top if _all_terms[i] != _word])
{{outputs.expanded_query}} = _query + " " + " ".join({{outputs.added_terms}})`,
      outputBindings: { expanded_query: "expanded_query", added_terms: "expansion_terms" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 20. Hypothetical Document Embed (HyDE)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.hypothetical-document-embed",
    name: "Hypothetical Document Embed (HyDE)",
    category: "embeddings-retrieval",
    description: "Generate a hypothetical answer to a query using an LLM, then embed it for improved dense retrieval",
    tags: ["hyde", "hypothetical", "document", "embed", "llm", "retrieval", "rag"],
    inputs: [
      { id: "query", name: "Query", type: "text", required: true },
    ],
    outputs: [
      { id: "hypothetical_doc", name: "Hypothetical Document", type: "text", required: true },
      { id: "embedding", name: "HyDE Embedding", type: "embedding", required: true },
    ],
    parameters: [
      { id: "llm_model", name: "LLM Model", type: "string", default: "google/flan-t5-base", description: "HuggingFace text generation model for hypothesis" },
      { id: "embed_model", name: "Embedding Model", type: "string", default: "all-MiniLM-L6-v2" },
      { id: "max_length", name: "Max Generation Length", type: "number", default: 256, min: 32, max: 1024 },
      { id: "prompt_template", name: "Prompt Template", type: "string", default: "Please write a short passage that answers the following question: {query}", description: "Template with {query} placeholder" },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline", "from sentence_transformers import SentenceTransformer", "import numpy as np"],
      body: `_prompt = "{{params.prompt_template}}".format(query={{inputs.query}})
_generator = pipeline("text2text-generation", model="{{params.llm_model}}")
_result = _generator(_prompt, max_length={{params.max_length}})
{{outputs.hypothetical_doc}} = _result[0]["generated_text"]
_embed_model = SentenceTransformer("{{params.embed_model}}")
{{outputs.embedding}} = _embed_model.encode({{outputs.hypothetical_doc}}, normalize_embeddings=True)`,
      outputBindings: { hypothetical_doc: "hyde_doc", embedding: "hyde_embedding" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 21. Parent-Child Chunking
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.parent-child-chunking",
    name: "Parent-Child Chunking",
    category: "embeddings-retrieval",
    description: "Split text into large parent chunks and smaller child chunks, maintaining parent-child relationships for retrieval-augmented generation",
    tags: ["chunk", "parent", "child", "hierarchical", "rag", "context", "langchain"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "parent_chunks", name: "Parent Chunks", type: "text_list", required: true },
      { id: "child_chunks", name: "Child Chunks", type: "text_list", required: true },
      { id: "child_to_parent", name: "Child-to-Parent Map", type: "list", required: true, description: "Parent index for each child chunk" },
    ],
    parameters: [
      { id: "parent_chunk_size", name: "Parent Chunk Size", type: "number", default: 2000, min: 200, max: 20000 },
      { id: "child_chunk_size", name: "Child Chunk Size", type: "number", default: 400, min: 50, max: 5000 },
      { id: "child_overlap", name: "Child Overlap", type: "number", default: 50, min: 0, max: 1000 },
    ],
    codeTemplate: {
      imports: ["from langchain.text_splitter import RecursiveCharacterTextSplitter"],
      body: `_parent_splitter = RecursiveCharacterTextSplitter(
    chunk_size={{params.parent_chunk_size}}, chunk_overlap=0
)
_child_splitter = RecursiveCharacterTextSplitter(
    chunk_size={{params.child_chunk_size}},
    chunk_overlap={{params.child_overlap}}
)
{{outputs.parent_chunks}} = _parent_splitter.split_text({{inputs.text}})
{{outputs.child_chunks}} = []
{{outputs.child_to_parent}} = []
for _pidx, _parent in enumerate({{outputs.parent_chunks}}):
    _children = _child_splitter.split_text(_parent)
    for _child in _children:
        {{outputs.child_chunks}}.append(_child)
        {{outputs.child_to_parent}}.append(_pidx)`,
      outputBindings: { parent_chunks: "parent_chunks", child_chunks: "child_chunks", child_to_parent: "child_parent_map" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 22. Sliding Window Chunk
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "embeddings-retrieval.sliding-window-chunk",
    name: "Sliding Window Chunk",
    category: "embeddings-retrieval",
    description: "Split text into overlapping chunks using a token-level sliding window for precise context windows",
    tags: ["chunk", "sliding", "window", "overlap", "token", "split"],
    inputs: [
      { id: "text", name: "Text", type: "text", required: true },
    ],
    outputs: [
      { id: "chunks", name: "Chunks", type: "text_list", required: true },
      { id: "offsets", name: "Token Offsets", type: "list", required: true, description: "Start token index of each chunk" },
      { id: "count", name: "Chunk Count", type: "number", required: true },
    ],
    parameters: [
      { id: "window_size", name: "Window Size (tokens)", type: "number", default: 128, min: 16, max: 2048, description: "Number of tokens per chunk" },
      { id: "stride", name: "Stride (tokens)", type: "number", default: 64, min: 1, max: 2048, description: "Number of tokens to advance between chunks" },
      { id: "tokenizer", name: "Tokenizer", type: "select", default: "whitespace", options: [{ label: "Whitespace", value: "whitespace" }, { label: "NLTK Word", value: "nltk" }] },
    ],
    codeTemplate: {
      imports: ["import nltk"],
      setup: "nltk.download('punkt_tab', quiet=True)",
      body: `if "{{params.tokenizer}}" == "nltk":
    from nltk.tokenize import word_tokenize
    _tokens = word_tokenize({{inputs.text}})
else:
    _tokens = {{inputs.text}}.split()
_window = {{params.window_size}}
_stride = {{params.stride}}
{{outputs.chunks}} = []
{{outputs.offsets}} = []
for _start in range(0, len(_tokens), _stride):
    _end = min(_start + _window, len(_tokens))
    _chunk_tokens = _tokens[_start:_end]
    {{outputs.chunks}}.append(" ".join(_chunk_tokens))
    {{outputs.offsets}}.append(_start)
    if _end >= len(_tokens):
        break
{{outputs.count}} = len({{outputs.chunks}})`,
      outputBindings: { chunks: "window_chunks", offsets: "chunk_offsets", count: "chunk_count" },
    },
  },
];
