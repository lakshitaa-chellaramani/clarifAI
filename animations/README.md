# Custom Animations

Place Mixamo animation files (`.fbx`) in this folder for use with your avatars.

## Getting Free Animations from Mixamo

1. Go to [Mixamo](https://www.mixamo.com/)
2. Sign in with an Adobe account (free)
3. Browse the animation library (2000+ animations)
4. Select an animation
5. Click **Download** with these settings:
   - Format: **FBX Binary (.fbx)**
   - Skin: **Without Skin**
   - Frames per Second: **30**
   - Keyframe Reduction: **None**

## Animation Categories

### Idle Animations
- `idle-breathing.fbx`
- `idle-looking-around.fbx`
- `idle-weight-shift.fbx`

### Talking Gestures
- `talking-gesture-1.fbx`
- `talking-gesture-2.fbx`
- `pointing.fbx`
- `explaining.fbx`

### Reactions
- `nodding.fbx`
- `head-shake.fbx`
- `thinking.fbx`
- `surprised.fbx`

### Professional
- `standing-greeting.fbx`
- `sitting-idle.fbx`
- `arms-crossed.fbx`

## Using Animations

The TalkingHead library supports Mixamo FBX animations directly. To use an animation:

```javascript
// Load animation from file
head.playAnimation('./animations/idle-breathing.fbx');

// Play built-in pose
head.playPose('side');
```

## Built-in Poses

TalkingHead comes with several built-in poses:
- `side` - Standing with weight on one leg
- `hip` - Hand on hip pose
- `wide` - Wide stance (male)
- `straight` - Standing straight

## Creating Custom Poses

You can create custom poses in the config:

```javascript
head.poseTemplates["custom-pose"] = {
  standing: true,
  sitting: false,
  bend: false,
  kneeling: false,
  lying: false,
  props: {
    'Hips.position': {x: 0, y: 0.989, z: 0.001},
    'Spine.rotation': {x: -0.143, y: -0.007, z: 0.005},
    // ... more bone rotations
  }
};
```

## Animation Tips

1. **Loop animations** - Choose animations marked as "In Place" for seamless looping
2. **Blend transitions** - TalkingHead automatically blends between poses
3. **Upper body only** - News anchors typically only show upper body, so focus on torso, arm, and head animations

## License

Mixamo animations are **royalty-free** for personal, commercial, and non-profit projects. However:
- Raw animation files cannot be distributed outside your project team
- Cannot be used to train ML models
