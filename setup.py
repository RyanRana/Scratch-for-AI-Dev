"""AI Blocks — visual AI/ML blocks as a Python API."""
from setuptools import setup, find_packages

setup(
    name="aiblocks",
    version="0.1.0",
    description="AI Blocks: 500+ AI/ML building blocks as callable Python functions",
    long_description=open("README.md").read() if __import__("os").path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=[
        "pandas",
        "numpy",
    ],
    extras_require={
        "ml": ["scikit-learn", "xgboost", "lightgbm"],
        "dl": ["torch", "torchvision", "torchaudio"],
        "llm": ["transformers", "openai", "anthropic", "langchain"],
        "vision": ["opencv-python", "Pillow", "ultralytics"],
        "audio": ["librosa", "soundfile"],
        "all": [
            "scikit-learn", "xgboost", "lightgbm",
            "torch", "torchvision", "torchaudio",
            "transformers", "openai", "anthropic", "langchain",
            "opencv-python", "Pillow", "ultralytics",
            "librosa", "soundfile",
            "mlflow", "wandb",
            "fastapi", "uvicorn",
        ],
    },
)
