let scene, camera, renderer, analyser, dataArray, audioContext, source, controls;
let geometries = [], material;
let playButton, pauseButton, loadingBar, loadingBarContainer, loadingText;
let geometrySelect, bgColorInput, geomColorInput, dynamicsStrengthInput, dynamicsIntensityInput, randomizeCheckbox, light1ColorInput, light2ColorInput, lightRotationSpeedInput, surfaceTypeSelect, masterEffectStrengthInput, geometryCountInput, bgColorAutoSelect, geomColorAutoSelect, stroboColorInput, cameraMovementCheckbox, strobeEffectCheckbox, cameraSpeedInput, cameraCrazinessInput;
let positionSensitivityInput, rotationSensitivityInput, scaleSensitivityInput, skewSensitivityInput, twistSensitivityInput, movementPatternSelect;
let audio, isPlaying = false;
let counter = 0;
let mediaRecorder;
let recordedChunks = [];
let recording = false;
let light1, light2;
let dynamicsStrength = 1, dynamicsIntensity = 1, randomize = false, masterEffectStrength = 1, lightRotationSpeed = 0.1;
let geometryCount = 1, organicMovement = false;
let cameraRadius = 10;
let cameraAngle = 0;
let automateCamera = false, strobeEffect = false;
let cameraSpeed = 1, cameraCraziness = 0;
let cameraModeSelect;
let cameraMode = 'normal';
let cameraHeightOffset = 0;
let particles, particleSystem, particleGeometry, particleMaterial;
let particleToggle, particleCountInput, particleShapeSelect, particleSizeInput, particleSpeedInput, particleDirectionSelect, particleMovementSelect;
let particleCount = 5000;
let particleSize = 1;
let particleSpeed = 1;
let particleDirection = 'outward';
let particleMovement = 'linear';
let automateDynamics = false;
let dynamicAutoToggle;
let wasAutomateCameraEnabled = true;
let movementSensitivity = {
    position: 1.0,
    rotation: 0.3,
    scale: 10.0,
    skew: 0.5,
    twist: 0.5
};
let movementPattern = 'oscillation';
let glowEffectToggle, distortionEffectToggle, chromaticAberrationToggle, motionBlurToggle, bloomIntensityInput;

function init() {
    scene = new THREE.Scene();
	// Add the event listener for the camera mode dropdown

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = cameraRadius;

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('audioCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    light1 = new THREE.PointLight("#ffffff", 10);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    light2 = new THREE.PointLight("#ffffff", 10);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    material = createMaterial();

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.update();

    window.addEventListener('resize', onWindowResize, false);

    setupUIControls();
	setupParticleControls();
setupNewEffectControls();
    createGeometries();
	createParticleSystem();
	
    animate();
}
function createParticleSystem() {
  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 100);
  const colors = new Float32Array(particleCount * 100);

  for (let i = 0; i < particleCount * 100; i += 3) {
    positions[i] = (Math.random() - 0.5) * 800;
    positions[i + 1] = (Math.random() - 0.5) * 800;
    positions[i + 2] = (Math.random() - 0.5) * 800;

    colors[i] = Math.random();
    colors[i + 1] = Math.random();
    colors[i + 2] = Math.random();
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  particleMaterial = new THREE.PointsMaterial({
    size: particleSize,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    sizeAttenuation: true,
  });

  updateParticleShape(particleShapeSelect.value);

  particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);
}

function setupParticleControls() {
  particleToggle = document.getElementById('particlesToggle');
  particleCountInput = document.getElementById('particleCount');
  particleShapeSelect = document.getElementById('particleShape');
  particleSizeInput = document.getElementById('particleSize');
  particleSpeedInput = document.getElementById('particleSpeed');
  particleDirectionSelect = document.getElementById('particleDirection');
  particleMovementSelect = document.getElementById('particleMovement');

  particleToggle.addEventListener('change', (event) => {
    particleSystem.visible = event.target.checked;
  });

  particleCountInput.addEventListener('input', (event) => {
    particleCount = parseInt(event.target.value);
    updateParticleSystem();
  });

  particleShapeSelect.addEventListener('change', (event) => {
  updateParticleShape(event.target.value);
});

  particleSizeInput.addEventListener('input', (event) => {
    particleSize = parseFloat(event.target.value);
    particleMaterial.size = particleSize;
  });

  particleSpeedInput.addEventListener('input', (event) => {
    particleSpeed = parseFloat(event.target.value);
  });

  particleDirectionSelect.addEventListener('change', (event) => {
    particleDirection = event.target.value;
  });

  particleMovementSelect.addEventListener('change', (event) => {
    particleMovement = event.target.value;
  });
}

function updateParticleSystem() {
  scene.remove(particleSystem);
  createParticleSystem();
}

function createStarGeometry() {
  const starGeometry = new THREE.BufferGeometry();
  const vertices = [];
  const outerRadius = 0.5;
  const innerRadius = 0.2;
  const numPoints = 10;

  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i / numPoints) * Math.PI;
    vertices.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    );
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  return starGeometry;
}

function setupNewEffectControls() {
    glowEffectToggle = document.getElementById('glowEffectToggle');
    distortionEffectToggle = document.getElementById('distortionEffectToggle');
    chromaticAberrationToggle = document.getElementById('chromaticAberrationToggle');
    motionBlurToggle = document.getElementById('motionBlurToggle');
    bloomIntensityInput = document.getElementById('bloomIntensity');

    glowEffectToggle.addEventListener('change', (event) => {
        material.uniforms.glowEnabled.value = event.target.checked;
    });

    distortionEffectToggle.addEventListener('change', (event) => {
        material.uniforms.distortionEnabled.value = event.target.checked;
    });

    chromaticAberrationToggle.addEventListener('change', (event) => {
        material.uniforms.chromaticAberrationEnabled.value = event.target.checked;
    });

    motionBlurToggle.addEventListener('change', (event) => {
        material.uniforms.motionBlurEnabled.value = event.target.checked;
    });

    bloomIntensityInput.addEventListener('input', (event) => {
        material.uniforms.bloomIntensity.value = parseFloat(event.target.value);
    });
}


function updateParticleShape(shape) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  switch (shape) {
    case 'square':
      ctx.fillRect(16, 16, 32, 32);
      break;
    case 'triangle':
      ctx.beginPath();
      ctx.moveTo(32, 16);
      ctx.lineTo(16, 48);
      ctx.lineTo(48, 48);
      ctx.closePath();
      ctx.fill();
      break;
    case 'star':
      drawStar(ctx, 32, 32, 5, 16, 8);
      break;
    case 'circle':
    default:
      ctx.beginPath();
      ctx.arc(32, 32, 16, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  particleMaterial.map = texture;
  particleMaterial.needsUpdate = true;
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}


function createMaterial() {
    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 1.0 },
            color: { value: new THREE.Color(0xffffff) },
            frequencyData: { value: new Uint8Array(256) },
            dynamicsStrength: { value: dynamicsStrength },
            dynamicsIntensity: { value: dynamicsIntensity },
            randomize: { value: randomize },
            masterEffectStrength: { value: masterEffectStrength },
            light1Position: { value: light1.position },
            light2Position: { value: light2.position },
            light1Color: { value: new THREE.Color("#ffffff") },
            light2Color: { value: new THREE.Color("#ffffff") },
            roughness: { value: 0.5 },
            metalness: { value: 0.5 },
            transparency: { value: 1.0 },
            wireframe: { value: false },
	    glowEnabled: { value: false }, // Default off
            chromaticAberrationEnabled: { value: false }, // Default off
            bloomIntensity: { value: 1.0 } // Default intensity
        },
        vertexShader: `
    uniform float time;
    uniform float dynamicsStrength;
    uniform float dynamicsIntensity;
    uniform bool randomize;
    uniform float masterEffectStrength;
    uniform float frequencyData[256];
    uniform bool distortionEnabled;
    uniform bool motionBlurEnabled;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = vec3(modelViewMatrix * vec4(position, 1.0));
        vec3 pos = position;
        float distance = length(pos);
        float edgeFactor = pow(distance, 2.0);
        float freqValue = frequencyData[int(mod(distance * 30.0, 256.0))] / 255.0;
        pos += normalize(pos) * freqValue * edgeFactor * dynamicsStrength * dynamicsIntensity * masterEffectStrength;

        // Apply randomize effect if enabled
        if (randomize) {
            pos.x += sin(time * 0.1 + pos.x) * 0.1; // Increased the intensity
            pos.y += cos(time * 0.1 + pos.y) * 0.1;
            pos.z += sin(time * 0.1 + pos.z) * 0.1;
        }

        // Apply distortion effect with increased intensity
        if (distortionEnabled) {
            pos.x += sin(time + pos.x * 10.0) * 0.5; // Increased the distortion factor
            pos.y += cos(time + pos.y * 10.0) * 0.5;
            pos.z += sin(time + pos.z * 10.0) * 0.5;
        }

        // Apply motion blur effect with more intensity
        if (motionBlurEnabled) {
            pos += normalize(pos) * sin(time * 0.5) * 0.5; // Increased blur intensity
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`,

        fragmentShader: `
    uniform vec3 color;
    uniform vec3 light1Position;
    uniform vec3 light2Position;
    uniform vec3 light1Color;
    uniform vec3 light2Color;
    uniform float masterEffectStrength;
    uniform float roughness;
    uniform float metalness;
    uniform float transparency;
    uniform bool wireframe;
    uniform bool glowEnabled;
    uniform bool chromaticAberrationEnabled;
    uniform float bloomIntensity;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
        vec3 lightDir1 = normalize(light1Position - vPosition);
        vec3 lightDir2 = normalize(light2Position - vPosition);
        float intensity1 = max(dot(vNormal, lightDir1), 0.0);
        float intensity2 = max(dot(vNormal, lightDir2), 0.0);
        vec3 lightEffect1 = light1Color * intensity1;
        vec3 lightEffect2 = light2Color * intensity2;
        vec3 baseColor = color * (lightEffect1 + lightEffect2);
        
        // Apply glow effect with more intensity
        if (glowEnabled) {
            // Calculate distance from the vertex to the camera
            float glowDistance = length(vPosition - cameraPosition);
            
            // Calculate the glow intensity, uniform across the surface
            float glowIntensity = smoothstep(0.2, 1.0, glowDistance) * bloomIntensity * 2.0;

            // Apply the glow color across the entire surface
            vec3 glowColor = vec3(0.01, 0.4, 0.1) * glowIntensity;

            // Add the glow on top of the base color
            baseColor += glowColor;
        }

        // Apply chromatic aberration effect with increased impact
        if (chromaticAberrationEnabled) {
            baseColor.r += sin(vPosition.x * 15.0) * 0.5; // Increased chromatic aberration factor
            baseColor.g += sin(vPosition.y * 15.0) * 0.5;
            baseColor.b += sin(vPosition.z * 15.0) * 0.5;
        }
        
        // Final color output
        gl_FragColor = vec4(baseColor * masterEffectStrength, transparency);
    }
`,

        transparent: true,
        side: THREE.DoubleSide,
        wireframe: false,
    });
}

function createGeometries() {
    removeGeometries();
    for (let i = 0; i < geometryCount; i++) {
        const geometry = new THREE.Mesh(getGeometry(geometrySelect.value), material);
        geometry.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25
        );
        geometries.push(geometry);
        scene.add(geometry);
    }
}

function getGeometry(type) {
    switch (type) {
        case 'sphere':
            return new THREE.SphereGeometry(1, 64, 64);
        case 'cube':
            return new THREE.BoxGeometry(1.5, 1.5, 1.5);
        case 'torus':
            return new THREE.TorusGeometry(1, 0.4, 32, 64);
        case 'plane':
            return new THREE.PlaneGeometry(2.5, 2.5, 32, 32);
        case 'icosahedron':
            return new THREE.IcosahedronGeometry(1, 0);
        case 'octahedron':
            return new THREE.OctahedronGeometry(1, 0);
        case 'tetrahedron':
            return new THREE.TetrahedronGeometry(1, 0);
        case 'dodecahedron':
            return new THREE.DodecahedronGeometry(1, 0);
        case 'cylinder':
            return new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
        case 'cone':
            return new THREE.ConeGeometry(1, 2, 32);
        case 'pyramid':
            return new THREE.ConeGeometry(1, 2, 4);
        case 'knot':
            return new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
        case 'ring':
            return new THREE.RingGeometry(0.5, 1.5, 32);
        case 'grid':
            return new THREE.PlaneGeometry(5, 5, 10, 10);
        case 'star':
            const starShape = new THREE.Shape();
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI) / 5;
                const radius = i % 2 === 0 ? 1 : 0.5;
                starShape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
            }
            return new THREE.ExtrudeGeometry(starShape, { depth: 0.5, bevelEnabled: false });
        case 'torusKnot':
            return new THREE.TorusKnotGeometry(1, 0.4, 100, 16);
        case 'boxLine':
            return new THREE.BoxGeometry(1, 1, 1, 10, 10, 10);
        case 'heart':
            const heartShape = new THREE.Shape();
            heartShape.moveTo(0, 0.75);
            heartShape.bezierCurveTo(0.5, 0.75, 1, 0.5, 1, 0);
            heartShape.bezierCurveTo(1, -0.5, 0.5, -0.75, 0, -1);
            heartShape.bezierCurveTo(-0.5, -0.75, -1, -0.5, -1, 0);
            heartShape.bezierCurveTo(-1, 0.5, -0.5, 0.75, 0, 0.75);
            return new THREE.ExtrudeGeometry(heartShape, { depth: 0.5, bevelEnabled: false });
        case 'arrow':
            return new THREE.ConeGeometry(1, 2, 8);
        case 'gear':
            return new THREE.CylinderGeometry(0.5, 1, 0.5, 32);
        default:
            return new THREE.SphereGeometry(1, 64, 64);
    }
}

function removeGeometries() {
    geometries.forEach(geometry => scene.remove(geometry));
    geometries = [];
}

function applySurfaceType(type) {
    switch (type) {
        case 'reflective':
            material.uniforms.metalness.value = 1.0;
            material.uniforms.roughness.value = 0.0;
            material.wireframe = false;
            break;
        case 'transparent':
            material.uniforms.transparency.value = 0.5;
            material.wireframe = false;
            break;
        case 'psychedelic':
            material.uniforms.color.value.set(0xff00ff);
            material.wireframe = true;
            break;
        case 'chrome':
            material.uniforms.metalness.value = 1.0;
            material.uniforms.roughness.value = 0.0;
            material.uniforms.color.value.set(0xcccccc);
            material.wireframe = false;
            break;
        case 'holographic':
            material.uniforms.color.value.set(0x00ffff);
            material.uniforms.transparency.value = 0.8;
            material.wireframe = true;
            break;
        case 'fluid':
            material.uniforms.wavyStrength = 1.5;
            material.uniforms.color.value.set(0x0000ff);
            break;
        default:
            material.uniforms.metalness.value = 0.5;
            material.uniforms.roughness.value = 0.5;
            material.uniforms.transparency.value = 1.0;
            material.wireframe = false;
            break;
    }
}

function setupUIControls() {
    playButton = document.getElementById('playButton');
    pauseButton = document.getElementById('pauseButton');
    loadingBar = document.getElementById('loadingBar');
    loadingBarContainer = document.getElementById('loadingBarContainer');
    loadingText = document.getElementById('loadingText');
    geometrySelect = document.getElementById('geometrySelect');
    geometryCountInput = document.getElementById('geometryCount');
    bgColorInput = document.getElementById('bgColor');
    geomColorInput = document.getElementById('geomColor');
    dynamicsStrengthInput = document.getElementById('dynamicsStrength');
    dynamicsIntensityInput = document.getElementById('dynamicsIntensity');
    randomizeCheckbox = document.getElementById('randomize');
    light1ColorInput = document.getElementById('light1Color');
    light2ColorInput = document.getElementById('light2Color');
    lightRotationSpeedInput = document.getElementById('lightRotationSpeed');
    surfaceTypeSelect = document.getElementById('surfaceType');
    masterEffectStrengthInput = document.getElementById('masterEffectStrength');
    bgColorAutoSelect = document.getElementById('bgColorAuto');
    geomColorAutoSelect = document.getElementById('geomColorAuto');
    stroboColorInput = document.getElementById('stroboColor');
    cameraMovementCheckbox = document.getElementById('automateCamera');
    strobeEffectCheckbox = document.getElementById('strobeEffect');
    cameraSpeedInput = document.getElementById('cameraSpeed');
    cameraCrazinessInput = document.getElementById('cameraCraziness');
    setupMovementControls();
    playButton.addEventListener('click', playAudio);
    pauseButton.addEventListener('click', pauseAudio);
    dynamicAutoToggle = document.getElementById('dynamicAutoToggle');
    dynamicAutoToggle.addEventListener('change', (event) => {
        automateDynamics = event.target.checked;
    });
	document.addEventListener('DOMContentLoaded', () => {
     cameraModeSelect = document.getElementById('cameraModeSelect');

    // Attach event listener to the dropdown
    cameraModeSelect.addEventListener('change', (event) => {
        cameraMode = event.target.value;
        console.log("Selected Camera Mode: ", cameraMode);  // Debugging log
    });

	document.getElementById('startRecordingButton').addEventListener('click', startRecording);
    document.getElementById('stopRecordingButton').addEventListener('click', stopRecording);
});

    geometrySelect.addEventListener('change', createGeometries);

    geometryCountInput.addEventListener('input', (event) => {
        geometryCount = parseInt(event.target.value);
        createGeometries();
    });

    surfaceTypeSelect.addEventListener('change', (event) => {
        applySurfaceType(event.target.value);
    });

    bgColorInput.addEventListener('input', (event) => {
        renderer.setClearColor(event.target.value);
    });

    geomColorInput.addEventListener('input', (event) => {
        material.uniforms.color.value.set(event.target.value);
    });

    dynamicsStrengthInput.addEventListener('input', (event) => {
        dynamicsStrength = parseFloat(event.target.value);
        material.uniforms.dynamicsStrength.value = dynamicsStrength;
    });

    dynamicsIntensityInput.addEventListener('input', (event) => {
        dynamicsIntensity = parseFloat(event.target.value);
        material.uniforms.dynamicsIntensity.value = dynamicsIntensity;
    });

    randomizeCheckbox.addEventListener('change', (event) => {
        randomize = event.target.checked;
        material.uniforms.randomize.value = randomize;
    });

    light1ColorInput.addEventListener('input', (event) => {
        light1.color.set(event.target.value);
        material.uniforms.light1Color.value.set(event.target.value);
    });

    light2ColorInput.addEventListener('input', (event) => {
        light2.color.set(event.target.value);
        material.uniforms.light2Color.value.set(event.target.value);
    });

    lightRotationSpeedInput.addEventListener('input', (event) => {
        lightRotationSpeed = parseFloat(event.target.value);
    });

    masterEffectStrengthInput.addEventListener('input', (event) => {
        masterEffectStrength = parseFloat(event.target.value);
        material.uniforms.masterEffectStrength.value = masterEffectStrength;
    });

    cameraMovementCheckbox.addEventListener('change', (event) => {
        automateCamera = event.target.checked;
    });

    cameraSpeedInput.addEventListener('input', (event) => {
        cameraSpeed = parseFloat(event.target.value);
    });

    cameraCrazinessInput.addEventListener('input', (event) => {
        cameraCraziness = parseFloat(event.target.value);
    });

    strobeEffectCheckbox.addEventListener('change', (event) => {
        strobeEffect = event.target.checked;
    });
}

function setupMovementControls() {
    positionSensitivityInput = document.getElementById('positionSensitivity');
    rotationSensitivityInput = document.getElementById('rotationSensitivity');
    scaleSensitivityInput = document.getElementById('scaleSensitivity');
    skewSensitivityInput = document.getElementById('skewSensitivity');
    twistSensitivityInput = document.getElementById('twistSensitivity');
    movementPatternSelect = document.getElementById('movementPatternSelect');

    positionSensitivityInput.addEventListener('input', (event) => {
        movementSensitivity.position = parseFloat(event.target.value);
    });

    rotationSensitivityInput.addEventListener('input', (event) => {
        movementSensitivity.rotation = parseFloat(event.target.value);
    });

    scaleSensitivityInput.addEventListener('input', (event) => {
        movementSensitivity.scale = parseFloat(event.target.value);
    });

    skewSensitivityInput.addEventListener('input', (event) => {
        movementSensitivity.skew = parseFloat(event.target.value);
    });

    twistSensitivityInput.addEventListener('input', (event) => {
        movementSensitivity.twist = parseFloat(event.target.value);
    });

    movementPatternSelect.addEventListener('change', (event) => {
        movementPattern = event.target.value;
    });
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now() * 0.001;

    if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        material.uniforms.frequencyData.value = dataArray;
	if (automateDynamics) {
            // Calculate the bass frequencies (usually the first ~32 frequencies in the spectrum)
            let bassSum = 0;
            let bassCount = 32; // Lower frequencies are typically represented in the first part of the array.
            for (let i = 0; i < bassCount; i++) {
                bassSum += dataArray[i];
            }
            let averageBass = bassSum / bassCount;
            
            // Normalize the bass value (0 to 1)
            let normalizedBass = averageBass / 255;

            // Dynamically adjust dynamics based on the bass
            dynamicsStrength = normalizedBass * 3; // Adjust this multiplier based on desired intensity
            dynamicsIntensity = normalizedBass * 3;

            // Update the material to reflect the new dynamics values
            material.uniforms.dynamicsStrength.value = dynamicsStrength;
            material.uniforms.dynamicsIntensity.value = dynamicsIntensity;
        }
    }

    light1.position.x = Math.sin(time * lightRotationSpeed) * 5;
    light1.position.z = Math.cos(time * lightRotationSpeed) * 5;
    light2.position.x = Math.cos(time * lightRotationSpeed) * 5;
    light2.position.z = Math.sin(time * lightRotationSpeed) * 5;

    light1.intensity = 10 * (0.3 + Math.random() * 0.7);
    light2.intensity = 10 * (0.3 + Math.random() * 0.7);

    geometries.forEach((geometry, index) => {
        let audioData = 0;
        if (dataArray && dataArray.length > 0) {
            audioData = dataArray[index % 256] / 255;
        }
        let audioScale = 1 + audioData * dynamicsIntensity * 20 * movementSensitivity.scale;
        geometry.scale.set(audioScale, audioScale, audioScale);

        let positionShift = audioData * movementSensitivity.position;
        // Handle different movement patterns
        if (movementPattern !== 'none') { // Add this check to prevent movement when "None" is selected
            geometry.position.x += positionShift * Math.sin(time + index);
            geometry.position.y += positionShift * Math.cos(time + index);
            geometry.position.z += positionShift * Math.sin(time * 0.5 + index);

            let rotationSpeed = 0.01 + audioData * movementSensitivity.rotation * 0.008;
            geometry.rotation.x += rotationSpeed;
            geometry.rotation.y += rotationSpeed;

            geometry.rotation.z += Math.sin(time * movementSensitivity.skew + index) * 0.05;
            geometry.rotation.x += Math.cos(time * movementSensitivity.twist + index) * 0.05;

            if (movementPattern === 'oscillation') {
                geometry.position.x += Math.sin(time * movementSensitivity.position + index) * 0.01;
                geometry.position.y += Math.cos(time * movementSensitivity.position + index) * 0.01;
            } else if (movementPattern === 'wave') {
                geometry.position.x += Math.sin(time * movementSensitivity.position + index) * 0.02;
                geometry.position.y += Math.sin(time * movementSensitivity.position + index * 0.05) * 0.02;
            } else if (movementPattern === 'spiral') {
                geometry.position.x += Math.sin(time * movementSensitivity.position + index) * 0.03;
                geometry.position.z += Math.cos(time * movementSensitivity.position + index) * 0.03;
            }
        }

        if (analyser) {
            audioScale = 1 + (dataArray[index % 256] / 255) * dynamicsIntensity * 2;
            geometry.scale.set(audioScale, audioScale, audioScale);
        }
    });

    controls.update();

    
    updateCameraMovement(time);

    automateColors(time);

    if (strobeEffect) {
        applyStrobeEffect();
    }

    material.uniforms.time.value += 0.05;

	animateParticles();

    renderer.render(scene, camera);
}

function animateParticles() {
  if (!particleSystem.visible) return;

  const positions = particleGeometry.attributes.position.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    let dx, dy, dz;

    switch (particleDirection) {
      case 'outward':
        dx = x * particleSpeed * 0.01;
        dy = y * particleSpeed * 0.01;
        dz = z * particleSpeed * 0.01;
        break;
      case 'inward':
        dx = -x * particleSpeed * 0.01;
        dy = -y * particleSpeed * 0.01;
        dz = -z * particleSpeed * 0.01;
        break;
      case 'upward':
        dy = particleSpeed * 0.1;
        dx = dz = 0;
        break;
      case 'downward':
        dy = -particleSpeed * 0.1;
        dx = dz = 0;
        break;
      case 'random':
        dx = (Math.random() - 0.5) * particleSpeed * 0.1;
        dy = (Math.random() - 0.5) * particleSpeed * 0.1;
        dz = (Math.random() - 0.5) * particleSpeed * 0.1;
        break;
    }

    switch (particleMovement) {
      case 'linear':
        positions[i] += dx;
        positions[i + 1] += dy;
        positions[i + 2] += dz;
        break;
      case 'circular':
        const angle = particleSpeed * 0.02;
        const newX = x * Math.cos(angle) - z * Math.sin(angle);
        const newZ = x * Math.sin(angle) + z * Math.cos(angle);
        positions[i] = newX;
        positions[i + 2] = newZ;
        break;
      case 'spiral':
        const spiralAngle = particleSpeed * 0.02;
        const radius = Math.sqrt(x * x + z * z);
        positions[i] = radius * Math.cos(spiralAngle);
        positions[i + 1] += dy;
        positions[i + 2] = radius * Math.sin(spiralAngle);
        break;
    }

    // Reset particles that go out of bounds
    if (Math.abs(positions[i]) > 5000 || Math.abs(positions[i + 1]) > 5000 || Math.abs(positions[i + 2]) > 5000) {
      positions[i] = (Math.random() - 0.5) * 1200;
      positions[i + 1] = (Math.random() - 0.5) * 1200;
      positions[i + 2] = (Math.random() - 0.5) * 1200;
    }
  }

  particleGeometry.attributes.position.needsUpdate = true;
}

function automateColors(time) {
    const stroboInterval = Math.floor(time * 10) % 3;

    if (bgColorAutoSelect.value === "strobo") {
        switch (stroboInterval) {
            case 0:
                renderer.setClearColor(0xffffff);
                break;
            case 1:
                renderer.setClearColor(0x000000);
                break;
            case 2:
                renderer.setClearColor(stroboColorInput.value);
                break;
        }
    } else if (bgColorAutoSelect.value === "fade") {
        renderer.setClearColor(`hsl(${Math.floor(time * 10 % 360)}, 100%, 50%)`);
    }

    if (geomColorAutoSelect.value === "strobo") {
        switch (stroboInterval) {
            case 0:
                material.uniforms.color.value.set(0xffffff);
                break;
            case 1:
                material.uniforms.color.value.set(0x000000);
                break;
            case 2:
                material.uniforms.color.value.set(stroboColorInput.value);
                break;
        }
    } else if (geomColorAutoSelect.value === "fade") {
        material.uniforms.color.value.setHSL((time * 0.1) % 1, 1, 0.5);
    }
}

function applyStrobeEffect() {
    const maxIntensity = Math.max(...dataArray);
    const strobeColor = maxIntensity > 128 ? 0xffffff : 0x000000;
    renderer.setClearColor(strobeColor);
}

function updateCameraMovement(time) {
const mainGeometryPosition = geometries.length > 0 ? geometries[0].position : new THREE.Vector3(0, 0, 0);
	if (!automateCamera && wasAutomateCameraEnabled) {
        // If autofocus is turned off, do not update the camera position
	camera.lookAt(mainGeometryPosition);
	wasAutomateCameraEnabled = false;
        return;
    }
if (automateCamera) {
        const angle = time * cameraSpeed;
        const crazinessFactor = cameraCraziness * 10;

	const targetGeometryIndex = Math.floor(time % geometries.length);
        const targetGeometryPosition = geometries.length > 0 ? geometries[targetGeometryIndex].position : mainGeometryPosition;

        // Set the camera position to orbit around the main geometry
        // Calculate the camera's X, Y, Z position for a more complex path
        const radiusOffset = Math.sin(angle * 0.5) * 250;  // Adds variation in distance
	switch (cameraMode) {
            case 'fixedRotation':
                // Camera rotates around the object without changing position
                camera.position.x = targetGeometryPosition.x + 50;
                camera.position.y = targetGeometryPosition.y + 50;
                camera.position.z = targetGeometryPosition.z;
                break;

            case 'zoomInOut':
                // Camera zooms in and out while focusing on the object
                camera.position.z = targetGeometryPosition.z + (cameraRadius + radiusOffset) + Math.sin(angle) * 10;
                break;

            case 'circularPath':
                // Camera moves in a perfect circular orbit around the object
                camera.position.x = targetGeometryPosition.x + Math.sin(angle) * (cameraRadius + radiusOffset);
                camera.position.z = targetGeometryPosition.z + Math.cos(angle) * (cameraRadius + radiusOffset);
                camera.position.y = targetGeometryPosition.y;
                break;

            case 'randomJump':
                // Camera moves to random positions around the object
                if (Math.random() > 0.95) {
                    camera.position.x = targetGeometryPosition.x + (Math.random() - 0.5) * 100;
                    camera.position.y = targetGeometryPosition.y + (Math.random() - 0.5) * 100;
                    camera.position.z = targetGeometryPosition.z + (Math.random() - 0.5) * 100;
                }
                break;

            case 'spiral':
                // Camera spirals in towards or out from the object
                camera.position.x = targetGeometryPosition.x + Math.sin(angle) * (cameraRadius + radiusOffset);
                camera.position.z = targetGeometryPosition.z + Math.cos(angle) * (cameraRadius + radiusOffset);
                camera.position.y += 1;  // Gradually spirals upwards
                break;

            case 'normal':
            
        camera.position.x = targetGeometryPosition.x + Math.sin(angle) * (cameraRadius + radiusOffset) + Math.sin(angle * 1.5) * crazinessFactor;
        camera.position.z = targetGeometryPosition.z + Math.cos(angle) * (cameraRadius + radiusOffset) + Math.cos(angle * 1.5) * crazinessFactor;
        camera.position.y = targetGeometryPosition.y + Math.sin(angle * 0.5) * crazinessFactor ;

	// Make the camera occasionally dive through the geometry
	if (Math.sin(time) > 0.9 && counter < 4) {
		count();
	}
        if (Math.sin(time) > 0.9 && counter == 4) {
            camera.position.y = targetGeometryPosition.y + Math.sin(angle * 0.8) * 5.5;  // Dive
        }
	break;
	}
        // Make the camera always look at the main geometry
        camera.lookAt(targetGeometryPosition);

        // Update the flag to track that autofocus is enabled
        wasAutomateCameraEnabled = true;
	
    }
}
function count(){
 counter++;
 if(counter>=4){
	counter = 0;
}
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function playAudio() {
    if (audio && !isPlaying) {
        isPlaying = true;
        audioContext.resume();
        audio.play();
    }
}

function pauseAudio() {
    if (audio && isPlaying) {
        isPlaying = false;
        audioContext.suspend();
        audio.pause();
    }
}

// Add the recording functions below pauseAudio
function startRecording() {
    const canvasStream = renderer.domElement.captureStream(60); // Capture canvas at 60 FPS

    // If audio is playing, capture the audio stream
    let audioStream;
    if (audio && audioContext && isPlaying) {
        audioStream = audio.captureStream();
    }

    // Combine both the canvas and audio streams
    const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks()
    ]);
	 recordedChunks = [];

    mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

    mediaRecorder.ondataavailable = function(event) {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = function() {
        const blob = new Blob(recordedChunks, {
            type: 'video/webm'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'scene_recording_with_audio.webm';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
	// Reset mediaRecorder after stopping the recording
        mediaRecorder = null;
    };

    mediaRecorder.start();
    recording = true;
}

function stopRecording() {
    if (mediaRecorder && recording) {
        mediaRecorder.stop();
        recording = false;
    }
}

document.getElementById('fileInput').addEventListener('change', function() {
    const file = this.files[0];
    audio = new Audio(URL.createObjectURL(file));
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    source = audioContext.createMediaElementSource(audio);
    
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    loadingBarContainer.style.display = 'block';
    audio.addEventListener('progress', updateLoadingProgress);
    audio.addEventListener('canplaythrough', hideLoadingBar);
    audio.addEventListener('ended', () => {
        isPlaying = false;
        audioContext.suspend();
    });

    audio.addEventListener('error', () => {
        loadingText.textContent = "Error loading audio";
        loadingBarContainer.style.backgroundColor = "#f00";
    });
});

function updateLoadingProgress() {
    if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        const duration = audio.duration;
        if (duration > 0) {
            const progress = (bufferedEnd / duration) * 100;
            loadingBar.style.width = `${progress}%`;
            loadingText.textContent = `Loading... ${Math.round(progress)}%`;
        }
    }
}

function hideLoadingBar() {
    loadingBarContainer.style.display = 'none';
}

init();
