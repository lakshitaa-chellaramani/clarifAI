# Custom Backgrounds

Place your custom background images in this folder.

## Recommended Specifications

- **Resolution**: 1920x1080 (Full HD) or 3840x2160 (4K)
- **Aspect Ratio**: 16:9
- **Format**: JPEG or PNG
- **File Size**: < 2MB for optimal loading

## Suggested Background Types

### Newsroom / Studio
- Professional news desk setups
- Virtual studio environments
- Green screen replacement backgrounds

### World / Maps
- World maps with data visualizations
- Geographic regions
- Satellite views

### City / Urban
- City skylines (day and night)
- Landmark backgrounds
- Urban landscapes

### Technology
- Abstract tech patterns
- Data center visuals
- Network/connectivity graphics

### Finance / Business
- Stock market graphics
- Financial data displays
- Corporate environments

## Free Background Sources

- [Unsplash](https://unsplash.com/) - High-quality free photos
- [Pexels](https://pexels.com/) - Free stock photos
- [Virtual Backgrounds](https://www.virtualbackgrounds.co/) - Meeting backgrounds
- [Sketchfab](https://sketchfab.com/) - 3D studio models (render to 2D)

## Using Custom Backgrounds

1. Add your image to this folder
2. In the app, go to the **Scene** tab
3. Click **Upload Image**
4. Select your background file

Or add to config for permanent availability:

```javascript
// In js/config.js
CONFIG.backgrounds.presets.push({
    id: 'my-background',
    name: 'My Custom Background',
    url: './backgrounds/my-background.jpg',
    thumbnail: './backgrounds/my-background-thumb.jpg'
});
```

## Tips

- Use images with the subject area on the left or right (not centered)
- Avoid busy backgrounds that distract from the avatar
- Consider lighting direction - avatars look best with light from above/front
- Dark backgrounds work well for a professional broadcast look
