"""
AI Blocks — Python API

Call any block as a function:
    import aiblocks
    df = aiblocks.data_io.load_csv(file_path="data.csv")
    model = aiblocks.classical_ml.random_forest(train_data=df)
"""

from aiblocks import control_flow
from aiblocks import data_io
from aiblocks import data_processing
from aiblocks import text_nlp
from aiblocks import embeddings_retrieval
from aiblocks import classical_ml
from aiblocks import neural_networks
from aiblocks import transformers_llms
from aiblocks import vision
from aiblocks import audio_speech
from aiblocks import training
from aiblocks import fine_tuning
from aiblocks import distillation
from aiblocks import evaluation
from aiblocks import experiment_tracking
from aiblocks import agents
from aiblocks import prompt_engineering
from aiblocks import monitoring
from aiblocks import utilities

__all__ = [
    "control_flow",
    "data_io",
    "data_processing",
    "text_nlp",
    "embeddings_retrieval",
    "classical_ml",
    "neural_networks",
    "transformers_llms",
    "vision",
    "audio_speech",
    "training",
    "fine_tuning",
    "distillation",
    "evaluation",
    "experiment_tracking",
    "agents",
    "prompt_engineering",
    "monitoring",
    "utilities",
]

__version__ = "0.1.0"
