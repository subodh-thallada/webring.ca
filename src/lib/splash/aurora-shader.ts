const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.15;

    float n1 = snoise(vec2(uv.x * 2.0 + t, uv.y * 0.5 + t * 0.3));
    float n2 = snoise(vec2(uv.x * 1.5 - t * 0.7, uv.y * 0.8 + t * 0.2));
    float n3 = snoise(vec2(uv.x * 3.0 + t * 0.5, uv.y * 0.3 - t * 0.1));

    float band = smoothstep(0.15, 0.45, uv.y) * smoothstep(0.85, 0.55, uv.y);

    vec3 green = vec3(0.1, 0.8, 0.4);
    vec3 purple = vec3(0.5, 0.2, 0.8);
    vec3 cyan = vec3(0.1, 0.6, 0.8);

    float mix1 = smoothstep(-0.3, 0.5, n1);
    float mix2 = smoothstep(-0.2, 0.6, n2);
    float mix3 = smoothstep(-0.1, 0.4, n3);

    vec3 aurora = green * mix1 * 0.4 + purple * mix2 * 0.3 + cyan * mix3 * 0.2;
    aurora *= band;

    vec3 skyTop = vec3(0.04, 0.04, 0.18);
    vec3 skyBottom = vec3(0.02, 0.06, 0.04);
    vec3 sky = mix(skyBottom, skyTop, uv.y);

    vec3 color = sky + aurora;
    gl_FragColor = vec4(color, 1.0);
  }
`

export interface AuroraContext {
  renderer: any
  scene: any
  camera: any
  material: any
  animationId: number
  startTime: number
}

export function getShaders(): { vertex: string; fragment: string } {
  return { vertex: VERTEX_SHADER, fragment: FRAGMENT_SHADER }
}

export function initAurora(canvas: HTMLCanvasElement): AuroraContext | null {
  const THREE = (window as any).THREE
  if (!THREE) return null

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false })
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight) },
    },
  })

  const plane = new THREE.PlaneGeometry(2, 2)
  scene.add(new THREE.Mesh(plane, material))

  const startTime = performance.now()
  let animationId = 0

  function animate() {
    material.uniforms.uTime.value = (performance.now() - startTime) / 1000
    renderer.render(scene, camera)
    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)

  return { renderer, scene, camera, material, animationId, startTime }
}

export function destroyAurora(ctx: AuroraContext): void {
  cancelAnimationFrame(ctx.animationId)
  ctx.renderer.dispose()
  ctx.material.dispose()
}

export function resizeAurora(ctx: AuroraContext, width: number, height: number): void {
  ctx.renderer.setSize(width, height)
  ctx.material.uniforms.uResolution.value.set(width, height)
}
