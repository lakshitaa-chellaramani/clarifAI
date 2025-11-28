# Pre-recorded Audio

Place your pre-recorded audio files in this folder for use with custom lip-sync.

## Supported Formats

- **MP3** - Most compatible, good compression
- **WAV** - Uncompressed, best for lip-sync generation
- **OGG** - Open format, good quality
- **M4A** - Apple format, supported in most browsers

## Recommended Settings

- **Sample Rate**: 22050 Hz or 44100 Hz
- **Channels**: Mono (better for lip-sync) or Stereo
- **Bit Rate**: 128-320 kbps for MP3

## Workflow

### 1. Record Audio

Record your news script using:
- Professional recording software (Audacity, Adobe Audition)
- Online recording tools
- AI voice generators (ElevenLabs, Play.ht, etc.)

### 2. Generate Lip-sync Data

Use [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync) to generate viseme data:

```bash
# Install Rhubarb Lip Sync first
rhubarb -f json -o script_lipsync.json script.wav
```

For better accuracy, provide the transcript:
```bash
rhubarb -f json -d script.txt -o script_lipsync.json script.wav
```

### 3. Use in App

1. Go to the **Audio** tab
2. Upload your audio file
3. Upload the corresponding lip-sync JSON
4. Start broadcast

## Lip-sync JSON Format

Rhubarb outputs JSON in this format:

```json
{
  "metadata": {
    "soundFile": "script.wav",
    "duration": 5.23
  },
  "mouthCues": [
    { "start": 0.00, "end": 0.05, "value": "X" },
    { "start": 0.05, "end": 0.27, "value": "D" },
    { "start": 0.27, "end": 0.31, "value": "C" },
    { "start": 0.31, "end": 0.43, "value": "B" },
    { "start": 0.43, "end": 0.49, "value": "X" }
  ]
}
```

## Python Utility

Use the included Python script to generate TTS audio with lip-sync:

```bash
cd utils

# Generate TTS audio with lip-sync
python generate_lipsync.py --text "Hello, welcome to the news." --output hello

# Use a specific voice
python generate_lipsync.py --text "Breaking news..." --voice en-GB-SoniaNeural --output breaking

# Process existing audio
python generate_lipsync.py --audio ./recording.mp3 --output recording
```

See `utils/generate_lipsync.py` for full documentation.

## Tips

- Keep audio segments short (< 60 seconds) for best performance
- Use clear, well-paced speech for accurate lip-sync
- Avoid background music or noise in recordings
- Export at consistent sample rates across files
