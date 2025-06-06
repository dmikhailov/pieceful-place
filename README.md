# Pieceful Place - Video Canvas Grid Puzzle

A beautiful, interactive video puzzle application where users can drag and rearrange canvas pieces to complete a video scene. Features an immersive experience with ocean sounds and smooth animations.

## 🎯 Features

- **Interactive Video Puzzle**: Drag and drop canvas pieces to solve the puzzle
- **Mobile-Friendly**: Optimized touch controls and responsive design
- **Immersive Audio**: Optional seashore audio for relaxation
- **Fullscreen Mode**: Enhanced fullscreen experience with auto-hiding controls
- **Smooth Animations**: Beautiful transitions and hover effects
- **Cross-Platform**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your system
- A modern web browser

### Installation

1. **Clone or download the project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:8080
   ```

## 📱 Mobile Testing

### Local Network Testing

1. **Start the server with external access:**
   ```bash
   npx live-server --host=0.0.0.0 --port=8080
   ```

2. **Find your computer's IP address:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
   ```

3. **Access from mobile device:**
   - Ensure your mobile device is on the **same WiFi network**
   - Open a web browser on your mobile device
   - Navigate to: `http://YOUR_IP_ADDRESS:8080`
   - Example: `http://192.168.0.94:8080`

### Mobile Features to Test

- ✅ **Touch Controls**: Tap and drag canvas pieces
- ✅ **Video Playback**: Auto-playing muted video
- ✅ **Audio Controls**: Shore audio toggle button
- ✅ **Responsive Layout**: Portrait and landscape orientations
- ✅ **Fullscreen Mode**: Enhanced mobile fullscreen experience
- ✅ **Gesture Support**: Smooth touch interactions

### Troubleshooting Mobile Access

If you can't access the application from mobile:

1. **Check WiFi**: Ensure both devices are on the same network
2. **Verify IP**: Use the correct IP address from the ifconfig command
3. **Include Port**: Always include `:8080` in the URL
4. **Use HTTP**: Use `http://` not `https://`
5. **Firewall**: Check if your computer's firewall is blocking connections

## 🎮 How to Play

1. **Start the Game**: Click the "Play" button to begin
2. **Drag Pieces**: Click and drag canvas pieces to rearrange them
3. **Solve the Puzzle**: Arrange pieces to complete the video scene
4. **Audio Control**: Toggle the seashore audio for ambience
5. **Fullscreen**: Enter fullscreen mode for immersive experience

## 🛠 Project Structure

```
pieceful-place/
├── index.html          # Main HTML file
├── script.js           # Application logic and interactions
├── package.json        # Node.js dependencies
├── audio/              # Audio files (seashore sounds)
├── video/              # Video files (puzzle content)
└── README.md           # This file
```

## 🎨 Technical Features

### Mobile Optimizations
- **Touch Events**: `touch-action: none` for precise control
- **Viewport Meta**: Proper mobile scaling
- **Responsive Grid**: Adaptive layout for different screen sizes
- **Fullscreen API**: Enhanced mobile fullscreen experience

### Browser Compatibility
- Modern browsers with HTML5 video support
- Touch-enabled devices
- WebGL canvas support

## 🔧 Development

### Available Scripts

- `npm start` - Start the development server
- `npx live-server --host=0.0.0.0` - Start server with external access

### Live Reload
The application uses live-server for automatic reload during development. Any changes to files will automatically refresh connected browsers.

## 🌐 External Testing Options

For testing outside your local network, consider:
- **ngrok**: Create public tunnels to your local server
- **Deploy**: Host on platforms like Netlify, Vercel, or GitHub Pages

## 📝 License

This project is open source and available under the MIT License.

---

**Enjoy your peaceful puzzle experience! 🧩🌊** 