 # NewsAnchor Pro

A professional AI-powered news anchor broadcast studio using 3D avatars with real-time lip-sync.

![NewsAnchor Pro](https://img.shields.io/badge/version-2.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 🎭 **3D Avatar System** - Ready Player Me compatible avatars with facial expressions
- 👄 **Real-time Lip-sync** - HeadTTS neural voices with automatic Oculus Visemes
- 📝 **JSON Script Runner** - Control entire broadcasts with JSON files
- 🎤 **Multiple TTS Options** - HeadTTS neural voices, Browser TTS, Google Cloud TTS
- 🖼️ **Dynamic Backgrounds** - Preset newsroom backgrounds or custom images
- 📺 **Broadcast Overlays** - Lower thirds, news ticker, subtitles
- 🎬 **Video Recording** - Record broadcasts as WebM video
- 😊 **Mood & Gestures** - Control avatar emotions and hand gestures
- 📷 **Multiple Camera Views** - Full body, upper body, mid shot, head close-up

## Quick Start

### 1. Start Local Server

```bash
cd news-anchor-pro
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### 2. Test with JSON Script

1. Go to the **Script** tab
2. Click **Upload Script JSON**
3. Select `scripts/simple_script.json`
4. Click the **Play** button

The avatar will speak each segment with mood changes, gestures, and proper lip-sync!

---

## 📁 Adding Custom Avatars

### Method 1: URL/Path Input (Fastest)

1. Place your `.glb` file in the `avatars/` folder
2. In the app, go to **Avatar** tab
3. Enter the path: `./avatars/your-avatar.glb`
4. Select the body type (Male/Female)
5. Click **Load URL**

### Method 2: File Upload (Temporary)

1. Go to **Avatar** tab
2. Click the file upload button
3. Select your `.glb` file
4. Avatar loads immediately (not saved permanently)

### Method 3: Config File (Permanent)

1. Place your `.glb` file in the `avatars/` folder
2. Open `js/config.js` in a text editor
3. Find the `customAvatars` array
4. Add your avatar:

```javascript
customAvatars: [
    {
        id: 'my-avatar',              // Unique ID (no spaces)
        name: 'My Custom Avatar',     // Display name
        body: 'F',                    // 'F' = female, 'M' = male
        url: './avatars/my-avatar.glb',
        thumbnail: null               // Optional thumbnail
    }
]
```

5. Refresh the browser - your avatar appears in the grid!

### Avatar Requirements

Your GLB file **must** have:
- ✅ **Oculus Visemes** blend shapes (for lip-sync)
- ✅ Mixamo-compatible skeleton
- ⭐ ARKit blend shapes (optional, for expressions)

**Create compatible avatars at:**
- [Ready Player Me](https://readyplayer.me/avatar)
- [PlayerZero](https://playerzero.readyplayer.me/)

---

## 📝 JSON Script Pipeline

The JSON script system lets you control the entire broadcast with a single file.

### Simple Format (Array)

```json
[
    {
        "text": "Good evening, welcome to the news.",
        "mood": "neutral",
        "view": "upper"
    },
    {
        "text": "Here's our top story tonight!",
        "mood": "happy",
        "gesture": "nod",
        "view": "mid"
    },
    {
        "text": "Thank you for watching!",
        "mood": "neutral",
        "gesture": "wave"
    }
]
```

### Segment Properties

| Property | Type | Options | Default |
|----------|------|---------|---------|
| `text` | string | Any text | (required) |
| `mood` | string | neutral, happy, angry, sad, fear, love | neutral |
| `view` | string | full, upper, mid, head | upper |
| `gesture` | string | wave, thumbsUp, think, nod | null |
| `voice` | string | af_bella, am_adam, etc. | af_bella |
| `speed` | number | 0.5 - 2.0 | 1.0 |
| `delay` | number | milliseconds | 500 |

### How It Works

1. You create a JSON file with segments
2. Upload it in the Script tab
3. Click Play
4. For each segment:
   - HeadTTS generates speech + visemes
   - Avatar changes mood/expression
   - Camera moves to specified view
   - Gesture plays if specified
   - Lip-sync runs automatically
5. After segment finishes, moves to next

### Sample Scripts Included

- `scripts/simple_script.json` - Basic demo (7 segments)
- `scripts/sample_broadcast.json` - Full news broadcast (8 segments)

---

## 🔊 Lip-Sync System

### HeadTTS (Default - Recommended)

HeadTTS provides neural TTS with automatic Oculus Visemes:
- ✅ No API key required
- ✅ High-quality neural voices
- ✅ Perfect lip-sync (visemes generated automatically)
- ✅ Works in Chrome/Edge (WebGPU)
- ⚠️ First load takes ~10 seconds to initialize

### Available Voices

| ID | Name | Gender |
|----|------|--------|
| af_bella | Bella | Female US |
| af_nicole | Nicole | Female US |
| af_sarah | Sarah | Female US |
| am_adam | Adam | Male US |
| am_michael | Michael | Male US |
| am_fenrir | Fenrir | Male US |
| bf_emma | Emma | Female UK |
| bm_george | George | Male UK |

### Browser TTS (Fallback)

- Uses system voices
- Quality varies by browser/OS
- Basic lip-sync (less accurate)

---

## Project Structure

```
news-anchor-pro/
├── index.html              # Main application
├── css/styles.css          # Professional broadcast styling
├── js/
│   ├── config.js           # Configuration (★ ADD AVATARS HERE)
│   └── app.js              # Main application logic
├── avatars/                # Put custom GLB files here
├── backgrounds/            # Custom background images
├── scripts/                # JSON broadcast scripts
│   ├── simple_script.json  # Simple demo script
│   └── sample_broadcast.json
└── README.md
```

---

## Troubleshooting

### Custom Avatar Not Loading

1. **Check file path**: Use `./avatars/filename.glb` (note the `./`)
2. **Check browser console** for error messages (F12)
3. **Verify GLB has visemes**: Must have Oculus Viseme blend shapes
4. **Try different body type**: Switch between Male/Female in dropdown

### No Lip-Sync

1. **Wait for HeadTTS** to initialize (loading indicator)
2. **Use Chrome/Edge** for WebGPU support
3. **Check avatar has visemes**: Not all GLB files have them

### HeadTTS Not Loading

1. **Use Chrome or Edge** (WebGPU required)
2. **Wait 10-20 seconds** for first load
3. Falls back to browser TTS automatically

### JSON Script Not Running

1. **Check JSON format** - must be valid JSON
2. **Array format** - can be simple array or object with `segments`
3. **Each segment needs `text`** property at minimum

---

## Example Workflow

1. **Create your avatar** at [Ready Player Me](https://readyplayer.me/avatar)
2. **Download the GLB** file
3. **Place in `avatars/` folder**
4. **Add to config.js** (or use URL input)
5. **Create your script** as JSON file
6. **Upload script** in the app
7. **Click Play** and record!

---

## Credits

- [TalkingHead](https://github.com/met4citizen/TalkingHead) - 3D avatar lip-sync
- [HeadTTS](https://github.com/met4citizen/HeadTTS) - Neural TTS with visemes
- [Ready Player Me](https://readyplayer.me/) - Free avatar creation
- [Three.js](https://threejs.org/) - 3D rendering

## License

MIT License - Feel free to use for personal and commercial projects.

## Changelog

### v2.2.0
- Added URL-based avatar loading
- Improved custom avatar workflow
- Enhanced JSON script documentation
- Added scripts folder with examples
- Better error handling for avatar loading

### v2.1.0
- Integrated HeadTTS for neural TTS with automatic visemes
- JSON script runner for automated broadcasts
- Improved lip-sync pipeline

### v2.0.0
- Complete rewrite with modular architecture
- Professional broadcast studio UI
- TalkingHead integration
