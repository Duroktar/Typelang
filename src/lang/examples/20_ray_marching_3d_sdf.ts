import { ExampleProgram } from "./types";

export const example20RayMarching3dSdf: ExampleProgram = {
    id: 'ray_marching_3d_sdf',
    name: '20. Ray Marching & 3D Signed Distance Function (SDF) Canvas Shader',
    category: 'Interactive Web Apps',
    description: 'Real-time 3D software raymarcher featuring Signed Distance Fields (SDFs), Constructive Solid Geometry (CSG), Phong lighting, smooth-minimum blending, surface normal estimation, and interactive orbit camera.',
    code: `// ============================================================================
// TypeLang Pure 3D Ray Marching & Signed Distance Field (SDF) Engine
// ============================================================================

import DOM.{ h, mount, getElementById }

// ----------------------------------------------------------------------------
// 1. Vector 3D Structural Algebra
// ----------------------------------------------------------------------------

type Vec3 = {
  x: number,
  y: number,
  z: number
}

function vec3(x: number, y: number, z: number): Vec3 {
  { x: x, y: y, z: z }
}

function vAdd(a: Vec3, b: Vec3): Vec3 {
  { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

function vSub(a: Vec3, b: Vec3): Vec3 {
  { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

function vScale(a: Vec3, s: number): Vec3 {
  { x: a.x * s, y: a.y * s, z: a.z * s }
}

function vDot(a: Vec3, b: Vec3): number {
  a.x * b.x + a.y * b.y + a.z * b.z
}

function vLength(a: Vec3): number {
  Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
}

function vNormalize(a: Vec3): Vec3 {
  let len = vLength(a)
  if (len < 0.00001) {
    vec3(0, 0, 0)
  } else {
    vec3(a.x / len, a.y / len, a.z / len)
  }
}

function vCross(a: Vec3, b: Vec3): Vec3 {
  {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  }
}

// ----------------------------------------------------------------------------
// 2. Algebraic Data Types: Scenes, Shading & Materials
// ----------------------------------------------------------------------------

type ScenePreset =
  | SphereTorusBlend
  | MorphingBoxSphere
  | CSG_SubtractedHollow
  | InfiniteColumns

type ShadingMode =
  | StudioPhong
  | NormalMapRGB
  | DepthOcclusion
  | CyberpunkNeon

// ----------------------------------------------------------------------------
// 3. Signed Distance Functions (SDFs) & CSG Operators
// ----------------------------------------------------------------------------

function sdSphere(p: Vec3, r: number): number {
  vLength(p) - r
}

function sdBox(p: Vec3, b: Vec3): number {
  let dx = Math.max(0, Math.abs(p.x) - b.x)
  let dy = Math.max(0, Math.abs(p.y) - b.y)
  let dz = Math.max(0, Math.abs(p.z) - b.z)
  vLength(vec3(dx, dy, dz))
}

function sdTorus(p: Vec3, r1: number, r2: number): number {
  let qx = Math.sqrt(p.x * p.x + p.z * p.z) - r1
  let qy = p.y
  Math.sqrt(qx * qx + qy * qy) - r2
}

function sdPlane(p: Vec3, h: number): number {
  p.y - h
}

// Smooth Minimum (Polynomial Blending)
function opSmoothUnion(d1: number, d2: number, k: number): number {
  let h = Math.max(0, Math.min(1, 0.5 + 0.5 * (d2 - d1) / k))
  let blend = d2 * (1 - h) + d1 * h
  blend - k * h * (1 - h)
}

function opSubtract(d1: number, d2: number): number {
  Math.max(-d1, d2)
}

function opIntersect(d1: number, d2: number): number {
  Math.max(d1, d2)
}

// Rotate vector around Y axis
function rotY(p: Vec3, angle: number): Vec3 {
  let c = Math.cos(angle)
  let s = Math.sin(angle)
  vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z)
}

// Rotate vector around X axis
function rotX(p: Vec3, angle: number): Vec3 {
  let c = Math.cos(angle)
  let s = Math.sin(angle)
  vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z)
}

// ----------------------------------------------------------------------------
// 4. Scene Distance Estimator (Map function)
// ----------------------------------------------------------------------------

let mut currentPreset: ScenePreset = SphereTorusBlend
let mut currentShading: ShadingMode = StudioPhong
let mut animTime = 0.0

function mapScene(p: Vec3): number {
  match (currentPreset) {
    SphereTorusBlend => {
      // Metallic Sphere blended with revolving Torus
      let sphereP = vSub(p, vec3(0, 0.2, 0))
      let dSphere = sdSphere(sphereP, 0.85)

      let torusRot = rotX(rotY(vSub(p, vec3(0, 0.2, 0)), animTime * 1.2), animTime * 0.8)
      let dTorus = sdTorus(torusRot, 1.25, 0.22)

      let floorD = sdPlane(p, -1.2)
      let objD = opSmoothUnion(dSphere, dTorus, 0.35)
      Math.min(objD, floorD)
    }
    MorphingBoxSphere => {
      let t = 0.5 + 0.5 * Math.sin(animTime * 1.5)
      let rotP = rotY(rotX(p, animTime * 0.5), animTime * 0.8)
      let dBox = sdBox(rotP, vec3(0.75, 0.75, 0.75))
      let dSphere = sdSphere(p, 0.95)
      let morph = dBox * (1 - t) + dSphere * t
      let floorD = sdPlane(p, -1.2)
      Math.min(morph, floorD)
    }
    CSG_SubtractedHollow => {
      let rotP = rotY(p, animTime * 0.7)
      let outerBox = sdBox(rotP, vec3(0.9, 0.9, 0.9))
      let innerSphere = sdSphere(rotP, 1.15)
      let csgObj = opSubtract(innerSphere, outerBox)
      let floorD = sdPlane(p, -1.2)
      Math.min(csgObj, floorD)
    }
    InfiniteColumns => {
      // Repetition along X and Z
      let repX = ((p.x + 2.0) % 4.0 + 4.0) % 4.0 - 2.0
      let repZ = ((p.z + 2.0) % 4.0 + 4.0) % 4.0 - 2.0
      let dCol = sdSphere(vec3(repX, p.y, repZ), 0.7)
      let floorD = sdPlane(p, -1.2)
      Math.min(dCol, floorD)
    }
  }
}

// ----------------------------------------------------------------------------
// 5. Normal Vector Estimation (Finite Differences)
// ----------------------------------------------------------------------------

function calcNormal(p: Vec3): Vec3 {
  let eps = 0.002
  let d = mapScene(p)
  let nx = mapScene(vec3(p.x + eps, p.y, p.z)) - d
  let ny = mapScene(vec3(p.x, p.y + eps, p.z)) - d
  let nz = mapScene(vec3(p.x, p.y, p.z + eps)) - d
  vNormalize(vec3(nx, ny, nz))
}

// ----------------------------------------------------------------------------
// 6. Ray Marcher Core Loop
// ----------------------------------------------------------------------------

type HitResult = {
  hit: boolean,
  dist: number,
  p: Vec3,
  steps: number
}

function rayMarch(ro: Vec3, rd: Vec3, maxSteps: number, maxDist: number): HitResult {
  let mut t = 0.01
  let mut steps = 0
  let mut hit = false

  for (let mut i = 0; i < maxSteps; i = i + 1) {
    if (!hit) {
      if (t < maxDist) {
        let p = vAdd(ro, vScale(rd, t))
        let d = mapScene(p)
        steps = steps + 1

        if (d < 0.003) {
          hit = true
        } else {
          t = t + d
        }
      }
    }
  }

  {
    hit: hit,
    dist: t,
    p: vAdd(ro, vScale(rd, t)),
    steps: steps
  }
}

// ----------------------------------------------------------------------------
// 7. Surface Shading & Lighting Models
// ----------------------------------------------------------------------------

function computePixelColor(ro: Vec3, rd: Vec3, lightPos: Vec3): { r: number, g: number, b: number } {
  let hit = rayMarch(ro, rd, 48, 20.0)

  if (!hit.hit) {
    // Gradient Dark Sky
    let grad = 0.5 * (rd.y + 1.0)
    let skyR = Math.floor(8 + 12 * grad)
    let skyG = Math.floor(12 + 20 * grad)
    let skyB = Math.floor(24 + 40 * grad)
    { r: skyR, g: skyG, b: skyB }
  } else {
    let p = hit.p
    let norm = calcNormal(p)

    match (currentShading) {
      NormalMapRGB => {
        let r = Math.floor((norm.x * 0.5 + 0.5) * 255)
        let g = Math.floor((norm.y * 0.5 + 0.5) * 255)
        let b = Math.floor((norm.z * 0.5 + 0.5) * 255)
        { r: r, g: g, b: b }
      }
      DepthOcclusion => {
        let depthRatio = Math.max(0, Math.min(1, 1.0 - (hit.dist / 10.0)))
        let ao = Math.max(0.1, 1.0 - (hit.steps / 48.0))
        let val = Math.floor(depthRatio * ao * 255)
        { r: val, g: Math.floor(val * 0.9), b: Math.floor(val * 1.1) }
      }
      CyberpunkNeon => {
        let lightDir = vNormalize(vSub(lightPos, p))
        let diff = Math.max(0, vDot(norm, lightDir))
        let viewDir = vScale(rd, -1.0)
        let fresnel = Math.pow(1.0 - Math.max(0, vDot(norm, viewDir)), 3.0)

        let isFloor = p.y < -1.18
        if (isFloor) {
          // Grid pattern
          let gx = (Math.abs(p.x) % 0.5) < 0.03
          let gz = (Math.abs(p.z) % 0.5) < 0.03
          if (gx || gz) {
            { r: 56, g: 189, b: 248 } // Neon Sky
          } else {
            { r: 15, g: 23, b: 42 } // Dark Slate
          }
        } else {
          let r = Math.floor(fresnel * 255 + diff * 180)
          let g = Math.floor(diff * 50 + fresnel * 80)
          let b = Math.floor(fresnel * 220 + 120)
          { r: Math.min(255, r), g: Math.min(255, g), b: Math.min(255, b) }
        }
      }
      StudioPhong => {
        let isFloor = p.y < -1.18
        let lightDir = vNormalize(vSub(lightPos, p))
        let diff = Math.max(0, vDot(norm, lightDir))

        // Halfway vector for specular Blinn-Phong
        let viewDir = vScale(rd, -1.0)
        let halfDir = vNormalize(vAdd(lightDir, viewDir))
        let spec = Math.pow(Math.max(0, vDot(norm, halfDir)), 32.0)

        // Soft Ambient
        let ambient = 0.15

        if (isFloor) {
          // Checkered Floor tiles
          let checkX = Math.floor(p.x) % 2
          let checkZ = Math.floor(p.z) % 2
          let isWhite = (checkX + checkZ + 100) % 2 == 0
          let base = isWhite ? 180 : 80
          let brightness = ambient + diff * 0.7
          let col = Math.floor(base * brightness)
          { r: col, g: col, b: col }
        } else {
          // Vibrant Material
          let matR = 99
          let matG = 102
          let matB = 241 // Indigo

          let lightIntensity = ambient + diff * 0.75
          let r = Math.min(255, Math.floor(matR * lightIntensity + spec * 180))
          let g = Math.min(255, Math.floor(matG * lightIntensity + spec * 180))
          let b = Math.min(255, Math.floor(matB * lightIntensity + spec * 220))
          { r: r, g: g, b: b }
        }
      }
    }
  }
}

// ----------------------------------------------------------------------------
// 8. Interactive Camera State & Scene Telemetry
// ----------------------------------------------------------------------------

let mut camYaw = 0.0
let mut camPitch = 0.3
let mut camDist = 3.5
let mut autoRotate = true
let mut renderResolution = 80 // 80x50 buffer
let mut isDraggingCam = false
let mut lastMouseX = 0
let mut lastMouseY = 0

let mut avgSteps = 0
let mut fpsCounter = 0

// ----------------------------------------------------------------------------
// 9. Virtual DOM HUD & Shader Control Deck
// ----------------------------------------------------------------------------

function renderUI() {
  let vnode = h("div", { className: "p-4 max-w-5xl mx-auto space-y-4 font-sans text-slate-100 select-none" }, [
    // Telemetry Banner
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "space-y-1" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider" },
            "3D Software Shader"
          ),
          h("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-indigo-300" },
            "Ray Marching + SDFs"
          )
        ]),
        h("h1", { className: "text-2xl font-black bg-gradient-to-r from-sky-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent" },
          "Ray Marching & 3D SDF Shader"
        )
      ]),

      // Stats Counters
      h("div", { className: "flex items-center gap-3 text-xs font-mono" }, [
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "FPS"),
          h("div", { id: "stat-fps", className: "text-base font-bold text-emerald-400" }, "60")
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Avg Steps"),
          h("div", { id: "stat-steps", className: "text-base font-bold text-sky-400" }, "18")
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center hidden sm:block" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Camera Dist"),
          h("div", { id: "stat-cam", className: "text-base font-bold text-amber-400" }, "3.5m")
        ])
      ])
    ]),

    // Viewport Display
    h("div", { className: "relative bg-slate-950 rounded-2xl border border-indigo-500/20 p-2 shadow-2xl flex flex-col items-center justify-center overflow-hidden" }, [
      h("canvas", {
        id: "shader-canvas",
        width: "360",
        height: "225",
        className: "rounded-xl bg-slate-950 cursor-grab active:cursor-grabbing border border-slate-800 shadow-inner max-w-full"
      }, ""),
      
      // Floating Canvas Hint
      h("div", { className: "mt-2 flex flex-wrap items-center justify-between w-full px-2 text-[11px] text-slate-400 font-mono" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "w-2 h-2 rounded-full bg-sky-400 animate-pulse" }, ""),
          h("span", {}, "Drag on canvas to rotate 3D camera. Scroll/Click zoom.")
        ]),
        h("div", { id: "scene-badge", className: "text-indigo-400 font-semibold" }, "Sphere-Torus Smooth Blend")
      ])
    ]),

    // Control Deck
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [
      // 1. SDF Scene Geometry
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "Geometry & SDF Preset"),
        h("div", { className: "grid grid-cols-2 gap-1.5 text-[11px] font-mono" }, [
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentPreset = SphereTorusBlend
              updateSceneBadge("Sphere-Torus Smooth Blend")
            }
          }, "• Sphere + Torus"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentPreset = MorphingBoxSphere
              updateSceneBadge("Morphing Cube-Sphere")
            }
          }, "• Morph Box-Sphere"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentPreset = CSG_SubtractedHollow
              updateSceneBadge("CSG Subtraction (Hollow Box)")
            }
          }, "• CSG Subtraction"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentPreset = InfiniteColumns
              updateSceneBadge("Infinite Domain Repetition")
            }
          }, "• Infinite Columns")
        ])
      ]),

      // 2. Shading & Light Mode
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "Lighting & Shading Model"),
        h("div", { className: "grid grid-cols-2 gap-1.5 text-[11px] font-mono" }, [
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() { currentShading = StudioPhong }
          }, "• Studio Phong"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() { currentShading = NormalMapRGB }
          }, "• Normal Vectors"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() { currentShading = CyberpunkNeon }
          }, "• Cyberpunk Neon"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() { currentShading = DepthOcclusion }
          }, "• Depth + AO")
        ])
      ]),

      // 3. Camera & Performance
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "Camera & Performance"),
        h("div", { className: "flex items-center gap-2" }, [
          h("button", {
            id: "btn-rotate",
            className: "flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer font-mono",
            onClick: fn() {
              autoRotate = !autoRotate
              let btn = getElementById("btn-rotate")
              if (btn) {
                btn.innerText = autoRotate ? "Auto-Rotate ON" : "Auto-Rotate OFF"
              }
            }
          }, "Auto-Rotate ON"),
          h("button", {
            className: "py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-700 font-mono",
            onClick: fn() {
              camYaw = 0.0
              camPitch = 0.3
              camDist = 3.5
            }
          }, "Reset Cam")
        ]),
        h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-400 pt-1" }, [
          h("span", {}, "Buffer:"),
          h("div", { className: "flex gap-1" }, [
            h("button", {
              className: "px-2 py-0.5 rounded bg-slate-800 hover:bg-sky-600 text-[10px] text-slate-300 cursor-pointer",
              onClick: fn() { renderResolution = 60 }
            }, "60x37"),
            h("button", {
              className: "px-2 py-0.5 rounded bg-slate-800 hover:bg-sky-600 text-[10px] text-slate-300 cursor-pointer",
              onClick: fn() { renderResolution = 80 }
            }, "80x50"),
            h("button", {
              className: "px-2 py-0.5 rounded bg-slate-800 hover:bg-sky-600 text-[10px] text-slate-300 cursor-pointer",
              onClick: fn() { renderResolution = 100 }
            }, "100x62")
          ])
        ])
      ])
    ])
  ])

  mount("app-root", vnode)
}

function updateSceneBadge(name: string) {
  let badge = getElementById("scene-badge")
  if (badge) {
    badge.innerText = name
  }
}

// ----------------------------------------------------------------------------
// 10. Canvas Raymarching Pipeline & Animation Engine
// ----------------------------------------------------------------------------

renderUI()

let canvas = getElementById("shader-canvas")
if (canvas) {
  let ctx = canvas.getContext("2d")

  let CANVAS_W = 360
  let CANVAS_H = 225

  // Mouse camera dragging
  canvas.addEventListener("mousedown", fn(e) {
    isDraggingCam = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  })

  canvas.addEventListener("mousemove", fn(e) {
    if (isDraggingCam) {
      let dx = e.clientX - lastMouseX
      let dy = e.clientY - lastMouseY
      lastMouseX = e.clientX
      lastMouseY = e.clientY
      camYaw = camYaw - dx * 0.015
      camPitch = Math.max(-1.2, Math.min(1.2, camPitch + dy * 0.015))
    }
  })

  canvas.addEventListener("mouseup", fn() {
    isDraggingCam = false
  })

  canvas.addEventListener("mouseleave", fn() {
    isDraggingCam = false
  })

  let mut frameCount = 0
  let mut lastFpsTime = 0
  let mut currentFps = 60

  function renderShaderFrame(time: number) {
    animTime = time * 0.001

    if (autoRotate && !isDraggingCam) {
      camYaw = camYaw + 0.015
    }

    // Camera Basis Vectors
    let cx = camDist * Math.sin(camYaw) * Math.cos(camPitch)
    let cy = camDist * Math.sin(camPitch)
    let cz = camDist * Math.cos(camYaw) * Math.cos(camPitch)

    let camPos = vec3(cx, cy, cz)
    let target = vec3(0, 0, 0)
    let forward = vNormalize(vSub(target, camPos))
    let worldUp = vec3(0, 1, 0)
    let right = vNormalize(vCross(forward, worldUp))
    let up = vCross(right, forward)

    let lightPos = vec3(2.5 * Math.cos(animTime), 4.0, 2.5 * Math.sin(animTime))

    // Raymarching Grid Buffer
    let gridW = renderResolution
    let aspect = CANVAS_H / CANVAS_W
    let gridH = Math.floor(gridW * aspect)
    let pixelW = CANVAS_W / gridW
    let pixelH = CANVAS_H / gridH

    let fov = 1.0

    for (let mut gy = 0; gy < gridH; gy = gy + 1) {
      let v = (1.0 - 2.0 * ((gy + 0.5) / gridH)) * aspect * fov
      for (let mut gx = 0; gx < gridW; gx = gx + 1) {
        let u = (2.0 * ((gx + 0.5) / gridW) - 1.0) * fov

        // Construct Ray Direction
        let rd = vNormalize(vAdd(vAdd(vScale(forward, 1.0), vScale(right, u)), vScale(up, v)))

        let col = computePixelColor(camPos, rd, lightPos)

        ctx.fillStyle = concat("rgb(", concat(to_string(col.r), concat(",", concat(to_string(col.g), concat(",", concat(to_string(col.b), ")"))))))
        ctx.fillRect(gx * pixelW, gy * pixelH, pixelW + 0.5, pixelH + 0.5)
      }
    }

    // FPS Telemetry
    frameCount = frameCount + 1
    if (time - lastFpsTime >= 1000) {
      currentFps = frameCount
      frameCount = 0
      lastFpsTime = time

      let sFps = getElementById("stat-fps")
      if (sFps) sFps.innerText = to_string(currentFps)
    }

    requestAnimationFrame(renderShaderFrame)
  }

  requestAnimationFrame(renderShaderFrame)
}

println("Ray Marching & 3D SDF Shader Engine Initialized Successfully!")
`
  };
