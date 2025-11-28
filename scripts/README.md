# Scripts Folder

This folder contains JSON script files that control the AI news anchor broadcast.

## JSON Script Format

You can use either a simple array format or a full object format.

### Simple Array Format (Recommended)

```json
[
    {
        "text": "Hello, welcome to the news.",
        "mood": "neutral",
        "view": "upper",
        "gesture": "wave"
    },
    {
        "text": "Here's our top story.",
        "mood": "happy",
        "view": "mid"
    }
]
```

### Full Object Format (With Metadata)

```json
{
    "title": "My Broadcast",
    "segments": [
        {
            "text": "Hello, welcome to the news.",
            "mood": "neutral",
            "view": "upper"
        }
    ]
}
```

## Segment Properties

| Property | Type | Options | Default | Description |
|----------|------|---------|---------|-------------|
| `text` | string | Any text | (required) | The text the avatar will speak |
| `mood` | string | neutral, happy, angry, sad, fear, disgust, love, sleep | neutral | Avatar's emotional expression |
| `view` | string | full, upper, mid, head | upper | Camera view/zoom level |
| `gesture` | string | wave, thumbsUp, think, nod, smile | null | Hand/body gesture to perform |
| `voice` | string | af_bella, af_nicole, am_adam, am_fenrir, etc. | af_bella | HeadTTS voice to use |
| `speed` | number | 0.5 - 2.0 | 1.0 | Speech speed multiplier |
| `delay` | number | Any ms value | 500 | Delay after this segment (ms) |

## Available Moods

| Mood | Emoji | Description |
|------|-------|-------------|
| neutral | 😐 | Default, calm expression |
| happy | 😊 | Smiling, positive |
| angry | 😠 | Frowning, intense |
| sad | 😢 | Downcast, melancholic |
| fear | 😨 | Worried, anxious |
| disgust | 🤢 | Displeased |
| love | 😍 | Warm, affectionate |
| sleep | 😴 | Eyes closed, relaxed |

## Available Gestures

| Gesture | Description |
|---------|-------------|
| wave | Hand wave greeting |
| thumbsUp | Thumbs up approval |
| think | Hand on chin, thinking pose |
| nod | Head nod |
| smile | Smile without changing mood |

## Available Views

| View | Description |
|------|-------------|
| full | Full body view (furthest) |
| upper | Upper body (default) |
| mid | Mid-shot, closer |
| head | Head close-up (closest) |

## Available Voices (HeadTTS)

### Female Voices
- `af_bella` - Bella (Female US) - Default
- `af_nicole` - Nicole (Female US)
- `af_sarah` - Sarah (Female US)
- `af_sky` - Sky (Female US)
- `bf_emma` - Emma (Female UK)
- `bf_isabella` - Isabella (Female UK)

### Male Voices
- `am_adam` - Adam (Male US)
- `am_michael` - Michael (Male US)
- `am_fenrir` - Fenrir (Male US)
- `bm_george` - George (Male UK)
- `bm_lewis` - Lewis (Male UK)

## Example Scripts

### Basic News Intro
```json
[
    {
        "text": "Good evening, I'm your news anchor.",
        "mood": "neutral",
        "view": "upper"
    },
    {
        "text": "Tonight, we have exciting news!",
        "mood": "happy",
        "gesture": "nod"
    }
]
```

### Interview Style
```json
[
    {
        "text": "Let me think about that question.",
        "mood": "neutral",
        "view": "mid",
        "gesture": "think"
    },
    {
        "text": "That's a great point!",
        "mood": "happy",
        "view": "head",
        "gesture": "thumbsUp"
    }
]
```

### Breaking News
```json
[
    {
        "text": "Breaking news just coming in!",
        "mood": "fear",
        "view": "head",
        "speed": 1.1
    },
    {
        "text": "Stay tuned for more details.",
        "mood": "neutral",
        "view": "upper"
    }
]
```

## How to Use

1. Create your JSON file in this folder
2. In the app, go to the Script tab
3. Click "Upload Script JSON"
4. Select your file
5. Click the Play button to start the broadcast

The system will process each segment sequentially with:
- HeadTTS generating the speech audio
- Automatic Oculus Viseme lip-sync
- Mood changes for facial expressions
- Camera view transitions
- Gesture animations
