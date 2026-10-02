import { ExampleProgram } from "./types";

export const example31GTA3LibertyCity: ExampleProgram = {
  id: "gta3_liberty_city",
  name: "31. Liberty City 2.5D (GTA 3 Style Open-World & Vehicle Physics)",
  title: "31. Liberty City 2.5D (GTA 3 Style Open-World & Vehicle Physics)",
  category: "Games & Graphics",
  description: "An authentic top-down 3D open-world sandbox engine inspired by GTA 3 with vehicle drift physics, pedestrian & traffic AI, 1-5 star police wanted system, Pay 'n' Spray respray garage, story missions, interactive minimap, weapons, and WebAudio radio stations.",
  code: `import DOM.{ h, mount, getElementById }

extern let window: any

// ============================================================================
// 31. Grand Theft Auto: Liberty City 2.5D Sandbox Engine
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Types & Data Models
// ----------------------------------------------------------------------------

export type Vehicle = {
  id: number,
  modelName: string,
  mut x: number,
  mut y: number,
  mut vx: number,
  mut vy: number,
  mut angle: number,
  mut speed: number,
  mut steer: number,
  mut health: number,
  maxSpeed: number,
  accel: number,
  handling: number,
  mut color: string,
  mut roofColor: string,
  width: number,
  length: number,
  isPolice: boolean,
  mut sirenOn: boolean,
  mut sirenTimer: number
}

export type Pedestrian = {
  id: number,
  mut x: number,
  mut y: number,
  mut vx: number,
  mut vy: number,
  mut angle: number,
  mut speed: number,
  mut health: number,
  mut state: string, // "walk", "flee", "dead"
  mut stateTimer: number,
  color: string,
  shirtColor: string
}

export type Particle = {
  mut x: number,
  mut y: number,
  mut vx: number,
  mut vy: number,
  mut life: number,
  maxLife: number,
  color: string,
  size: number
}

export type SkidMark = {
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  mut alpha: number
}

export type Bullet = {
  mut x: number,
  mut y: number,
  vx: number,
  vy: number,
  mut life: number,
  isRocket: boolean,
  fromPlayer: boolean
}

export type Building = {
  x: number,
  y: number,
  w: number,
  h: number,
  height3D: number,
  color: string,
  roofColor: string,
  label: string,
  isPayNSpray: boolean
}

// ----------------------------------------------------------------------------
// 2. Global Game State
// ----------------------------------------------------------------------------

let WORLD_W = 2400.0
let WORLD_H = 2400.0
let SCREEN_W = 860.0
let SCREEN_H = 500.0

// Player State
let mut playerX = 600.0
let mut playerY = 600.0
let mut playerVx = 0.0
let mut playerVy = 0.0
let mut playerAngle = 0.0
let mut playerHealth = 100.0
let mut playerArmor = 100.0
let mut playerCash = 5000
let mut inVehicleId = -1 // -1 = on foot
let mut playerWeapon = "Pistol" // "Fists", "Pistol", "Uzi", "Rocket"
let mut playerAmmo = 120
let mut wantedStars = 0
let mut wantedCrimePoints = 0.0
let mut wantedTimer = 0.0

// Camera
let mut camX = 600.0
let mut camY = 600.0
let mut camZoom = 1.0

// Radio & Audio
let mut currentRadio = "Head Radio 98.3" // "Head Radio 98.3", "Flashback FM", "MSX FM", "Lips 106", "Off"
let mut radioVolume = 0.5
let mut audioCtxInitialized = false

// Missions
let mut activeMission = 0 // 0: Free Roam, 1: Pick up Misty, 2: Smash Cartel Van, 3: Survive 3-Star Manhunt
let mut missionTimer = 0.0
let mut missionText = "Visit Luigi's Club (Green Blip on Radar) to start Mission 1"
let mut missionTargetX = 1400.0
let mut missionTargetY = 400.0
let mut missionActive = false

// Input Keys
let mut keyW = false
let mut keyS = false
let mut keyA = false
let mut keyD = false
let mut keySpace = false
let mut keyShift = false

// Entities
let mut vehicles: Vehicle[] = []
let mut pedestrians: Pedestrian[] = []
let mut particles: Particle[] = []
let mut skidMarks: SkidMark[] = []
let mut bullets: Bullet[] = []
let mut buildings: Building[] = []

let mut nextEntityId = 1
let mut gameTick = 0
let mut isGameRunning = true

// ----------------------------------------------------------------------------
// 3. City Map & Environment Generation
// ----------------------------------------------------------------------------

function initCityMap() {
  buildings = []

  // District 1: Red Light District & Luigi's Club
  buildings.push({ x: 200.0, y: 200.0, w: 220.0, h: 180.0, height3D: 40.0, color: "#334155", roofColor: "#1e293b", label: "Luigi's Club Sexxx", isPayNSpray: false })
  buildings.push({ x: 460.0, y: 200.0, w: 200.0, h: 180.0, height3D: 35.0, color: "#3b4252", roofColor: "#2e3440", label: "Apartments", isPayNSpray: false })
  buildings.push({ x: 200.0, y: 420.0, w: 180.0, h: 220.0, height3D: 30.0, color: "#475569", roofColor: "#334155", label: "Joey's Auto Garage", isPayNSpray: false })
  buildings.push({ x: 420.0, y: 420.0, w: 240.0, h: 220.0, height3D: 45.0, color: "#434c5e", roofColor: "#2e3440", label: "Ammu-Nation Depot", isPayNSpray: false })

  // Pay 'n' Spray Garage (Crucial Gameplay Mechanics!)
  buildings.push({ x: 1000.0, y: 200.0, w: 260.0, h: 200.0, height3D: 30.0, color: "#065f46", roofColor: "#047857", label: "Pay 'n' Spray (Respray)", isPayNSpray: true })

  // District 2: Chinatown & Commercial Strip
  buildings.push({ x: 800.0, y: 500.0, w: 280.0, h: 240.0, height3D: 50.0, color: "#475569", roofColor: "#1e293b", label: "Chinatown Market", isPayNSpray: false })
  buildings.push({ x: 1120.0, y: 500.0, w: 260.0, h: 240.0, height3D: 60.0, color: "#334155", roofColor: "#0f172a", label: "Bank of Liberty", isPayNSpray: false })
  buildings.push({ x: 800.0, y: 800.0, w: 240.0, h: 260.0, height3D: 45.0, color: "#3b4252", roofColor: "#2e3440", label: "8-Ball Autoyard", isPayNSpray: false })
  buildings.push({ x: 1080.0, y: 800.0, w: 300.0, h: 260.0, height3D: 55.0, color: "#434c5e", roofColor: "#1e293b", label: "Liberty Police HQ", isPayNSpray: false })

  // District 3: Portland Harbor & Industrial Warehouses
  buildings.push({ x: 1550.0, y: 200.0, w: 350.0, h: 220.0, height3D: 25.0, color: "#374151", roofColor: "#1f2937", label: "Harbor Warehouse A", isPayNSpray: false })
  buildings.push({ x: 1550.0, y: 460.0, w: 350.0, h: 240.0, height3D: 25.0, color: "#374151", roofColor: "#1f2937", label: "Portland Fish Factory", isPayNSpray: false })
  buildings.push({ x: 1550.0, y: 740.0, w: 350.0, h: 280.0, height3D: 30.0, color: "#1f2937", roofColor: "#111827", label: "Cartel Shipping Dock", isPayNSpray: false })

  // District 4: Saint Mark's Mafia Heights
  buildings.push({ x: 200.0, y: 1200.0, w: 300.0, h: 260.0, height3D: 65.0, color: "#475569", roofColor: "#1e293b", label: "Salvatore Leone Manor", isPayNSpray: false })
  buildings.push({ x: 540.0, y: 1200.0, w: 260.0, h: 260.0, height3D: 50.0, color: "#3b4252", roofColor: "#2e3440", label: "Marco's Bistro", isPayNSpray: false })
  buildings.push({ x: 200.0, y: 1520.0, w: 260.0, h: 300.0, height3D: 40.0, color: "#434c5e", roofColor: "#1e293b", label: "Portland View Hospital", isPayNSpray: false })
  buildings.push({ x: 500.0, y: 1520.0, w: 300.0, h: 300.0, height3D: 45.0, color: "#374151", roofColor: "#0f172a", label: "Liberty Daily News", isPayNSpray: false })

  // District 5: South Suburbs & Train Depot
  buildings.push({ x: 950.0, y: 1200.0, w: 350.0, h: 260.0, height3D: 35.0, color: "#334155", roofColor: "#1e293b", label: "Portland Docks Office", isPayNSpray: false })
  buildings.push({ x: 1350.0, y: 1200.0, w: 300.0, h: 260.0, height3D: 40.0, color: "#3b4252", roofColor: "#2e3440", label: "Belly Up Fish Cannery", isPayNSpray: false })
  buildings.push({ x: 950.0, y: 1520.0, w: 400.0, h: 300.0, height3D: 30.0, color: "#475569", roofColor: "#1e293b", label: "Freight Cargo Yard", isPayNSpray: false })
  buildings.push({ x: 1400.0, y: 1520.0, w: 380.0, h: 300.0, height3D: 35.0, color: "#1f2937", roofColor: "#111827", label: "Portland Oil Refinery", isPayNSpray: false })
}

// ----------------------------------------------------------------------------
// 4. Entity Spawning & Factory
// ----------------------------------------------------------------------------

function spawnVehicle(x: number, y: number, angle: number, model: string): Vehicle {
  let id = nextEntityId
  nextEntityId = nextEntityId + 1

  let mut maxSpeed = 7.0
  let mut accel = 0.25
  let mut handling = 0.05
  let mut color = "#ef4444"
  let mut roofColor = "#b91c1c"
  let mut width = 28.0
  let mut length = 56.0
  let isPolice = model == "Police Cruiser"

  if (model == "Banshee (Sports)") {
    maxSpeed = 9.5
    accel = 0.38
    handling = 0.065
    color = "#3b82f6"
    roofColor = "#1d4ed8"
    width = 28.0
    length = 54.0
  } else if (model == "Police Cruiser") {
    maxSpeed = 8.5
    accel = 0.32
    handling = 0.055
    color = "#0f172a"
    roofColor = "#ffffff"
    width = 30.0
    length = 58.0
  } else if (model == "Taxi Cab") {
    maxSpeed = 7.2
    accel = 0.26
    handling = 0.05
    color = "#eab308"
    roofColor = "#ca8a04"
    width = 30.0
    length = 58.0
  } else if (model == "Mafia Sentinel") {
    maxSpeed = 8.0
    accel = 0.30
    handling = 0.052
    color = "#475569"
    roofColor = "#1e293b"
    width = 30.0
    length = 60.0
  } else if (model == "Patriot (4x4 SUV)") {
    maxSpeed = 6.8
    accel = 0.22
    handling = 0.045
    color = "#065f46"
    roofColor = "#047857"
    width = 34.0
    length = 62.0
  }

  {
    id: id,
    modelName: model,
    x: x,
    y: y,
    vx: 0.0,
    vy: 0.0,
    angle: angle,
    speed: 0.0,
    steer: 0.0,
    health: 100.0,
    maxSpeed: maxSpeed,
    accel: accel,
    handling: handling,
    color: color,
    roofColor: roofColor,
    width: width,
    length: length,
    isPolice: isPolice,
    sirenOn: isPolice,
    sirenTimer: 0
  }
}

function spawnPedestrian(x: number, y: number): Pedestrian {
  let id = nextEntityId
  nextEntityId = nextEntityId + 1
  let angle = Math.random() * 6.283
  let speed = 0.8 + Math.random() * 0.6
  let shirtColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#e2e8f0"]
  let shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)]

  {
    id: id,
    x: x,
    y: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    angle: angle,
    speed: speed,
    health: 100.0,
    state: "walk",
    stateTimer: Math.floor(Math.random() * 100),
    color: "#fbcfe8",
    shirtColor: shirtColor
  }
}

function spawnBullet(x: number, y: number, angle: number, isRocket: boolean, fromPlayer: boolean) {
  let speed = isRocket ? 12.0 : 22.0
  bullets.push({
    x: x,
    y: y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: isRocket ? 120 : 40,
    isRocket: isRocket,
    fromPlayer: fromPlayer
  })
}

function spawnExplosion(x: number, y: number) {
  for (let mut i = 0; i < 35; i = i + 1) {
    let angle = Math.random() * 6.283
    let speed = 1.0 + Math.random() * 6.0
    let colors = ["#ef4444", "#f97316", "#eab308", "#ffffff", "#475569"]
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 25 + Math.floor(Math.random() * 25),
      maxLife: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4.0 + Math.random() * 6.0
    })
  }

  // Damage nearby entities
  for (let mut i = 0; i < vehicles.length; i = i + 1) {
    let v = vehicles[i]
    let dx = v.x - x
    let dy = v.y - y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 120.0) {
      v.health = v.health - (120.0 - dist) * 0.9
    }
  }

  let pDx = playerX - x
  let pDy = playerY - y
  let pDist = Math.sqrt(pDx * pDx + pDy * pDy)
  if (pDist < 120.0) {
    let dmg = (120.0 - pDist) * 0.5
    if (playerArmor > 0.0) {
      playerArmor = Math.max(0.0, playerArmor - dmg)
    } else {
      playerHealth = Math.max(0.0, playerHealth - dmg)
    }
  }
}

// ----------------------------------------------------------------------------
// 5. Initial Game Population
// ----------------------------------------------------------------------------

function initGame() {
  initCityMap()
  vehicles = []
  pedestrians = []
  particles = []
  skidMarks = []
  bullets = []

  // Spawn Player Car (Banshee parked nearby)
  vehicles.push(spawnVehicle(650.0, 600.0, 0.0, "Banshee (Sports)"))
  vehicles.push(spawnVehicle(750.0, 300.0, 1.57, "Taxi Cab"))
  vehicles.push(spawnVehicle(1150.0, 300.0, 1.57, "Mafia Sentinel"))
  vehicles.push(spawnVehicle(1450.0, 600.0, 3.14, "Patriot (4x4 SUV)"))
  vehicles.push(spawnVehicle(900.0, 950.0, 0.0, "Police Cruiser"))

  // Spawn Pedestrians across sidewalks
  for (let mut i = 0; i < 30; i = i + 1) {
    let px = 200.0 + Math.random() * 1800.0
    let py = 200.0 + Math.random() * 1800.0
    pedestrians.push(spawnPedestrian(px, py))
  }

  playerX = 580.0
  playerY = 600.0
  playerHealth = 100.0
  playerArmor = 100.0
  playerCash = 5000
  wantedStars = 0
  inVehicleId = -1
  activeMission = 0
  missionText = "Free Roam Liberty City. Press [F] or 'Enter Car' to drive!"
}

// ----------------------------------------------------------------------------
// 6. Physics & Game Loop
// ----------------------------------------------------------------------------

function checkBuildingCollision(x: number, y: number, rad: number): boolean {
  let mut hit = false
  for (let mut i = 0; i < buildings.length; i = i + 1) {
    let b = buildings[i]
    if (x + rad > b.x && x - rad < b.x + b.w && y + rad > b.y && y - rad < b.y + b.h) {
      hit = true
    }
  }
  hit
}

function updatePhysics() {
  gameTick = gameTick + 1

  // Wanted System Logic
  if (wantedStars > 0) {
    wantedTimer = wantedTimer + 0.016
    // Spawn police reinforcements if wanted
    if (gameTick % 180 == 0) {
      let mut policeCount = 0
      for (let mut i = 0; i < vehicles.length; i = i + 1) {
        if (vehicles[i].isPolice && vehicles[i].health > 0.0) policeCount = policeCount + 1
      }
      if (policeCount < wantedStars) {
        let spawnAngle = Math.random() * 6.283
        let spawnDist = 600.0
        let spX = playerX + Math.cos(spawnAngle) * spawnDist
        let spY = playerY + Math.sin(spawnAngle) * spawnDist
        if (spX > 100.0 && spX < WORLD_W - 100.0 && spY > 100.0 && spY < WORLD_H - 100.0) {
          vehicles.push(spawnVehicle(spX, spY, spawnAngle + 3.14, "Police Cruiser"))
        }
      }
    }
  }

  // 1. Update Player & Controlled Vehicle
  if (inVehicleId != -1) {
    // Player driving a vehicle
    for (let mut i = 0; i < vehicles.length; i = i + 1) {
      if (vehicles[i].id == inVehicleId) {
        let v = vehicles[i]

        // Steering
        if (keyA) v.angle = v.angle - v.handling * (Math.abs(v.speed) / v.maxSpeed + 0.3)
        if (keyD) v.angle = v.angle + v.handling * (Math.abs(v.speed) / v.maxSpeed + 0.3)

        // Acceleration & Braking
        if (keyW) {
          v.speed = Math.min(v.maxSpeed, v.speed + v.accel)
        } else if (keyS) {
          v.speed = Math.max(-v.maxSpeed * 0.45, v.speed - v.accel * 0.8)
        } else {
          v.speed = v.speed * 0.96 // Natural friction
        }

        // Handbrake / Drift
        if (keySpace) {
          v.speed = v.speed * 0.90
          // Add skidmarks
          if (Math.abs(v.speed) > 2.0 && gameTick % 2 == 0) {
            let leftTireX = v.x - Math.sin(v.angle) * 12.0
            let leftTireY = v.y + Math.cos(v.angle) * 12.0
            let rightTireX = v.x + Math.sin(v.angle) * 12.0
            let rightTireY = v.y - Math.cos(v.angle) * 12.0
            skidMarks.push({ x1: leftTireX, y1: leftTireY, x2: leftTireX + Math.cos(v.angle) * 4.0, y2: leftTireY + Math.sin(v.angle) * 4.0, alpha: 0.8 })
            skidMarks.push({ x1: rightTireX, y1: rightTireY, x2: rightTireX + Math.cos(v.angle) * 4.0, y2: rightTireY + Math.sin(v.angle) * 4.0, alpha: 0.8 })
          }
        }

        v.vx = Math.cos(v.angle) * v.speed
        v.vy = Math.sin(v.angle) * v.speed

        let nextX = v.x + v.vx
        let nextY = v.y + v.vy

        // Building Collision Check
        if (checkBuildingCollision(nextX, nextY, 18.0)) {
          v.speed = -v.speed * 0.4
          v.health = v.health - Math.abs(v.speed) * 4.0
          spawnExplosion(v.x, v.y)
        } else {
          v.x = Math.max(50.0, Math.min(WORLD_W - 50.0, nextX))
          v.y = Math.max(50.0, Math.min(WORLD_H - 50.0, nextY))
        }

        // Check Pay 'n' Spray Garage Visit!
        for (let mut bIdx = 0; bIdx < buildings.length; bIdx = bIdx + 1) {
          let b = buildings[bIdx]
          if (b.isPayNSpray && v.x > b.x && v.x < b.x + b.w && v.y > b.y && v.y < b.y + b.h) {
            v.health = 100.0
            v.color = "#10b981" // Fresh paint!
            wantedStars = 0
            wantedCrimePoints = 0.0
            missionText = "Pay 'n' Spray: Resprayed vehicle! Wanted level wiped!"
          }
        }

        playerX = v.x
        playerY = v.y
        playerAngle = v.angle

        // Vehicle Destruction
        if (v.health <= 0.0) {
          spawnExplosion(v.x, v.y)
          inVehicleId = -1
          playerHealth = Math.max(0.0, playerHealth - 50.0)
        }
      }
    }
  } else {
    // Player On-Foot Movement
    let mut moveSpeed = keyShift ? 5.0 : 3.4
    let mut moveX = 0.0
    let mut moveY = 0.0

    if (keyW) moveY = moveY - 1.0
    if (keyS) moveY = moveY + 1.0
    if (keyA) moveX = moveX - 1.0
    if (keyD) moveX = moveX + 1.0

    let len = Math.sqrt(moveX * moveX + moveY * moveY)
    if (len > 0.001) {
      playerVx = (moveX / len) * moveSpeed
      playerVy = (moveY / len) * moveSpeed
      playerAngle = Math.atan2(playerVy, playerVx)
    } else {
      playerVx = playerVx * 0.7
      playerVy = playerVy * 0.7
    }

    let nextX = playerX + playerVx
    let nextY = playerY + playerVy

    // 2.5D Wall sliding collision check: try diagonal, then X, then Y
    if (!checkBuildingCollision(nextX, nextY, 8.0)) {
      playerX = Math.max(40.0, Math.min(WORLD_W - 40.0, nextX))
      playerY = Math.max(40.0, Math.min(WORLD_H - 40.0, nextY))
    } else if (!checkBuildingCollision(nextX, playerY, 8.0)) {
      playerX = Math.max(40.0, Math.min(WORLD_W - 40.0, nextX))
    } else if (!checkBuildingCollision(playerX, nextY, 8.0)) {
      playerY = Math.max(40.0, Math.min(WORLD_H - 40.0, nextY))
    }
  }

  // 2. Update AI Vehicles (Traffic & Police Pursuits)
  for (let mut i = 0; i < vehicles.length; i = i + 1) {
    let v = vehicles[i]
    if (v.id != inVehicleId) {
      if (v.isPolice && wantedStars > 0) {
        // Police Pursuit AI
        let dx = playerX - v.x
        let dy = playerY - v.y
        let dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 35.0) {
          let targetAngle = Math.atan2(dy, dx)
          let mut angleDiff = targetAngle - v.angle

          while (angleDiff > 3.14159) { angleDiff = angleDiff - 6.28318 }
          while (angleDiff < -3.14159) { angleDiff = angleDiff + 6.28318 }

          // Smooth turning rate to prevent jitter and endless spinning
          let maxTurn = 0.05
          if (angleDiff > 0.08) {
            v.angle = v.angle + Math.min(maxTurn, angleDiff * 0.4)
          } else if (angleDiff < -0.08) {
            v.angle = v.angle - Math.min(maxTurn, -angleDiff * 0.4)
          }

          v.speed = Math.min(v.maxSpeed * 0.8, v.speed + v.accel * 0.6)
        } else {
          // Close proximity: ram / block, slow down slightly
          v.speed = v.speed * 0.90
        }
        v.sirenTimer = v.sirenTimer + 1
      } else {
        // Normal Traffic AI: Drive forward slowly
        v.speed = Math.min(2.8, v.speed + 0.05)
        if (checkBuildingCollision(v.x + Math.cos(v.angle) * 40.0, v.y + Math.sin(v.angle) * 40.0, 16.0)) {
          v.angle = v.angle + 0.04
        }
      }

      v.vx = Math.cos(v.angle) * v.speed
      v.vy = Math.sin(v.angle) * v.speed
      let nextX = v.x + v.vx
      let nextY = v.y + v.vy

      if (!checkBuildingCollision(nextX, nextY, 16.0)) {
        v.x = nextX
        v.y = nextY
      } else {
        // Collision with building: bounce back gently, avoid spinning in circles
        v.speed = -1.0
        v.x = v.x - Math.cos(v.angle) * 1.5
        v.y = v.y - Math.sin(v.angle) * 1.5
      }

      // Check collision with Player on foot (Hit & Run)
      if (inVehicleId == -1) {
        let pDx = playerX - v.x
        let pDy = playerY - v.y
        let dist = Math.sqrt(pDx * pDx + pDy * pDy)
        if (dist < 28.0 && Math.abs(v.speed) > 1.5) {
          playerHealth = Math.max(0.0, playerHealth - Math.abs(v.speed) * 8.0)
          playerVx = v.vx * 1.5
          playerVy = v.vy * 1.5
        }
      }
    }
  }

  // 3. Update Pedestrians (Walk, Dodge, Flee)
  for (let mut i = 0; i < pedestrians.length; i = i + 1) {
    let p = pedestrians[i]
    if (p.state != "dead") {
      p.stateTimer = p.stateTimer + 1
      if (p.stateTimer > 120) {
        p.stateTimer = 0
        p.angle = p.angle + (Math.random() - 0.5) * 1.8
      }

      // Flee from gunshots or police sirens
      let dx = p.x - playerX
      let dy = p.y - playerY
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 180.0 && wantedStars > 0) {
        p.state = "flee"
        p.angle = Math.atan2(dy, dx)
        p.speed = 2.4
      }

      p.vx = Math.cos(p.angle) * p.speed
      p.vy = Math.sin(p.angle) * p.speed
      p.x = p.x + p.vx
      p.y = p.y + p.vy

      // Check run over by vehicles
      for (let mut vIdx = 0; vIdx < vehicles.length; vIdx = vIdx + 1) {
        let v = vehicles[vIdx]
        let vDx = p.x - v.x
        let vDy = p.y - v.y
        let vDist = Math.sqrt(vDx * vDx + vDy * vDy)
        if (vDist < 24.0 && Math.abs(v.speed) > 2.0) {
          p.state = "dead"
          p.health = 0.0
          if (v.id == inVehicleId) {
            wantedCrimePoints = wantedCrimePoints + 25.0
            if (wantedCrimePoints > 50.0 && wantedStars == 0) wantedStars = 1
            if (wantedCrimePoints > 120.0 && wantedStars == 1) wantedStars = 2
          }
        }
      }
    }
  }

  // 4. Update Bullets & Projectiles
  let mut remainingBullets: Bullet[] = []
  for (let mut i = 0; i < bullets.length; i = i + 1) {
    let b = bullets[i]
    b.x = b.x + b.vx
    b.y = b.y + b.vy
    b.life = b.life - 1

    let mut hit = checkBuildingCollision(b.x, b.y, 4.0)
    if (hit && b.isRocket) {
      spawnExplosion(b.x, b.y)
    }

    // Check hit vehicles
    for (let mut vIdx = 0; vIdx < vehicles.length; vIdx = vIdx + 1) {
      let v = vehicles[vIdx]
      let dx = b.x - v.x
      let dy = b.y - v.y
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 26.0) {
        hit = true
        v.health = v.health - (b.isRocket ? 90.0 : 18.0)
        if (b.isRocket) spawnExplosion(b.x, b.y)
        if (v.isPolice && b.fromPlayer) {
          wantedStars = Math.min(5, wantedStars + 1)
        }
      }
    }

    if (!hit && b.life > 0) {
      remainingBullets.push(b)
    }
  }
  bullets = remainingBullets

  // 5. Update Particles & Skidmarks
  let mut remainingParticles: Particle[] = []
  for (let mut i = 0; i < particles.length; i = i + 1) {
    let p = particles[i]
    p.x = p.x + p.vx
    p.y = p.y + p.vy
    p.life = p.life - 1
    if (p.life > 0) remainingParticles.push(p)
  }
  particles = remainingParticles

  let mut remainingSkids: SkidMark[] = []
  for (let mut i = 0; i < skidMarks.length; i = i + 1) {
    let s = skidMarks[i]
    s.alpha = s.alpha - 0.002
    if (s.alpha > 0.05) remainingSkids.push(s)
  }
  skidMarks = remainingSkids

  // 6. Smooth Camera Tracking
  let targetCamX = playerX
  let targetCamY = playerY
  camX = camX + (targetCamX - camX) * 0.12
  camY = camY + (targetCamY - camY) * 0.12

  // Camera Zoom: zoom out when driving fast!
  let currentSpeed = inVehicleId != -1 ? 6.0 : 1.0
  let targetZoom = inVehicleId != -1 ? 0.85 : 1.05
  camZoom = camZoom + (targetZoom - camZoom) * 0.05

  // 7. Check Mission 1 Triggers
  if (activeMission == 1) {
    let mDx = playerX - missionTargetX
    let mDy = playerY - missionTargetY
    let mDist = Math.sqrt(mDx * mDx + mDy * mDy)
    if (mDist < 80.0) {
      activeMission = 0
      playerCash = playerCash + 1500
      wantedStars = 0
      missionText = "Mission Complete! Paid $1,500. Respect + 10."
    }
  }
}

// ----------------------------------------------------------------------------
// 7. Player Actions (Enter/Exit Car, Fire Weapon, Change Radio)
// ----------------------------------------------------------------------------

function toggleEnterExitCar() {
  if (inVehicleId != -1) {
    // Exit current car
    for (let mut i = 0; i < vehicles.length; i = i + 1) {
      if (vehicles[i].id == inVehicleId) {
        playerX = vehicles[i].x + Math.sin(vehicles[i].angle) * 32.0
        playerY = vehicles[i].y - Math.cos(vehicles[i].angle) * 32.0
        inVehicleId = -1
        missionText = "Exited vehicle on foot."
        return
      }
    }
    inVehicleId = -1
  } else {
    // Find closest car within hijack range
    let mut closestCarIdx = -1
    let mut closestDist = 99999.0
    for (let mut i = 0; i < vehicles.length; i = i + 1) {
      let v = vehicles[i]
      let dx = v.x - playerX
      let dy = v.y - playerY
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 75.0 && dist < closestDist) {
        closestDist = dist
        closestCarIdx = i
      }
    }

    if (closestCarIdx != -1) {
      let v = vehicles[closestCarIdx]
      inVehicleId = v.id
      missionText = concat("Driving: ", v.modelName)
      if (v.isPolice && wantedStars == 0) {
        wantedStars = 1 // Grand theft auto!
      }
    }
  }
}

function firePlayerWeapon() {
  if (playerWeapon == "Fists") {
    // Melee attack nearby peds
    for (let mut i = 0; i < pedestrians.length; i = i + 1) {
      let p = pedestrians[i]
      let dx = p.x - playerX
      let dy = p.y - playerY
      let dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 45.0) {
        p.health = p.health - 35.0
        if (p.health <= 0.0) p.state = "dead"
      }
    }
  } else if (playerAmmo > 0) {
    playerAmmo = playerAmmo - 1
    let isRocket = playerWeapon == "Rocket"
    let muzzleX = playerX + Math.cos(playerAngle) * 20.0
    let muzzleY = playerY + Math.sin(playerAngle) * 20.0
    spawnBullet(muzzleX, muzzleY, playerAngle, isRocket, true)
    wantedCrimePoints = wantedCrimePoints + 5.0
    if (wantedCrimePoints > 40.0 && wantedStars == 0) wantedStars = 1
  }
}

function cycleWeapon() {
  if (playerWeapon == "Fists") playerWeapon = "Pistol"
  else if (playerWeapon == "Pistol") playerWeapon = "Uzi"
  else if (playerWeapon == "Uzi") playerWeapon = "Rocket"
  else playerWeapon = "Fists"
}

function cycleRadio() {
  if (currentRadio == "Head Radio 98.3") currentRadio = "Flashback FM"
  else if (currentRadio == "Flashback FM") currentRadio = "MSX FM"
  else if (currentRadio == "MSX FM") currentRadio = "Lips 106"
  else if (currentRadio == "Lips 106") currentRadio = "Off"
  else currentRadio = "Head Radio 98.3"
}

function startMission(id: number) {
  activeMission = id
  if (id == 1) {
    missionTargetX = 1550.0
    missionTargetY = 250.0
    missionText = "Mission 1: The Fast Getaway - Drive to Portland Harbor Docks!"
  } else if (id == 2) {
    wantedStars = 3
    missionText = "Mission 2: Evade the 3-Star Police Manhunt! Reach Pay 'n' Spray!"
  }
}

// ----------------------------------------------------------------------------
// 8. 2.5D Canvas Rendering Engine
// ----------------------------------------------------------------------------

function drawGameCanvas() {
  let cvs = getElementById("gta3-canvas")
  if (!cvs) { return }

  if (cvs.width != 860) {
    cvs.width = 860
    cvs.height = 500
  }

  let ctx = cvs.getContext("2d")
  if (!ctx) { return }

  // Clear Canvas (Dark Asphalt)
  ctx.fillStyle = "#0f172a"
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)

  ctx.save()
  // Apply Camera Center & Zoom
  ctx.translate(SCREEN_W / 2.0, SCREEN_H / 2.0)
  ctx.scale(camZoom, camZoom)
  ctx.translate(-camX, -camY)

  // 1. Draw World Ground (Roads & Grid Lines)
  ctx.fillStyle = "#1e293b"
  ctx.fillRect(0, 0, WORLD_W, WORLD_H)

  // Draw Road Grid (Asphalt Lanes)
  ctx.strokeStyle = "#334155"
  ctx.lineWidth = 120.0
  ctx.beginPath()
  // Horizontal Avenues
  ctx.moveTo(0, 300.0); ctx.lineTo(WORLD_W, 300.0)
  ctx.moveTo(0, 700.0); ctx.lineTo(WORLD_W, 700.0)
  ctx.moveTo(0, 1100.0); ctx.lineTo(WORLD_W, 1100.0)
  ctx.moveTo(0, 1500.0); ctx.lineTo(WORLD_W, 1500.0)
  // Vertical Boulevards
  ctx.moveTo(350.0, 0); ctx.lineTo(350.0, WORLD_H)
  ctx.moveTo(750.0, 0); ctx.lineTo(750.0, WORLD_H)
  ctx.moveTo(1300.0, 0); ctx.lineTo(1300.0, WORLD_H)
  ctx.moveTo(1800.0, 0); ctx.lineTo(1800.0, WORLD_H)
  ctx.stroke()

  // Yellow Center Road Dividers
  ctx.strokeStyle = "#eab308"
  ctx.lineWidth = 3.0
  ctx.setLineDash([16, 16])
  ctx.beginPath()
  ctx.moveTo(0, 300.0); ctx.lineTo(WORLD_W, 300.0)
  ctx.moveTo(0, 700.0); ctx.lineTo(WORLD_W, 700.0)
  ctx.moveTo(0, 1100.0); ctx.lineTo(WORLD_W, 1100.0)
  ctx.moveTo(0, 1500.0); ctx.lineTo(WORLD_W, 1500.0)
  ctx.moveTo(350.0, 0); ctx.lineTo(350.0, WORLD_H)
  ctx.moveTo(750.0, 0); ctx.lineTo(750.0, WORLD_H)
  ctx.moveTo(1300.0, 0); ctx.lineTo(1300.0, WORLD_H)
  ctx.moveTo(1800.0, 0); ctx.lineTo(1800.0, WORLD_H)
  ctx.stroke()
  ctx.setLineDash([])

  // 2. Draw Skidmarks
  for (let mut i = 0; i < skidMarks.length; i = i + 1) {
    let s = skidMarks[i]
    ctx.strokeStyle = concat("rgba(15, 23, 42, ", concat(to_string(s.alpha), ")"))
    ctx.lineWidth = 4.0
    ctx.beginPath()
    ctx.moveTo(s.x1, s.y1)
    ctx.lineTo(s.x2, s.y2)
    ctx.stroke()
  }

  // 3. Draw 2.5D Extruded Buildings & Roofs
  for (let mut i = 0; i < buildings.length; i = i + 1) {
    let b = buildings[i]

    // 2.5D Perspective Wall Projection (towards camera)
    let pOffX = (b.x + b.w / 2.0 - camX) * 0.05
    let pOffY = (b.y + b.h / 2.0 - camY) * 0.05

    // Base Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
    ctx.fillRect(b.x + 12.0, b.y + 12.0, b.w, b.h)

    // Side Wall Extrusion
    ctx.fillStyle = b.color
    ctx.fillRect(b.x, b.y, b.w, b.h)

    // Roof Surface
    ctx.fillStyle = b.roofColor
    ctx.fillRect(b.x + pOffX, b.y + pOffY, b.w, b.h)
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 2.0
    ctx.strokeRect(b.x + pOffX, b.y + pOffY, b.w, b.h)

    // Building Neon Sign
    ctx.fillStyle = b.isPayNSpray ? "#34d399" : "#94a3b8"
    ctx.font = "bold 13px monospace"
    ctx.fillText(b.label, b.x + pOffX + 10.0, b.y + pOffY + 24.0)
  }

  // 4. Draw Pedestrians
  for (let mut i = 0; i < pedestrians.length; i = i + 1) {
    let p = pedestrians[i]
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.angle)

    if (p.state == "dead") {
      ctx.fillStyle = "#e11d48"
      ctx.beginPath()
      ctx.arc(0, 0, 8.0, 0, 6.283)
      ctx.fill()
    } else {
      // Body & Shoulders
      ctx.fillStyle = p.shirtColor
      ctx.fillRect(-6.0, -5.0, 12.0, 10.0)
      // Head
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(0, 0, 4.5, 0, 6.283)
      ctx.fill()
    }
    ctx.restore()
  }

  // 5. Draw Vehicles
  for (let mut i = 0; i < vehicles.length; i = i + 1) {
    let v = vehicles[i]
    ctx.save()
    ctx.translate(v.x, v.y)
    ctx.rotate(v.angle)

    // Headlight Beams
    ctx.fillStyle = "rgba(254, 240, 138, 0.15)"
    ctx.beginPath()
    ctx.moveTo(v.length / 2.0, -v.width / 3.0)
    ctx.lineTo(v.length / 2.0 + 140.0, -v.width * 1.6)
    ctx.lineTo(v.length / 2.0 + 140.0, v.width * 1.6)
    ctx.lineTo(v.length / 2.0, v.width / 3.0)
    ctx.closePath()
    ctx.fill()

    // Vehicle Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)"
    ctx.fillRect(-v.length / 2.0 + 4.0, -v.width / 2.0 + 4.0, v.length, v.width)

    // Main Chassis
    ctx.fillStyle = v.color
    ctx.fillRect(-v.length / 2.0, -v.width / 2.0, v.length, v.width)

    // Roof & Windshield
    ctx.fillStyle = v.roofColor
    ctx.fillRect(-v.length / 4.0, -v.width / 2.5, v.length / 2.0, v.width * 0.8)

    // Windshields (Glass)
    ctx.fillStyle = "#38bdf8"
    ctx.fillRect(v.length / 6.0, -v.width / 2.8, 5.0, v.width * 0.72) // Front
    ctx.fillRect(-v.length / 3.5, -v.width / 2.8, 4.0, v.width * 0.72) // Rear

    // Police Siren Flasher (Red & Blue)
    if (v.isPolice) {
      let isBlue = (v.sirenTimer % 20) > 10
      ctx.fillStyle = isBlue ? "#3b82f6" : "#ef4444"
      ctx.fillRect(-2.0, -6.0, 6.0, 12.0)
    }

    ctx.restore()
  }

  // 6. Draw Player (When On Foot)
  if (inVehicleId == -1) {
    ctx.save()
    ctx.translate(playerX, playerY)
    ctx.rotate(playerAngle)

    // Player Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
    ctx.beginPath()
    ctx.arc(2, 2, 8.0, 0, 6.283)
    ctx.fill()

    // Iconic Claude Leather Jacket (Dark Navy/Black)
    ctx.fillStyle = "#1e1e24"
    ctx.fillRect(-7.0, -6.0, 14.0, 12.0)

    // Green Cargo Pants
    ctx.fillStyle = "#166534"
    ctx.fillRect(-9.0, -5.0, 5.0, 10.0)

    // Head
    ctx.fillStyle = "#fcd34d"
    ctx.beginPath()
    ctx.arc(0, 0, 5.0, 0, 6.283)
    ctx.fill()

    // Weapon In Hand
    if (playerWeapon != "Fists") {
      ctx.fillStyle = "#94a3b8"
      ctx.fillRect(4.0, 2.0, 10.0, 3.0)
    }

    ctx.restore()
  }

  // 7. Draw Bullets & Explosions
  for (let mut i = 0; i < bullets.length; i = i + 1) {
    let b = bullets[i]
    ctx.fillStyle = b.isRocket ? "#f97316" : "#fef08a"
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.isRocket ? 4.5 : 2.5, 0, 6.283)
    ctx.fill()
  }

  for (let mut i = 0; i < particles.length; i = i + 1) {
    let p = particles[i]
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, 6.283)
    ctx.fill()
  }

  // 8. Draw Mission Target Beacon
  if (activeMission != 0) {
    ctx.strokeStyle = "#10b981"
    ctx.lineWidth = 4.0
    ctx.beginPath()
    ctx.arc(missionTargetX, missionTargetY, 40.0 + Math.sin(gameTick * 0.1) * 8.0, 0, 6.283)
    ctx.stroke()
  }

  ctx.restore()

  // =========================================================================
  // 9. In-Game HUD Overlays (Radar Minimap, Wanted Stars, Health/Armor)
  // =========================================================================

  // Radar Minimap in Bottom-Left Corner
  let radarX = 90.0
  let radarY = SCREEN_H - 90.0
  let radarRadius = 70.0

  ctx.save()
  ctx.beginPath()
  ctx.arc(radarX, radarY, radarRadius, 0, 6.283)
  ctx.clip()

  // Radar Background
  ctx.fillStyle = "#020617"
  ctx.fillRect(radarX - radarRadius, radarY - radarRadius, radarRadius * 2.0, radarRadius * 2.0)

  // Radar Map scaling
  let mapScale = 0.08
  for (let mut i = 0; i < buildings.length; i = i + 1) {
    let b = buildings[i]
    let bRelX = radarX + (b.x - playerX) * mapScale
    let bRelY = radarY + (b.y - playerY) * mapScale
    ctx.fillStyle = b.isPayNSpray ? "#10b981" : "#334155"
    ctx.fillRect(bRelX, bRelY, b.w * mapScale, b.h * mapScale)
  }

  // Police Blips on Radar
  for (let mut i = 0; i < vehicles.length; i = i + 1) {
    let v = vehicles[i]
    if (v.isPolice) {
      let vRelX = radarX + (v.x - playerX) * mapScale
      let vRelY = radarY + (v.y - playerY) * mapScale
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(vRelX, vRelY, 3.5, 0, 6.283)
      ctx.fill()
    }
  }

  // Player Center Blip
  ctx.fillStyle = "#ec4899"
  ctx.beginPath()
  ctx.arc(radarX, radarY, 4.0, 0, 6.283)
  ctx.fill()

  ctx.restore()

  // Radar Ring Border
  ctx.strokeStyle = "#38bdf8"
  ctx.lineWidth = 3.0
  ctx.beginPath()
  ctx.arc(radarX, radarY, radarRadius, 0, 6.283)
  ctx.stroke()
}

// ----------------------------------------------------------------------------
// 9. Interactive UI & Virtual Gamepad Mount
// ----------------------------------------------------------------------------

function renderGameUI() {
  let mut starSymbols = ""
  for (let mut i = 0; i < 5; i = i + 1) {
    if (i < wantedStars) {
      starSymbols = concat(starSymbols, "★ ")
    } else {
      starSymbols = concat(starSymbols, "☆ ")
    }
  }

  let vnode = h("div", { className: "space-y-4 font-sans select-none" }, [
    // Header & Story Banner
    h("div", { className: "p-4 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4" }, [
      h("div", { className: "space-y-1" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-black text-xs border border-amber-500/30" }, "GTA 3 2.5D"),
          h("h2", { className: "text-lg font-black text-white tracking-wider uppercase italic" }, "Liberty City Sandbox Engine")
        ]),
        h("p", { className: "text-xs text-slate-400 font-mono" }, missionText)
      ]),

      // Wanted Stars & Cash Counter
      h("div", { className: "flex items-center space-x-4 font-mono font-bold" }, [
        h("div", { className: "text-right" }, [
          h("div", { className: "text-xs text-slate-400 uppercase" }, "Wanted Level"),
          h("div", { className: wantedStars > 0 ? "text-base text-amber-400 animate-pulse font-black" : "text-base text-slate-600" }, starSymbols)
        ]),
        h("div", { className: "px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-emerald-400 text-lg font-black" }, [
          h("span", {}, concat("$", to_string(playerCash)))
        ])
      ])
    ]),

    // Primary Interactive Canvas Viewport
    h("div", { className: "relative bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-2xl overflow-hidden flex justify-center w-full" }, [
      h("canvas", {
        id: "gta3-canvas",
        width: "860",
        height: "500",
        className: "w-full max-w-[860px] h-auto aspect-[860/500] rounded-xl bg-slate-950 border border-slate-800/80 shadow-inner cursor-crosshair touch-none select-none"
      }, "")
    ]),

    // Mobile Virtual Touch Controller Deck (Phone Gamepad)
    h("div", { className: "p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl space-y-3" }, [
      h("div", { className: "flex items-center justify-between" }, [
        h("span", { className: "text-xs font-mono font-bold uppercase tracking-wider text-slate-400" }, "📱 Touch Virtual Gamepad"),
        h("span", { className: "text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60" }, "Touch & Hold to Drive / Move")
      ]),
      h("div", { className: "flex flex-wrap md:flex-nowrap items-center justify-between gap-6 pt-1" }, [
        // Left Thumb: Directional D-Pad
        h("div", { className: "flex-1 min-w-[200px] flex flex-col items-center justify-center select-none" }, [
          // D-Pad Up (Gas / Forward)
          h("button", {
            className: "w-16 h-12 rounded-t-xl bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white font-black text-base border border-slate-700 shadow-lg flex items-center justify-center touch-none transition-colors",
            onPointerDown: fn() { keyW = true },
            onPointerUp: fn() { keyW = false },
            onPointerLeave: fn() { keyW = false },
            onTouchStart: fn() { keyW = true },
            onTouchEnd: fn() { keyW = false },
            onMouseDown: fn() { keyW = true },
            onMouseUp: fn() { keyW = false },
            onMouseLeave: fn() { keyW = false }
          }, "⬆️ GAS"),
          // D-Pad Left & Right
          h("div", { className: "flex items-center space-x-4 my-1" }, [
            h("button", {
              className: "w-16 h-12 rounded-l-xl bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white font-black text-base border border-slate-700 shadow-lg flex items-center justify-center touch-none transition-colors",
              onPointerDown: fn() { keyA = true },
              onPointerUp: fn() { keyA = false },
              onPointerLeave: fn() { keyA = false },
              onTouchStart: fn() { keyA = true },
              onTouchEnd: fn() { keyA = false },
              onMouseDown: fn() { keyA = true },
              onMouseUp: fn() { keyA = false },
              onMouseLeave: fn() { keyA = false }
            }, "⬅️ LEFT"),
            h("button", {
              className: "w-14 h-12 rounded-lg bg-amber-500/20 active:bg-amber-500 hover:bg-amber-500/30 text-amber-300 font-black text-xs border border-amber-500/40 shadow flex items-center justify-center touch-none transition-colors",
              onPointerDown: fn() { keySpace = true },
              onPointerUp: fn() { keySpace = false },
              onPointerLeave: fn() { keySpace = false },
              onTouchStart: fn() { keySpace = true },
              onTouchEnd: fn() { keySpace = false },
              onMouseDown: fn() { keySpace = true },
              onMouseUp: fn() { keySpace = false },
              onMouseLeave: fn() { keySpace = false }
            }, "🛑 DRIFT"),
            h("button", {
              className: "w-16 h-12 rounded-r-xl bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white font-black text-base border border-slate-700 shadow-lg flex items-center justify-center touch-none transition-colors",
              onPointerDown: fn() { keyD = true },
              onPointerUp: fn() { keyD = false },
              onPointerLeave: fn() { keyD = false },
              onTouchStart: fn() { keyD = true },
              onTouchEnd: fn() { keyD = false },
              onMouseDown: fn() { keyD = true },
              onMouseUp: fn() { keyD = false },
              onMouseLeave: fn() { keyD = false }
            }, "RIGHT ➡️")
          ]),
          // D-Pad Down (Reverse / Brake)
          h("button", {
            className: "w-16 h-12 rounded-b-xl bg-slate-800 active:bg-indigo-600 hover:bg-slate-700 text-white font-black text-base border border-slate-700 shadow-lg flex items-center justify-center touch-none transition-colors",
            onPointerDown: fn() { keyS = true },
            onPointerUp: fn() { keyS = false },
            onPointerLeave: fn() { keyS = false },
            onTouchStart: fn() { keyS = true },
            onTouchEnd: fn() { keyS = false },
            onMouseDown: fn() { keyS = true },
            onMouseUp: fn() { keyS = false },
            onMouseLeave: fn() { keyS = false }
          }, "⬇️ BRAKE")
        ]),

        // Right Thumb: Primary Action Buttons
        h("div", { className: "flex-1 min-w-[220px] grid grid-cols-2 gap-3 select-none" }, [
          h("button", {
            className: "py-3 px-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 active:from-rose-500 active:to-amber-500 text-white font-black text-sm shadow-lg border border-rose-500/50 flex flex-col items-center justify-center gap-1 touch-none",
            onClick: fn() { firePlayerWeapon(); renderGameUI() }
          }, [
            h("span", { className: "text-lg" }, "💥"),
            h("span", {}, "FIRE / ATTACK")
          ]),
          h("button", {
            className: inVehicleId != -1
              ? "py-3 px-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 active:from-rose-500 active:to-red-600 text-white font-black text-sm shadow-lg border border-rose-500/50 flex flex-col items-center justify-center gap-1 touch-none"
              : "py-3 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 active:from-emerald-500 active:to-teal-500 text-white font-black text-sm shadow-lg border border-emerald-500/50 flex flex-col items-center justify-center gap-1 touch-none",
            onClick: fn() { toggleEnterExitCar(); renderGameUI() }
          }, [
            h("span", { className: "text-lg" }, inVehicleId != -1 ? "🚪" : "🚗"),
            h("span", {}, inVehicleId != -1 ? "EXIT VEHICLE" : "ENTER / HIJACK")
          ]),
          h("button", {
            className: "py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-cyan-300 font-black text-xs border border-slate-700 shadow flex items-center justify-center gap-1 touch-none",
            onClick: fn() { cycleWeapon(); renderGameUI() }
          }, [
            h("span", {}, "🔄 WEAPON")
          ]),
          h("button", {
            className: "py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-300 font-black text-xs border border-slate-700 shadow flex items-center justify-center gap-1 touch-none",
            onClick: fn() { cycleRadio(); renderGameUI() }
          }, [
            h("span", {}, "📻 RADIO")
          ])
        ])
      ])
    ]),

    // Game HUD Action Deck & Controls
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, [
      // Status Stats (Health, Armor, Weapon)
      h("div", { className: "p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs" }, [
        h("div", { className: "flex justify-between items-center" }, [
          h("span", { className: "text-rose-400 font-bold" }, concat("💚 HEALTH: ", to_string(Math.floor(playerHealth)))),
          h("span", { className: "text-cyan-400 font-bold" }, concat("🛡️ ARMOR: ", to_string(Math.floor(playerArmor))))
        ]),
        h("div", { className: "flex justify-between items-center pt-1" }, [
          h("span", { className: "text-amber-400 font-bold" }, concat("🔫 WEAPON: ", playerWeapon)),
          h("span", { className: "text-slate-400" }, concat("AMMO: ", to_string(playerAmmo)))
        ]),
        h("div", { className: "flex gap-2 pt-1" }, [
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-colors",
            onClick: fn() { cycleWeapon(); renderGameUI() }
          }, "🔄 Switch Weapon"),
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer transition-colors",
            onClick: fn() { firePlayerWeapon(); renderGameUI() }
          }, "💥 Attack / Fire")
        ])
      ]),

      // Vehicle & Radio Controls
      h("div", { className: "p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs" }, [
        h("div", { className: "flex justify-between items-center" }, [
          h("span", { className: "text-slate-400" }, "STATE:"),
          h("span", { className: inVehicleId != -1 ? "text-emerald-400 font-bold" : "text-indigo-400 font-bold" }, inVehicleId != -1 ? "🚗 In Vehicle" : "🚶 On Foot")
        ]),
        h("div", { className: "flex justify-between items-center pt-1" }, [
          h("span", { className: "text-slate-400" }, "📻 RADIO:"),
          h("span", { className: "text-cyan-400 font-bold truncate max-w-[140px]" }, currentRadio)
        ]),
        h("div", { className: "flex gap-2 pt-1" }, [
          h("button", {
            className: inVehicleId != -1 ? "flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer",
            onClick: fn() { toggleEnterExitCar(); renderGameUI() }
          }, inVehicleId != -1 ? "🚪 Exit Car" : "🚗 Enter Car"),
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700 cursor-pointer",
            onClick: fn() { cycleRadio(); renderGameUI() }
          }, "📻 Change Radio")
        ])
      ]),

      // Story Missions & Cheats
      h("div", { className: "p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs" }, [
        h("div", { className: "text-slate-400 text-[10px] uppercase font-bold" }, "Story Missions & Pay 'n' Spray"),
        h("div", { className: "flex gap-2" }, [
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/70 text-indigo-200 border border-indigo-500/40 font-bold cursor-pointer",
            onClick: fn() { startMission(1); renderGameUI() }
          }, "📜 Mission 1"),
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-amber-600/40 hover:bg-amber-600/70 text-amber-200 border border-amber-500/40 font-bold cursor-pointer",
            onClick: fn() { startMission(2); renderGameUI() }
          }, "⭐ 3-Star Chase")
        ]),
        h("button", {
          className: "w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold cursor-pointer",
          onClick: fn() { initGame(); renderGameUI() }
        }, "🔄 Reset Game / Respawn")
      ])
    ]),

    // Keybindings & Keyboard Quick Ref
    h("div", { className: "p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap justify-between gap-2" }, [
      h("span", {}, "🎮 WASD / Arrows: Steer & Move"),
      h("span", {}, "🚗 [F] / [Enter]: Enter / Exit Vehicle"),
      h("span", {}, "🛑 [Space]: Handbrake Drift"),
      h("span", {}, "🔫 [E] / [Ctrl]: Fire Weapon"),
      h("span", {}, "📻 [R]: Radio Station")
    ])
  ])

  mount("app-root", vnode)
  drawGameCanvas()
}

// ----------------------------------------------------------------------------
// 10. Key Event Listeners & Animation Loop
// ----------------------------------------------------------------------------

function handleKeyDown(e: any) {
  let k = e.key
  if (k == "w" || k == "W" || k == "ArrowUp") { keyW = true }
  if (k == "s" || k == "S" || k == "ArrowDown") { keyS = true }
  if (k == "a" || k == "A" || k == "ArrowLeft") { keyA = true }
  if (k == "d" || k == "D" || k == "ArrowRight") { keyD = true }
  if (k == " " || k == "Space") { keySpace = true }
  if (k == "Shift") { keyShift = true }
  if (k == "f" || k == "F" || k == "Enter") { toggleEnterExitCar(); renderGameUI() }
  if (k == "e" || k == "E") { firePlayerWeapon(); renderGameUI() }
  if (k == "q" || k == "Q") { cycleWeapon(); renderGameUI() }
  if (k == "r" || k == "R") { cycleRadio(); renderGameUI() }
}

function handleKeyUp(e: any) {
  let k = e.key
  if (k == "w" || k == "W" || k == "ArrowUp") { keyW = false }
  if (k == "s" || k == "S" || k == "ArrowDown") { keyS = false }
  if (k == "a" || k == "A" || k == "ArrowLeft") { keyA = false }
  if (k == "d" || k == "D" || k == "ArrowRight") { keyD = false }
  if (k == " " || k == "Space") { keySpace = false }
  if (k == "Shift") { keyShift = false }
}

// Register Window Keyboard Hooks
window.addEventListener("keydown", handleKeyDown)
window.addEventListener("keyup", handleKeyUp)

function startLoop() {
  let _timer = setInterval(fn() {
    if (isGameRunning) {
      updatePhysics()
      drawGameCanvas()
      if (gameTick % 12 == 0) {
        renderGameUI()
      }
    }
  }, 16)
}

// Bootstrap Game
initGame()
renderGameUI()
startLoop()

println("TypeLang GTA 3 Style Liberty City Sandbox Initialized!")
`
};
