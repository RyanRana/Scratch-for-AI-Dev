"""
aiblocks.embeddings_retrieval — Embeddings & Retrieval

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def text_embed(texts=None, model_name='all-MiniLM-L6-v2', normalize=True, batch_size=64, device='auto'):
    """Encode text into dense vector embeddings using sentence-transformers or OpenAI models
    
    Dependencies: pip install numpy sentence_transformers
    
    Args:
        texts (text_list) (required): List of texts to embed
    
    Parameters:
        model_name (string, default='all-MiniLM-L6-v2'): Sentence-transformers model name
        normalize (boolean, default=True): L2-normalize embeddings for cosine similarity
        batch_size (number, default=64): 
        device (select, default='auto'): 
    
    Returns:
        dict with keys:
            embeddings (embedding_list): Array of shape (n_texts, dim)
            dim (number): 
    """
    _imports = ['from sentence_transformers import SentenceTransformer', 'import numpy as np']
    _code = '_device = "{{params.device}}" if "{{params.device}}" != "auto" else None\n_model = SentenceTransformer("{{params.model_name}}", device=_device)\n{{outputs.embeddings}} = _model.encode(\n    {{inputs.texts}},\n    batch_size={{params.batch_size}},\n    normalize_embeddings={{params.normalize}},\n    show_progress_bar=True\n)\n{{outputs.dim}} = {{outputs.embeddings}}.shape[1]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{params.batch_size}}", str(batch_size))
    _code = _code.replace("{{params.device}}", str(device))
    _code = _code.replace("{{inputs.texts}}", "texts")
    _code = _code.replace("{{outputs.embeddings}}", "_out_embeddings")
    _code = _code.replace("{{outputs.dim}}", "_out_dim")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["texts"] = texts
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"embeddings": _ns.get("_out_embeddings"), "dim": _ns.get("_out_dim")}


def image_embed(images=None, model_name='clip-ViT-B-32', normalize=True):
    """Encode images into dense vector embeddings using CLIP or other vision encoders
    
    Dependencies: pip install Pillow numpy sentence_transformers
    
    Args:
        images (image_batch) (required): List of PIL images or file paths
    
    Parameters:
        model_name (string, default='clip-ViT-B-32'): Sentence-transformers CLIP model name
        normalize (boolean, default=True): 
    
    Returns:
        dict with keys:
            embeddings (embedding_list): 
            dim (number): 
    """
    _imports = ['from sentence_transformers import SentenceTransformer', 'from PIL import Image', 'import numpy as np']
    _code = '_model = SentenceTransformer("{{params.model_name}}")\n_imgs = []\nfor _item in {{inputs.images}}:\n    if isinstance(_item, str):\n        _imgs.append(Image.open(_item).convert("RGB"))\n "else":\n        _imgs.append(_item)\n{{outputs.embeddings}} = _model.encode(_imgs, normalize_embeddings={{params.normalize}}, show_progress_bar=True)\n{{outputs.dim}} = {{outputs.embeddings}}.shape[1]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.images}}", "images")
    _code = _code.replace("{{outputs.embeddings}}", "_out_embeddings")
    _code = _code.replace("{{outputs.dim}}", "_out_dim")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["images"] = images
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"embeddings": _ns.get("_out_embeddings"), "dim": _ns.get("_out_dim")}


def audio_embed(audio_paths=None, model_name='laion/larger_clap_general', sampling_rate=48000):
    """Encode audio signals into dense vector embeddings using CLAP or Wav2Vec2 models
    
    Dependencies: pip install librosa numpy transformers
    
    Args:
        audio_paths (list) (required): List of audio file paths
    
    Parameters:
        model_name (string, default='laion/larger_clap_general'): HuggingFace audio encoder model
        sampling_rate (number, default=48000): 
    
    Returns:
        dict with keys:
            embeddings (embedding_list): 
            dim (number): 
    """
    _imports = ['from transformers import ClapModel, ClapProcessor', 'import librosa', 'import numpy as np']
    _code = '_model = ClapModel.from_pretrained("{{params.model_name}}")\n_processor = ClapProcessor.from_pretrained("{{params.model_name}}")\n_audios = []\nfor _path in {{inputs.audio_paths}}:\n    _wav, _sr = librosa.load(_path, sr={{params.sampling_rate}})\n    _audios.append(_wav)\n_inputs = _processor(audios=_audios, return_tensors="pt", sampling_rate={{params.sampling_rate}})\nimport torch\nwith torch.no_grad():\n    {{outputs.embeddings}} = _model.get_audio_features(**_inputs).numpy()\n{{outputs.dim}} = {{outputs.embeddings}}.shape[1]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.sampling_rate}}", str(sampling_rate))
    _code = _code.replace("{{inputs.audio_paths}}", "audio_paths")
    _code = _code.replace("{{outputs.embeddings}}", "_out_embeddings")
    _code = _code.replace("{{outputs.dim}}", "_out_dim")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["audio_paths"] = audio_paths
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"embeddings": _ns.get("_out_embeddings"), "dim": _ns.get("_out_dim")}


def multimodal_embed(texts=None, images=None, model_name='openai/clip-vit-base-patch32', normalize=True):
    """Embed text and images into a shared vector space using CLIP for cross-modal similarity
    
    Dependencies: pip install Pillow numpy torch transformers
    
    Args:
        texts (text_list): Optional list of texts
        images (image_batch): Optional list of PIL images or paths
    
    Parameters:
        model_name (string, default='openai/clip-vit-base-patch32'): CLIP model from HuggingFace
        normalize (boolean, default=True): 
    
    Returns:
        dict with keys:
            text_embeddings (embedding_list): 
            image_embeddings (embedding_list): 
    """
    _imports = ['from transformers import CLIPModel, CLIPProcessor', 'from PIL import Image', 'import torch', 'import numpy as np']
    _code = '_model = CLIPModel.from_pretrained("{{params.model_name}}")\n_processor = CLIPProcessor.from_pretrained("{{params.model_name}}")\n_texts = {{inputs.texts}} or []\n_images_raw = {{inputs.images}} or []\n_pil_images = [Image.open(im).convert("RGB") if isinstance(im, str) else im for im in _images_raw]\n_inputs = _processor(text=_texts or None, images=_pil_images or None, return_tensors="pt", padding=True, truncation=True)\nwith torch.no_grad():\n    _outputs = _model(**_inputs)\n{{outputs.text_embeddings}} = np.array([]) if not _texts else _outputs.text_embeds.numpy()\n{{outputs.image_embeddings}} = np.array([]) if not _pil_images else _outputs.image_embeds.numpy()\nif {{params.normalize}} and {{outputs.text_embeddings}}.size:\n    {{outputs.text_embeddings}} = {{outputs.text_embeddings}} / np.linalg.norm({{outputs.text_embeddings}}, axis=1, keepdims=True)\nif {{params.normalize}} and {{outputs.image_embeddings}}.size:\n    {{outputs.image_embeddings}} = {{outputs.image_embeddings}} / np.linalg.norm({{outputs.image_embeddings}}, axis=1, keepdims=True)'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.texts}}", "texts")
    _code = _code.replace("{{inputs.images}}", "images")
    _code = _code.replace("{{outputs.text_embeddings}}", "_out_text_embeddings")
    _code = _code.replace("{{outputs.image_embeddings}}", "_out_image_embeddings")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["texts"] = texts
    _ns["images"] = images
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"text_embeddings": _ns.get("_out_text_embeddings"), "image_embeddings": _ns.get("_out_image_embeddings")}


def cross_encoder_score(query=None, documents=None, model_name='cross-encoder/ms-marco-MiniLM-L-6-v2', top_k=10):
    """Score query-document pairs using a cross-encoder model for high-accuracy relevance estimation
    
    Dependencies: pip install numpy sentence_transformers
    
    Args:
        query (text) (required): 
        documents (text_list) (required): 
    
    Parameters:
        model_name (string, default='cross-encoder/ms-marco-MiniLM-L-6-v2'): Cross-encoder model name
        top_k (number, default=10): 
    
    Returns:
        dict with keys:
            scores (list): Relevance scores per document
            ranked_indices (list): 
    """
    _imports = ['from sentence_transformers import CrossEncoder', 'import numpy as np']
    _code = '_ce = CrossEncoder("{{params.model_name}}")\n_pairs = [[{{inputs.query}}, doc] for doc in {{inputs.documents}}]\n_raw_scores = _ce.predict(_pairs)\n{{outputs.scores}} = [round(float(s), 4) for s in _raw_scores]\n{{outputs.ranked_indices}} = np.argsort(_raw_scores)[::-1][:{{params.top_k}}].tolist()'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    _code = _code.replace("{{outputs.ranked_indices}}", "_out_ranked_indices")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["documents"] = documents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"scores": _ns.get("_out_scores"), "ranked_indices": _ns.get("_out_ranked_indices")}


def cosine_similarity(embeddings_a=None, embeddings_b=None):
    """Compute pairwise or query-to-corpus cosine similarity between embedding vectors
    
    Dependencies: pip install numpy scikit-learn
    
    Args:
        embeddings_a (embedding_list) (required): 
        embeddings_b (embedding_list) (required): 
    
    Returns:
        tensor: Matrix of shape (n_a, n_b)
    """
    _imports = ['from sklearn.metrics.pairwise import cosine_similarity', 'import numpy as np']
    _code = '_a = np.array({{inputs.embeddings_a}})\n_b = np.array({{inputs.embeddings_b}})\nif _a.ndim == 1:\n    _a = _a.reshape(1, -1)\nif _b.ndim == 1:\n    _b = _b.reshape(1, -1)\n{{outputs.similarity_matrix}} = cosine_similarity(_a, _b)'
    
    _code = _code.replace("{{inputs.embeddings_a}}", "embeddings_a")
    _code = _code.replace("{{inputs.embeddings_b}}", "embeddings_b")
    _code = _code.replace("{{outputs.similarity_matrix}}", "_out_similarity_matrix")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["embeddings_a"] = embeddings_a
    _ns["embeddings_b"] = embeddings_b
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_similarity_matrix")


def dot_product(embeddings_a=None, embeddings_b=None):
    """Compute dot product similarity between two sets of embedding vectors
    
    Dependencies: pip install numpy
    
    Args:
        embeddings_a (embedding_list) (required): 
        embeddings_b (embedding_list) (required): 
    
    Returns:
        tensor: Matrix of shape (n_a, n_b)
    """
    _imports = ['import numpy as np']
    _code = '_a = np.array({{inputs.embeddings_a}})\n_b = np.array({{inputs.embeddings_b}})\nif _a.ndim == 1:\n    _a = _a.reshape(1, -1)\nif _b.ndim == 1:\n    _b = _b.reshape(1, -1)\n{{outputs.scores}} = _a @ _b.T'
    
    _code = _code.replace("{{inputs.embeddings_a}}", "embeddings_a")
    _code = _code.replace("{{inputs.embeddings_b}}", "embeddings_b")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["embeddings_a"] = embeddings_a
    _ns["embeddings_b"] = embeddings_b
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_scores")


def euclidean_distance(embeddings_a=None, embeddings_b=None):
    """Compute pairwise Euclidean (L2) distances between two sets of embedding vectors
    
    Dependencies: pip install numpy scikit-learn
    
    Args:
        embeddings_a (embedding_list) (required): 
        embeddings_b (embedding_list) (required): 
    
    Returns:
        tensor: Matrix of shape (n_a, n_b)
    """
    _imports = ['from sklearn.metrics.pairwise import euclidean_distances', 'import numpy as np']
    _code = '_a = np.array({{inputs.embeddings_a}})\n_b = np.array({{inputs.embeddings_b}})\nif _a.ndim == 1:\n    _a = _a.reshape(1, -1)\nif _b.ndim == 1:\n    _b = _b.reshape(1, -1)\n{{outputs.distances}} = euclidean_distances(_a, _b)'
    
    _code = _code.replace("{{inputs.embeddings_a}}", "embeddings_a")
    _code = _code.replace("{{inputs.embeddings_b}}", "embeddings_b")
    _code = _code.replace("{{outputs.distances}}", "_out_distances")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["embeddings_a"] = embeddings_a
    _ns["embeddings_b"] = embeddings_b
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_distances")


def ann_search_hnsw(index_vectors=None, query_vectors=None, k=10, M=32, ef_construction=200, ef_search=128):
    """Perform approximate nearest neighbor search using FAISS HNSW index for fast retrieval
    
    Dependencies: pip install faiss-cpu numpy
    
    Args:
        index_vectors (embedding_list) (required): Vectors to build the index from
        query_vectors (embedding_list) (required): Vectors to search for
    
    Parameters:
        k (number, default=10): 
        M (number, default=32): Number of bi-directional links per element
        ef_construction (number, default=200): Size of dynamic candidate list during construction
        ef_search (number, default=128): Size of dynamic candidate list during search
    
    Returns:
        dict with keys:
            indices (list): Indices of nearest neighbors per query
            distances (list): 
    """
    _imports = ['import faiss', 'import numpy as np']
    _code = '_db = np.array({{inputs.index_vectors}}, dtype="float32")\n_queries = np.array({{inputs.query_vectors}}, dtype="float32")\nif _queries.ndim == 1:\n    _queries = _queries.reshape(1, -1)\n_dim = _db.shape[1]\n_index = faiss.IndexHNSWFlat(_dim, {{params.M}})\n_index.hnsw.efConstruction = {{params.ef_construction}}\n_index.hnsw.efSearch = {{params.ef_search}}\n_index.add(_db)\n{{outputs.distances}}, {{outputs.indices}} = _index.search(_queries, {{params.k}})\n{{outputs.distances}} = {{outputs.distances}}.tolist()\n{{outputs.indices}} = {{outputs.indices}}.tolist()'
    
    _code = _code.replace("{{params.k}}", str(k))
    _code = _code.replace("{{params.M}}", str(M))
    _code = _code.replace("{{params.ef_construction}}", str(ef_construction))
    _code = _code.replace("{{params.ef_search}}", str(ef_search))
    _code = _code.replace("{{inputs.index_vectors}}", "index_vectors")
    _code = _code.replace("{{inputs.query_vectors}}", "query_vectors")
    _code = _code.replace("{{outputs.indices}}", "_out_indices")
    _code = _code.replace("{{outputs.distances}}", "_out_distances")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["index_vectors"] = index_vectors
    _ns["query_vectors"] = query_vectors
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"indices": _ns.get("_out_indices"), "distances": _ns.get("_out_distances")}


def exact_knn_search(index_vectors=None, query_vectors=None, k=10, metric='l2'):
    """Perform exact K-nearest-neighbor search using FAISS flat index (brute-force, guaranteed recall)
    
    Dependencies: pip install faiss-cpu numpy
    
    Args:
        index_vectors (embedding_list) (required): 
        query_vectors (embedding_list) (required): 
    
    Parameters:
        k (number, default=10): 
        metric (select, default='l2'): 
    
    Returns:
        dict with keys:
            indices (list): 
            distances (list): 
    """
    _imports = ['import faiss', 'import numpy as np']
    _code = '_db = np.array({{inputs.index_vectors}}, dtype="float32")\n_queries = np.array({{inputs.query_vectors}}, dtype="float32")\nif _queries.ndim == 1:\n    _queries = _queries.reshape(1, -1)\n_dim = _db.shape[1]\nif "{{params.metric}}" == "ip":\n    _index = faiss.IndexFlatIP(_dim)\n "else":\n    _index = faiss.IndexFlatL2(_dim)\n_index.add(_db)\n{{outputs.distances}}, {{outputs.indices}} = _index.search(_queries, {{params.k}})\n{{outputs.distances}} = {{outputs.distances}}.tolist()\n{{outputs.indices}} = {{outputs.indices}}.tolist()'
    
    _code = _code.replace("{{params.k}}", str(k))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{inputs.index_vectors}}", "index_vectors")
    _code = _code.replace("{{inputs.query_vectors}}", "query_vectors")
    _code = _code.replace("{{outputs.indices}}", "_out_indices")
    _code = _code.replace("{{outputs.distances}}", "_out_distances")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["index_vectors"] = index_vectors
    _ns["query_vectors"] = query_vectors
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"indices": _ns.get("_out_indices"), "distances": _ns.get("_out_distances")}


def vector_db_upsert(embeddings=None, ids=None, payloads=None, collection_name='my_collection', url='http://localhost:6333', create_if_missing=True, distance='Cosine'):
    """Upsert vectors with metadata into a Qdrant vector database collection
    
    Dependencies: pip install numpy qdrant-client
    
    Args:
        embeddings (embedding_list) (required): 
        ids (list) (required): Unique point IDs (ints or UUIDs)
        payloads (list): List of metadata dicts
    
    Parameters:
        collection_name (string, default='my_collection'): 
        url (string, default='http://localhost:6333'): 
        create_if_missing (boolean, default=True): Create collection if it does not exist
        distance (select, default='Cosine'): 
    
    Returns:
        dict with keys:
            status (text): 
            count (number): 
    """
    _imports = ['from qdrant_client import QdrantClient', 'from qdrant_client.models import VectorParams, Distance, PointStruct', 'import numpy as np']
    _code = '_client = QdrantClient(url="{{params.url}}")\n_embeddings = np.array({{inputs.embeddings}})\n_dim = _embeddings.shape[1]\nif {{params.create_if_missing}}:\n    _collections = [c.name for c in _client.get_collections().collections]\n    if "{{params.collection_name}}" not in _collections:\n        _client.create_collection(\n            collection_name="{{params.collection_name}}",\n            vectors_config=VectorParams(size=_dim, distance=Distance.{{params.distance}})\n        )\n_payloads = {{inputs.payloads}} or [{}] * len({{inputs.ids}})\n_points = [\n    PointStruct(id=_id, vector=_vec.tolist(), payload=_pay)\n    for _id, _vec, _pay in zip({{inputs.ids}}, _embeddings, _payloads)\n]\n_client.upsert(collection_name="{{params.collection_name}}", points=_points)\n{{outputs.count}} = len(_points)\n{{outputs.status}} = f"Upserted {{{outputs.count}}} points to {{params.collection_name}}"'
    
    _code = _code.replace("{{params.collection_name}}", str(collection_name))
    _code = _code.replace("{{params.url}}", str(url))
    _code = _code.replace("{{params.create_if_missing}}", str(create_if_missing))
    _code = _code.replace("{{params.distance}}", str(distance))
    _code = _code.replace("{{inputs.embeddings}}", "embeddings")
    _code = _code.replace("{{inputs.ids}}", "ids")
    _code = _code.replace("{{inputs.payloads}}", "payloads")
    _code = _code.replace("{{outputs.status}}", "_out_status")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["embeddings"] = embeddings
    _ns["ids"] = ids
    _ns["payloads"] = payloads
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"status": _ns.get("_out_status"), "count": _ns.get("_out_count")}


def vector_db_query(query_vector=None, collection_name='my_collection', url='http://localhost:6333', top_k=10, score_threshold=0.0):
    """Query a Qdrant vector database collection with an embedding vector to retrieve nearest neighbors
    
    Dependencies: pip install numpy qdrant-client
    
    Args:
        query_vector (embedding) (required): 
    
    Parameters:
        collection_name (string, default='my_collection'): 
        url (string, default='http://localhost:6333'): 
        top_k (number, default=10): 
        score_threshold (number, default=0.0): Minimum score to include
    
    Returns:
        dict with keys:
            results (list): List of {id, score, payload} dicts
            ids (list): 
            scores (list): 
    """
    _imports = ['from qdrant_client import QdrantClient', 'import numpy as np']
    _code = '_client = QdrantClient(url="{{params.url}}")\n_query = np.array({{inputs.query_vector}}).tolist()\n_hits = _client.search(\n    collection_name="{{params.collection_name}}",\n    query_vector=_query,\n    limit={{params.top_k}},\n    score_threshold={{params.score_threshold}} if {{params.score_threshold}} > 0 else None\n)\n{{outputs.results}} = [{"id": h.id, "score": round(h.score, 4), "payload": h.payload} for h in _hits]\n{{outputs.ids}} = [h.id for h in _hits]\n{{outputs.scores}} = [round(h.score, 4) for h in _hits]'
    
    _code = _code.replace("{{params.collection_name}}", str(collection_name))
    _code = _code.replace("{{params.url}}", str(url))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{params.score_threshold}}", str(score_threshold))
    _code = _code.replace("{{inputs.query_vector}}", "query_vector")
    _code = _code.replace("{{outputs.results}}", "_out_results")
    _code = _code.replace("{{outputs.ids}}", "_out_ids")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query_vector"] = query_vector
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"results": _ns.get("_out_results"), "ids": _ns.get("_out_ids"), "scores": _ns.get("_out_scores")}


def hybrid_search(query=None, documents=None, embeddings=None, query_embedding=None, top_k=10, rrf_k=60, dense_weight=0.5):
    """Combine dense vector search with sparse BM25 search using reciprocal rank fusion (RRF)
    
    Dependencies: pip install numpy rank_bm25 scikit-learn
    
    Args:
        query (text) (required): 
        documents (text_list) (required): 
        embeddings (embedding_list) (required): 
        query_embedding (embedding) (required): 
    
    Parameters:
        top_k (number, default=10): 
        rrf_k (number, default=60): Reciprocal rank fusion constant
        dense_weight (number, default=0.5): Weight for dense scores (1 - weight = sparse weight)
    
    Returns:
        dict with keys:
            ranked_indices (list): 
            scores (list): 
    """
    _imports = ['from rank_bm25 import BM25Okapi', 'from sklearn.metrics.pairwise import cosine_similarity', 'import numpy as np']
    _code = '# Sparse scores (BM25)\n_tokenized = [doc.lower().split() for doc in {{inputs.documents}}]\n_bm25 = BM25Okapi(_tokenized)\n_sparse_scores = _bm25.get_scores({{inputs.query}}.lower().split())\n_sparse_rank = np.argsort(-_sparse_scores)\n\n# Dense scores (cosine)\n_q_emb = np.array({{inputs.query_embedding}}).reshape(1, -1)\n_doc_embs = np.array({{inputs.embeddings}})\n_dense_scores = cosine_similarity(_q_emb, _doc_embs)[0]\n_dense_rank = np.argsort(-_dense_scores)\n\n# Reciprocal Rank Fusion\n_rrf_scores = np.zeros(len({{inputs.documents}}))\n_k = {{params.rrf_k}}\n_dw = {{params.dense_weight}}\nfor rank, idx in enumerate(_dense_rank):\n    _rrf_scores[idx] += _dw / (rank + _k)\nfor rank, idx in enumerate(_sparse_rank):\n    _rrf_scores[idx] += (1 - _dw) / (rank + _k)\n\n{{outputs.ranked_indices}} = np.argsort(-_rrf_scores)[:{{params.top_k}}].tolist()\n{{outputs.scores}} = [round(float(_rrf_scores[i]), 6) for i in {{outputs.ranked_indices}}]'
    
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{params.rrf_k}}", str(rrf_k))
    _code = _code.replace("{{params.dense_weight}}", str(dense_weight))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{inputs.embeddings}}", "embeddings")
    _code = _code.replace("{{inputs.query_embedding}}", "query_embedding")
    _code = _code.replace("{{outputs.ranked_indices}}", "_out_ranked_indices")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["documents"] = documents
    _ns["embeddings"] = embeddings
    _ns["query_embedding"] = query_embedding
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"ranked_indices": _ns.get("_out_ranked_indices"), "scores": _ns.get("_out_scores")}


def rerank_results(query=None, documents=None, model_name='cross-encoder/ms-marco-MiniLM-L-6-v2', top_k=10):
    """Rerank a list of retrieved documents using a cross-encoder model for improved relevance ordering
    
    Dependencies: pip install numpy sentence_transformers
    
    Args:
        query (text) (required): 
        documents (text_list) (required): 
    
    Parameters:
        model_name (string, default='cross-encoder/ms-marco-MiniLM-L-6-v2'): 
        top_k (number, default=10): 
    
    Returns:
        dict with keys:
            reranked_docs (text_list): 
            reranked_indices (list): 
            scores (list): 
    """
    _imports = ['from sentence_transformers import CrossEncoder', 'import numpy as np']
    _code = '_ce = CrossEncoder("{{params.model_name}}")\n_pairs = [[{{inputs.query}}, doc] for doc in {{inputs.documents}}]\n_scores = _ce.predict(_pairs)\n_order = np.argsort(-np.array(_scores))[:{{params.top_k}}]\n{{outputs.reranked_indices}} = _order.tolist()\n{{outputs.reranked_docs}} = [{{inputs.documents}}[i] for i in _order]\n{{outputs.scores}} = [round(float(_scores[i]), 4) for i in _order]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{outputs.reranked_docs}}", "_out_reranked_docs")
    _code = _code.replace("{{outputs.reranked_indices}}", "_out_reranked_indices")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    _ns["documents"] = documents
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"reranked_docs": _ns.get("_out_reranked_docs"), "reranked_indices": _ns.get("_out_reranked_indices"), "scores": _ns.get("_out_scores")}


def build_index(embeddings=None, index_type='flat', metric='l2', nlist=100, M=32):
    """Build a FAISS index from a set of embedding vectors with configurable index type (Flat, IVF, HNSW)
    
    Dependencies: pip install faiss-cpu numpy
    
    Args:
        embeddings (embedding_list) (required): 
    
    Parameters:
        index_type (select, default='flat'): 
        metric (select, default='l2'): 
        nlist (number, default=100): Number of Voronoi cells for IVF
        M (number, default=32): 
    
    Returns:
        dict with keys:
            index (index): 
            num_vectors (number): 
    """
    _imports = ['import faiss', 'import numpy as np']
    _code = '_vecs = np.array({{inputs.embeddings}}, dtype="float32")\n_dim = _vecs.shape[1]\n_type = "{{params.index_type}}"\n_metric = faiss.METRIC_L2 if "{{params.metric}}" == "l2" else faiss.METRIC_INNER_PRODUCT\nif _type == "flat":\n    {{outputs.index}} = faiss.IndexFlatL2(_dim) if "{{params.metric}}" == "l2" else faiss.IndexFlatIP(_dim)\nelif _type == "ivf":\n    _quantizer = faiss.IndexFlatL2(_dim) if "{{params.metric}}" == "l2" else faiss.IndexFlatIP(_dim)\n    {{outputs.index}} = faiss.IndexIVFFlat(_quantizer, _dim, {{params.nlist}}, _metric)\n    {{outputs.index}}.train(_vecs)\nelif _type == "hnsw":\n    {{outputs.index}} = faiss.IndexHNSWFlat(_dim, {{params.M}}, _metric)\n{{outputs.index}}.add(_vecs)\n{{outputs.num_vectors}} = {{outputs.index}}.ntotal'
    
    _code = _code.replace("{{params.index_type}}", str(index_type))
    _code = _code.replace("{{params.metric}}", str(metric))
    _code = _code.replace("{{params.nlist}}", str(nlist))
    _code = _code.replace("{{params.M}}", str(M))
    _code = _code.replace("{{inputs.embeddings}}", "embeddings")
    _code = _code.replace("{{outputs.index}}", "_out_index")
    _code = _code.replace("{{outputs.num_vectors}}", "_out_num_vectors")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["embeddings"] = embeddings
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"index": _ns.get("_out_index"), "num_vectors": _ns.get("_out_num_vectors")}


def chunk_embed_pipeline(text=None, chunk_size=512, chunk_overlap=64, embed_model='all-MiniLM-L6-v2', normalize=True):
    """End-to-end pipeline that chunks text and embeds each chunk for RAG ingestion
    
    Dependencies: pip install langchain sentence_transformers
    
    Args:
        text (text) (required): 
    
    Parameters:
        chunk_size (number, default=512): 
        chunk_overlap (number, default=64): 
        embed_model (string, default='all-MiniLM-L6-v2'): 
        normalize (boolean, default=True): 
    
    Returns:
        dict with keys:
            chunks (text_list): 
            embeddings (embedding_list): 
            count (number): 
    """
    _imports = ['from langchain.text_splitter import RecursiveCharacterTextSplitter', 'from sentence_transformers import SentenceTransformer']
    _code = '_splitter = RecursiveCharacterTextSplitter(\n    chunk_size={{params.chunk_size}},\n    chunk_overlap={{params.chunk_overlap}}\n)\n{{outputs.chunks}} = _splitter.split_text({{inputs.text}})\n_model = SentenceTransformer("{{params.embed_model}}")\n{{outputs.embeddings}} = _model.encode(\n    {{outputs.chunks}},\n    normalize_embeddings={{params.normalize}},\n    show_progress_bar=True\n)\n{{outputs.count}} = len({{outputs.chunks}})'
    
    _code = _code.replace("{{params.chunk_size}}", str(chunk_size))
    _code = _code.replace("{{params.chunk_overlap}}", str(chunk_overlap))
    _code = _code.replace("{{params.embed_model}}", str(embed_model))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.chunks}}", "_out_chunks")
    _code = _code.replace("{{outputs.embeddings}}", "_out_embeddings")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"chunks": _ns.get("_out_chunks"), "embeddings": _ns.get("_out_embeddings"), "count": _ns.get("_out_count")}


def sparse_retrieval_bm25(documents=None, query=None, top_k=10, k1=1.5, b=0.75):
    """Perform sparse lexical retrieval using BM25 Okapi scoring over a text corpus
    
    Dependencies: pip install numpy rank_bm25
    
    Args:
        documents (text_list) (required): 
        query (text) (required): 
    
    Parameters:
        top_k (number, default=10): 
        k1 (number, default=1.5): 
        b (number, default=0.75): 
    
    Returns:
        dict with keys:
            top_docs (text_list): 
            top_indices (list): 
            scores (list): 
    """
    _imports = ['from rank_bm25 import BM25Okapi', 'import numpy as np']
    _code = '_tokenized = [doc.lower().split() for doc in {{inputs.documents}}]\n_bm25 = BM25Okapi(_tokenized, k1={{params.k1}}, b={{params.b}})\n_query_tokens = {{inputs.query}}.lower().split()\n_scores = _bm25.get_scores(_query_tokens)\n_top_idx = np.argsort(-_scores)[:{{params.top_k}}]\n{{outputs.top_indices}} = _top_idx.tolist()\n{{outputs.top_docs}} = [{{inputs.documents}}[i] for i in _top_idx]\n{{outputs.scores}} = [round(float(_scores[i]), 4) for i in _top_idx]'
    
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{params.k1}}", str(k1))
    _code = _code.replace("{{params.b}}", str(b))
    _code = _code.replace("{{inputs.documents}}", "documents")
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.top_docs}}", "_out_top_docs")
    _code = _code.replace("{{outputs.top_indices}}", "_out_top_indices")
    _code = _code.replace("{{outputs.scores}}", "_out_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["documents"] = documents
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"top_docs": _ns.get("_out_top_docs"), "top_indices": _ns.get("_out_top_indices"), "scores": _ns.get("_out_scores")}


def dense_sparse_fusion(dense_scores=None, sparse_scores=None, method='rrf', alpha=0.5, rrf_k=60, top_k=10):
    """Fuse dense and sparse retrieval ranked lists using weighted reciprocal rank fusion or linear combination
    
    Dependencies: pip install numpy
    
    Args:
        dense_scores (list) (required): Per-document dense similarity scores
        sparse_scores (list) (required): Per-document sparse (BM25) scores
    
    Parameters:
        method (select, default='rrf'): 
        alpha (number, default=0.5): Weight for dense scores; sparse = 1 - alpha
        rrf_k (number, default=60): 
        top_k (number, default=10): 
    
    Returns:
        dict with keys:
            fused_indices (list): 
            fused_scores (list): 
    """
    _imports = ['import numpy as np']
    _code = '_dense = np.array({{inputs.dense_scores}}, dtype="float64")\n_sparse = np.array({{inputs.sparse_scores}}, dtype="float64")\n_n = len(_dense)\n_method = "{{params.method}}"\nif _method == "linear":\n    # Min-max normalize each\n    _d_min, _d_max = _dense.min(), _dense.max()\n    _s_min, _s_max = _sparse.min(), _sparse.max()\n    _d_norm = (_dense - _d_min) / (_d_max - _d_min + 1e-9)\n    _s_norm = (_sparse - _s_min) / (_s_max - _s_min + 1e-9)\n    _fused = {{params.alpha}} * _d_norm + (1 - {{params.alpha}}) * _s_norm\n "else":\n    _dense_rank = np.argsort(-_dense)\n    _sparse_rank = np.argsort(-_sparse)\n    _fused = np.zeros(_n)\n    _k = {{params.rrf_k}}\n    for r, idx in enumerate(_dense_rank):\n        _fused[idx] += {{params.alpha}} / (r + _k)\n    for r, idx in enumerate(_sparse_rank):\n        _fused[idx] += (1 - {{params.alpha}}) / (r + _k)\n_order = np.argsort(-_fused)[:{{params.top_k}}]\n{{outputs.fused_indices}} = _order.tolist()\n{{outputs.fused_scores}} = [round(float(_fused[i]), 6) for i in _order]'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.alpha}}", str(alpha))
    _code = _code.replace("{{params.rrf_k}}", str(rrf_k))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.dense_scores}}", "dense_scores")
    _code = _code.replace("{{inputs.sparse_scores}}", "sparse_scores")
    _code = _code.replace("{{outputs.fused_indices}}", "_out_fused_indices")
    _code = _code.replace("{{outputs.fused_scores}}", "_out_fused_scores")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["dense_scores"] = dense_scores
    _ns["sparse_scores"] = sparse_scores
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"fused_indices": _ns.get("_out_fused_indices"), "fused_scores": _ns.get("_out_fused_scores")}


def query_expansion(query=None, method='wordnet', max_synonyms_per_word=2, embed_model='all-MiniLM-L6-v2'):
    """Expand a search query with synonyms and related terms using WordNet or an LLM to improve recall
    
    Dependencies: pip install nltk
    
    Args:
        query (text) (required): 
    
    Parameters:
        method (select, default='wordnet'): 
        max_synonyms_per_word (number, default=2): 
        embed_model (string, default='all-MiniLM-L6-v2'): Model for embedding-based expansion
    
    Returns:
        dict with keys:
            expanded_query (text): 
            added_terms (list): 
    """
    _imports = ['import nltk', 'from nltk.corpus import wordnet']
    _code = '_query = {{inputs.query}}\n_words = _query.lower().split()\n{{outputs.added_terms}} = []\nif "{{params.method}}" == "wordnet":\n    for _word in _words:\n        _syns = set()\n        for _ss in wordnet.synsets(_word):\n            for _lemma in _ss.lemmas():\n                _name = _lemma.name().replace("_", " ")\n                if _name.lower() != _word:\n                    _syns.add(_name)\n                if len(_syns) >= {{params.max_synonyms_per_word}}:\n                    break\n            if len(_syns) >= {{params.max_synonyms_per_word}}:\n                break\n        {{outputs.added_terms}}.extend(list(_syns))\n "else":\n    from sentence_transformers import SentenceTransformer\n    import numpy as np\n    _model = SentenceTransformer("{{params.embed_model}}")\n    _word_embs = _model.encode(_words)\n    # Use model vocabulary to find nearest terms (simplified)\n    _all_terms = list(set(_words))\n    for _word in _words:\n        _w_emb = _model.encode([_word])\n        _sims = np.dot(_model.encode(_all_terms), _w_emb.T).flatten()\n        _top = np.argsort(-_sims)[1:{{params.max_synonyms_per_word}}+1]\n        {{outputs.added_terms}}.extend([_all_terms[i] for i in _top if _all_terms[i] != _word])\n{{outputs.expanded_query}} = _query + " " + " ".join({{outputs.added_terms}})'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.max_synonyms_per_word}}", str(max_synonyms_per_word))
    _code = _code.replace("{{params.embed_model}}", str(embed_model))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.expanded_query}}", "_out_expanded_query")
    _code = _code.replace("{{outputs.added_terms}}", "_out_added_terms")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"expanded_query": _ns.get("_out_expanded_query"), "added_terms": _ns.get("_out_added_terms")}


def hypothetical_document_embed(query=None, llm_model='google/flan-t5-base', embed_model='all-MiniLM-L6-v2', max_length=256, prompt_template='Please write a short passage that answers the following question: {query}'):
    """Generate a hypothetical answer to a query using an LLM, then embed it for improved dense retrieval
    
    Dependencies: pip install numpy sentence_transformers transformers
    
    Args:
        query (text) (required): 
    
    Parameters:
        llm_model (string, default='google/flan-t5-base'): HuggingFace text generation model for hypothesis
        embed_model (string, default='all-MiniLM-L6-v2'): 
        max_length (number, default=256): 
        prompt_template (string, default='Please write a short passage that answers the following question: {query}'): Template with {query} placeholder
    
    Returns:
        dict with keys:
            hypothetical_doc (text): 
            embedding (embedding): 
    """
    _imports = ['from transformers import pipeline', 'from sentence_transformers import SentenceTransformer', 'import numpy as np']
    _code = '_prompt = "{{params.prompt_template}}".format(query={{inputs.query}})\n_generator = pipeline("text2text-generation", model="{{params.llm_model}}")\n_result = _generator(_prompt, max_length={{params.max_length}})\n{{outputs.hypothetical_doc}} = _result[0]["generated_text"]\n_embed_model = SentenceTransformer("{{params.embed_model}}")\n{{outputs.embedding}} = _embed_model.encode({{outputs.hypothetical_doc}}, normalize_embeddings=True)'
    
    _code = _code.replace("{{params.llm_model}}", str(llm_model))
    _code = _code.replace("{{params.embed_model}}", str(embed_model))
    _code = _code.replace("{{params.max_length}}", str(max_length))
    _code = _code.replace("{{params.prompt_template}}", str(prompt_template))
    _code = _code.replace("{{inputs.query}}", "query")
    _code = _code.replace("{{outputs.hypothetical_doc}}", "_out_hypothetical_doc")
    _code = _code.replace("{{outputs.embedding}}", "_out_embedding")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["query"] = query
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"hypothetical_doc": _ns.get("_out_hypothetical_doc"), "embedding": _ns.get("_out_embedding")}


def parent_child_chunking(text=None, parent_chunk_size=2000, child_chunk_size=400, child_overlap=50):
    """Split text into large parent chunks and smaller child chunks, maintaining parent-child relationships for retrieval-augmented generation
    
    Dependencies: pip install langchain
    
    Args:
        text (text) (required): 
    
    Parameters:
        parent_chunk_size (number, default=2000): 
        child_chunk_size (number, default=400): 
        child_overlap (number, default=50): 
    
    Returns:
        dict with keys:
            parent_chunks (text_list): 
            child_chunks (text_list): 
            child_to_parent (list): Parent index for each child chunk
    """
    _imports = ['from langchain.text_splitter import RecursiveCharacterTextSplitter']
    _code = '_parent_splitter = RecursiveCharacterTextSplitter(\n    chunk_size={{params.parent_chunk_size}}, chunk_overlap=0\n)\n_child_splitter = RecursiveCharacterTextSplitter(\n    chunk_size={{params.child_chunk_size}},\n    chunk_overlap={{params.child_overlap}}\n)\n{{outputs.parent_chunks}} = _parent_splitter.split_text({{inputs.text}})\n{{outputs.child_chunks}} = []\n{{outputs.child_to_parent}} = []\nfor _pidx, _parent in enumerate({{outputs.parent_chunks}}):\n    _children = _child_splitter.split_text(_parent)\n    for _child in _children:\n        {{outputs.child_chunks}}.append(_child)\n        {{outputs.child_to_parent}}.append(_pidx)'
    
    _code = _code.replace("{{params.parent_chunk_size}}", str(parent_chunk_size))
    _code = _code.replace("{{params.child_chunk_size}}", str(child_chunk_size))
    _code = _code.replace("{{params.child_overlap}}", str(child_overlap))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.parent_chunks}}", "_out_parent_chunks")
    _code = _code.replace("{{outputs.child_chunks}}", "_out_child_chunks")
    _code = _code.replace("{{outputs.child_to_parent}}", "_out_child_to_parent")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"parent_chunks": _ns.get("_out_parent_chunks"), "child_chunks": _ns.get("_out_child_chunks"), "child_to_parent": _ns.get("_out_child_to_parent")}


def sliding_window_chunk(text=None, window_size=128, stride=64, tokenizer='whitespace'):
    """Split text into overlapping chunks using a token-level sliding window for precise context windows
    
    Dependencies: pip install nltk
    
    Args:
        text (text) (required): 
    
    Parameters:
        window_size (number, default=128): Number of tokens per chunk
        stride (number, default=64): Number of tokens to advance between chunks
        tokenizer (select, default='whitespace'): 
    
    Returns:
        dict with keys:
            chunks (text_list): 
            offsets (list): Start token index of each chunk
            count (number): 
    """
    _imports = ['import nltk']
    _code = 'if "{{params.tokenizer}}" == "nltk":\n    from nltk.tokenize import word_tokenize\n    _tokens = word_tokenize({{inputs.text}})\n "else":\n    _tokens = {{inputs.text}}.split()\n_window = {{params.window_size}}\n_stride = {{params.stride}}\n{{outputs.chunks}} = []\n{{outputs.offsets}} = []\nfor _start in range(0, len(_tokens), _stride):\n    _end = min(_start + _window, len(_tokens))\n    _chunk_tokens = _tokens[_start:_end]\n    {{outputs.chunks}}.append(" ".join(_chunk_tokens))\n    {{outputs.offsets}}.append(_start)\n    if _end >= len(_tokens):\n        break\n{{outputs.count}} = len({{outputs.chunks}})'
    
    _code = _code.replace("{{params.window_size}}", str(window_size))
    _code = _code.replace("{{params.stride}}", str(stride))
    _code = _code.replace("{{params.tokenizer}}", str(tokenizer))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.chunks}}", "_out_chunks")
    _code = _code.replace("{{outputs.offsets}}", "_out_offsets")
    _code = _code.replace("{{outputs.count}}", "_out_count")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"chunks": _ns.get("_out_chunks"), "offsets": _ns.get("_out_offsets"), "count": _ns.get("_out_count")}

