/**
 * NewsAnchor Pro Configuration v2.2
 * Complete lip-sync pipeline with HeadTTS integration
 * 
 * ═══════════════════════════════════════════════════════════════════
 * HOW TO ADD CUSTOM AVATARS (3 STEPS):
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Step 1: Place your .glb file in the 'avatars/' folder
 * 
 * Step 2: Add an entry to the 'customAvatars' array below:
 *   {
 *       id: 'my-custom',           // Unique identifier
 *       name: 'My Avatar',         // Display name
 *       body: 'F',                 // 'F' = female rig, 'M' = male rig
 *       url: './avatars/my-avatar.glb',
 *       thumbnail: null            // Optional: './avatars/my-avatar-thumb.png'
 *   }
 * 
 * Step 3: Refresh the browser - your avatar will appear in the grid!
 * 
 * IMPORTANT: Your GLB file must have:
 * - Oculus Visemes blend shapes for lip-sync (viseme_aa, viseme_E, etc.)
 * - ARKit blend shapes for facial expressions (optional but recommended)
 * - Mixamo-compatible skeleton for animations
 * 
 * ═══════════════════════════════════════════════════════════════════
 */

const CONFIG = {
    // Application Settings
    app: {
        name: 'NewsAnchor Pro',
        version: '2.2.0',
        debug: true  // Set to true to see detailed logs
    },

    // Avatar Configuration
    avatars: {
        // Default avatars using Ready Player Me
        presets: [
            {
                id: 'female-1',
                name: 'Sarah',
                body: 'F',
                url: 'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
                thumbnail: 'https://api.readyplayer.me/v1/avatars/64bfa15f0e72c63d7c3934a6/portrait.png?w=150&h=150'
            },
            {
                id: 'female-2',
                name: 'Emma',
                body: 'F',
                url: 'https://models.readyplayer.me/6460717a4c6e8a55c44fee44.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
                thumbnail: 'https://api.readyplayer.me/v1/avatars/6460717a4c6e8a55c44fee44/portrait.png?w=150&h=150'
            },
            {
                id: 'male-1',
                name: 'Michael',
                body: 'M',
                url: 'https://models.readyplayer.me/64606ea54c6e8a55c44fec7e.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
                thumbnail: 'https://api.readyplayer.me/v1/avatars/64606ea54c6e8a55c44fec7e/portrait.png?w=150&h=150'
            },
            {
                id: 'male-2',
                name: 'James',
                body: 'M',
                url: 'https://models.readyplayer.me/6460730c4c6e8a55c44fef95.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
                thumbnail: 'https://api.readyplayer.me/v1/avatars/6460730c4c6e8a55c44fef95/portrait.png?w=150&h=150'
            },
            {
                id: 'female-3',
                name: 'Lisa',
                body: 'F',
                url: 'https://models.readyplayer.me/64607247d101a70e388e2927.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
                thumbnail: 'https://api.readyplayer.me/v1/avatars/64607247d101a70e388e2927/portrait.png?w=150&h=150'
            },
            {
                id: 'male-3',
                name: 'David',
                body: 'M',
                url: 'https://models.readyplayer.me/64606f8bd101a70e388e26cc.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png',
                thumbnail: 'https://api.readyplayer.me/v1/avatars/64606f8bd101a70e388e26cc/portrait.png?w=150&h=150'
            }
        ],
        
        // ═══════════════════════════════════════════════════════════════
        // ★★★ CUSTOM AVATARS - ADD YOUR GLB FILES HERE ★★★
        // ═══════════════════════════════════════════════════════════════
        // 
        // After placing your .glb file in the avatars/ folder,
        // add an entry below following this format:
        //
        customAvatars: [
            // ──────────────────────────────────────────────────────────
            // EXAMPLE: Uncomment and modify the lines below
            // ──────────────────────────────────────────────────────────
            // {
            //     id: 'my-avatar',              // Unique ID (no spaces)
            //     name: 'My Custom Avatar',     // Display name in UI
            //     body: 'F',                    // 'F' = female, 'M' = male
            //     url: './avatars/my-avatar.glb',
            //     thumbnail: null               // Optional thumbnail image
            // },
            // {
            //     id: 'news-anchor-1',
            //     name: 'News Anchor 1',
            //     body: 'M',
            //     url: './avatars/news-anchor-1.glb',
            //     thumbnail: './avatars/news-anchor-1-thumb.png'
            // }
        ],
        
        // Default avatar to load (id from presets or customAvatars)
        default: 'female-1',
        
        // Custom avatars folder path
        customFolder: './avatars/',
        
        // TalkingHead avatar settings
        settings: {
            ttsLang: 'en-US',
            ttsVoice: 'en-US-Standard-C',
            lipsyncLang: 'en',
            avatarMood: 'neutral'
        }
    },
    
    // HeadTTS Configuration (Neural TTS with lip-sync)
    headTTS: {
        enabled: true,  // Set to true to use HeadTTS for TTS + lip-sync
        
        // Endpoints in order of priority
        // Options: 'webgpu', 'wasm', or WebSocket server URL like 'ws://localhost:8882'
        endpoints: ['webgpu', 'wasm'],
        
        // Language to load
        language: 'en-us',
        
        // Default voice (see HeadTTS docs for available voices)
        // Voices: af_bella, af_nicole, am_adam, am_fenrir, af_sarah, etc.
        defaultVoice: 'af_bella',
        
        // Speech settings
        speed: 1.0,
        
        // Pre-load voices for faster first speech
        preloadVoices: ['af_bella', 'am_adam']
    },

    // Background Configuration
    backgrounds: {
        presets: [
            {
                id: 'newsroom',
                name: 'Newsroom',
                url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1920&q=80',
                thumbnail: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=60'
            },
            {
                id: 'city',
                name: 'City Skyline',
                url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80',
                thumbnail: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=60'
            },
            {
                id: 'world-map',
                name: 'World Map',
                url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920&q=80',
                thumbnail: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&q=60'
            },
            {
                id: 'tech',
                name: 'Technology',
                url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80',
                thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=60'
            },
            {
                id: 'finance',
                name: 'Finance',
                url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80',
                thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=60'
            },
            {
                id: 'abstract',
                name: 'Abstract',
                url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80',
                thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=60'
            }
        ],
        
        // Default background
        default: 'newsroom',
        
        // Custom backgrounds folder
        customFolder: './backgrounds/'
    },

    // TTS Configuration
    tts: {
        // Default engine: 'headtts', 'browser', 'google', 'elevenlabs'
        // 'headtts' is recommended - uses neural voices with perfect lip-sync
        defaultEngine: 'headtts',
        
        // Google TTS settings (requires API key)
        google: {
            endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
            voices: [
                { id: 'en-US-Standard-A', name: 'US English - Female A', gender: 'F' },
                { id: 'en-US-Standard-B', name: 'US English - Male B', gender: 'M' },
                { id: 'en-US-Standard-C', name: 'US English - Female C', gender: 'F' },
                { id: 'en-US-Standard-D', name: 'US English - Male D', gender: 'M' },
                { id: 'en-US-Wavenet-A', name: 'US English Wavenet - Female A', gender: 'F' },
                { id: 'en-US-Wavenet-B', name: 'US English Wavenet - Male B', gender: 'M' },
                { id: 'en-GB-Standard-A', name: 'UK English - Female A', gender: 'F' },
                { id: 'en-GB-Standard-B', name: 'UK English - Male B', gender: 'M' }
            ]
        },
        
        // Browser TTS settings (fallback)
        browser: {
            defaultRate: 1.0,
            defaultPitch: 1.0,
            defaultVolume: 0.8
        }
    },
    
    // Script Runner Configuration
    // For running automated broadcasts from JSON
    scriptRunner: {
        // Default delay between segments (ms)
        segmentDelay: 500,
        
        // Default values if not specified in segment
        defaults: {
            mood: 'neutral',
            view: 'upper',
            gesture: null,
            voice: 'af_bella',
            speed: 1.0
        }
    },

    // Camera Views
    views: {
        full: { distance: 2.5, yOffset: 0 },
        upper: { distance: 0.8, yOffset: 0.1 },
        mid: { distance: 0.5, yOffset: 0.15 },
        head: { distance: 0.3, yOffset: 0.2 }
    },

    // Overlay Styles
    overlayStyles: {
        modern: {
            lowerThirdBg: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-transparent) 70%, transparent 100%)',
            tickerBg: 'rgba(0, 0, 0, 0.9)'
        },
        classic: {
            lowerThirdBg: 'var(--accent)',
            tickerBg: 'var(--accent)'
        },
        minimal: {
            lowerThirdBg: 'rgba(0, 0, 0, 0.7)',
            tickerBg: 'rgba(0, 0, 0, 0.7)'
        },
        breaking: {
            lowerThirdBg: '#dc2626',
            tickerBg: '#dc2626'
        }
    },

    // Moods available in TalkingHead
    moods: ['neutral', 'happy', 'angry', 'sad', 'fear', 'disgust', 'love', 'sleep'],

    // Rhubarb to Oculus Viseme mapping
    visemeMapping: {
        'A': 'aa',   // "ah" sound
        'B': 'PP',   // Closed lips (p, b, m)
        'C': 'E',    // "eh" sound
        'D': 'aa',   // Wide open mouth
        'E': 'O',    // "oh" sound
        'F': 'U',    // "oo" sound
        'G': 'FF',   // "f" and "v" sounds
        'H': 'nn',   // "l" sound
        'X': 'sil'   // Silence
    }
};

// Make CONFIG available globally
window.CONFIG = CONFIG;
