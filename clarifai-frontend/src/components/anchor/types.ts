// AI Anchor Types

export interface AvatarConfig {
  id: string;
  name: string;
  body: "F" | "M";
  url: string;
  thumbnail?: string;
}

export interface BackgroundConfig {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
}

export interface ScriptSegment {
  text: string;
  mood?: Mood;
  view?: CameraView;
  gesture?: Gesture;
  voice?: string;
  speed?: number;
  duration?: number;
  delay?: number;
}

export type Mood = "neutral" | "happy" | "sad" | "angry" | "fear" | "love" | "disgust" | "sleep";
export type CameraView = "full" | "upper" | "mid" | "head";
export type Gesture = "wave" | "thumbsUp" | "think" | "nod" | "headShake" | "point";
export type TTSEngine = "headtts" | "browser";

export interface HeadTTSVoice {
  id: string;
  name: string;
  gender: "F" | "M";
}

export const HEADTTS_VOICES: HeadTTSVoice[] = [
  { id: "af_bella", name: "Bella (Female US)", gender: "F" },
  { id: "af_nicole", name: "Nicole (Female US)", gender: "F" },
  { id: "af_sarah", name: "Sarah (Female US)", gender: "F" },
  { id: "af_sky", name: "Sky (Female US)", gender: "F" },
  { id: "am_adam", name: "Adam (Male US)", gender: "M" },
  { id: "am_michael", name: "Michael (Male US)", gender: "M" },
  { id: "am_fenrir", name: "Fenrir (Male US)", gender: "M" },
  { id: "bf_emma", name: "Emma (Female UK)", gender: "F" },
  { id: "bf_isabella", name: "Isabella (Female UK)", gender: "F" },
  { id: "bm_george", name: "George (Male UK)", gender: "M" },
  { id: "bm_lewis", name: "Lewis (Male UK)", gender: "M" },
];

export const PRESET_AVATARS: AvatarConfig[] = [
  {
    id: "female-1",
    name: "Sarah",
    body: "F",
    url: "https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
    thumbnail: "https://api.readyplayer.me/v1/avatars/64bfa15f0e72c63d7c3934a6/portrait.png?w=150&h=150",
  },
  {
    id: "female-2",
    name: "Emma",
    body: "F",
    url: "https://models.readyplayer.me/6460717a4c6e8a55c44fee44.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
    thumbnail: "https://api.readyplayer.me/v1/avatars/6460717a4c6e8a55c44fee44/portrait.png?w=150&h=150",
  },
  {
    id: "male-1",
    name: "Michael",
    body: "M",
    url: "https://models.readyplayer.me/64606ea54c6e8a55c44fec7e.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
    thumbnail: "https://api.readyplayer.me/v1/avatars/64606ea54c6e8a55c44fec7e/portrait.png?w=150&h=150",
  },
  {
    id: "male-2",
    name: "James",
    body: "M",
    url: "https://models.readyplayer.me/6460730c4c6e8a55c44fef95.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
    thumbnail: "https://api.readyplayer.me/v1/avatars/6460730c4c6e8a55c44fef95/portrait.png?w=150&h=150",
  },
  {
    id: "female-3",
    name: "Lisa",
    body: "F",
    url: "https://models.readyplayer.me/64607247d101a70e388e2927.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
    thumbnail: "https://api.readyplayer.me/v1/avatars/64607247d101a70e388e2927/portrait.png?w=150&h=150",
  },
  {
    id: "male-3",
    name: "David",
    body: "M",
    url: "https://models.readyplayer.me/64606f8bd101a70e388e26cc.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png",
    thumbnail: "https://api.readyplayer.me/v1/avatars/64606f8bd101a70e388e26cc/portrait.png?w=150&h=150",
  },
];

export const PRESET_BACKGROUNDS: BackgroundConfig[] = [
  {
    id: "newsroom",
    name: "Newsroom",
    url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&q=60",
  },
  {
    id: "city",
    name: "City Skyline",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=60",
  },
  {
    id: "world-map",
    name: "World Map",
    url: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&q=60",
  },
  {
    id: "tech",
    name: "Technology",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=60",
  },
  {
    id: "abstract",
    name: "Abstract",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&q=80",
    thumbnail: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=60",
  },
];

export const CAMERA_VIEWS = {
  full: { distance: 2.5, yOffset: 0 },
  upper: { distance: 0.8, yOffset: 0.1 },
  mid: { distance: 0.5, yOffset: 0.15 },
  head: { distance: 0.3, yOffset: 0.2 },
};
