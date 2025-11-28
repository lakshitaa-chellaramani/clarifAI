# Custom Avatars

Place your custom Ready Player Me compatible `.glb` avatar files in this folder.

## Requirements

Your custom avatars must be **Ready Player Me compatible**, which means they need:

1. **Mixamo-compatible bone structure** - Standard humanoid skeleton
2. **ARKit blend shapes** - For facial expressions
3. **Oculus Viseme blend shapes** - For lip-sync animation

## Creating a Free Avatar

### Option 1: Ready Player Me (Recommended)

1. Go to [Ready Player Me](https://readyplayer.me/avatar)
2. Create your avatar using their free tool
3. Copy your avatar ID (e.g., `64bfa15f0e72c63d7c3934a6`)
4. Download using this URL format:

```
https://models.readyplayer.me/{YOUR_AVATAR_ID}.glb?morphTargets=ARKit,Oculus+Visemes,mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png
```

### Option 2: PlayerZero

1. Go to [PlayerZero](https://playerzero.readyplayer.me/)
2. Create your avatar
3. Download using this URL format:

```
https://avatars.readyplayer.me/{YOUR_AVATAR_ID}.glb?morphTargetsGroup=ARKit,Oculus+Visemes&morphTargets=mouthSmile,mouthOpen,eyesClosed,eyesLookUp,eyesLookDown&textureSizeLimit=1024&textureFormat=png
```

## URL Parameters

| Parameter | Description |
|-----------|-------------|
| `morphTargets=ARKit,Oculus+Visemes` | Required for facial expressions and lip-sync |
| `mouthOpen,mouthSmile,eyesClosed,eyesLookUp,eyesLookDown` | Additional blend shapes |
| `textureSizeLimit=1024` | Texture resolution (512, 1024, 2048) |
| `textureFormat=png` | Texture format (png, webp) |
| `textureQuality=high` | Quality setting (low, medium, high) |
| `lod=1` | Level of detail (0=highest, 2=lowest) |
| `useDracoMeshCompression=true` | Enable compression for smaller file |

## Required Blend Shapes

For lip-sync to work properly, your avatar needs these Oculus Viseme blend shapes:

| Viseme | Sound |
|--------|-------|
| `viseme_sil` | Silence |
| `viseme_PP` | P, B, M |
| `viseme_FF` | F, V |
| `viseme_TH` | TH |
| `viseme_DD` | D, T, N |
| `viseme_kk` | K, G |
| `viseme_CH` | CH, J, SH |
| `viseme_SS` | S, Z |
| `viseme_nn` | N, L |
| `viseme_RR` | R |
| `viseme_aa` | A |
| `viseme_E` | E |
| `viseme_I` | I |
| `viseme_O` | O |
| `viseme_U` | U |

## Using Custom Avatars

### Option A: Load via URL/Path (Quick Test)

1. Place your `.glb` file in this folder
2. In the app, go to **Avatar** tab
3. Enter the path in the URL input: `./avatars/your-avatar.glb`
4. Select Body Type (Female/Male)
5. Click **Load URL**

### Option B: Upload Directly (Temporary)

1. In the app, go to **Avatar** tab
2. Click the file upload button
3. Select your `.glb` file
4. Avatar loads (but won't persist after refresh)

### Option C: Add to Config (Permanent - Recommended)

1. Place your `.glb` file in this folder
2. Open `js/config.js`
3. Find the `customAvatars` array (around line 80)
4. Add your avatar entry:

```javascript
customAvatars: [
    {
        id: 'my-avatar',              // Unique ID (no spaces)
        name: 'My Custom Avatar',     // Name shown in UI grid
        body: 'F',                    // 'F' = female, 'M' = male
        url: './avatars/my-avatar.glb',
        thumbnail: null               // Optional: './avatars/my-avatar-thumb.png'
    }
]
```

5. Save and refresh browser
6. Your avatar now appears in the selection grid!

## Naming Convention

Use descriptive names for your files:
- `female-reporter-1.glb`
- `male-anchor-blue-suit.glb`
- `custom-avatar-name.glb`

Include `male` or `female` in the filename to help the app detect the body type.

## Creating Custom Avatars (Advanced)

If you want to create avatars from scratch using Blender:

1. Model your character with a humanoid structure
2. Auto-rig using [Mixamo](https://www.mixamo.com/)
3. Add ARKit and Oculus blend shapes
4. Export as GLB with embedded textures

Helpful Blender scripts are available in the [TalkingHead repository](https://github.com/met4citizen/TalkingHead):
- `rename-mixamo-bones.py` - Rename Mixamo bones to RPM format
- `build-visemes-from-arkit.py` - Generate Oculus visemes from ARKit shapes

## Troubleshooting

### Avatar doesn't load
- Check browser console for errors
- Verify the GLB file is valid (try opening in [glTF Viewer](https://gltf-viewer.donmccurdy.com/))
- Ensure morph targets are included

### Lip-sync doesn't work
- Verify Oculus Viseme blend shapes are present
- Check that morph targets were exported correctly

### Avatar appears dark/black
- Ensure textures are embedded in the GLB
- Check lighting settings in the app
