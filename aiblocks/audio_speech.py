"""
aiblocks.audio_speech — Audio & Speech

Auto-generated from AI Blocks definitions.
Each function corresponds to one visual block.
"""

def load_audio(file_path=None, mono=True, normalize=True, backend='sox'):
    """Load an audio file from disk as a waveform tensor and sample rate
    
    Dependencies: pip install torchaudio
    
    Args:
        file_path (path) (required): Path to audio file (wav, mp3, flac, ogg)
    
    Parameters:
        mono (boolean, default=True): 
        normalize (boolean, default=True): 
        backend (select, default='sox'): 
    
    Returns:
        dict with keys:
            waveform (audio): 
            sample_rate (number): 
    """
    _imports = ['import torchaudio']
    _code = '{{outputs.waveform}}, {{outputs.sample_rate}} = torchaudio.load({{inputs.file_path}}, backend="{{params.backend}}")\nif {{params.mono}} and {{outputs.waveform}}.shape[0] > 1:\n    {{outputs.waveform}} = {{outputs.waveform}}.mean(dim=0, keepdim=True)\nif {{params.normalize}}:\n    {{outputs.waveform}} = {{outputs.waveform}} / ({{outputs.waveform}}.abs().max() + 1e-8)'
    
    _code = _code.replace("{{params.mono}}", str(mono))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{params.backend}}", str(backend))
    _code = _code.replace("{{inputs.file_path}}", "file_path")
    _code = _code.replace("{{outputs.waveform}}", "_out_waveform")
    _code = _code.replace("{{outputs.sample_rate}}", "_out_sample_rate")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["file_path"] = file_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"waveform": _ns.get("_out_waveform"), "sample_rate": _ns.get("_out_sample_rate")}


def resample_audio(waveform=None, orig_sr=None, target_sr=16000):
    """Resample an audio waveform to a target sample rate using torchaudio
    
    Dependencies: pip install torchaudio
    
    Args:
        waveform (audio) (required): 
        orig_sr (number) (required): 
    
    Parameters:
        target_sr (number, default=16000): 
    
    Returns:
        audio: 
    """
    _imports = ['import torchaudio.transforms as T']
    _code = '_resampler = T.Resample(orig_freq=int({{inputs.orig_sr}}), new_freq={{params.target_sr}})\n{{outputs.waveform_out}} = _resampler({{inputs.waveform}})'
    
    _code = _code.replace("{{params.target_sr}}", str(target_sr))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.orig_sr}}", "orig_sr")
    _code = _code.replace("{{outputs.waveform_out}}", "_out_waveform_out")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["orig_sr"] = orig_sr
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_waveform_out")


def mfcc_features(waveform=None, sample_rate=None, n_mfcc=13, n_fft=400, hop_length=160, n_mels=23):
    """Extract Mel-Frequency Cepstral Coefficients from an audio waveform
    
    Dependencies: pip install torchaudio
    
    Args:
        waveform (audio) (required): 
        sample_rate (number) (required): 
    
    Parameters:
        n_mfcc (number, default=13): 
        n_fft (number, default=400): 
        hop_length (number, default=160): 
        n_mels (number, default=23): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torchaudio.transforms as T']
    _code = '_mfcc_transform = T.MFCC(\n    sample_rate=int({{inputs.sample_rate}}),\n    n_mfcc={{params.n_mfcc}},\n    melkwargs={"n_fft": {{params.n_fft}}, "hop_length": {{params.hop_length}}, "n_mels": {{params.n_mels}}}\n)\n{{outputs.mfcc}} = _mfcc_transform({{inputs.waveform}})'
    
    _code = _code.replace("{{params.n_mfcc}}", str(n_mfcc))
    _code = _code.replace("{{params.n_fft}}", str(n_fft))
    _code = _code.replace("{{params.hop_length}}", str(hop_length))
    _code = _code.replace("{{params.n_mels}}", str(n_mels))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.sample_rate}}", "sample_rate")
    _code = _code.replace("{{outputs.mfcc}}", "_out_mfcc")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["sample_rate"] = sample_rate
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_mfcc")


def mel_spectrogram(waveform=None, sample_rate=None, n_fft=1024, hop_length=512, n_mels=80, power=2.0):
    """Compute a Mel-scaled spectrogram from an audio waveform
    
    Dependencies: pip install torchaudio
    
    Args:
        waveform (audio) (required): 
        sample_rate (number) (required): 
    
    Parameters:
        n_fft (number, default=1024): 
        hop_length (number, default=512): 
        n_mels (number, default=80): 
        power (number, default=2.0): 
    
    Returns:
        tensor: 
    """
    _imports = ['import torchaudio.transforms as T']
    _code = '_mel_spec = T.MelSpectrogram(\n    sample_rate=int({{inputs.sample_rate}}),\n    n_fft={{params.n_fft}},\n    hop_length={{params.hop_length}},\n    n_mels={{params.n_mels}},\n    power={{params.power}}\n)\n{{outputs.mel_spec}} = _mel_spec({{inputs.waveform}})'
    
    _code = _code.replace("{{params.n_fft}}", str(n_fft))
    _code = _code.replace("{{params.hop_length}}", str(hop_length))
    _code = _code.replace("{{params.n_mels}}", str(n_mels))
    _code = _code.replace("{{params.power}}", str(power))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.sample_rate}}", "sample_rate")
    _code = _code.replace("{{outputs.mel_spec}}", "_out_mel_spec")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["sample_rate"] = sample_rate
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_mel_spec")


def waveform_plot(waveform=None, sample_rate=None, title='Waveform', figsize_w=12, figsize_h=4):
    """Visualize an audio waveform as a matplotlib time-domain plot
    
    Dependencies: pip install matplotlib torch
    
    Args:
        waveform (audio) (required): 
        sample_rate (number) (required): 
    
    Parameters:
        title (string, default='Waveform'): 
        figsize_w (number, default=12): 
        figsize_h (number, default=4): 
    
    Returns:
        any: 
    """
    _imports = ['import matplotlib.pyplot as plt', 'import torch']
    _code = '_wav = {{inputs.waveform}}.squeeze().cpu()\n_sr = int({{inputs.sample_rate}})\n_time_axis = torch.arange(0, _wav.shape[-1]) / _sr\n{{outputs.figure}}, _ax = plt.subplots(figsize=({{params.figsize_w}}, {{params.figsize_h}}))\n_ax.plot(_time_axis.numpy(), _wav.numpy(), linewidth=0.5)\n_ax.set_xlabel("Time (s)")\n_ax.set_ylabel("Amplitude")\n_ax.set_title("{{params.title}}")\nplt.tight_layout()'
    
    _code = _code.replace("{{params.title}}", str(title))
    _code = _code.replace("{{params.figsize_w}}", str(figsize_w))
    _code = _code.replace("{{params.figsize_h}}", str(figsize_h))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.sample_rate}}", "sample_rate")
    _code = _code.replace("{{outputs.figure}}", "_out_figure")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["sample_rate"] = sample_rate
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_figure")


def vad(waveform=None, threshold=0.5, min_speech_ms=250, min_silence_ms=100):
    """Detect speech segments in audio using Silero VAD
    
    Dependencies: pip install torch
    
    Args:
        waveform (audio) (required): 16kHz mono waveform
    
    Parameters:
        threshold (number, default=0.5): 
        min_speech_ms (number, default=250): 
        min_silence_ms (number, default=100): 
    
    Returns:
        dict with keys:
            speech_timestamps (list): 
            has_speech (boolean): 
    """
    _imports = ['import torch']
    _code = '_vad_model, _vad_utils = torch.hub.load("snakers4/silero-vad", "silero_vad", force_reload=False)\n(_get_speech_timestamps, _, _, _, _) = _vad_utils\n{{outputs.speech_timestamps}} = _get_speech_timestamps(\n    {{inputs.waveform}}.squeeze(),\n    _vad_model,\n    threshold={{params.threshold}},\n    min_speech_duration_ms={{params.min_speech_ms}},\n    min_silence_duration_ms={{params.min_silence_ms}},\n    sampling_rate=16000\n)\n{{outputs.has_speech}} = len({{outputs.speech_timestamps}}) > 0'
    
    _code = _code.replace("{{params.threshold}}", str(threshold))
    _code = _code.replace("{{params.min_speech_ms}}", str(min_speech_ms))
    _code = _code.replace("{{params.min_silence_ms}}", str(min_silence_ms))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{outputs.speech_timestamps}}", "_out_speech_timestamps")
    _code = _code.replace("{{outputs.has_speech}}", "_out_has_speech")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"speech_timestamps": _ns.get("_out_speech_timestamps"), "has_speech": _ns.get("_out_has_speech")}


def asr_whisper(waveform=None, model_size='openai/whisper-base', language='en', return_timestamps=True):
    """Transcribe speech to text using OpenAI Whisper via Hugging Face transformers
    
    Dependencies: pip install torch transformers
    
    Args:
        waveform (audio) (required): 16kHz mono waveform
    
    Parameters:
        model_size (select, default='openai/whisper-base'): 
        language (string, default='en'): 
        return_timestamps (boolean, default=True): 
    
    Returns:
        dict with keys:
            transcription (text): 
            segments (list): 
    """
    _imports = ['from transformers import pipeline', 'import torch']
    _code = '_asr_pipe = pipeline(\n    "automatic-speech-recognition",\n    model="{{params.model_size}}",\n    device="cuda:0" if torch.cuda.is_available() else "cpu",\n    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32\n)\n_asr_result = _asr_pipe(\n    {{inputs.waveform}}.squeeze().numpy(),\n    generate_kwargs={"language": "{{params.language}}"},\n    return_timestamps={{params.return_timestamps}}\n)\n{{outputs.transcription}} = _asr_result["text"]\n{{outputs.segments}} = _asr_result.get("chunks", [])'
    
    _code = _code.replace("{{params.model_size}}", str(model_size))
    _code = _code.replace("{{params.language}}", str(language))
    _code = _code.replace("{{params.return_timestamps}}", str(return_timestamps))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{outputs.transcription}}", "_out_transcription")
    _code = _code.replace("{{outputs.segments}}", "_out_segments")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"transcription": _ns.get("_out_transcription"), "segments": _ns.get("_out_segments")}


def asr_custom(waveform=None, model_id='facebook/wav2vec2-base-960h', use_lm=False):
    """Run automatic speech recognition with a custom Wav2Vec2 or HuBERT model
    
    Dependencies: pip install torch transformers
    
    Args:
        waveform (audio) (required): 16kHz mono waveform
    
    Parameters:
        model_id (string, default='facebook/wav2vec2-base-960h'): 
        use_lm (boolean, default=False): 
    
    Returns:
        dict with keys:
            transcription (text): 
            logits (tensor): 
    """
    _imports = ['from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor', 'import torch']
    _code = '_processor = Wav2Vec2Processor.from_pretrained("{{params.model_id}}")\n_asr_model = Wav2Vec2ForCTC.from_pretrained("{{params.model_id}}")\n_asr_model.eval()\n_input_values = _processor({{inputs.waveform}}.squeeze().numpy(), sampling_rate=16000, return_tensors="pt").input_values\nwith torch.no_grad():\n    {{outputs.logits}} = _asr_model(_input_values).logits\n_predicted_ids = torch.argmax({{outputs.logits}}, dim=-1)\n{{outputs.transcription}} = _processor.batch_decode(_predicted_ids)[0]'
    
    _code = _code.replace("{{params.model_id}}", str(model_id))
    _code = _code.replace("{{params.use_lm}}", str(use_lm))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{outputs.transcription}}", "_out_transcription")
    _code = _code.replace("{{outputs.logits}}", "_out_logits")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"transcription": _ns.get("_out_transcription"), "logits": _ns.get("_out_logits")}


def tts(text=None, model_source='speechbrain/tts-tacotron2-ljspeech', vocoder='speechbrain/tts-hifigan-ljspeech'):
    """Synthesize speech from text using SpeechBrain or a HuggingFace TTS model
    
    Dependencies: pip install speechbrain
    
    Args:
        text (text) (required): 
    
    Parameters:
        model_source (select, default='speechbrain/tts-tacotron2-ljspeech'): 
        vocoder (select, default='speechbrain/tts-hifigan-ljspeech'): 
    
    Returns:
        dict with keys:
            waveform (audio): 
            sample_rate (number): 
    """
    _imports = ['from speechbrain.inference.TTS import Tacotron2', 'from speechbrain.inference.vocoders import HIFIGAN']
    _code = '_tts_model = Tacotron2.from_hparams(source="{{params.model_source}}", savedir="/tmp/tts_model")\n_vocoder = HIFIGAN.from_hparams(source="{{params.vocoder}}", savedir="/tmp/tts_vocoder") if "{{params.vocoder}}" != "none" else None\n_mel_output, _mel_length, _alignment = _tts_model.encode_text({{inputs.text}})\nif _vocoder is not None:\n    {{outputs.waveform}} = _vocoder.decode_batch(_mel_output).squeeze(0)\n "else":\n    {{outputs.waveform}} = _mel_output\n{{outputs.sample_rate}} = 22050'
    
    _code = _code.replace("{{params.model_source}}", str(model_source))
    _code = _code.replace("{{params.vocoder}}", str(vocoder))
    _code = _code.replace("{{inputs.text}}", "text")
    _code = _code.replace("{{outputs.waveform}}", "_out_waveform")
    _code = _code.replace("{{outputs.sample_rate}}", "_out_sample_rate")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["text"] = text
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"waveform": _ns.get("_out_waveform"), "sample_rate": _ns.get("_out_sample_rate")}


def speaker_embed(waveform=None, model_source='speechbrain/spkrec-ecapa-voxceleb', normalize=True):
    """Extract speaker embedding vectors using SpeechBrain ECAPA-TDNN
    
    Dependencies: pip install speechbrain torch
    
    Args:
        waveform (audio) (required): 16kHz mono waveform
    
    Parameters:
        model_source (select, default='speechbrain/spkrec-ecapa-voxceleb'): 
        normalize (boolean, default=True): 
    
    Returns:
        embedding: 
    """
    _imports = ['from speechbrain.inference.speaker import EncoderClassifier', 'import torch.nn.functional as F']
    _code = '_spk_model = EncoderClassifier.from_hparams(source="{{params.model_source}}", savedir="/tmp/spk_model")\n{{outputs.embedding}} = _spk_model.encode_batch({{inputs.waveform}}).squeeze()\nif {{params.normalize}}:\n    {{outputs.embedding}} = F.normalize({{outputs.embedding}}, p=2, dim=-1)'
    
    _code = _code.replace("{{params.model_source}}", str(model_source))
    _code = _code.replace("{{params.normalize}}", str(normalize))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{outputs.embedding}}", "_out_embedding")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_embedding")


def speaker_diarization(file_path=None, num_speakers=0, hf_token=''):
    """Segment audio by speaker identity using pyannote.audio
    
    Dependencies: pip install pyannote
    
    Args:
        file_path (path) (required): 
    
    Parameters:
        num_speakers (number, default=0): 
        hf_token (string, default=''): 
    
    Returns:
        dict with keys:
            diarization (any): 
            segments (list): 
    """
    _imports = ['from pyannote.audio import Pipeline']
    _code = '_diar_pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1", use_auth_token="{{params.hf_token}}" or None)\n_num_spk = {{params.num_speakers}} if {{params.num_speakers}} > 0 else None\n{{outputs.diarization}} = _diar_pipeline({{inputs.file_path}}, num_speakers=_num_spk)\n{{outputs.segments}} = [\n    {"start": turn.start, "end": turn.end, "speaker": speaker}\n    for turn, _, speaker in {{outputs.diarization}}.itertracks(yield_label=True)\n]'
    
    _code = _code.replace("{{params.num_speakers}}", str(num_speakers))
    _code = _code.replace("{{params.hf_token}}", str(hf_token))
    _code = _code.replace("{{inputs.file_path}}", "file_path")
    _code = _code.replace("{{outputs.diarization}}", "_out_diarization")
    _code = _code.replace("{{outputs.segments}}", "_out_segments")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["file_path"] = file_path
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"diarization": _ns.get("_out_diarization"), "segments": _ns.get("_out_segments")}


def audio_classify(waveform=None, model_id='MIT/ast-finetuned-audioset-10-10-0.4593', top_k=5):
    """Classify audio into categories (e.g., environmental sounds) using a pretrained model
    
    Dependencies: pip install transformers
    
    Args:
        waveform (audio) (required): 
    
    Parameters:
        model_id (string, default='MIT/ast-finetuned-audioset-10-10-0.4593'): 
        top_k (number, default=5): 
    
    Returns:
        dict with keys:
            predictions (list): 
            top_label (text): 
    """
    _imports = ['from transformers import pipeline']
    _code = '_audio_clf = pipeline("audio-classification", model="{{params.model_id}}")\n_clf_input = {{inputs.waveform}}.squeeze().numpy()\n{{outputs.predictions}} = _audio_clf(_clf_input, top_k={{params.top_k}})\n{{outputs.top_label}} = {{outputs.predictions}}[0]["label"]'
    
    _code = _code.replace("{{params.model_id}}", str(model_id))
    _code = _code.replace("{{params.top_k}}", str(top_k))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{outputs.predictions}}", "_out_predictions")
    _code = _code.replace("{{outputs.top_label}}", "_out_top_label")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"predictions": _ns.get("_out_predictions"), "top_label": _ns.get("_out_top_label")}


def music_separate(waveform=None, sample_rate=None, model_name='htdemucs', shifts=1):
    """Separate audio into stems (vocals, drums, bass, other) using Demucs
    
    Dependencies: pip install demucs torch
    
    Args:
        waveform (audio) (required): Stereo or mono audio tensor
        sample_rate (number) (required): 
    
    Parameters:
        model_name (select, default='htdemucs'): 
        shifts (number, default=1): More shifts = better quality but slower
    
    Returns:
        dict with keys:
            vocals (audio): 
            drums (audio): 
            bass (audio): 
            other (audio): 
    """
    _imports = ['import torch', 'from demucs.pretrained import get_model', 'from demucs.apply import apply_model']
    _code = '_demucs = get_model("{{params.model_name}}")\n_demucs.eval()\n_wav_input = {{inputs.waveform}}.unsqueeze(0) if {{inputs.waveform}}.dim() == 2 else {{inputs.waveform}}\nif _wav_input.shape[1] == 1:\n    _wav_input = _wav_input.repeat(1, 2, 1)\nwith torch.no_grad():\n    _sources = apply_model(_demucs, _wav_input, shifts={{params.shifts}})\n{{outputs.drums}} = _sources[0, 0]\n{{outputs.bass}} = _sources[0, 1]\n{{outputs.other}} = _sources[0, 2]\n{{outputs.vocals}} = _sources[0, 3]'
    
    _code = _code.replace("{{params.model_name}}", str(model_name))
    _code = _code.replace("{{params.shifts}}", str(shifts))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.sample_rate}}", "sample_rate")
    _code = _code.replace("{{outputs.vocals}}", "_out_vocals")
    _code = _code.replace("{{outputs.drums}}", "_out_drums")
    _code = _code.replace("{{outputs.bass}}", "_out_bass")
    _code = _code.replace("{{outputs.other}}", "_out_other")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["sample_rate"] = sample_rate
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return {"vocals": _ns.get("_out_vocals"), "drums": _ns.get("_out_drums"), "bass": _ns.get("_out_bass"), "other": _ns.get("_out_other")}


def noise_reduce(waveform=None, sample_rate=None, method='spectral_gating', prop_decrease=1.0, n_fft=2048):
    """Reduce background noise in audio using spectral gating or a neural denoiser
    
    Dependencies: pip install noisereduce numpy
    
    Args:
        waveform (audio) (required): 
        sample_rate (number) (required): 
    
    Parameters:
        method (select, default='spectral_gating'): 
        prop_decrease (number, default=1.0): 
        n_fft (number, default=2048): 
    
    Returns:
        audio: 
    """
    _imports = ['import noisereduce as nr', 'import numpy as np']
    _code = '_audio_np = {{inputs.waveform}}.squeeze().cpu().numpy()\n_sr = int({{inputs.sample_rate}})\n_stationary = "{{params.method}}" != "non_stationary"\n_cleaned_np = nr.reduce_noise(\n    y=_audio_np,\n    sr=_sr,\n    stationary=_stationary,\n    prop_decrease={{params.prop_decrease}},\n    n_fft={{params.n_fft}}\n)\nimport torch as _torch\n{{outputs.clean_waveform}} = _torch.from_numpy(_cleaned_np).unsqueeze(0).float()'
    
    _code = _code.replace("{{params.method}}", str(method))
    _code = _code.replace("{{params.prop_decrease}}", str(prop_decrease))
    _code = _code.replace("{{params.n_fft}}", str(n_fft))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.sample_rate}}", "sample_rate")
    _code = _code.replace("{{outputs.clean_waveform}}", "_out_clean_waveform")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["sample_rate"] = sample_rate
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_clean_waveform")


def audio_augment(waveform=None, sample_rate=None, add_noise=True, noise_snr_db=15, pitch_shift=False, pitch_semitones=2, time_stretch=False, speed_factor_min=0.8, speed_factor_max=1.2):
    """Apply audio augmentations (noise, pitch shift, time stretch) for training data diversity
    
    Dependencies: pip install torch torchaudio
    
    Args:
        waveform (audio) (required): 
        sample_rate (number) (required): 
    
    Parameters:
        add_noise (boolean, default=True): 
        noise_snr_db (number, default=15): 
        pitch_shift (boolean, default=False): 
        pitch_semitones (number, default=2): 
        time_stretch (boolean, default=False): 
        speed_factor_min (number, default=0.8): 
        speed_factor_max (number, default=1.2): 
    
    Returns:
        audio: 
    """
    _imports = ['import torch', 'import torchaudio.transforms as T', 'import random', 'import math']
    _code = '{{outputs.augmented}} = {{inputs.waveform}}.clone()\n_sr = int({{inputs.sample_rate}})\n\nif {{params.add_noise}}:\n    _snr_db = {{params.noise_snr_db}}\n    _signal_power = {{outputs.augmented}}.pow(2).mean()\n    _noise_power = _signal_power / (10 ** (_snr_db / 10))\n    _noise = torch.randn_like({{outputs.augmented}}) * _noise_power.sqrt()\n    {{outputs.augmented}} = {{outputs.augmented}} + _noise\n\nif {{params.pitch_shift}}:\n    _semitones = random.uniform(-{{params.pitch_semitones}}, {{params.pitch_semitones}})\n    _pitch_transform = T.PitchShift(_sr, _semitones)\n    {{outputs.augmented}} = _pitch_transform({{outputs.augmented}})\n\nif {{params.time_stretch}}:\n    _speed = random.uniform({{params.speed_factor_min}}, {{params.speed_factor_max}})\n    _stretch = T.SpeedPerturbation(_sr, [_speed])\n    {{outputs.augmented}} = _stretch({{outputs.augmented}})[0]'
    
    _code = _code.replace("{{params.add_noise}}", str(add_noise))
    _code = _code.replace("{{params.noise_snr_db}}", str(noise_snr_db))
    _code = _code.replace("{{params.pitch_shift}}", str(pitch_shift))
    _code = _code.replace("{{params.pitch_semitones}}", str(pitch_semitones))
    _code = _code.replace("{{params.time_stretch}}", str(time_stretch))
    _code = _code.replace("{{params.speed_factor_min}}", str(speed_factor_min))
    _code = _code.replace("{{params.speed_factor_max}}", str(speed_factor_max))
    _code = _code.replace("{{inputs.waveform}}", "waveform")
    _code = _code.replace("{{inputs.sample_rate}}", "sample_rate")
    _code = _code.replace("{{outputs.augmented}}", "_out_augmented")
    import re as _re
    _code = _re.sub(r"\{\{[^}]*\}\}", "None", _code)
    
    # Execute
    _ns = {}
    _ns["waveform"] = waveform
    _ns["sample_rate"] = sample_rate
    for _imp in _imports:
        exec(_imp, _ns)
    exec(_code, _ns)
    return _ns.get("_out_augmented")

