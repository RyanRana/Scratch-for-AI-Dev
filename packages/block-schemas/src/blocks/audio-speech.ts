import type { BlockDefinition } from "../types.js";

export const audioSpeechBlocks: BlockDefinition[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Load Audio
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.load-audio",
    name: "Load Audio",
    category: "audio-speech",
    description: "Load an audio file from disk as a waveform tensor and sample rate",
    tags: ["audio", "load", "wav", "mp3", "torchaudio", "io"],
    inputs: [
      { id: "file_path", name: "File Path", type: "path", required: true, description: "Path to audio file (wav, mp3, flac, ogg)" },
    ],
    outputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    parameters: [
      { id: "mono", name: "Convert to Mono", type: "boolean", default: true },
      { id: "normalize", name: "Normalize", type: "boolean", default: true },
      { id: "backend", name: "Backend", type: "select", default: "sox", options: [{ label: "SoX", value: "sox" }, { label: "SoundFile", value: "soundfile" }, { label: "FFmpeg", value: "ffmpeg" }] },
    ],
    codeTemplate: {
      imports: ["import torchaudio"],
      body: `{{outputs.waveform}}, {{outputs.sample_rate}} = torchaudio.load({{inputs.file_path}}, backend="{{params.backend}}")
if {{params.mono}} and {{outputs.waveform}}.shape[0] > 1:
    {{outputs.waveform}} = {{outputs.waveform}}.mean(dim=0, keepdim=True)
if {{params.normalize}}:
    {{outputs.waveform}} = {{outputs.waveform}} / ({{outputs.waveform}}.abs().max() + 1e-8)`,
      outputBindings: { waveform: "waveform", sample_rate: "sample_rate" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Resample Audio
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.resample-audio",
    name: "Resample Audio",
    category: "audio-speech",
    description: "Resample an audio waveform to a target sample rate using torchaudio",
    tags: ["audio", "resample", "sample-rate", "torchaudio"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "orig_sr", name: "Original Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "waveform_out", name: "Resampled Waveform", type: "audio", required: true },
    ],
    parameters: [
      { id: "target_sr", name: "Target Sample Rate", type: "number", default: 16000, min: 1000, max: 96000, step: 1000 },
    ],
    codeTemplate: {
      imports: ["import torchaudio.transforms as T"],
      body: `_resampler = T.Resample(orig_freq=int({{inputs.orig_sr}}), new_freq={{params.target_sr}})
{{outputs.waveform_out}} = _resampler({{inputs.waveform}})`,
      outputBindings: { waveform_out: "resampled_waveform" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. MFCC Features
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.mfcc-features",
    name: "MFCC Features",
    category: "audio-speech",
    description: "Extract Mel-Frequency Cepstral Coefficients from an audio waveform",
    tags: ["audio", "mfcc", "features", "torchaudio", "spectral"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "mfcc", name: "MFCC Features", type: "tensor", required: true },
    ],
    parameters: [
      { id: "n_mfcc", name: "Number of MFCCs", type: "number", default: 13, min: 1, max: 128, step: 1 },
      { id: "n_fft", name: "FFT Size", type: "number", default: 400, min: 128, max: 4096, step: 64 },
      { id: "hop_length", name: "Hop Length", type: "number", default: 160, min: 64, max: 2048, step: 32 },
      { id: "n_mels", name: "Number of Mel Bands", type: "number", default: 23, min: 8, max: 256, step: 1 },
    ],
    codeTemplate: {
      imports: ["import torchaudio.transforms as T"],
      body: `_mfcc_transform = T.MFCC(
    sample_rate=int({{inputs.sample_rate}}),
    n_mfcc={{params.n_mfcc}},
    melkwargs={"n_fft": {{params.n_fft}}, "hop_length": {{params.hop_length}}, "n_mels": {{params.n_mels}}}
)
{{outputs.mfcc}} = _mfcc_transform({{inputs.waveform}})`,
      outputBindings: { mfcc: "mfcc_features" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Mel Spectrogram
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.mel-spectrogram",
    name: "Mel Spectrogram",
    category: "audio-speech",
    description: "Compute a Mel-scaled spectrogram from an audio waveform",
    tags: ["audio", "mel", "spectrogram", "torchaudio", "spectral"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "mel_spec", name: "Mel Spectrogram", type: "tensor", required: true },
    ],
    parameters: [
      { id: "n_fft", name: "FFT Size", type: "number", default: 1024, min: 128, max: 4096, step: 64 },
      { id: "hop_length", name: "Hop Length", type: "number", default: 512, min: 64, max: 2048, step: 32 },
      { id: "n_mels", name: "Number of Mel Bands", type: "number", default: 80, min: 8, max: 256, step: 1 },
      { id: "power", name: "Power", type: "number", default: 2.0, min: 1.0, max: 2.0, step: 0.5 },
    ],
    codeTemplate: {
      imports: ["import torchaudio.transforms as T"],
      body: `_mel_spec = T.MelSpectrogram(
    sample_rate=int({{inputs.sample_rate}}),
    n_fft={{params.n_fft}},
    hop_length={{params.hop_length}},
    n_mels={{params.n_mels}},
    power={{params.power}}
)
{{outputs.mel_spec}} = _mel_spec({{inputs.waveform}})`,
      outputBindings: { mel_spec: "mel_spectrogram" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Waveform Plot
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.waveform-plot",
    name: "Waveform Plot",
    category: "audio-speech",
    description: "Visualize an audio waveform as a matplotlib time-domain plot",
    tags: ["audio", "waveform", "plot", "visualization", "matplotlib"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "figure", name: "Plot Figure", type: "any", required: true },
    ],
    parameters: [
      { id: "title", name: "Title", type: "string", default: "Waveform", placeholder: "Plot title" },
      { id: "figsize_w", name: "Figure Width", type: "number", default: 12, min: 4, max: 24, step: 1 },
      { id: "figsize_h", name: "Figure Height", type: "number", default: 4, min: 2, max: 12, step: 1 },
    ],
    codeTemplate: {
      imports: ["import matplotlib.pyplot as plt", "import torch"],
      body: `_wav = {{inputs.waveform}}.squeeze().cpu()
_sr = int({{inputs.sample_rate}})
_time_axis = torch.arange(0, _wav.shape[-1]) / _sr
{{outputs.figure}}, _ax = plt.subplots(figsize=({{params.figsize_w}}, {{params.figsize_h}}))
_ax.plot(_time_axis.numpy(), _wav.numpy(), linewidth=0.5)
_ax.set_xlabel("Time (s)")
_ax.set_ylabel("Amplitude")
_ax.set_title("{{params.title}}")
plt.tight_layout()`,
      outputBindings: { figure: "waveform_fig" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. VAD (Voice Activity Detection)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.vad",
    name: "VAD (Voice Activity Detection)",
    category: "audio-speech",
    description: "Detect speech segments in audio using Silero VAD",
    tags: ["audio", "vad", "voice-activity", "speech", "silero"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true, description: "16kHz mono waveform" },
    ],
    outputs: [
      { id: "speech_timestamps", name: "Speech Timestamps", type: "list", required: true },
      { id: "has_speech", name: "Has Speech", type: "boolean", required: true },
    ],
    parameters: [
      { id: "threshold", name: "Speech Threshold", type: "number", default: 0.5, min: 0.0, max: 1.0, step: 0.05 },
      { id: "min_speech_ms", name: "Min Speech Duration (ms)", type: "number", default: 250, min: 50, max: 2000, step: 50 },
      { id: "min_silence_ms", name: "Min Silence Duration (ms)", type: "number", default: 100, min: 50, max: 2000, step: 50 },
    ],
    codeTemplate: {
      imports: ["import torch"],
      body: `_vad_model, _vad_utils = torch.hub.load("snakers4/silero-vad", "silero_vad", force_reload=False)
(_get_speech_timestamps, _, _, _, _) = _vad_utils
{{outputs.speech_timestamps}} = _get_speech_timestamps(
    {{inputs.waveform}}.squeeze(),
    _vad_model,
    threshold={{params.threshold}},
    min_speech_duration_ms={{params.min_speech_ms}},
    min_silence_duration_ms={{params.min_silence_ms}},
    sampling_rate=16000
)
{{outputs.has_speech}} = len({{outputs.speech_timestamps}}) > 0`,
      outputBindings: { speech_timestamps: "speech_timestamps", has_speech: "has_speech" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. ASR (Whisper)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.asr-whisper",
    name: "ASR (Whisper)",
    category: "audio-speech",
    description: "Transcribe speech to text using OpenAI Whisper via Hugging Face transformers",
    tags: ["audio", "asr", "whisper", "transcription", "speech-to-text", "transformers"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true, description: "16kHz mono waveform" },
    ],
    outputs: [
      { id: "transcription", name: "Transcription", type: "text", required: true },
      { id: "segments", name: "Segments", type: "list", required: true },
    ],
    parameters: [
      { id: "model_size", name: "Model Size", type: "select", default: "openai/whisper-base", options: [{ label: "Tiny", value: "openai/whisper-tiny" }, { label: "Base", value: "openai/whisper-base" }, { label: "Small", value: "openai/whisper-small" }, { label: "Medium", value: "openai/whisper-medium" }, { label: "Large v3", value: "openai/whisper-large-v3" }] },
      { id: "language", name: "Language", type: "string", default: "en", placeholder: "Language code (e.g., en, fr, de)" },
      { id: "return_timestamps", name: "Return Timestamps", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline", "import torch"],
      body: `_asr_pipe = pipeline(
    "automatic-speech-recognition",
    model="{{params.model_size}}",
    device="cuda:0" if torch.cuda.is_available() else "cpu",
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32
)
_asr_result = _asr_pipe(
    {{inputs.waveform}}.squeeze().numpy(),
    generate_kwargs={"language": "{{params.language}}"},
    return_timestamps={{params.return_timestamps}}
)
{{outputs.transcription}} = _asr_result["text"]
{{outputs.segments}} = _asr_result.get("chunks", [])`,
      outputBindings: { transcription: "whisper_text", segments: "whisper_segments" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. ASR (Custom)
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.asr-custom",
    name: "ASR (Custom)",
    category: "audio-speech",
    description: "Run automatic speech recognition with a custom Wav2Vec2 or HuBERT model",
    tags: ["audio", "asr", "wav2vec2", "hubert", "custom", "transformers"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true, description: "16kHz mono waveform" },
    ],
    outputs: [
      { id: "transcription", name: "Transcription", type: "text", required: true },
      { id: "logits", name: "Logits", type: "tensor", required: true },
    ],
    parameters: [
      { id: "model_id", name: "Model ID", type: "string", default: "facebook/wav2vec2-base-960h", placeholder: "HuggingFace model ID" },
      { id: "use_lm", name: "Use Language Model Decoding", type: "boolean", default: false },
    ],
    codeTemplate: {
      imports: ["from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor", "import torch"],
      body: `_processor = Wav2Vec2Processor.from_pretrained("{{params.model_id}}")
_asr_model = Wav2Vec2ForCTC.from_pretrained("{{params.model_id}}")
_asr_model.eval()
_input_values = _processor({{inputs.waveform}}.squeeze().numpy(), sampling_rate=16000, return_tensors="pt").input_values
with torch.no_grad():
    {{outputs.logits}} = _asr_model(_input_values).logits
_predicted_ids = torch.argmax({{outputs.logits}}, dim=-1)
{{outputs.transcription}} = _processor.batch_decode(_predicted_ids)[0]`,
      outputBindings: { transcription: "asr_text", logits: "asr_logits" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 9. TTS Block
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.tts",
    name: "TTS Block",
    category: "audio-speech",
    description: "Synthesize speech from text using SpeechBrain or a HuggingFace TTS model",
    tags: ["audio", "tts", "text-to-speech", "synthesis", "speechbrain"],
    inputs: [
      { id: "text", name: "Input Text", type: "text", required: true },
    ],
    outputs: [
      { id: "waveform", name: "Synthesized Audio", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    parameters: [
      { id: "model_source", name: "Model Source", type: "select", default: "speechbrain/tts-tacotron2-ljspeech", options: [{ label: "Tacotron2 (LJSpeech)", value: "speechbrain/tts-tacotron2-ljspeech" }, { label: "FastSpeech2 (LJSpeech)", value: "speechbrain/tts-fastspeech2-ljspeech" }, { label: "Microsoft SpeechT5", value: "microsoft/speecht5_tts" }] },
      { id: "vocoder", name: "Vocoder", type: "select", default: "speechbrain/tts-hifigan-ljspeech", options: [{ label: "HiFi-GAN (LJSpeech)", value: "speechbrain/tts-hifigan-ljspeech" }, { label: "None (model has built-in)", value: "none" }] },
    ],
    codeTemplate: {
      imports: ["from speechbrain.inference.TTS import Tacotron2", "from speechbrain.inference.vocoders import HIFIGAN"],
      body: `_tts_model = Tacotron2.from_hparams(source="{{params.model_source}}", savedir="/tmp/tts_model")
_vocoder = HIFIGAN.from_hparams(source="{{params.vocoder}}", savedir="/tmp/tts_vocoder") if "{{params.vocoder}}" != "none" else None
_mel_output, _mel_length, _alignment = _tts_model.encode_text({{inputs.text}})
if _vocoder is not None:
    {{outputs.waveform}} = _vocoder.decode_batch(_mel_output).squeeze(0)
else:
    {{outputs.waveform}} = _mel_output
{{outputs.sample_rate}} = 22050`,
      outputBindings: { waveform: "tts_waveform", sample_rate: "tts_sample_rate" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 10. Speaker Embed
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.speaker-embed",
    name: "Speaker Embed",
    category: "audio-speech",
    description: "Extract speaker embedding vectors using SpeechBrain ECAPA-TDNN",
    tags: ["audio", "speaker", "embedding", "verification", "speechbrain", "ecapa"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true, description: "16kHz mono waveform" },
    ],
    outputs: [
      { id: "embedding", name: "Speaker Embedding", type: "embedding", required: true },
    ],
    parameters: [
      { id: "model_source", name: "Model", type: "select", default: "speechbrain/spkrec-ecapa-voxceleb", options: [{ label: "ECAPA-TDNN (VoxCeleb)", value: "speechbrain/spkrec-ecapa-voxceleb" }, { label: "X-Vector (VoxCeleb)", value: "speechbrain/spkrec-xvect-voxceleb" }] },
      { id: "normalize", name: "L2 Normalize", type: "boolean", default: true },
    ],
    codeTemplate: {
      imports: ["from speechbrain.inference.speaker import EncoderClassifier", "import torch.nn.functional as F"],
      body: `_spk_model = EncoderClassifier.from_hparams(source="{{params.model_source}}", savedir="/tmp/spk_model")
{{outputs.embedding}} = _spk_model.encode_batch({{inputs.waveform}}).squeeze()
if {{params.normalize}}:
    {{outputs.embedding}} = F.normalize({{outputs.embedding}}, p=2, dim=-1)`,
      outputBindings: { embedding: "speaker_embedding" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 11. Speaker Diarization
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.speaker-diarization",
    name: "Speaker Diarization",
    category: "audio-speech",
    description: "Segment audio by speaker identity using pyannote.audio",
    tags: ["audio", "speaker", "diarization", "pyannote", "segmentation"],
    inputs: [
      { id: "file_path", name: "Audio File Path", type: "path", required: true },
    ],
    outputs: [
      { id: "diarization", name: "Diarization Result", type: "any", required: true },
      { id: "segments", name: "Speaker Segments", type: "list", required: true },
    ],
    parameters: [
      { id: "num_speakers", name: "Number of Speakers (0 = auto)", type: "number", default: 0, min: 0, max: 20, step: 1 },
      { id: "hf_token", name: "HuggingFace Token", type: "string", default: "", placeholder: "Required for pyannote models", advanced: true },
    ],
    codeTemplate: {
      imports: ["from pyannote.audio import Pipeline"],
      body: `_diar_pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", use_auth_token="{{params.hf_token}}" or None)
_num_spk = {{params.num_speakers}} if {{params.num_speakers}} > 0 else None
{{outputs.diarization}} = _diar_pipeline({{inputs.file_path}}, num_speakers=_num_spk)
{{outputs.segments}} = [
    {"start": turn.start, "end": turn.end, "speaker": speaker}
    for turn, _, speaker in {{outputs.diarization}}.itertracks(yield_label=True)
]`,
      outputBindings: { diarization: "diarization_result", segments: "speaker_segments" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 12. Audio Classify
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.audio-classify",
    name: "Audio Classify",
    category: "audio-speech",
    description: "Classify audio into categories (e.g., environmental sounds) using a pretrained model",
    tags: ["audio", "classification", "transformers", "ast"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
    ],
    outputs: [
      { id: "predictions", name: "Predictions", type: "list", required: true },
      { id: "top_label", name: "Top Label", type: "text", required: true },
    ],
    parameters: [
      { id: "model_id", name: "Model ID", type: "string", default: "MIT/ast-finetuned-audioset-10-10-0.4593", placeholder: "HuggingFace model ID" },
      { id: "top_k", name: "Top K Results", type: "number", default: 5, min: 1, max: 50, step: 1 },
    ],
    codeTemplate: {
      imports: ["from transformers import pipeline"],
      body: `_audio_clf = pipeline("audio-classification", model="{{params.model_id}}")
_clf_input = {{inputs.waveform}}.squeeze().numpy()
{{outputs.predictions}} = _audio_clf(_clf_input, top_k={{params.top_k}})
{{outputs.top_label}} = {{outputs.predictions}}[0]["label"]`,
      outputBindings: { predictions: "audio_predictions", top_label: "audio_top_label" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 13. Music Separate
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.music-separate",
    name: "Music Separate",
    category: "audio-speech",
    description: "Separate audio into stems (vocals, drums, bass, other) using Demucs",
    tags: ["audio", "music", "separation", "demucs", "source-separation"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true, description: "Stereo or mono audio tensor" },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "vocals", name: "Vocals", type: "audio", required: true },
      { id: "drums", name: "Drums", type: "audio", required: true },
      { id: "bass", name: "Bass", type: "audio", required: true },
      { id: "other", name: "Other", type: "audio", required: true },
    ],
    parameters: [
      { id: "model_name", name: "Demucs Model", type: "select", default: "htdemucs", options: [{ label: "HTDemucs (default)", value: "htdemucs" }, { label: "HTDemucs FT", value: "htdemucs_ft" }, { label: "MDX Extra", value: "mdx_extra" }] },
      { id: "shifts", name: "Random Shifts", type: "number", default: 1, min: 0, max: 10, step: 1, description: "More shifts = better quality but slower", advanced: true },
    ],
    codeTemplate: {
      imports: ["import torch", "from demucs.pretrained import get_model", "from demucs.apply import apply_model"],
      body: `_demucs = get_model("{{params.model_name}}")
_demucs.eval()
_wav_input = {{inputs.waveform}}.unsqueeze(0) if {{inputs.waveform}}.dim() == 2 else {{inputs.waveform}}
if _wav_input.shape[1] == 1:
    _wav_input = _wav_input.repeat(1, 2, 1)
with torch.no_grad():
    _sources = apply_model(_demucs, _wav_input, shifts={{params.shifts}})
{{outputs.drums}} = _sources[0, 0]
{{outputs.bass}} = _sources[0, 1]
{{outputs.other}} = _sources[0, 2]
{{outputs.vocals}} = _sources[0, 3]`,
      outputBindings: { vocals: "vocals_stem", drums: "drums_stem", bass: "bass_stem", other: "other_stem" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 14. Noise Reduce
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.noise-reduce",
    name: "Noise Reduce",
    category: "audio-speech",
    description: "Reduce background noise in audio using spectral gating or a neural denoiser",
    tags: ["audio", "noise", "denoise", "enhancement", "noisereduce"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "clean_waveform", name: "Cleaned Waveform", type: "audio", required: true },
    ],
    parameters: [
      { id: "method", name: "Method", type: "select", default: "spectral_gating", options: [{ label: "Spectral Gating", value: "spectral_gating" }, { label: "Stationary Noise", value: "stationary" }, { label: "Non-stationary Noise", value: "non_stationary" }] },
      { id: "prop_decrease", name: "Noise Reduction Strength", type: "number", default: 1.0, min: 0.0, max: 1.0, step: 0.1 },
      { id: "n_fft", name: "FFT Size", type: "number", default: 2048, min: 256, max: 8192, step: 256, advanced: true },
    ],
    codeTemplate: {
      imports: ["import noisereduce as nr", "import numpy as np"],
      body: `_audio_np = {{inputs.waveform}}.squeeze().cpu().numpy()
_sr = int({{inputs.sample_rate}})
_stationary = "{{params.method}}" != "non_stationary"
_cleaned_np = nr.reduce_noise(
    y=_audio_np,
    sr=_sr,
    stationary=_stationary,
    prop_decrease={{params.prop_decrease}},
    n_fft={{params.n_fft}}
)
import torch as _torch
{{outputs.clean_waveform}} = _torch.from_numpy(_cleaned_np).unsqueeze(0).float()`,
      outputBindings: { clean_waveform: "clean_waveform" },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 15. Audio Augment
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "audio-speech.audio-augment",
    name: "Audio Augment",
    category: "audio-speech",
    description: "Apply audio augmentations (noise, pitch shift, time stretch) for training data diversity",
    tags: ["audio", "augmentation", "training", "torch-audiomentations"],
    inputs: [
      { id: "waveform", name: "Waveform", type: "audio", required: true },
      { id: "sample_rate", name: "Sample Rate", type: "number", required: true },
    ],
    outputs: [
      { id: "augmented", name: "Augmented Waveform", type: "audio", required: true },
    ],
    parameters: [
      { id: "add_noise", name: "Add Gaussian Noise", type: "boolean", default: true },
      { id: "noise_snr_db", name: "Noise SNR (dB)", type: "number", default: 15, min: 0, max: 40, step: 1 },
      { id: "pitch_shift", name: "Pitch Shift", type: "boolean", default: false },
      { id: "pitch_semitones", name: "Max Pitch Shift (semitones)", type: "number", default: 2, min: 0, max: 12, step: 1 },
      { id: "time_stretch", name: "Time Stretch", type: "boolean", default: false },
      { id: "speed_factor_min", name: "Speed Factor Min", type: "number", default: 0.8, min: 0.5, max: 1.0, step: 0.05 },
      { id: "speed_factor_max", name: "Speed Factor Max", type: "number", default: 1.2, min: 1.0, max: 2.0, step: 0.05 },
    ],
    codeTemplate: {
      imports: ["import torch", "import torchaudio.transforms as T", "import random", "import math"],
      body: `{{outputs.augmented}} = {{inputs.waveform}}.clone()
_sr = int({{inputs.sample_rate}})

if {{params.add_noise}}:
    _snr_db = {{params.noise_snr_db}}
    _signal_power = {{outputs.augmented}}.pow(2).mean()
    _noise_power = _signal_power / (10 ** (_snr_db / 10))
    _noise = torch.randn_like({{outputs.augmented}}) * _noise_power.sqrt()
    {{outputs.augmented}} = {{outputs.augmented}} + _noise

if {{params.pitch_shift}}:
    _semitones = random.uniform(-{{params.pitch_semitones}}, {{params.pitch_semitones}})
    _pitch_transform = T.PitchShift(_sr, _semitones)
    {{outputs.augmented}} = _pitch_transform({{outputs.augmented}})

if {{params.time_stretch}}:
    _speed = random.uniform({{params.speed_factor_min}}, {{params.speed_factor_max}})
    _stretch = T.SpeedPerturbation(_sr, [_speed])
    {{outputs.augmented}} = _stretch({{outputs.augmented}})[0]`,
      outputBindings: { augmented: "augmented_audio" },
    },
  },
];
