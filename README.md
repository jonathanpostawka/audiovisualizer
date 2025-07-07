# Audio Visualizer
An interactive 3D Audio Visualizer built using HTML5, JavaScript, and Three.js. Upload audio files to create dynamic 3D visualizations that react in real-time.

## Features

- Customizable Geometries: Choose from multiple 3D shapes (spheres, cubes, stars, etc.).
- Particle System: Enable particles and adjust their shape, count, speed, and movement.
- Audio Interaction: Real-time 3D object movements and scaling driven by the uploaded music.
- Lighting Effects: Control dynamic lights and choose different surface effects.
- Camera Modes: Automate the camera with circular paths, zoom, random jumps, and more.
- Shader Effects: Enable glow, distortion, chromatic aberration, and motion blur.
- Recording: Record the visualizer and audio directly in the browser.
## How to Use

Clone the repository:

```bash
git clone https://github.com/jonathanpostawka/audiovisualizer.git
```

Open `index.html` in a browser or run the setup script to start a local server:

```bash
./setup.sh
```
This command launches a simple server on port 8000 (or the value of the `PORT`
environment variable). Open `http://localhost:8000` in your browser after
running the script. If you are running in a remote environment, make sure the
port is forwarded so you can access the application.
Upload an audio file to begin the visualization.
Click **Open Controls** to launch a floating window with hardware style knobs.
Adjust the knobs to tweak geometry dynamics, camera modes and effects.
When you are happy with the visuals press **Start Recording** to capture
audio and video. The recording is saved as an MP4 file when supported by
your browser.

### Hosting on GitHub Pages

1. Push the contents of this repository to GitHub.
2. In the repository settings open the **Pages** tab.
3. Select the `main` branch and **root** folder as the source.
4. Save the settings and GitHub will build the site. After a minute your
   visualizer is available at `https://<username>.github.io/<repo>/`.

You can still run `./setup.sh` locally for development before pushing.

### Quick Tutorial

1. Click **Open Controls**.
2. Use high quality video for best results.
3. Enable glow and bloom for a vibrant look.
4. Experiment with the camera modes while music is playing.
5. Hit **Start Recording** then **Stop Recording** to save an mp4.

Customize visual settings using the provided control panel.

## Technologies Used

- HTML5
- JavaScript (ES6+)
- Three.js
- Web Audio API

## Future Improvements

- Enhanced geometry interaction.
- Additional shader effects.
- Improved performance for large audio files.

## License

This project is licensed under the MIT License.
