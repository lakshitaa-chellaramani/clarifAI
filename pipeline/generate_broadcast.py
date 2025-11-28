#!/usr/bin/env python3
"""
NewsAnchor Pro - Complete Broadcast Generation Pipeline
Generates TTS audio with automatic lip-sync from text analysis.

No external tools required - uses built-in English phoneme patterns.

Usage:
    python generate_broadcast.py --input segments.json --output ./output
    python generate_broadcast.py --input segments.json --output ./output --voice en-GB-SoniaNeural
    python generate_broadcast.py --list-voices
    python generate_broadcast.py --sample my_script.json
"""

import json
import argparse
import asyncio
import os
import sys
from pathlib import Path
from datetime import datetime
import re

# Check for required packages
try:
    import edge_tts
except ImportError:
    print("ERROR: edge-tts not installed. Run: pip install edge-tts --break-system-packages")
    sys.exit(1)

# CMU Phoneme to Oculus Viseme mapping
# Based on standard phoneme-to-viseme mappings
PHONEME_TO_VISEME = {
    # Vowels
    'AA': 'aa',   # father
    'AE': 'aa',   # cat
    'AH': 'aa',   # but
    'AO': 'O',    # caught
    'AW': 'O',    # cow
    'AX': 'aa',   # about (schwa)
    'AY': 'aa',   # bite
    'EH': 'E',    # bet
    'ER': 'E',    # bird
    'EY': 'E',    # bait
    'IH': 'I',    # bit
    'IX': 'I',    # roses
    'IY': 'I',    # beat
    'OW': 'O',    # boat
    'OY': 'O',    # boy
    'UH': 'U',    # book
    'UW': 'U',    # boot
    'UX': 'U',    # dude
    
    # Consonants - Bilabial
    'P': 'PP',    # pat
    'B': 'PP',    # bat
    'M': 'PP',    # mat
    
    # Consonants - Labiodental
    'F': 'FF',    # fat
    'V': 'FF',    # vat
    
    # Consonants - Dental/Alveolar
    'TH': 'TH',   # think
    'DH': 'TH',   # that
    'T': 'DD',    # tap
    'D': 'DD',    # dad
    'N': 'nn',    # nap
    'S': 'SS',    # sat
    'Z': 'SS',    # zap
    'L': 'nn',    # lap
    
    # Consonants - Post-alveolar
    'SH': 'CH',   # ship
    'ZH': 'CH',   # measure
    'CH': 'CH',   # chat
    'JH': 'CH',   # judge
    'R': 'RR',    # rat
    
    # Consonants - Velar/Glottal
    'K': 'kk',    # cat
    'G': 'kk',    # gap
    'NG': 'kk',   # sing
    'HH': 'kk',   # hat
    'W': 'U',     # wet
    'Y': 'I',     # yes
    
    # Silence
    ' ': 'sil',
    '': 'sil',
}

# Oculus Viseme durations (in seconds) - typical speaking rate
VISEME_DURATIONS = {
    'sil': 0.08,
    'PP': 0.08,
    'FF': 0.10,
    'TH': 0.09,
    'DD': 0.07,
    'kk': 0.08,
    'CH': 0.10,
    'SS': 0.10,
    'nn': 0.08,
    'RR': 0.08,
    'aa': 0.12,
    'E': 0.10,
    'I': 0.10,
    'O': 0.12,
    'U': 0.11,
}

# Available Edge-TTS voices
VOICES = {
    'en-US-JennyNeural': {'gender': 'F', 'style': 'news'},
    'en-US-AriaNeural': {'gender': 'F', 'style': 'professional'},
    'en-US-GuyNeural': {'gender': 'M', 'style': 'news'},
    'en-US-DavisNeural': {'gender': 'M', 'style': 'professional'},
    'en-US-JaneNeural': {'gender': 'F', 'style': 'friendly'},
    'en-US-JasonNeural': {'gender': 'M', 'style': 'friendly'},
    'en-US-SaraNeural': {'gender': 'F', 'style': 'cheerful'},
    'en-US-TonyNeural': {'gender': 'M', 'style': 'cheerful'},
    'en-GB-SoniaNeural': {'gender': 'F', 'style': 'news'},
    'en-GB-RyanNeural': {'gender': 'M', 'style': 'news'},
    'en-GB-LibbyNeural': {'gender': 'F', 'style': 'friendly'},
    'en-AU-NatashaNeural': {'gender': 'F', 'style': 'news'},
    'en-AU-WilliamNeural': {'gender': 'M', 'style': 'news'},
    'en-IN-NeerjaNeural': {'gender': 'F', 'style': 'news'},
    'en-IN-PrabhatNeural': {'gender': 'M', 'style': 'news'},
}


def text_to_phonemes(text: str) -> list:
    """
    Convert text to phoneme-like sequence using English letter patterns.
    This is a simplified approach that maps letter combinations to phonemes.
    """
    text = text.lower().strip()
    
    # Common English grapheme-to-phoneme patterns (simplified)
    patterns = [
        # Multi-letter patterns first
        (r'tion', ['SH', 'AH', 'N']),
        (r'sion', ['ZH', 'AH', 'N']),
        (r'ough', ['AH', 'F']),
        (r'ight', ['AY', 'T']),
        (r'ould', ['UH', 'D']),
        (r'ould', ['UH', 'D']),
        (r'th', ['TH']),
        (r'sh', ['SH']),
        (r'ch', ['CH']),
        (r'wh', ['W']),
        (r'ck', ['K']),
        (r'ng', ['NG']),
        (r'ph', ['F']),
        (r'gh', []),  # Often silent
        (r'wr', ['R']),
        (r'kn', ['N']),
        (r'mb', ['M']),
        (r'qu', ['K', 'W']),
        (r'ee', ['IY']),
        (r'ea', ['IY']),
        (r'oo', ['UW']),
        (r'ou', ['AW']),
        (r'ow', ['OW']),
        (r'ai', ['EY']),
        (r'ay', ['EY']),
        (r'oi', ['OY']),
        (r'oy', ['OY']),
        (r'au', ['AO']),
        (r'aw', ['AO']),
        (r'ie', ['IY']),
        (r'ue', ['UW']),
        # Single letters
        (r'a', ['AE']),
        (r'e', ['EH']),
        (r'i', ['IH']),
        (r'o', ['AA']),
        (r'u', ['AH']),
        (r'y', ['IY']),
        (r'b', ['B']),
        (r'c', ['K']),
        (r'd', ['D']),
        (r'f', ['F']),
        (r'g', ['G']),
        (r'h', ['HH']),
        (r'j', ['JH']),
        (r'k', ['K']),
        (r'l', ['L']),
        (r'm', ['M']),
        (r'n', ['N']),
        (r'p', ['P']),
        (r'r', ['R']),
        (r's', ['S']),
        (r't', ['T']),
        (r'v', ['V']),
        (r'w', ['W']),
        (r'x', ['K', 'S']),
        (r'z', ['Z']),
    ]
    
    phonemes = []
    i = 0
    
    while i < len(text):
        matched = False
        
        # Try to match patterns from longest to shortest
        for pattern, phones in patterns:
            if text[i:i+len(pattern)] == pattern:
                phonemes.extend(phones)
                i += len(pattern)
                matched = True
                break
        
        if not matched:
            # Skip non-alphabetic characters, add silence for spaces/punctuation
            if text[i] in ' .,!?;:':
                phonemes.append(' ')
            i += 1
    
    return phonemes


def phonemes_to_visemes(phonemes: list) -> list:
    """Convert phoneme sequence to viseme sequence."""
    visemes = []
    for phoneme in phonemes:
        # Look up viseme
        viseme = PHONEME_TO_VISEME.get(phoneme.upper(), 'sil')
        visemes.append(viseme)
    
    return visemes


def generate_viseme_timing(visemes: list, duration: float, sample_rate: int = 22050) -> dict:
    """
    Generate timing data for visemes to match audio duration.
    Returns TalkingHead-compatible format.
    """
    if not visemes:
        return {'visemes': ['sil'], 'vtimes': [0], 'vdurations': [int(duration * sample_rate)]}
    
    # Calculate base duration per viseme
    num_visemes = len(visemes)
    time_per_viseme = duration / num_visemes
    
    vtimes = []
    vdurations = []
    
    current_time = 0
    for i, viseme in enumerate(visemes):
        # Get expected duration for this viseme type
        expected_duration = VISEME_DURATIONS.get(viseme, 0.08)
        
        # Scale to fit total duration
        scaled_duration = time_per_viseme
        
        # Convert to samples
        start_sample = int(current_time * sample_rate)
        duration_samples = int(scaled_duration * sample_rate)
        
        vtimes.append(start_sample)
        vdurations.append(duration_samples)
        
        current_time += scaled_duration
    
    return {
        'visemes': visemes,
        'vtimes': vtimes,
        'vdurations': vdurations,
        'sampleRate': sample_rate
    }


def generate_lipsync_from_text(text: str, duration: float) -> dict:
    """
    Generate complete lip-sync data from text.
    
    Args:
        text: The text being spoken
        duration: Audio duration in seconds
    
    Returns:
        TalkingHead-compatible lip-sync data
    """
    # Convert text to phonemes
    phonemes = text_to_phonemes(text)
    
    # Convert phonemes to visemes
    visemes = phonemes_to_visemes(phonemes)
    
    # Merge consecutive identical visemes
    merged_visemes = []
    for v in visemes:
        if not merged_visemes or merged_visemes[-1] != v:
            merged_visemes.append(v)
    
    # Add silence at start and end
    if merged_visemes[0] != 'sil':
        merged_visemes.insert(0, 'sil')
    if merged_visemes[-1] != 'sil':
        merged_visemes.append('sil')
    
    # Generate timing
    timing = generate_viseme_timing(merged_visemes, duration)
    
    return timing


async def generate_tts(text: str, output_path: str, voice: str = 'en-US-JennyNeural',
                       rate: str = '+0%', pitch: str = '+0Hz') -> float:
    """
    Generate TTS audio using Edge-TTS.
    Returns audio duration in seconds.
    """
    try:
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(output_path)
        
        # Get duration using pydub
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_mp3(output_path)
            duration = len(audio) / 1000.0  # Convert ms to seconds
        except:
            # Estimate duration if pydub fails
            word_count = len(text.split())
            duration = max(1.0, word_count / 2.5)  # ~2.5 words per second
        
        print(f"  ✓ Generated audio: {output_path} ({duration:.2f}s)")
        return duration
        
    except Exception as e:
        print(f"  ✗ TTS Error: {e}")
        return 0


async def process_segment(segment: dict, index: int, output_dir: str, voice: str) -> dict:
    """Process a single broadcast segment."""
    segment_id = segment.get('id', f'segment_{index:03d}')
    text = segment.get('text', '')
    mood = segment.get('mood', 'neutral')
    gestures = segment.get('gestures', [])
    view = segment.get('view', 'upper')
    rate = segment.get('rate', '+0%')
    pitch = segment.get('pitch', '+0Hz')
    pause_before = segment.get('pauseBefore', 0)
    pause_after = segment.get('pauseAfter', 0.5)
    
    if not text:
        print(f"  ⚠ Segment {index}: No text, skipping")
        return None
    
    print(f"\n📝 Processing segment {index}: {segment_id}")
    print(f"   Text: {text[:60]}{'...' if len(text) > 60 else ''}")
    
    # File paths
    audio_path = os.path.join(output_dir, f'{segment_id}.mp3')
    
    # Generate TTS
    duration = await generate_tts(text, audio_path, voice, rate, pitch)
    if duration == 0:
        return None
    
    # Generate lip-sync from phonemes
    print(f"  ⚡ Generating lip-sync from phonemes...")
    lipsync_data = generate_lipsync_from_text(text, duration)
    print(f"  ✓ Generated {len(lipsync_data['visemes'])} visemes")
    
    # Save lip-sync data
    lipsync_path = os.path.join(output_dir, f'{segment_id}_lipsync.json')
    with open(lipsync_path, 'w') as f:
        json.dump(lipsync_data, f, indent=2)
    
    return {
        'id': segment_id,
        'index': index,
        'text': text,
        'audioFile': f'{segment_id}.mp3',
        'lipsyncFile': f'{segment_id}_lipsync.json',
        'duration': duration,
        'mood': mood,
        'gestures': gestures,
        'view': view,
        'pauseBefore': pause_before,
        'pauseAfter': pause_after,
        'lipsync': lipsync_data
    }


async def process_broadcast(input_file: str, output_dir: str, voice: str):
    """Process entire broadcast from JSON input."""
    print(f"\n📂 Loading input: {input_file}")
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    # Handle both list format and object with segments key
    if isinstance(data, list):
        segments = data
        metadata = {}
    else:
        segments = data.get('segments', data.get('items', []))
        metadata = {k: v for k, v in data.items() if k not in ['segments', 'items']}
    
    if not segments:
        print("❌ No segments found in input file")
        return
    
    print(f"📊 Found {len(segments)} segments")
    print(f"🎤 Using voice: {voice}")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Process each segment
    processed_segments = []
    for i, segment in enumerate(segments):
        result = await process_segment(segment, i, output_dir, voice)
        if result:
            processed_segments.append(result)
    
    # Calculate total duration
    total_duration = sum(
        s['duration'] + s.get('pauseBefore', 0) + s.get('pauseAfter', 0.5) 
        for s in processed_segments
    )
    
    # Create broadcast manifest
    manifest = {
        'version': '2.0',
        'generated': datetime.now().isoformat(),
        'voice': voice,
        'totalSegments': len(processed_segments),
        'totalDuration': total_duration,
        'metadata': metadata,
        'segments': processed_segments
    }
    
    # Save manifest
    manifest_path = os.path.join(output_dir, 'broadcast.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"✅ Broadcast generated successfully!")
    print(f"{'='*50}")
    print(f"   Output directory: {output_dir}")
    print(f"   Manifest: {manifest_path}")
    print(f"   Total segments: {len(processed_segments)}")
    print(f"   Total duration: {total_duration:.1f}s ({total_duration/60:.1f} min)")
    print(f"\n📺 To play:")
    print(f"   1. Start a local server: python -m http.server 8000")
    print(f"   2. Open: http://localhost:8000/news-anchor-pro/")
    print(f"   3. Load: {manifest_path}")
    
    return manifest


def list_voices():
    """List available voices."""
    print("\n🎤 Available Edge-TTS Voices:\n")
    
    regions = {}
    for voice_id, info in VOICES.items():
        region = voice_id.split('-')[1]
        if region not in regions:
            regions[region] = []
        regions[region].append((voice_id, info))
    
    region_names = {
        'US': '🇺🇸 United States',
        'GB': '🇬🇧 United Kingdom',
        'AU': '🇦🇺 Australia',
        'IN': '🇮🇳 India'
    }
    
    for region, voices in sorted(regions.items()):
        print(f"{region_names.get(region, region)}:")
        for voice_id, info in voices:
            gender = '♀' if info['gender'] == 'F' else '♂'
            print(f"  {gender} {voice_id} ({info['style']})")
        print()


def create_sample_input(output_path: str):
    """Create a sample input JSON file."""
    sample = [
        {
            "id": "intro",
            "text": "Good evening and welcome to the evening news. I'm Sarah, and here are tonight's top stories.",
            "mood": "neutral",
            "view": "upper",
            "gestures": ["👋"],
            "pauseAfter": 1.0
        },
        {
            "id": "story_1",
            "text": "In breaking news tonight, scientists have announced a major breakthrough in renewable energy technology.",
            "mood": "neutral",
            "view": "upper",
            "gestures": [],
            "pauseAfter": 0.5
        },
        {
            "id": "story_1_detail",
            "text": "The new solar panel design promises to be thirty percent more efficient than current models.",
            "mood": "happy",
            "view": "mid",
            "gestures": ["👍"],
            "pauseAfter": 1.0
        },
        {
            "id": "transition",
            "text": "Moving on to international news.",
            "mood": "neutral",
            "view": "upper",
            "gestures": [],
            "pauseAfter": 0.5
        },
        {
            "id": "story_2",
            "text": "World leaders gathered today for the annual climate summit, discussing new targets for emissions reduction.",
            "mood": "neutral",
            "view": "upper",
            "gestures": [],
            "pauseAfter": 0.5
        },
        {
            "id": "outro",
            "text": "That's all for tonight's news. Thank you for watching, and we'll see you tomorrow. Good night.",
            "mood": "happy",
            "view": "upper",
            "gestures": ["👋"],
            "pauseAfter": 0
        }
    ]
    
    with open(output_path, 'w') as f:
        json.dump(sample, f, indent=2)
    
    print(f"✅ Sample input created: {output_path}")
    print(f"\nEdit this file and run:")
    print(f"  python generate_broadcast.py --input {output_path} --output ./output")


def main():
    parser = argparse.ArgumentParser(
        description='NewsAnchor Pro - Generate broadcast with TTS and lip-sync',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_broadcast.py --input segments.json --output ./output
  python generate_broadcast.py --input segments.json --output ./output --voice en-GB-SoniaNeural
  python generate_broadcast.py --sample my_script.json
  python generate_broadcast.py --list-voices

Input JSON Format (list of segments):
[
  {
    "id": "intro",
    "text": "Hello and welcome to the news.",
    "mood": "neutral",      // neutral, happy, sad, angry, fear, surprise
    "view": "upper",        // full, upper, mid, head
    "gestures": ["👋"],     // emoji gestures
    "pauseBefore": 0,       // seconds
    "pauseAfter": 0.5       // seconds
  }
]
        """
    )
    
    parser.add_argument('--input', '-i', help='Input JSON file with segments')
    parser.add_argument('--output', '-o', default='./output', help='Output directory')
    parser.add_argument('--voice', '-v', default='en-US-JennyNeural',
                        help='Edge-TTS voice (default: en-US-JennyNeural)')
    parser.add_argument('--list-voices', action='store_true', help='List available voices')
    parser.add_argument('--sample', metavar='FILE', help='Create sample input JSON file')
    
    args = parser.parse_args()
    
    if args.list_voices:
        list_voices()
        return
    
    if args.sample:
        create_sample_input(args.sample)
        return
    
    if not args.input:
        parser.print_help()
        print("\n❌ Error: --input is required")
        return
    
    if not os.path.exists(args.input):
        print(f"❌ Input file not found: {args.input}")
        return
    
    # Validate voice
    if args.voice not in VOICES:
        print(f"⚠ Voice '{args.voice}' not in presets, using anyway")
    
    # Run the pipeline
    asyncio.run(process_broadcast(args.input, args.output, args.voice))


if __name__ == '__main__':
    main()
