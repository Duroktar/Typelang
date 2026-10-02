import { ExampleProgram } from "./types";

export const example11InteractiveCanvasSwarm: ExampleProgram = {
    id: 'interactive_canvas_swarm',
    name: '11. Interactive Canvas 2D Particle Swarm',
    category: 'Interactive Web Apps',
    description: 'HTML5 2D Canvas particle physics simulation with requestAnimationFrame loop and click burst triggers.',
    code: `import DOM.{ h, mount, getElementById }

let vnode = h("div", { className: "p-4 flex flex-col items-center justify-center space-y-4 font-sans text-slate-200" }, [
  h("div", { className: "text-center space-y-1" }, [
    h("h2", { className: "text-lg font-bold text-indigo-400" }, "TypeLang 2D Particle Swarm"),
    h("p", { className: "text-xs text-slate-400" }, "Click on the canvas to spawn exploding energy particle bursts!")
  ]),
  h("canvas", {
    id: "particle-canvas",
    width: "480",
    height: "280",
    className: "rounded-2xl border border-indigo-500/30 bg-slate-950 shadow-2xl cursor-crosshair"
  }, ""),
  h("div", { className: "flex gap-2 text-xs text-slate-400 font-mono" }, [
    h("span", { className: "px-2 py-0.5 rounded bg-slate-900 border border-slate-800" }, "Engine: requestAnimationFrame"),
    h("span", { className: "px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400" }, "FPS: ~60")
  ])
])

mount("app-root", vnode)

let canvas = getElementById("particle-canvas")
if (canvas) {
  let ctx = canvas.getContext("2d")
  let particles = []

  function spawnBurst(x: number, y: number) {
    let colors = ["#6366f1", "#a855f7", "#ec4899", "#38bdf8", "#34d399"]
    for (let mut i = 0; i < 28; i = i + 1) {
      let angle = Math.random() * Math.PI * 2
      let speed = Math.random() * 4 + 1
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015
      })
    }
  }

  spawnBurst(240, 140)

  canvas.addEventListener("click", fn(e) {
    let rect = canvas.getBoundingClientRect()
    spawnBurst(e.clientX - rect.left, e.clientY - rect.top)
  })

  function animate() {
    ctx.fillStyle = "rgba(15, 23, 42, 0.25)"
    ctx.fillRect(0, 0, 480, 280)

    for (let mut i = particles.length - 1; i >= 0; i = i - 1) {
      let p = particles[i]
      p.x = p.x + p.vx
      p.y = p.y + p.vy
      p.life = p.life - p.decay

      if (p.life <= 0) {
        particles.splice(i, 1)
      } else {
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    if (particles.length < 5) {
      spawnBurst(Math.random() * 400 + 40, Math.random() * 200 + 40)
    }

    requestAnimationFrame(animate)
  }

  animate()
}
println("Mounted Canvas Particle Physics engine successfully!")
`
  };
