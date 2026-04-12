"""
20 ML Engineering coding challenges for benchmarking block-based vs vanilla Claude.
Each challenge has a prompt, expected capabilities, and evaluation criteria.
"""

CHALLENGES = [
    # ── Classical ML ──────────────────────────────────────────────────────
    {
        "id": "clf_01_random_forest",
        "title": "Random Forest Classifier",
        "category_hint": ["data-io", "data-processing", "classical-ml", "evaluation"],
        "prompt": (
            "Write a complete Python script that loads the Iris dataset from sklearn, "
            "splits it 80/20 stratified, trains a Random Forest classifier with 200 trees, "
            "predicts on the test set, and prints accuracy, precision, recall, and F1."
        ),
        "expected_imports": ["sklearn"],
        "eval_keywords": ["RandomForestClassifier", "train_test_split", "accuracy_score"],
    },
    {
        "id": "clf_02_xgboost_pipeline",
        "title": "XGBoost with Cross-Validation",
        "category_hint": ["data-io", "data-processing", "classical-ml", "evaluation"],
        "prompt": (
            "Write Python code that loads a CSV file 'data.csv', does a stratified 5-fold "
            "cross-validation with XGBoost (learning_rate=0.1, max_depth=6, 300 rounds), "
            "prints mean and std of AUC-ROC across folds, then trains a final model on all data."
        ),
        "expected_imports": ["xgboost", "sklearn"],
        "eval_keywords": ["XGBClassifier", "StratifiedKFold", "roc_auc"],
    },
    {
        "id": "clf_03_regression_compare",
        "title": "Compare Regression Models",
        "category_hint": ["data-io", "data-processing", "classical-ml", "evaluation"],
        "prompt": (
            "Load the Boston-style housing CSV ('housing.csv'), split 80/20, train Linear "
            "Regression, Ridge (alpha=1.0), and Lasso (alpha=0.5). Print RMSE and R-squared "
            "for each model side by side."
        ),
        "expected_imports": ["sklearn"],
        "eval_keywords": ["LinearRegression", "Ridge", "Lasso", "mean_squared_error", "r2_score"],
    },

    # ── Deep Learning ─────────────────────────────────────────────────────
    {
        "id": "dl_04_mnist_cnn",
        "title": "MNIST CNN Classifier",
        "category_hint": ["data-io", "neural-networks", "training", "evaluation"],
        "prompt": (
            "Write a PyTorch script that builds a CNN for MNIST (2 conv layers with ReLU "
            "and max-pooling, then 2 FC layers), trains for 10 epochs with Adam (lr=0.001) "
            "and cross-entropy loss, prints train/test accuracy each epoch."
        ),
        "expected_imports": ["torch"],
        "eval_keywords": ["Conv2d", "MaxPool2d", "CrossEntropyLoss", "Adam"],
    },
    {
        "id": "dl_05_transfer_learning",
        "title": "Transfer Learning ResNet",
        "category_hint": ["vision", "training", "fine-tuning", "evaluation"],
        "prompt": (
            "Write a PyTorch script that loads a pretrained ResNet-18, replaces the final FC "
            "layer for 10 classes, freezes all layers except the new head, trains for 5 epochs "
            "on a custom image folder dataset with data augmentation (random crop, flip, normalize)."
        ),
        "expected_imports": ["torch", "torchvision"],
        "eval_keywords": ["resnet18", "pretrained", "requires_grad", "RandomResizedCrop"],
    },
    {
        "id": "dl_06_autoencoder",
        "title": "Variational Autoencoder",
        "category_hint": ["neural-networks", "training", "evaluation"],
        "prompt": (
            "Implement a Variational Autoencoder (VAE) in PyTorch with an encoder (FC 784->400->20 "
            "for mu and logvar), reparameterization trick, decoder (20->400->784 sigmoid), "
            "train on MNIST for 20 epochs, compute reconstruction + KL loss."
        ),
        "expected_imports": ["torch"],
        "eval_keywords": ["reparameterize", "kl_divergence", "encoder", "decoder", "mu", "logvar"],
    },

    # ── NLP ───────────────────────────────────────────────────────────────
    {
        "id": "nlp_07_sentiment",
        "title": "Sentiment Analysis Pipeline",
        "category_hint": ["data-io", "text-nlp", "classical-ml", "evaluation"],
        "prompt": (
            "Write Python code that loads 'reviews.csv' (columns: text, label), builds a "
            "TF-IDF vectorizer (max_features=5000, bigrams), trains a Logistic Regression, "
            "evaluates with classification_report and confusion_matrix."
        ),
        "expected_imports": ["sklearn"],
        "eval_keywords": ["TfidfVectorizer", "LogisticRegression", "classification_report"],
    },
    {
        "id": "nlp_08_ner_transformer",
        "title": "Named Entity Recognition with HuggingFace",
        "category_hint": ["text-nlp", "transformers-llms", "evaluation"],
        "prompt": (
            "Write Python code using HuggingFace Transformers to load a pretrained NER model "
            "(dslim/bert-base-NER), run inference on a list of sentences, extract entities "
            "with their labels and confidence scores, and print results in a table."
        ),
        "expected_imports": ["transformers"],
        "eval_keywords": ["pipeline", "ner", "bert-base-NER", "entity"],
    },
    {
        "id": "nlp_09_text_embedding",
        "title": "Semantic Search with Embeddings",
        "category_hint": ["embeddings-retrieval", "text-nlp"],
        "prompt": (
            "Write Python code that uses sentence-transformers (all-MiniLM-L6-v2) to embed "
            "a corpus of documents, stores them in a FAISS index, and implements a search "
            "function that takes a query string and returns the top-5 most similar documents."
        ),
        "expected_imports": ["sentence_transformers", "faiss"],
        "eval_keywords": ["SentenceTransformer", "faiss", "IndexFlatIP", "encode"],
    },

    # ── RAG & Agents ──────────────────────────────────────────────────────
    {
        "id": "rag_10_basic",
        "title": "Basic RAG Pipeline",
        "category_hint": ["embeddings-retrieval", "prompt-engineering", "agents"],
        "prompt": (
            "Build a RAG pipeline: load PDF documents with PyPDF2, chunk them (500 chars, "
            "100 overlap), embed with sentence-transformers, store in ChromaDB, then "
            "implement a query function that retrieves top-3 chunks and passes them to "
            "an LLM (OpenAI API) with a system prompt for grounded answers."
        ),
        "expected_imports": ["chromadb", "sentence_transformers"],
        "eval_keywords": ["ChromaDB", "chunk", "embed", "retrieve", "system"],
    },
    {
        "id": "agent_11_react",
        "title": "ReAct Agent with Tools",
        "category_hint": ["agents", "prompt-engineering", "utilities"],
        "prompt": (
            "Implement a ReAct agent loop in Python: the agent has access to a calculator "
            "tool and a web_search tool. It receives a question, loops through "
            "Thought/Action/Observation steps (max 5), calls tools via function dispatch, "
            "and returns a final answer. Use the Anthropic API for the LLM."
        ),
        "expected_imports": ["anthropic"],
        "eval_keywords": ["Thought", "Action", "Observation", "tool", "loop"],
    },

    # ── Fine-tuning ───────────────────────────────────────────────────────
    {
        "id": "ft_12_lora",
        "title": "LoRA Fine-tuning Script",
        "category_hint": ["fine-tuning", "transformers-llms", "training"],
        "prompt": (
            "Write a Python script that fine-tunes a Llama-2-7b model using LoRA "
            "(r=16, alpha=32, dropout=0.05) with PEFT library on a custom JSONL dataset. "
            "Use 4-bit quantization (bitsandbytes), gradient checkpointing, and save "
            "the adapter weights. Train for 3 epochs with cosine LR schedule."
        ),
        "expected_imports": ["peft", "transformers", "bitsandbytes"],
        "eval_keywords": ["LoraConfig", "get_peft_model", "BitsAndBytesConfig", "4bit"],
    },
    {
        "id": "ft_13_dpo",
        "title": "DPO Training Pipeline",
        "category_hint": ["fine-tuning", "training", "transformers-llms"],
        "prompt": (
            "Write a script that trains a language model with Direct Preference Optimization "
            "(DPO). Load a preference dataset with chosen/rejected pairs, set up the DPO "
            "trainer from TRL with beta=0.1, train for 1 epoch, save the model."
        ),
        "expected_imports": ["trl", "transformers"],
        "eval_keywords": ["DPOTrainer", "DPOConfig", "chosen", "rejected", "beta"],
    },

    # ── Evaluation & Experiment Tracking ──────────────────────────────────
    {
        "id": "eval_14_llm_judge",
        "title": "LLM-as-Judge Evaluation",
        "category_hint": ["evaluation", "prompt-engineering", "agents"],
        "prompt": (
            "Write Python code that evaluates LLM outputs using an LLM-as-judge pattern. "
            "Given a list of (question, reference_answer, model_answer) triples, use Claude "
            "to score each on correctness (1-5) and helpfulness (1-5). Compute average scores "
            "and Cohen's kappa for inter-rater reliability against human labels."
        ),
        "expected_imports": ["anthropic", "sklearn"],
        "eval_keywords": ["judge", "score", "correctness", "kappa"],
    },
    {
        "id": "exp_15_mlflow",
        "title": "MLflow Experiment Tracking",
        "category_hint": ["experiment-tracking", "classical-ml", "evaluation"],
        "prompt": (
            "Write a script that trains 3 different sklearn models (RF, GBT, SVM), logs "
            "each run to MLflow with hyperparameters, metrics (accuracy, F1), and the "
            "trained model artifact. At the end, query the MLflow API to find the best run."
        ),
        "expected_imports": ["mlflow", "sklearn"],
        "eval_keywords": ["mlflow.start_run", "log_param", "log_metric", "log_model"],
    },

    # ── Vision ────────────────────────────────────────────────────────────
    {
        "id": "vis_16_object_detection",
        "title": "YOLOv8 Object Detection",
        "category_hint": ["vision", "data-io", "evaluation"],
        "prompt": (
            "Write a Python script using Ultralytics YOLOv8 that loads a pretrained "
            "yolov8n model, runs inference on all images in a folder, draws bounding boxes "
            "with labels and confidence scores, saves annotated images, and prints a "
            "summary of detected objects with counts."
        ),
        "expected_imports": ["ultralytics"],
        "eval_keywords": ["YOLO", "predict", "boxes", "conf", "cls"],
    },
    {
        "id": "vis_17_image_aug",
        "title": "Image Augmentation Pipeline",
        "category_hint": ["vision", "data-processing", "data-io"],
        "prompt": (
            "Write a Python script using Albumentations that creates a training augmentation "
            "pipeline (random crop 224x224, horizontal flip, color jitter, normalize, "
            "CoarseDropout) and a validation pipeline (resize, center crop, normalize). "
            "Apply to all images in a folder and save augmented versions."
        ),
        "expected_imports": ["albumentations", "cv2"],
        "eval_keywords": ["Compose", "RandomCrop", "HorizontalFlip", "Normalize"],
    },

    # ── Deployment & Monitoring ───────────────────────────────────────────
    {
        "id": "deploy_18_fastapi",
        "title": "FastAPI Model Serving",
        "category_hint": ["deployment", "data-io", "utilities"],
        "prompt": (
            "Write a FastAPI application that serves a sklearn model: POST /predict accepts "
            "JSON features and returns predictions. Include health check endpoint, input "
            "validation with Pydantic, model loading from pickle, request logging, and "
            "error handling. Add a /batch endpoint for batch predictions."
        ),
        "expected_imports": ["fastapi", "pydantic"],
        "eval_keywords": ["FastAPI", "BaseModel", "predict", "batch", "pickle"],
    },
    {
        "id": "monitor_19_drift",
        "title": "Data Drift Detection",
        "category_hint": ["monitoring", "data-processing", "evaluation"],
        "prompt": (
            "Write Python code that implements data drift detection: compute PSI "
            "(Population Stability Index) and KS test for each feature between a reference "
            "dataset and a production dataset. Flag features with PSI > 0.2 as drifted. "
            "Generate a drift report with per-feature statistics."
        ),
        "expected_imports": ["scipy", "numpy"],
        "eval_keywords": ["PSI", "ks_2samp", "drift", "bins"],
    },

    # ── Distillation ──────────────────────────────────────────────────────
    {
        "id": "distill_20_knowledge",
        "title": "Knowledge Distillation Training",
        "category_hint": ["distillation", "neural-networks", "training"],
        "prompt": (
            "Write a PyTorch script that performs knowledge distillation: a pretrained "
            "ResNet-50 teacher and a smaller ResNet-18 student. Use temperature scaling "
            "(T=4), combine soft target loss (KL divergence) with hard target loss "
            "(cross-entropy) using alpha=0.7. Train student for 10 epochs on CIFAR-10."
        ),
        "expected_imports": ["torch", "torchvision"],
        "eval_keywords": ["teacher", "student", "temperature", "kl_div", "alpha"],
    },
]
