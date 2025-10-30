# Logo Setup Instructions

## Where to Place Your Logo

Place your logo image file in the following location:
```
client/public/logo.png
```

## Supported Formats

The logo should be in one of these formats:
- PNG (recommended)
- SVG
- JPG/JPEG

## Recommended Logo Specifications

For best results, your logo should be:
- **Size**: At least 512x512 pixels (square format works best)
- **Format**: PNG with transparency
- **File name**: `logo.png`

## Alternative Logo Path

If you want to use a different file name or path, you can set the `VITE_APP_LOGO` environment variable in your `.env` file:

```env
VITE_APP_LOGO=/your-custom-path/logo.png
```

## Where the Logo Appears

The logo is automatically displayed in:
1. Browser favicon and tabs
2. Home page navigation bar
3. Login page header
4. Dashboard sidebar (when expanded and collapsed)
5. Dashboard sign-in prompt
6. ManusDialog component
7. Open Graph and Twitter Card metadata for social sharing
8. Apple touch icon for iOS devices

## Metadata Integration

The logo is automatically included in:
- Open Graph tags (Facebook, LinkedIn, etc.)
- Twitter Card metadata
- Apple touch icons
- Favicon
- Site theme color

All metadata has been configured in `client/index.html`.

## Testing

After adding your logo file:
1. Restart your development server
2. Check that the logo appears in all locations mentioned above
3. Verify the favicon appears in the browser tab
4. Test social sharing previews using tools like:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)

