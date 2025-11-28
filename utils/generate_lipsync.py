#!/usr/bin/env python3
"""
AI News Anchor - Lip Sync & TTS Utility

This script provides utilities for:
1. Generating TTS audio from text using various engines
2. Creating lip-sync data using Rhubarb Lip Sync
3. Batch processing multiple scripts

Requirements:
    pip install pyttsx3 edge-tts gtts
    
For Rhubarb Lip Sync:
    Download from: https://github.com/DanielSWolf/rhubarb-lip-sync/releases
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from typing import Optional, Dict, List
import asyncio

# ============================================================================
# Configuration
# ============================================================================

RHUBARB_PATH = os.getenv("RHUBARB_PATH", "rhubarb")
OUTPUT_DIR = Path("./output")

# Viseme mapping from Rhubarb to Oculus (used by TalkingHead)
VISEME_MAP = {
    'A': 'aa',   # "ah" sound
    'B': 'PP',   # closed lips
    'C': 'E',    # "eh" sound
    'D': 'aa',   # "ah" wide
    'E': 'O',    # "oh" sound
    'F': 'U',    # "oo" sound
    'G': 'FF',   # "f/v" sound
    'H': 'nn',   # "l" sound
    'X': 'sil'   # silence
}

# ============================================================================
# TTS Engines
# ============================================================================

def generate_tts_pyttsx3(text: str, output_path: str, voice_id: Optional[str] = None,
                         rate: int = 150, volume: float = 1.0) -> bool:
    """
    Generate TTS using pyttsx3 (offline, works on all platforms)
    """
    try:
        import pyttsx3
        
        engine = pyttsx3.init()
        
        # Set properties
        engine.setProperty('rate', rate)
        engine.setProperty('volume', volume)
        
        # Set voice if specified
        if voice_id:
            engine.setProperty('voice', voice_id)
        else:
            # Try to get a female voice
            voices = engine.getProperty('voices')
            for voice in voices:
                if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
                    engine.setProperty('voice', voice.id)
                    break
        
        # Save to file
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        
        return os.path.exists(output_path)
    
    except ImportError:
        print("pyttsx3 not installed. Run: pip install pyttsx3")
        return False
    except Exception as e:
        print(f"Error generating TTS with pyttsx3: {e}")
        return False


async def generate_tts_edge(text: str, output_path: str, 
                           voice: str = "en-US-AriaNeural",
                           rate: str = "+0%", pitch: str = "+0Hz") -> bool:
    """
    Generate TTS using Microsoft Edge TTS (free, high quality)
    
    Available voices:
    - en-US-AriaNeural (female)
    - en-US-JennyNeural (female)
    - en-US-GuyNeural (male)
    - en-GB-SoniaNeural (British female)
    """
    try:
        import edge_tts
        
        communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
        await communicate.save(output_path)
        
        return os.path.exists(output_path)
    
    except ImportError:
        print("edge-tts not installed. Run: pip install edge-tts")
        return False
    except Exception as e:
        print(f"Error generating TTS with edge-tts: {e}")
        return False


def generate_tts_gtts(text: str, output_path: str, 
                      lang: str = "en", slow: bool = False) -> bool:
    """
    Generate TTS using Google TTS (requires internet)
    """
    try:
        from gtts import gTTS
        
        tts = gTTS(text=text, lang=lang, slow=slow)
        tts.save(output_path)
        
        return os.path.exists(output_path)
    
    except ImportError:
        print("gtts not installed. Run: pip install gtts")
        return False
    except Exception as e:
        print(f"Error generating TTS with gtts: {e}")
        return False


# ============================================================================
# Lip Sync Generation
# ============================================================================

def generate_lipsync(audio_path: str, output_path: str,
                     transcript: Optional[str] = None,
                     recognizer: str = "pocketSphinx") -> Optional[Dict]:
    """
    Generate lip-sync data using Rhubarb Lip Sync
    
    Args:
        audio_path: Path to audio file (WAV, MP3, etc.)
        output_path: Path for output JSON file
        transcript: Optional transcript for better accuracy
        recognizer: "pocketSphinx" (English) or "phonetic" (language-independent)
    
    Returns:
        Parsed JSON data or None on failure
    """
    if not os.path.exists(audio_path):
        print(f"Audio file not found: {audio_path}")
        return None
    
    # Build command
    cmd = [
        RHUBARB_PATH,
        "-f", "json",
        "-o", output_path,
        "--recognizer", recognizer
    ]
    
    # Add transcript if provided
    if transcript:
        transcript_path = output_path.replace('.json', '_transcript.txt')
        with open(transcript_path, 'w') as f:
            f.write(transcript)
        cmd.extend(["-d", transcript_path])
    
    cmd.append(audio_path)
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            print(f"Rhubarb error: {result.stderr}")
            return None
        
        # Read and return the generated JSON
        with open(output_path, 'r') as f:
            return json.load(f)
    
    except FileNotFoundError:
        print(f"Rhubarb not found at: {RHUBARB_PATH}")
        print("Download from: https://github.com/DanielSWolf/rhubarb-lip-sync/releases")
        return None
    except subprocess.TimeoutExpired:
        print("Rhubarb timed out")
        return None
    except json.JSONDecodeError:
        print("Failed to parse Rhubarb output")
        return None


def convert_to_oculus_visemes(rhubarb_data: Dict) -> Dict:
    """
    Convert Rhubarb visemes to Oculus format for TalkingHead
    """
    if not rhubarb_data or 'mouthCues' not in rhubarb_data:
        return rhubarb_data
    
    converted_cues = []
    for cue in rhubarb_data['mouthCues']:
        converted_cues.append({
            'start': cue['start'],
            'end': cue['end'],
            'rhubarb': cue['value'],
            'oculus': VISEME_MAP.get(cue['value'], 'sil')
        })
    
    return {
        'metadata': rhubarb_data.get('metadata', {}),
        'mouthCues': converted_cues
    }


def generate_talkinghead_audio_object(audio_path: str, lipsync_data: Dict,
                                       sample_rate: int = 22050) -> Dict:
    """
    Generate an audio object compatible with TalkingHead's speakAudio method
    
    This creates the data structure needed for:
    head.speakAudio({ audio, visemes, vtimes, vdurations })
    """
    if not lipsync_data or 'mouthCues' not in lipsync_data:
        return {}
    
    visemes = []
    vtimes = []
    vdurations = []
    
    for cue in lipsync_data['mouthCues']:
        oculus_viseme = cue.get('oculus', VISEME_MAP.get(cue.get('value', 'X'), 'sil'))
        start_ms = int(cue['start'] * 1000)
        duration_ms = int((cue['end'] - cue['start']) * 1000)
        
        visemes.append(oculus_viseme)
        vtimes.append(start_ms)
        vdurations.append(duration_ms)
    
    return {
        'audioFile': audio_path,
        'sampleRate': sample_rate,
        'visemes': visemes,
        'vtimes': vtimes,
        'vdurations': vdurations
    }


# ============================================================================
# Batch Processing
# ============================================================================

def process_news_segment(script: str, segment_id: str, 
                         tts_engine: str = "edge",
                         voice: str = "en-US-AriaNeural") -> Dict:
    """
    Process a complete news segment: generate TTS and lip-sync data
    
    Args:
        script: The news script text
        segment_id: Unique identifier for this segment
        tts_engine: "edge", "pyttsx3", or "gtts"
        voice: Voice identifier (depends on engine)
    
    Returns:
        Dictionary with paths to generated files and metadata
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    audio_path = OUTPUT_DIR / f"{segment_id}.mp3"
    lipsync_path = OUTPUT_DIR / f"{segment_id}_lipsync.json"
    talkinghead_path = OUTPUT_DIR / f"{segment_id}_talkinghead.json"
    
    result = {
        'segment_id': segment_id,
        'script': script,
        'audio_path': None,
        'lipsync_path': None,
        'talkinghead_path': None,
        'success': False
    }
    
    # Generate TTS
    print(f"Generating TTS for segment: {segment_id}")
    
    if tts_engine == "edge":
        success = asyncio.run(generate_tts_edge(script, str(audio_path), voice))
    elif tts_engine == "pyttsx3":
        success = generate_tts_pyttsx3(script, str(audio_path))
    elif tts_engine == "gtts":
        success = generate_tts_gtts(script, str(audio_path))
    else:
        print(f"Unknown TTS engine: {tts_engine}")
        return result
    
    if not success:
        print(f"Failed to generate TTS for segment: {segment_id}")
        return result
    
    result['audio_path'] = str(audio_path)
    print(f"✓ Audio saved to: {audio_path}")
    
    # Generate lip-sync data
    print(f"Generating lip-sync data...")
    lipsync_data = generate_lipsync(str(audio_path), str(lipsync_path), script)
    
    if lipsync_data:
        result['lipsync_path'] = str(lipsync_path)
        print(f"✓ Lip-sync saved to: {lipsync_path}")
        
        # Convert to TalkingHead format
        converted_data = convert_to_oculus_visemes(lipsync_data)
        talkinghead_data = generate_talkinghead_audio_object(
            str(audio_path), converted_data
        )
        
        with open(talkinghead_path, 'w') as f:
            json.dump(talkinghead_data, f, indent=2)
        
        result['talkinghead_path'] = str(talkinghead_path)
        print(f"✓ TalkingHead data saved to: {talkinghead_path}")
        
        result['success'] = True
    else:
        print("⚠ Lip-sync generation failed (Rhubarb not available?)")
        print("  Audio file was still generated successfully.")
        result['success'] = True  # Partial success
    
    return result


def batch_process_scripts(scripts_file: str, tts_engine: str = "edge",
                          voice: str = "en-US-AriaNeural") -> List[Dict]:
    """
    Process multiple scripts from a JSON file
    
    Expected format:
    [
        {"id": "segment1", "script": "Good evening..."},
        {"id": "segment2", "script": "In other news..."}
    ]
    """
    with open(scripts_file, 'r') as f:
        scripts = json.load(f)
    
    results = []
    for item in scripts:
        segment_id = item.get('id', f"segment_{len(results)}")
        script = item.get('script', '')
        
        if not script:
            print(f"Skipping empty script: {segment_id}")
            continue
        
        result = process_news_segment(script, segment_id, tts_engine, voice)
        results.append(result)
    
    return results


# ============================================================================
# CLI Interface
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="AI News Anchor - Lip Sync & TTS Utility",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate TTS and lip-sync for a single script
  python generate_lipsync.py --text "Hello, welcome to the news." --output hello
  
  # Use a specific voice
  python generate_lipsync.py --text "Breaking news..." --voice en-GB-SoniaNeural --output breaking
  
  # Process just an audio file (generate lip-sync only)
  python generate_lipsync.py --audio ./recording.mp3 --output recording
  
  # Batch process multiple scripts
  python generate_lipsync.py --batch ./scripts.json
  
  # List available Edge TTS voices
  python generate_lipsync.py --list-voices
        """
    )
    
    parser.add_argument('--text', '-t', type=str, help='Text to convert to speech')
    parser.add_argument('--audio', '-a', type=str, help='Existing audio file for lip-sync only')
    parser.add_argument('--output', '-o', type=str, default='output', help='Output filename (without extension)')
    parser.add_argument('--engine', '-e', type=str, default='edge', 
                        choices=['edge', 'pyttsx3', 'gtts'],
                        help='TTS engine to use')
    parser.add_argument('--voice', '-v', type=str, default='en-US-AriaNeural',
                        help='Voice ID (for edge-tts)')
    parser.add_argument('--batch', '-b', type=str, help='JSON file with multiple scripts')
    parser.add_argument('--list-voices', action='store_true', help='List available Edge TTS voices')
    parser.add_argument('--transcript', type=str, help='Transcript file for better lip-sync accuracy')
    
    args = parser.parse_args()
    
    # List voices
    if args.list_voices:
        print("\nAvailable Edge TTS voices (English):\n")
        voices = [
            ("en-US-AriaNeural", "Female, US"),
            ("en-US-JennyNeural", "Female, US"),
            ("en-US-GuyNeural", "Male, US"),
            ("en-US-DavisNeural", "Male, US"),
            ("en-GB-SoniaNeural", "Female, British"),
            ("en-GB-RyanNeural", "Male, British"),
            ("en-AU-NatashaNeural", "Female, Australian"),
            ("en-IN-NeerjaNeural", "Female, Indian"),
        ]
        for voice_id, desc in voices:
            print(f"  {voice_id:25} - {desc}")
        print("\nFor full list, run: edge-tts --list-voices")
        return
    
    # Batch processing
    if args.batch:
        if not os.path.exists(args.batch):
            print(f"Batch file not found: {args.batch}")
            sys.exit(1)
        results = batch_process_scripts(args.batch, args.engine, args.voice)
        successful = sum(1 for r in results if r['success'])
        print(f"\n✓ Processed {successful}/{len(results)} segments")
        return
    
    # Single audio file (lip-sync only)
    if args.audio:
        if not os.path.exists(args.audio):
            print(f"Audio file not found: {args.audio}")
            sys.exit(1)
        
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        output_path = OUTPUT_DIR / f"{args.output}_lipsync.json"
        
        transcript = None
        if args.transcript and os.path.exists(args.transcript):
            with open(args.transcript, 'r') as f:
                transcript = f.read()
        
        lipsync_data = generate_lipsync(args.audio, str(output_path), transcript)
        
        if lipsync_data:
            print(f"✓ Lip-sync data saved to: {output_path}")
            
            # Also generate TalkingHead format
            converted = convert_to_oculus_visemes(lipsync_data)
            th_path = OUTPUT_DIR / f"{args.output}_talkinghead.json"
            th_data = generate_talkinghead_audio_object(args.audio, converted)
            
            with open(th_path, 'w') as f:
                json.dump(th_data, f, indent=2)
            print(f"✓ TalkingHead data saved to: {th_path}")
        else:
            print("✗ Failed to generate lip-sync data")
            sys.exit(1)
        return
    
    # Single text (TTS + lip-sync)
    if args.text:
        result = process_news_segment(args.text, args.output, args.engine, args.voice)
        if result['success']:
            print(f"\n✓ Segment processed successfully!")
            print(f"  Audio: {result['audio_path']}")
            if result['lipsync_path']:
                print(f"  Lip-sync: {result['lipsync_path']}")
                print(f"  TalkingHead: {result['talkinghead_path']}")
        else:
            print("\n✗ Failed to process segment")
            sys.exit(1)
        return
    
    # No valid arguments
    parser.print_help()


if __name__ == "__main__":
    main()
