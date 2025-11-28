/**
 * NewsAnchor Pro - Main Application v2.1
 * Integrates TalkingHead + HeadTTS for real-time lip-sync
 * 
 * Features:
 * - HeadTTS neural TTS with automatic Oculus visemes
 * - Script Runner for JSON-based broadcast sequences
 * - Custom avatar support
 * - Multiple TTS engine fallbacks
 */

import { TalkingHead } from 'talkinghead';
import { HeadTTS } from 'https://cdn.jsdelivr.net/npm/@met4citizen/headtts@1.1/+esm';

class NewsAnchorApp {
    constructor() {
        // Core state
        this.head = null;           // TalkingHead instance
        this.headTTS = null;        // HeadTTS instance
        this.isPlaying = false;
        this.isPaused = false;
        this.isRecording = false;
        this.headTTSReady = false;
        
        // Avatar state
        this.currentAvatar = null;
        this.currentBackground = null;
        this.currentView = 'upper';
        this.currentMood = 'neutral';
        
        // Script runner state
        this.scriptQueue = [];
        this.currentSegmentIndex = 0;
        this.isRunningScript = false;
        
        // Audio state
        this.uploadedAudio = null;
        this.lipsyncData = null;
        
        // Recording
        this.mediaRecorder = null;
        this.recordedChunks = [];
        
        // Browser TTS fallback
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // DOM element cache
        this.elements = {};
        
        // Initialize
        this.init();
    }

    async init() {
        this.updateLoadingStatus('Initializing application...');
        this.updateProgress(5);
        
        // Cache DOM elements
        this.cacheElements();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load browser voices (fallback)
        this.loadVoices();
        
        try {
            this.updateLoadingStatus('Initializing TalkingHead...');
            this.updateProgress(15);
            await this.initTalkingHead();
            
            this.updateLoadingStatus('Initializing HeadTTS...');
            this.updateProgress(30);
            await this.initHeadTTS();
            
            this.updateLoadingStatus('Loading avatar...');
            this.updateProgress(60);
            await this.loadDefaultAvatar();
            
            this.updateLoadingStatus('Loading background...');
            this.updateProgress(85);
            this.loadBackground(CONFIG.backgrounds.default);
            
            // Populate UI
            this.populateAvatars();
            this.populateBackgrounds();
            this.populateHeadTTSVoices();
            
            this.updateLoadingStatus('Ready!');
            this.updateProgress(100);
            
            setTimeout(() => {
                this.elements.loadingOverlay.classList.add('hidden');
                this.updateStatus('Ready to broadcast');
            }, 500);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.updateLoadingStatus(`Error: ${error.message}`);
        }
        
        this.startTimeDisplay();
    }

    cacheElements() {
        // Loading elements
        this.elements.loadingOverlay = document.getElementById('loadingOverlay');
        this.elements.progressBar = document.getElementById('progressBar');
        this.elements.loadingStatus = document.getElementById('loadingStatus');
        
        // Status indicators
        this.elements.statusAvatar = document.getElementById('statusAvatar');
        this.elements.statusTTS = document.getElementById('statusTTS');
        this.elements.statusLipSync = document.getElementById('statusLipSync');
        this.elements.liveIndicator = document.getElementById('liveIndicator');
        this.elements.timeDisplay = document.getElementById('timeDisplay');
        this.elements.footerStatus = document.getElementById('footerStatus');
        
        // Preview elements
        this.elements.avatarContainer = document.getElementById('avatarContainer');
        this.elements.backgroundImage = document.getElementById('backgroundImage');
        this.elements.backgroundLayer = document.getElementById('backgroundLayer');
        
        // Overlay elements
        this.elements.lowerThird = document.getElementById('lowerThird');
        this.elements.anchorName = document.getElementById('anchorName');
        this.elements.anchorTitle = document.getElementById('anchorTitle');
        this.elements.newsTicker = document.getElementById('newsTicker');
        this.elements.tickerText = document.getElementById('tickerText');
        this.elements.subtitlesContainer = document.getElementById('subtitlesContainer');
        this.elements.subtitlesText = document.getElementById('subtitlesText');
        this.elements.recordingIndicator = document.getElementById('recordingIndicator');
        
        // Control buttons
        this.elements.btnPlay = document.getElementById('btnPlay');
        this.elements.btnPause = document.getElementById('btnPause');
        this.elements.btnStop = document.getElementById('btnStop');
        this.elements.btnRecord = document.getElementById('btnRecord');
        this.elements.volumeSlider = document.getElementById('volumeSlider');
        
        // Script inputs
        this.elements.scriptInput = document.getElementById('scriptInput');
        this.elements.charCount = document.getElementById('charCount');
        this.elements.inputAnchorName = document.getElementById('inputAnchorName');
        this.elements.inputAnchorTitle = document.getElementById('inputAnchorTitle');
        this.elements.inputTicker = document.getElementById('inputTicker');
        
        // Checkboxes
        this.elements.chkShowLowerThird = document.getElementById('chkShowLowerThird');
        this.elements.chkShowTicker = document.getElementById('chkShowTicker');
        this.elements.chkShowSubtitles = document.getElementById('chkShowSubtitles');
        
        // Grid containers
        this.elements.avatarGrid = document.getElementById('avatarGrid');
        this.elements.backgroundGrid = document.getElementById('backgroundGrid');
        
        // File inputs
        this.elements.customAvatarInput = document.getElementById('customAvatarInput');
        this.elements.customAvatarUrl = document.getElementById('customAvatarUrl');
        this.elements.btnLoadAvatarUrl = document.getElementById('btnLoadAvatarUrl');
        this.elements.avatarBodyType = document.getElementById('avatarBodyType');
        this.elements.customBgInput = document.getElementById('customBgInput');
        this.elements.audioInput = document.getElementById('audioInput');
        this.elements.lipsyncInput = document.getElementById('lipsyncInput');
        this.elements.scriptJsonInput = document.getElementById('scriptJsonInput');
        this.elements.audioPreview = document.getElementById('audioPreview');
        this.elements.audioPlayer = document.getElementById('audioPlayer');
        
        // TTS settings
        this.elements.ttsEngine = document.getElementById('ttsEngine');
        this.elements.browserVoice = document.getElementById('browserVoice');
        this.elements.browserVoiceSection = document.getElementById('browserVoiceSection');
        this.elements.headttsVoiceSection = document.getElementById('headttsVoiceSection');
        this.elements.headttsVoice = document.getElementById('headttsVoice');
        this.elements.googleVoiceSection = document.getElementById('googleVoiceSection');
        this.elements.googleVoice = document.getElementById('googleVoice');
        this.elements.googleApiKey = document.getElementById('googleApiKey');
        this.elements.speechRate = document.getElementById('speechRate');
        this.elements.speechRateValue = document.getElementById('speechRateValue');
        this.elements.speechPitch = document.getElementById('speechPitch');
        this.elements.speechPitchValue = document.getElementById('speechPitchValue');
        
        // Scene settings
        this.elements.overlayStyle = document.getElementById('overlayStyle');
        this.elements.customColor = document.getElementById('customColor');
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Broadcast controls
        this.elements.btnPlay.addEventListener('click', () => this.startBroadcast());
        this.elements.btnPause.addEventListener('click', () => this.pauseBroadcast());
        this.elements.btnStop.addEventListener('click', () => this.stopBroadcast());
        this.elements.btnRecord.addEventListener('click', () => this.toggleRecording());
        
        // Script text input
        this.elements.scriptInput.addEventListener('input', () => {
            const count = this.elements.scriptInput.value.length;
            this.elements.charCount.textContent = count;
        });
        
        // Lower third inputs
        this.elements.inputAnchorName.addEventListener('input', () => {
            this.elements.anchorName.textContent = this.elements.inputAnchorName.value;
        });
        this.elements.inputAnchorTitle.addEventListener('input', () => {
            this.elements.anchorTitle.textContent = this.elements.inputAnchorTitle.value;
        });
        this.elements.inputTicker.addEventListener('input', () => {
            this.elements.tickerText.textContent = this.elements.inputTicker.value;
        });
        
        // Overlay toggles
        this.elements.chkShowLowerThird.addEventListener('change', () => {
            this.elements.lowerThird.classList.toggle('visible', this.elements.chkShowLowerThird.checked);
        });
        this.elements.chkShowTicker.addEventListener('change', () => {
            this.elements.newsTicker.classList.toggle('visible', this.elements.chkShowTicker.checked);
        });
        
        // File inputs
        this.elements.customAvatarInput.addEventListener('change', (e) => this.handleCustomAvatar(e));
        this.elements.customBgInput.addEventListener('change', (e) => this.handleCustomBackground(e));
        this.elements.audioInput.addEventListener('change', (e) => this.handleAudioUpload(e));
        this.elements.lipsyncInput.addEventListener('change', (e) => this.handleLipsyncUpload(e));
        
        // URL-based avatar loading
        if (this.elements.btnLoadAvatarUrl) {
            this.elements.btnLoadAvatarUrl.addEventListener('click', () => this.loadAvatarFromUrl());
        }
        
        // Also handle Enter key in URL input
        if (this.elements.customAvatarUrl) {
            this.elements.customAvatarUrl.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.loadAvatarFromUrl();
                }
            });
        }
        
        // Script JSON input
        if (this.elements.scriptJsonInput) {
            this.elements.scriptJsonInput.addEventListener('change', (e) => this.handleScriptJsonUpload(e));
        }
        
        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setMood(e.target.dataset.mood);
            });
        });
        
        // Gesture buttons
        document.querySelectorAll('.gesture-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playGesture(e.target.dataset.gesture);
            });
        });
        
        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setView(e.target.dataset.view);
            });
        });
        
        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.setAccentColor(e.target.dataset.color);
            });
        });
        
        this.elements.customColor?.addEventListener('input', (e) => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.setAccentColor(e.target.value);
        });
        
        // TTS engine change
        this.elements.ttsEngine.addEventListener('change', () => this.handleTTSEngineChange());
        
        // Speech rate/pitch sliders
        this.elements.speechRate.addEventListener('input', () => {
            this.elements.speechRateValue.textContent = `${this.elements.speechRate.value}x`;
        });
        this.elements.speechPitch?.addEventListener('input', () => {
            if (this.elements.speechPitchValue) {
                this.elements.speechPitchValue.textContent = this.elements.speechPitch.value;
            }
        });
    }

    // =========================================================
    // TALKINGHEAD INITIALIZATION
    // =========================================================
    
    async initTalkingHead() {
        try {
            this.head = new TalkingHead(this.elements.avatarContainer, {
                ttsEndpoint: null,
                lipsyncModules: ['en'],
                cameraView: 'upper',
                cameraDistance: 0.8,
                cameraRotateX: 0,
                cameraRotateY: 0,
                cameraPanX: 0,
                cameraPanY: 0.1,
                lightAmbientColor: 0xffffff,
                lightAmbientIntensity: 2,
                lightDirectColor: 0xffffff,
                lightDirectIntensity: 10,
                lightSpotIntensity: 0,
                modelFPS: 30,
                modelMovementFactor: 1,
                avatarMood: 'neutral',
                statsNode: null
            });
            
            console.log('✓ TalkingHead initialized');
            
        } catch (error) {
            console.error('TalkingHead init failed:', error);
            throw error;
        }
    }

    // =========================================================
    // HEADTTS INITIALIZATION
    // =========================================================
    
    async initHeadTTS() {
        if (!CONFIG.headTTS.enabled) {
            console.log('HeadTTS disabled in config, using browser TTS');
            this.setStatusIndicator('statusTTS', 'warning');
            return;
        }
        
        try {
            this.headTTS = new HeadTTS({
                endpoints: CONFIG.headTTS.endpoints,
                languages: [CONFIG.headTTS.language],
                voices: CONFIG.headTTS.preloadVoices,
                workerModule: 'https://cdn.jsdelivr.net/npm/@met4citizen/headtts@1.1/modules/worker-tts.mjs',
                dictionaryURL: 'https://cdn.jsdelivr.net/npm/@met4citizen/headtts@1.1/dictionaries/',
                defaultVoice: CONFIG.headTTS.defaultVoice,
                defaultSpeed: CONFIG.headTTS.speed,
                trace: CONFIG.app.debug ? 7 : 0
            });
            
            // Set up message handler for audio responses
            this.headTTS.onmessage = (message) => {
                if (message.type === 'audio') {
                    this.handleHeadTTSAudio(message.data);
                } else if (message.type === 'error') {
                    console.error('HeadTTS error:', message.data.error);
                    this.updateStatus(`TTS Error: ${message.data.error}`);
                }
            };
            
            this.headTTS.onend = () => {
                console.log('HeadTTS queue complete');
            };
            
            // Connect to endpoint
            this.updateLoadingStatus('Connecting to HeadTTS...');
            await this.headTTS.connect(null, (progress) => {
                if (progress.loaded && progress.total) {
                    const pct = Math.round((progress.loaded / progress.total) * 100);
                    this.updateLoadingStatus(`Loading TTS model: ${pct}%`);
                }
            });
            
            this.headTTSReady = true;
            this.setStatusIndicator('statusTTS', 'ready');
            this.setStatusIndicator('statusLipSync', 'ready');
            console.log('✓ HeadTTS connected and ready');
            
        } catch (error) {
            console.error('HeadTTS init failed:', error);
            this.headTTSReady = false;
            this.setStatusIndicator('statusTTS', 'warning');
            this.updateStatus('HeadTTS unavailable, using browser TTS');
        }
    }
    
    handleHeadTTSAudio(audioData) {
        // audioData contains: words, wtimes, wdurations, visemes, vtimes, vdurations
        if (!this.head) return;
        
        console.log('Received HeadTTS audio with visemes:', audioData.visemes?.length);
        
        // Play audio with lip-sync using TalkingHead
        try {
            this.head.speakAudio(audioData, {}, (word) => {
                // Word callback - update subtitles
                if (this.elements.chkShowSubtitles?.checked && word) {
                    this.highlightCurrentWord(word);
                }
            });
        } catch (error) {
            console.error('Error playing audio:', error);
        }
    }
    
    highlightCurrentWord(currentWord) {
        const text = this.elements.subtitlesText.getAttribute('data-full-text') || '';
        const words = text.split(' ');
        const index = words.findIndex(w => w.toLowerCase().includes(currentWord.toLowerCase().trim()));
        
        if (index >= 0) {
            const before = words.slice(0, index).join(' ');
            const current = words[index];
            const after = words.slice(index + 1).join(' ');
            this.elements.subtitlesText.innerHTML = 
                `${before} <strong style="color: #fbbf24;">${current}</strong> ${after}`;
        }
    }
    
    populateHeadTTSVoices() {
        const select = this.elements.headttsVoice;
        if (!select) return;
        
        // HeadTTS available voices
        const voices = [
            { id: 'af_bella', name: 'Bella (Female US)', gender: 'F' },
            { id: 'af_nicole', name: 'Nicole (Female US)', gender: 'F' },
            { id: 'af_sarah', name: 'Sarah (Female US)', gender: 'F' },
            { id: 'af_sky', name: 'Sky (Female US)', gender: 'F' },
            { id: 'am_adam', name: 'Adam (Male US)', gender: 'M' },
            { id: 'am_michael', name: 'Michael (Male US)', gender: 'M' },
            { id: 'am_fenrir', name: 'Fenrir (Male US)', gender: 'M' },
            { id: 'bf_emma', name: 'Emma (Female UK)', gender: 'F' },
            { id: 'bf_isabella', name: 'Isabella (Female UK)', gender: 'F' },
            { id: 'bm_george', name: 'George (Male UK)', gender: 'M' },
            { id: 'bm_lewis', name: 'Lewis (Male UK)', gender: 'M' }
        ];
        
        select.innerHTML = '';
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.id;
            option.textContent = voice.name;
            if (voice.id === CONFIG.headTTS.defaultVoice) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    // =========================================================
    // AVATAR LOADING
    // =========================================================
    
    async loadDefaultAvatar() {
        // Combine preset and custom avatars
        const allAvatars = [
            ...CONFIG.avatars.presets,
            ...(CONFIG.avatars.customAvatars || [])
        ];
        
        const defaultAvatar = allAvatars.find(a => a.id === CONFIG.avatars.default);
        
        if (defaultAvatar) {
            await this.loadAvatar(defaultAvatar.id);
        } else if (allAvatars.length > 0) {
            await this.loadAvatar(allAvatars[0].id);
        }
    }
    
    async loadAvatar(avatarId) {
        // Find avatar in presets or custom
        const allAvatars = [
            ...CONFIG.avatars.presets,
            ...(CONFIG.avatars.customAvatars || [])
        ];
        
        const avatar = allAvatars.find(a => a.id === avatarId);
        if (!avatar) {
            console.error('Avatar not found:', avatarId);
            this.updateStatus(`Avatar not found: ${avatarId}`);
            return;
        }
        
        this.setStatusIndicator('statusAvatar', 'warning');
        this.updateStatus(`Loading avatar: ${avatar.name}...`);
        
        try {
            await this.head.showAvatar({
                url: avatar.url,
                body: avatar.body,
                avatarMood: this.currentMood,
                ttsLang: CONFIG.avatars.settings.ttsLang,
                ttsVoice: CONFIG.avatars.settings.ttsVoice,
                lipsyncLang: CONFIG.avatars.settings.lipsyncLang
            }, (progress) => {
                console.log('Avatar loading:', progress);
            });
            
            this.currentAvatar = avatar;
            this.setStatusIndicator('statusAvatar', 'ready');
            this.updateStatus(`Avatar loaded: ${avatar.name}`);
            
            // Update grid selection
            document.querySelectorAll('.avatar-item').forEach(item => {
                item.classList.toggle('selected', item.dataset.id === avatarId);
            });
            
        } catch (error) {
            console.error('Failed to load avatar:', error);
            this.setStatusIndicator('statusAvatar', 'error');
            this.updateStatus(`Failed to load avatar: ${error.message}`);
        }
    }
    
    async loadCustomAvatar(url, body = 'F') {
        this.setStatusIndicator('statusAvatar', 'warning');
        this.updateStatus('Loading custom avatar...');
        
        try {
            await this.head.showAvatar({
                url: url,
                body: body,
                avatarMood: this.currentMood,
                lipsyncLang: 'en'
            });
            
            this.currentAvatar = { id: 'custom-uploaded', name: 'Custom', body, url };
            this.setStatusIndicator('statusAvatar', 'ready');
            this.updateStatus('Custom avatar loaded successfully!');
            
            // Deselect all in grid
            document.querySelectorAll('.avatar-item').forEach(item => {
                item.classList.remove('selected');
            });
            
        } catch (error) {
            console.error('Failed to load custom avatar:', error);
            this.setStatusIndicator('statusAvatar', 'error');
            this.updateStatus(`Failed to load avatar: ${error.message}`);
        }
    }
    
    /**
     * Load avatar from URL input (for local files like ./avatars/my-avatar.glb)
     */
    async loadAvatarFromUrl() {
        const url = this.elements.customAvatarUrl?.value?.trim();
        if (!url) {
            this.updateStatus('Please enter an avatar URL or path');
            return;
        }
        
        const bodyType = this.elements.avatarBodyType?.value || 'F';
        
        this.updateStatus(`Loading avatar from: ${url}`);
        console.log(`Loading custom avatar from URL: ${url}, body type: ${bodyType}`);
        
        await this.loadCustomAvatar(url, bodyType);
    }
    
    populateAvatars() {
        this.elements.avatarGrid.innerHTML = '';
        
        // Combine presets and custom avatars
        const allAvatars = [
            ...CONFIG.avatars.presets,
            ...(CONFIG.avatars.customAvatars || [])
        ];
        
        allAvatars.forEach(avatar => {
            const item = document.createElement('div');
            item.className = 'avatar-item';
            item.dataset.id = avatar.id;
            
            if (avatar.id === CONFIG.avatars.default) {
                item.classList.add('selected');
            }
            
            // Use placeholder if no thumbnail
            const thumbnail = avatar.thumbnail || 
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23333" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%23888" font-size="14">' + avatar.name.charAt(0) + '</text></svg>';
            
            item.innerHTML = `
                <img src="${thumbnail}" alt="${avatar.name}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2214%22>${avatar.name.charAt(0)}</text></svg>'">
                <div class="avatar-name">${avatar.name}</div>
            `;
            
            item.addEventListener('click', () => this.loadAvatar(avatar.id));
            this.elements.avatarGrid.appendChild(item);
        });
    }

    // =========================================================
    // BACKGROUND LOADING
    // =========================================================
    
    loadBackground(backgroundId) {
        const bg = CONFIG.backgrounds.presets.find(b => b.id === backgroundId);
        if (!bg) return;
        
        this.elements.backgroundImage.onload = () => {
            this.elements.backgroundImage.classList.add('loaded');
        };
        this.elements.backgroundImage.src = bg.url;
        this.currentBackground = bg;
        
        document.querySelectorAll('.background-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.id === backgroundId);
        });
    }
    
    loadCustomBackground(url) {
        this.elements.backgroundImage.onload = () => {
            this.elements.backgroundImage.classList.add('loaded');
        };
        this.elements.backgroundImage.src = url;
        this.currentBackground = { id: 'custom', name: 'Custom', url };
        
        document.querySelectorAll('.background-item').forEach(item => {
            item.classList.remove('selected');
        });
    }
    
    populateBackgrounds() {
        this.elements.backgroundGrid.innerHTML = '';
        
        CONFIG.backgrounds.presets.forEach(bg => {
            const item = document.createElement('div');
            item.className = 'background-item';
            item.dataset.id = bg.id;
            
            if (bg.id === CONFIG.backgrounds.default) {
                item.classList.add('selected');
            }
            
            item.innerHTML = `
                <img src="${bg.thumbnail}" alt="${bg.name}" loading="lazy">
                <div class="bg-name">${bg.name}</div>
            `;
            
            item.addEventListener('click', () => this.loadBackground(bg.id));
            this.elements.backgroundGrid.appendChild(item);
        });
    }

    // =========================================================
    // BROADCAST CONTROLS
    // =========================================================
    
    async startBroadcast() {
        const script = this.elements.scriptInput.value.trim();
        
        // Check if we have a script queue from JSON upload
        if (this.scriptQueue.length > 0) {
            await this.runScriptQueue();
            return;
        }
        
        if (!script && !this.uploadedAudio) {
            this.updateStatus('Please enter a script or upload a script JSON');
            return;
        }
        
        this.isPlaying = true;
        this.isPaused = false;
        this.elements.btnPlay.disabled = true;
        this.elements.btnPause.disabled = false;
        this.elements.btnStop.disabled = false;
        this.elements.liveIndicator.classList.add('active');
        
        // Show overlays
        if (this.elements.chkShowLowerThird.checked) {
            this.elements.lowerThird.classList.add('visible');
        }
        if (this.elements.chkShowTicker.checked) {
            this.elements.newsTicker.classList.add('visible');
        }
        
        this.updateStatus('Broadcasting...');
        
        try {
            if (this.uploadedAudio && this.lipsyncData) {
                await this.playWithLipSync();
            } else if (script) {
                await this.speakText(script);
            }
        } catch (error) {
            console.error('Broadcast error:', error);
            this.updateStatus(`Error: ${error.message}`);
            this.stopBroadcast();
        }
    }
    
    pauseBroadcast() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.elements.btnPlay.disabled = false;
        this.elements.btnPause.disabled = true;
        
        if (this.head) {
            this.head.stop();
        }
        
        this.updateStatus('Broadcast paused');
    }
    
    stopBroadcast() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isRunningScript = false;
        
        this.elements.btnPlay.disabled = false;
        this.elements.btnPause.disabled = true;
        this.elements.btnStop.disabled = true;
        this.elements.liveIndicator.classList.remove('active');
        
        // Hide overlays
        this.elements.lowerThird.classList.remove('visible');
        this.elements.newsTicker.classList.remove('visible');
        this.elements.subtitlesContainer.classList.remove('visible');
        
        // Stop TalkingHead
        if (this.head) {
            this.head.stop();
        }
        
        // Cancel browser TTS if active
        if (this.synth) {
            this.synth.cancel();
        }
        
        this.updateStatus('Broadcast stopped');
    }

    // =========================================================
    // TEXT-TO-SPEECH WITH LIP-SYNC
    // =========================================================
    
    async speakText(text, options = {}) {
        if (!this.head) return;
        
        // Show subtitles
        if (this.elements.chkShowSubtitles.checked) {
            this.elements.subtitlesContainer.classList.add('visible');
            this.elements.subtitlesText.textContent = text;
            this.elements.subtitlesText.setAttribute('data-full-text', text);
        }
        
        const engine = this.elements.ttsEngine.value;
        
        // Apply options if provided (from script runner)
        if (options.mood) {
            this.setMood(options.mood);
        }
        if (options.view) {
            this.setView(options.view);
        }
        if (options.gesture) {
            this.playGesture(options.gesture);
        }
        
        // Choose TTS engine
        if (engine === 'headtts' && this.headTTSReady) {
            await this.speakWithHeadTTS(text, options);
        } else {
            await this.speakWithBrowserTTS(text);
        }
    }
    
    async speakWithHeadTTS(text, options = {}) {
        if (!this.headTTS || !this.headTTSReady) {
            console.warn('HeadTTS not ready, falling back to browser TTS');
            return this.speakWithBrowserTTS(text);
        }
        
        return new Promise((resolve, reject) => {
            try {
                // Setup voice
                const voice = options.voice || 
                    this.elements.headttsVoice?.value || 
                    CONFIG.headTTS.defaultVoice;
                    
                const speed = parseFloat(this.elements.speechRate.value) || CONFIG.headTTS.speed;
                
                this.headTTS.setup({
                    voice: voice,
                    language: CONFIG.headTTS.language,
                    speed: speed,
                    audioEncoding: 'wav'
                });
                
                console.log(`Speaking with HeadTTS: voice=${voice}, speed=${speed}`);
                
                // Synthesize - onmessage handler will receive audio
                this.headTTS.synthesize({
                    input: text
                }).then((messages) => {
                    // All audio chunks received
                    console.log('HeadTTS synthesis complete, messages:', messages.length);
                    
                    // Wait for TalkingHead to finish speaking
                    const checkSpeaking = setInterval(() => {
                        if (!this.head || !this.head.isSpeaking) {
                            clearInterval(checkSpeaking);
                            this.elements.subtitlesContainer.classList.remove('visible');
                            
                            // If not running script, stop broadcast
                            if (!this.isRunningScript) {
                                this.stopBroadcast();
                            }
                            resolve();
                        }
                    }, 100);
                    
                }).catch(reject);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    async speakWithBrowserTTS(text) {
        return new Promise((resolve, reject) => {
            this.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice
            const voiceIndex = parseInt(this.elements.browserVoice.value);
            const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
            if (englishVoices[voiceIndex]) {
                utterance.voice = englishVoices[voiceIndex];
            }
            
            utterance.rate = parseFloat(this.elements.speechRate.value);
            utterance.pitch = parseFloat(this.elements.speechPitch?.value || 1);
            utterance.volume = this.elements.volumeSlider.value / 100;
            
            let wordIndex = 0;
            const words = text.split(' ');
            
            utterance.onboundary = (event) => {
                if (event.name === 'word' && this.elements.chkShowSubtitles.checked) {
                    const before = words.slice(0, wordIndex).join(' ');
                    const current = words[wordIndex];
                    const after = words.slice(wordIndex + 1).join(' ');
                    this.elements.subtitlesText.innerHTML = 
                        `${before} <strong style="color: #fbbf24;">${current}</strong> ${after}`;
                    wordIndex++;
                }
            };
            
            utterance.onstart = () => {
                // Trigger basic lip-sync animation
                this.animateMouthForText(text);
            };
            
            utterance.onend = () => {
                this.elements.subtitlesContainer.classList.remove('visible');
                if (!this.isRunningScript) {
                    this.stopBroadcast();
                }
                resolve();
            };
            
            utterance.onerror = (error) => {
                reject(error);
            };
            
            this.synth.speak(utterance);
        });
    }
    
    animateMouthForText(text) {
        if (!this.head) return;
        
        const words = text.split(' ');
        const avgWordDuration = 300;
        
        let currentWord = 0;
        const animateWord = () => {
            if (currentWord >= words.length || !this.isPlaying) return;
            
            const word = words[currentWord];
            this.generateSimpleVisemes(word);
            
            currentWord++;
            setTimeout(animateWord, avgWordDuration);
        };
        
        animateWord();
    }
    
    generateSimpleVisemes(word) {
        const vowels = 'aeiouAEIOU';
        
        for (let i = 0; i < word.length; i++) {
            const char = word[i];
            setTimeout(() => {
                if (!this.head || !this.isPlaying) return;
                
                if (vowels.includes(char)) {
                    const openAmount = char.toLowerCase() === 'a' ? 0.6 : 
                                       char.toLowerCase() === 'o' ? 0.5 : 0.4;
                    this.head.setFixedValue('jawOpen', openAmount);
                    
                    setTimeout(() => {
                        if (this.head) this.head.setFixedValue('jawOpen', null);
                    }, 80);
                }
            }, i * 60);
        }
    }

    // =========================================================
    // SCRIPT RUNNER - JSON-BASED BROADCAST SEQUENCES
    // =========================================================
    
    handleScriptJsonUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Support both array format and object with 'segments' array
                if (Array.isArray(data)) {
                    this.scriptQueue = data;
                } else if (data.segments && Array.isArray(data.segments)) {
                    this.scriptQueue = data.segments;
                } else {
                    throw new Error('Invalid format: expected array or object with "segments" array');
                }
                
                this.currentSegmentIndex = 0;
                this.updateStatus(`Script loaded: ${this.scriptQueue.length} segments`);
                
                // Update script preview
                const preview = this.scriptQueue.map((seg, i) => 
                    `[${i + 1}] ${seg.text?.substring(0, 50)}...`
                ).join('\n');
                this.elements.scriptInput.value = preview;
                this.elements.charCount.textContent = preview.length;
                
            } catch (error) {
                console.error('Failed to parse script JSON:', error);
                this.updateStatus(`Invalid JSON: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
    
    async runScriptQueue() {
        if (this.scriptQueue.length === 0) {
            this.updateStatus('No script loaded');
            return;
        }
        
        this.isRunningScript = true;
        this.isPlaying = true;
        this.currentSegmentIndex = 0;
        
        this.elements.btnPlay.disabled = true;
        this.elements.btnPause.disabled = false;
        this.elements.btnStop.disabled = false;
        this.elements.liveIndicator.classList.add('active');
        
        // Show overlays
        if (this.elements.chkShowLowerThird.checked) {
            this.elements.lowerThird.classList.add('visible');
        }
        if (this.elements.chkShowTicker.checked) {
            this.elements.newsTicker.classList.add('visible');
        }
        
        this.updateStatus(`Running script: ${this.scriptQueue.length} segments`);
        
        try {
            for (let i = 0; i < this.scriptQueue.length; i++) {
                if (!this.isRunningScript || !this.isPlaying) break;
                
                this.currentSegmentIndex = i;
                const segment = this.scriptQueue[i];

                this.updateStatus(`Segment ${i + 1}/${this.scriptQueue.length}`);

                // Report progress to parent window (iframe integration)
                if (window.parent !== window) {
                    window.parent.postMessage({
                        type: 'segment-progress',
                        current: i + 1,
                        total: this.scriptQueue.length
                    }, '*');
                }
                
                await this.runSegment(segment);
                
                // Delay between segments
                if (i < this.scriptQueue.length - 1) {
                    const delay = segment.delay || CONFIG.scriptRunner.segmentDelay;
                    await this.sleep(delay);
                }
            }
            
            this.updateStatus('Script complete');
            
        } catch (error) {
            console.error('Script runner error:', error);
            this.updateStatus(`Script error: ${error.message}`);
        }
        
        this.isRunningScript = false;
        this.stopBroadcast();
    }
    
    async runSegment(segment) {
        /**
         * Segment format:
         * {
         *   "text": "Text to speak",
         *   "mood": "happy",           // optional: neutral, happy, angry, sad, fear, disgust, love, sleep
         *   "gesture": "wave",         // optional: wave, thumbsUp, think, smile, nod, etc.
         *   "view": "upper",           // optional: full, upper, mid, head
         *   "voice": "af_bella",       // optional: HeadTTS voice
         *   "speed": 1.0,              // optional: speech speed
         *   "delay": 500               // optional: delay after this segment (ms)
         * }
         */
        
        const defaults = CONFIG.scriptRunner.defaults;
        
        // Apply segment settings
        const mood = segment.mood || defaults.mood;
        const view = segment.view || defaults.view;
        const gesture = segment.gesture || defaults.gesture;
        const voice = segment.voice || defaults.voice;
        const speed = segment.speed || defaults.speed;
        
        // Set mood before speaking
        if (mood) {
            this.setMood(mood);
        }
        
        // Set camera view
        if (view) {
            this.setView(view);
        }
        
        // Play gesture (non-blocking)
        if (gesture) {
            this.playGesture(gesture);
        }
        
        // Speak the text with lip-sync
        if (segment.text) {
            await this.speakText(segment.text, { voice, speed, mood, view, gesture });
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // =========================================================
    // PRE-RECORDED AUDIO WITH LIP-SYNC
    // =========================================================
    
    async playWithLipSync() {
        if (!this.uploadedAudio || !this.lipsyncData) {
            throw new Error('Audio or lip-sync data missing');
        }
        
        const audioData = await this.prepareAudioData();
        
        if (this.head) {
            this.head.speakAudio(audioData);
        }
        
        this.elements.audioPlayer.play();
        
        return new Promise((resolve) => {
            this.elements.audioPlayer.onended = () => {
                this.stopBroadcast();
                resolve();
            };
        });
    }
    
    async prepareAudioData() {
        const visemes = [];
        const vtimes = [];
        const vdurations = [];
        
        if (this.lipsyncData.mouthCues) {
            // Rhubarb format
            const sampleRate = 24000; // HeadTTS/TalkingHead use 24kHz
            
            this.lipsyncData.mouthCues.forEach((cue, index) => {
                const oculusViseme = CONFIG.visemeMapping[cue.value] || 'sil';
                visemes.push(oculusViseme);
                vtimes.push(Math.round(cue.start * 1000)); // Convert to ms
                
                const duration = index < this.lipsyncData.mouthCues.length - 1
                    ? this.lipsyncData.mouthCues[index + 1].start - cue.start
                    : cue.end - cue.start;
                vdurations.push(Math.round(duration * 1000));
            });
            
            return { visemes, vtimes, vdurations };
            
        } else if (this.lipsyncData.visemes) {
            // Already in correct format
            return this.lipsyncData;
        }
        
        return { visemes: [], vtimes: [], vdurations: [] };
    }

    // =========================================================
    // RECORDING
    // =========================================================
    
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    async startRecording() {
        try {
            const canvas = this.elements.avatarContainer.querySelector('canvas');
            if (!canvas) {
                this.updateStatus('No canvas found for recording');
                return;
            }
            
            const stream = canvas.captureStream(30);
            
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });
            
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.recordedChunks.push(e.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.elements.btnRecord.classList.add('recording');
            this.elements.recordingIndicator.classList.add('active');
            this.updateStatus('Recording started');
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.updateStatus(`Recording failed: ${error.message}`);
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        this.isRecording = false;
        this.elements.btnRecord.classList.remove('recording');
        this.elements.recordingIndicator.classList.remove('active');
        this.updateStatus('Recording stopped');
    }
    
    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsanchor_${Date.now()}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('Recording saved');
    }

    // =========================================================
    // AVATAR CONTROLS
    // =========================================================
    
    setMood(mood) {
        this.currentMood = mood;
        if (this.head) {
            this.head.setMood(mood);
        }
        
        // Update UI
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mood === mood);
        });
    }
    
    playGesture(gesture) {
        if (this.head) {
            // TalkingHead gesture methods
            const gestures = {
                'wave': () => this.head.playGesture('wave', 2),
                'thumbsUp': () => this.head.playGesture('thumbsup', 2),
                'think': () => this.head.playGesture('think', 2),
                'smile': () => this.head.setMood('happy'),
                'nod': () => this.head.playGesture('nod', 2),
                'headShake': () => this.head.playGesture('shake', 2),
                'point': () => this.head.playGesture('point', 2)
            };
            
            if (gestures[gesture]) {
                gestures[gesture]();
            }
        }
    }
    
    setView(view) {
        this.currentView = view;
        const viewConfig = CONFIG.views[view];
        
        if (this.head && viewConfig) {
            this.head.setView(view, viewConfig.distance);
        }
        
        // Update UI
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
    
    setAccentColor(color) {
        document.documentElement.style.setProperty('--accent-primary', color);
        
        this.elements.lowerThird.style.background = 
            `linear-gradient(90deg, ${color} 0%, ${color}e6 70%, transparent 100%)`;
        
        const tickerLabel = this.elements.newsTicker.querySelector('.ticker-label');
        if (tickerLabel) {
            tickerLabel.style.background = color;
        }
    }

    // =========================================================
    // FILE HANDLERS
    // =========================================================
    
    handleCustomAvatar(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        
        // Use selected body type from dropdown, or detect from filename
        let body = this.elements.avatarBodyType?.value || 'F';
        if (!this.elements.avatarBodyType?.value) {
            body = file.name.toLowerCase().includes('male') && 
                        !file.name.toLowerCase().includes('female') ? 'M' : 'F';
        }
        
        console.log(`Loading uploaded avatar: ${file.name}, body type: ${body}`);
        this.loadCustomAvatar(url, body);
    }
    
    handleCustomBackground(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        this.loadCustomBackground(url);
    }
    
    handleAudioUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const url = URL.createObjectURL(file);
        this.uploadedAudio = url;
        
        this.elements.audioPlayer.src = url;
        this.elements.audioPreview.style.display = 'block';
        
        this.updateStatus(`Audio loaded: ${file.name}`);
    }
    
    handleLipsyncUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.lipsyncData = JSON.parse(e.target.result);
                this.updateStatus(`Lip-sync data loaded: ${file.name}`);
            } catch (error) {
                this.updateStatus('Invalid lip-sync JSON file');
            }
        };
        reader.readAsText(file);
    }
    
    loadVoices() {
        const populateVoiceList = () => {
            this.voices = this.synth.getVoices();
            const voiceSelect = this.elements.browserVoice;
            voiceSelect.innerHTML = '';
            
            const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
            
            if (englishVoices.length === 0) {
                voiceSelect.innerHTML = '<option value="">No English voices available</option>';
                return;
            }
            
            englishVoices.forEach((voice, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} (${voice.lang})`;
                if (voice.default) {
                    option.selected = true;
                }
                voiceSelect.appendChild(option);
            });
        };
        
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = populateVoiceList;
        }
        populateVoiceList();
    }
    
    handleTTSEngineChange() {
        const engine = this.elements.ttsEngine.value;
        
        // Hide all voice sections
        if (this.elements.browserVoiceSection) {
            this.elements.browserVoiceSection.style.display = 'none';
        }
        if (this.elements.headttsVoiceSection) {
            this.elements.headttsVoiceSection.style.display = 'none';
        }
        if (this.elements.googleVoiceSection) {
            this.elements.googleVoiceSection.style.display = 'none';
        }
        
        // Show relevant section
        if (engine === 'browser' && this.elements.browserVoiceSection) {
            this.elements.browserVoiceSection.style.display = 'block';
        } else if (engine === 'headtts' && this.elements.headttsVoiceSection) {
            this.elements.headttsVoiceSection.style.display = 'block';
        } else if (engine === 'google' && this.elements.googleVoiceSection) {
            this.elements.googleVoiceSection.style.display = 'block';
        }
    }

    // =========================================================
    // UI UTILITIES
    // =========================================================
    
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
    }
    
    setStatusIndicator(id, status) {
        const element = this.elements[id];
        if (!element) return;
        
        element.classList.remove('ready', 'warning', 'error');
        element.classList.add(status);
    }
    
    updateStatus(message) {
        this.elements.footerStatus.textContent = message;
        if (CONFIG.app.debug) {
            console.log('[Status]', message);
        }
    }
    
    updateLoadingStatus(message) {
        if (this.elements.loadingStatus) {
            this.elements.loadingStatus.textContent = message;
        }
    }
    
    updateProgress(percent) {
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = `${percent}%`;
        }
    }
    
    startTimeDisplay() {
        const updateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.elements.timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
}

// =========================================================
// GLOBAL API FOR SCRIPT ACCESS
// =========================================================

// Expose methods for external script control
window.NewsAnchorAPI = {
    /**
     * Load and run a script from JSON array
     * @param {Array} segments - Array of segment objects
     */
    async runScript(segments) {
        if (!window.app) {
            console.error('App not initialized');
            return;
        }
        window.app.scriptQueue = segments;
        await window.app.runScriptQueue();
    },
    
    /**
     * Speak text with options
     * @param {string} text - Text to speak
     * @param {object} options - Options (mood, view, gesture, voice, speed)
     */
    async speak(text, options = {}) {
        if (!window.app) return;
        await window.app.speakText(text, options);
    },
    
    /**
     * Set avatar mood
     * @param {string} mood - Mood name
     */
    setMood(mood) {
        if (window.app) window.app.setMood(mood);
    },
    
    /**
     * Set camera view
     * @param {string} view - View name (full, upper, mid, head)
     */
    setView(view) {
        if (window.app) window.app.setView(view);
    },
    
    /**
     * Play gesture
     * @param {string} gesture - Gesture name
     */
    playGesture(gesture) {
        if (window.app) window.app.playGesture(gesture);
    },
    
    /**
     * Load avatar by ID
     * @param {string} avatarId - Avatar ID from config
     */
    async loadAvatar(avatarId) {
        if (window.app) await window.app.loadAvatar(avatarId);
    },
    
    /**
     * Stop broadcast
     */
    stop() {
        if (window.app) window.app.stopBroadcast();
    }
};

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new NewsAnchorApp();

    // Listen for postMessage commands from parent window (iframe integration)
    window.addEventListener('message', async (event) => {
        const { type, segments } = event.data;

        if (!window.app) {
            console.warn('App not ready yet');
            return;
        }

        switch (type) {
            case 'run-script':
                if (segments && Array.isArray(segments)) {
                    console.log('Received script via postMessage:', segments.length, 'segments');
                    window.app.scriptQueue = segments;

                    // Notify parent that we're starting
                    window.parent.postMessage({ type: 'broadcast-status', status: 'playing' }, '*');

                    try {
                        // Override the script complete callback to notify parent
                        const originalStopBroadcast = window.app.stopBroadcast.bind(window.app);
                        window.app.stopBroadcast = function() {
                            originalStopBroadcast();
                            window.parent.postMessage({ type: 'broadcast-status', status: 'stopped' }, '*');
                        };

                        await window.app.runScriptQueue();
                        window.parent.postMessage({ type: 'broadcast-status', status: 'complete' }, '*');
                    } catch (error) {
                        console.error('Script playback error:', error);
                        window.parent.postMessage({ type: 'broadcast-status', status: 'error', error: error.message }, '*');
                    }
                }
                break;

            case 'pause':
                window.app.pauseBroadcast();
                window.parent.postMessage({ type: 'broadcast-status', status: 'paused' }, '*');
                break;

            case 'stop':
                window.app.stopBroadcast();
                window.parent.postMessage({ type: 'broadcast-status', status: 'stopped' }, '*');
                break;

            case 'set-mood':
                if (event.data.mood) {
                    window.app.setMood(event.data.mood);
                }
                break;

            case 'set-view':
                if (event.data.view) {
                    window.app.setView(event.data.view);
                }
                break;

            case 'play-gesture':
                if (event.data.gesture) {
                    window.app.playGesture(event.data.gesture);
                }
                break;

            case 'load-avatar':
                if (event.data.avatarId) {
                    await window.app.loadAvatar(event.data.avatarId);
                }
                break;

            default:
                console.log('Unknown postMessage type:', type);
        }
    });

    // Notify parent window that we're ready
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'broadcast-status', status: 'ready' }, '*');
    }

    // Check for pending script from ClarifAI (stored in localStorage)
    setTimeout(() => {
        const pendingScript = localStorage.getItem('clarifai-pending-script');
        if (pendingScript) {
            try {
                const segments = JSON.parse(pendingScript);
                if (Array.isArray(segments) && segments.length > 0) {
                    console.log('Found pending ClarifAI script:', segments.length, 'segments');
                    window.app.scriptQueue = segments;
                    window.app.updateStatus(`ClarifAI script loaded: ${segments.length} segments. Click Play to start.`);

                    // Show preview in script input
                    const preview = segments.map((seg, i) =>
                        `[${i + 1}] ${seg.text?.substring(0, 50)}...`
                    ).join('\n');
                    if (window.app.elements.scriptInput) {
                        window.app.elements.scriptInput.value = preview;
                        window.app.elements.charCount.textContent = preview.length;
                    }

                    // Clear the pending script
                    localStorage.removeItem('clarifai-pending-script');
                }
            } catch (e) {
                console.error('Failed to parse pending script:', e);
            }
        }
    }, 2000); // Wait for app to fully initialize
});
