import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Reflector } from "three/addons/objects/Reflector.js";

/**
 * The 3D car in the home hero. Plain Three.js (no React) so the whole thing
 * lives in one lazily-loaded chunk that is only fetched on the client.
 *
 * Timeline (seconds from the first visible frame):
 *   0    – 1.5   slides in fast from the right, drifting (yawed + leaning)
 *   1.5  – 2.0   brakes hard: straightens with a snap, nose dips and bounces
 *   2.0  – 2.3   holds still
 *   2.3  – ∞     spins slowly on its own axis, forever
 */

export type HeroCarOptions = {
  /** Phones/tablets: lighter model, lower pixel ratio, no floor reflection. */
  lite: boolean;
  /** prefers-reduced-motion: skip the entrance and the spin, show a still. */
  reducedMotion: boolean;
  onLoaded?: () => void;
  /** Fires once, the moment the car comes to rest after its drift. */
  onStop?: () => void;
  onError?: (error: unknown) => void;
};

export type HeroCarHandle = {
  /** Pause rendering while the hero is scrolled out of view. */
  setVisible: (visible: boolean) => void;
  dispose: () => void;
};

const MODEL_URL = "/car-hero.glb";
const MODEL_URL_LITE = "/car-hero-lite.glb";

// Scene units are meters; the car is normalized to this length.
const CAR_LENGTH = 4.4;

const ENTRY_END = 1.5;
const BRAKE_TIME = 0.28; // the hard stop itself; the rest of 1.5–2.0 is the bounce
const STOP_AT = ENTRY_END + BRAKE_TIME;
const SPIN_START = 2.3;
const SPIN_RAMP = 1.2; // seconds to ease into full spin speed
const SPIN_SPEED = (Math.PI * 2) / 14; // one full turn every 14s

const DRIFT_YAW = 0.38; // rad the car is angled against its travel while drifting
const DRIFT_ROLL = 0.06; // rad of body lean while drifting
const BRAKE_PITCH = 0.05; // rad of nose dive when it stops

// A still, flattering 3/4 angle for reduced-motion users.
const STILL_YAW = -0.5;

export function mountHeroCar(container: HTMLElement, opts: HeroCarOptions): HeroCarHandle {
  const { lite, reducedMotion } = opts;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: lite ? "low-power" : "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  // Viewed from the front-left and slightly above: a classic 3/4 showroom angle.
  const cameraDir = new THREE.Vector3(-0.55, 0.3, 1).normalize();
  const lookTarget = new THREE.Vector3(0, 0.55, 0);

  // Soft studio lighting: a procedural room for PBR reflections (no HDR
  // download), plus a gentle key and a cool rim so the paint has shape.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.9;
  pmrem.dispose();

  scene.add(new THREE.HemisphereLight(0xdbe7ff, 0x1a2338, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9cc3ff, 1.1);
  rim.position.set(5, 3, -6);
  scene.add(rim);

  // rig: slides along X and yaws. body: leans/pitches/bounces in car space.
  const rig = new THREE.Group();
  const body = new THREE.Group();
  rig.add(body);
  scene.add(rig);

  const shadow = createContactShadow();
  rig.add(shadow);

  let reflector: Reflector | null = null;
  if (!lite) {
    reflector = createFloorReflection();
    scene.add(reflector);
  }

  // --- sizing ---------------------------------------------------------------

  let startX = 20;
  function resize() {
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;

    // Pull the camera back until the car (plus some floor) fits both ways.
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const neededWidth = CAR_LENGTH * 1.45;
    const neededHeight = 2.7;
    const dist = Math.max(neededWidth / (2 * tanHalf * camera.aspect), neededHeight / (2 * tanHalf));
    camera.position.copy(lookTarget).addScaledVector(cameraDir, dist);
    camera.lookAt(lookTarget);
    camera.updateProjectionMatrix();

    // Far enough right that the whole car starts off-canvas.
    startX = dist * tanHalf * camera.aspect * 2 + CAR_LENGTH;

    if (reflector) {
      const pr = renderer.getPixelRatio();
      reflector.getRenderTarget().setSize(Math.round(w * pr * 0.5), Math.round(h * pr * 0.5));
    }
  }
  resize();

  // --- model ----------------------------------------------------------------

  let disposed = false;
  let ready = false;
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    lite ? MODEL_URL_LITE : MODEL_URL,
    async (gltf) => {
      if (disposed) return disposeObject(gltf.scene);
      const model = prepareModel(gltf.scene);
      body.add(model);
      // Upload shaders/textures before the first frame so the entrance
      // doesn't stutter.
      try {
        await renderer.compileAsync(scene, camera);
      } catch {
        // compileAsync is an optimization; rendering still works without it.
      }
      if (disposed) return;
      ready = true;
      applyPose(reducedMotion ? Infinity : 0);
      opts.onLoaded?.();
      if (reducedMotion) opts.onStop?.();
      updateLoop();
    },
    undefined,
    (error) => {
      if (!disposed) opts.onError?.(error);
    },
  );

  // --- animation ------------------------------------------------------------

  let visible = true;
  let elapsed = 0; // advances only while rendering, so a hidden tab pauses the show
  let spinAngle = 0;
  let lastTime: number | null = null;

  function applyPose(t: number) {
    if (reducedMotion) {
      rig.position.x = 0;
      rig.rotation.y = STILL_YAW;
      return;
    }

    // Travel: fast, slightly decelerating slide, then a hard constant-decel
    // stop. Distances are solved so position and velocity are continuous.
    const total = startX; // final x is 0
    const endRatio = 0.7; // speed when the brakes hit, relative to the average slide speed
    const slide = total / (1 + (endRatio * BRAKE_TIME) / (2 * ENTRY_END));
    const vEnd = (slide / ENTRY_END) * endRatio;
    const v0 = (2 * slide) / ENTRY_END - vEnd;
    const brakeDist = total - slide; // = vEnd * BRAKE_TIME / 2

    let x: number;
    if (t < ENTRY_END) {
      const accel = (vEnd - v0) / ENTRY_END;
      x = total - (v0 * t + 0.5 * accel * t * t);
    } else if (t < ENTRY_END + BRAKE_TIME) {
      const tau = t - ENTRY_END;
      const decel = vEnd / BRAKE_TIME;
      x = brakeDist - (vEnd * tau - 0.5 * decel * tau * tau);
    } else {
      x = 0;
    }
    rig.position.x = x;

    // Drift: the tail steps out a little more the longer it slides, then
    // snaps straight on braking with a small damped overshoot.
    let yawOff: number;
    let roll: number;
    let pitch = 0;
    let lift = 0;
    if (t < ENTRY_END) {
      const p = t / ENTRY_END;
      const wobble = Math.sin(t * 7) * 0.03;
      yawOff = DRIFT_YAW * (0.55 + 0.45 * p) + wobble;
      roll = DRIFT_ROLL * (0.6 + 0.4 * p);
    } else {
      const tau = t - ENTRY_END;
      const snap = Math.exp(-9 * tau) * Math.cos(15 * tau);
      yawOff = DRIFT_YAW * snap;
      roll = DRIFT_ROLL * Math.exp(-8 * tau) * Math.cos(17 * tau);
      // Nose dives as it stops, then rebounds a couple of times.
      const bounce = Math.exp(-7 * tau) * Math.sin(16 * tau);
      pitch = BRAKE_PITCH * bounce;
      lift = -0.025 * Math.abs(bounce);
    }

    // The car's nose points to -X, so +Z rotation dips the nose.
    body.rotation.set(roll, 0, pitch);
    body.position.y = lift;
    rig.rotation.y = yawOff + spinAngle;
  }

  function frame(now: number) {
    const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 1 / 20);
    lastTime = now;

    if (!reducedMotion) {
      const wasMoving = elapsed < STOP_AT;
      elapsed += dt;
      if (wasMoving && elapsed >= STOP_AT) opts.onStop?.();
      if (elapsed > SPIN_START) {
        const ramp = THREE.MathUtils.smoothstep(elapsed - SPIN_START, 0, SPIN_RAMP);
        spinAngle -= SPIN_SPEED * ramp * dt;
        spinAngle %= Math.PI * 2;
      }
      applyPose(elapsed);
    }

    renderer.render(scene, camera);
  }

  function updateLoop() {
    // Reduced motion needs a single still frame, not a loop.
    if (reducedMotion) {
      renderer.setAnimationLoop(null);
      if (ready) renderer.render(scene, camera);
      return;
    }
    if (ready && visible) {
      lastTime = null;
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  }

  const observer = new ResizeObserver(() => {
    resize();
    // The loop re-renders the animated case; a still needs a manual frame.
    if (reducedMotion && ready) renderer.render(scene, camera);
  });
  observer.observe(container);

  return {
    setVisible(v) {
      visible = v;
      updateLoop();
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      disposeObject(scene);
      envMap.dispose();
      reflector?.getRenderTarget().dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}

/** Center the car on the origin, sit it on the floor, scale it, nose to -X. */
function prepareModel(root: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = CAR_LENGTH / Math.max(size.x, size.z);

  root.position.set(-center.x, -box.min.y, -center.z);
  const wrapper = new THREE.Group();
  wrapper.add(root);
  wrapper.scale.setScalar(scale);
  // glTF models face +Z; turn it to face the direction it drives in (-X).
  wrapper.rotation.y = -Math.PI / 2;

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of materials) {
      const mat = m as THREE.MeshPhysicalMaterial;
      // Real transmission costs an extra full-scene render every frame; a
      // tinted transparent glass reads the same at hero size.
      if (mat.transmission > 0) {
        mat.transmission = 0;
        mat.transparent = true;
        mat.opacity = 0.35;
        mat.depthWrite = false;
      }
    }
  });
  return wrapper;
}

/** A soft dark ellipse under the car that grounds it (far cheaper than shadow maps). */
function createContactShadow() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(0.55, "rgba(0,0,0,0.35)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CAR_LENGTH * 1.25, CAR_LENGTH * 0.62),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.005;
  mesh.renderOrder = 1;
  return mesh;
}

/**
 * A mirror floor whose reflection fades out radially and is kept faint, so it
 * reads as a glossy showroom floor over the hero photo rather than a mirror.
 * Transparent where there's nothing to reflect.
 */
function createFloorReflection() {
  const reflector = new Reflector(new THREE.PlaneGeometry(14, 8), {
    textureWidth: 512,
    textureHeight: 512,
    multisample: 0,
    shader: {
      name: "FadedReflector",
      uniforms: {
        color: { value: null },
        tDiffuse: { value: null },
        textureMatrix: { value: null },
        strength: { value: 0.28 },
      },
      vertexShader: /* glsl */ `
        uniform mat4 textureMatrix;
        varying vec4 vReflectUv;
        varying vec2 vPlaneUv;
        #include <common>
        #include <logdepthbuf_pars_vertex>
        void main() {
          vReflectUv = textureMatrix * vec4(position, 1.0);
          vPlaneUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          #include <logdepthbuf_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float strength;
        varying vec4 vReflectUv;
        varying vec2 vPlaneUv;
        #include <logdepthbuf_pars_fragment>
        void main() {
          #include <logdepthbuf_fragment>
          vec4 base = texture2DProj(tDiffuse, vReflectUv);
          vec2 d = (vPlaneUv - 0.5) * vec2(1.0, 1.75);
          float fade = 1.0 - smoothstep(0.08, 0.36, length(d));
          gl_FragColor = vec4(base.rgb, base.a * fade * strength);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
    },
  });
  reflector.rotation.x = -Math.PI / 2;
  const mat = reflector.material as THREE.ShaderMaterial;
  mat.transparent = true;
  mat.depthWrite = false;
  return reflector;
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of materials) {
      for (const value of Object.values(m)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      m.dispose();
    }
  });
}
