import { useEffect, useRef } from 'react'
import type { JSX } from 'react'

// ── Types ────────────────────────────────────────────────
interface Star {
  x: number
  y: number
  r: number
  speed: number
  alpha: number
}

interface Enemy {
  x: number
  y: number
  alive: boolean
  type: 'boss' | 'mid' | 'small'
  wobble: number
}

interface Bullet {
  x: number
  y: number
}

interface EnemyBullet {
  x: number
  y: number
  speed: number
}

interface Particle {
  vx: number
  vy: number
  r: number
}

interface Explosion {
  x: number
  y: number
  life: number
  maxLife: number
  particles: Particle[]
}

// ── Constants ────────────────────────────────────────────
const STAR_COUNT = 120
const ENEMY_ROWS = 3
const ENEMY_COLS = 8

// ── Component ────────────────────────────────────────────
const GalagaBg = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const resize = (): void => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }
    window.addEventListener('resize', resize)

    // ── Stars ──────────────────────────────────────────
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      speed: Math.random() * 0.4 + 0.05,
      alpha: Math.random() * 0.7 + 0.2,
    }))

    // ── Player ─────────────────────────────────────────
    const player = {
      x: W / 2,
      y: H - 90,
      targetX: W / 2,
      cooldown: 0,
      fireRate: 22,
    }

    // ── Collections ────────────────────────────────────
    const bullets: Bullet[] = []
    const enemyBullets: EnemyBullet[] = []
    const explosions: Explosion[] = []

    let enemies: Enemy[] = []
    let enemyDir = 1
    let enemySpeed = 0.35
    let enemyMoveTimer = 0

    const spawnEnemies = (): void => {
      enemies = []
      for (let r = 0; r < ENEMY_ROWS; r++) {
        for (let c = 0; c < ENEMY_COLS; c++) {
          const type: Enemy['type'] =
            r === 0 ? 'boss' : r === 1 ? 'mid' : 'small'
          enemies.push({
            x: 120 + c * 110,
            y: 80 + r * 60,
            alive: true,
            type,
            wobble: Math.random() * Math.PI * 2,
          })
        }
      }
    }
    spawnEnemies()

    // ── Draw helpers ───────────────────────────────────
    const drawPlayer = (x: number, y: number): void => {
      ctx.save()
      ctx.translate(x, y)
      ctx.beginPath()
      ctx.moveTo(0, -18)
      ctx.lineTo(12, 10)
      ctx.lineTo(6, 6)
      ctx.lineTo(0, 14)
      ctx.lineTo(-6, 6)
      ctx.lineTo(-12, 10)
      ctx.closePath()
      ctx.fillStyle = 'rgba(218,119,86,0.85)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(0, 14, 4, 0, Math.PI * 2)
      const g = ctx.createRadialGradient(0, 14, 0, 0, 14, 6)
      g.addColorStop(0, 'rgba(242,192,167,1)')
      g.addColorStop(1, 'rgba(218,119,86,0)')
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    }

    const drawEnemy = (
      x: number,
      y: number,
      type: Enemy['type'],
      wobble: number,
      t: number,
    ): void => {
      ctx.save()
      ctx.translate(x, y + Math.sin(wobble + t * 0.03) * 3)

      if (type === 'boss') {
        ctx.beginPath()
        ctx.moveTo(0, -14); ctx.lineTo(14, 0)
        ctx.lineTo(0, 14);  ctx.lineTo(-14, 0)
        ctx.closePath()
        ctx.strokeStyle = 'rgba(232,149,109,0.9)'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.fillStyle = 'rgba(218,119,86,0.18)'
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(0, -7); ctx.lineTo(7, 0)
        ctx.lineTo(0, 7);  ctx.lineTo(-7, 0)
        ctx.closePath()
        ctx.fillStyle = 'rgba(232,149,109,0.5)'
        ctx.fill()
      } else if (type === 'mid') {
        ctx.beginPath()
        ctx.arc(0, 0, 9, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(218,119,86,0.7)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(0, 0, 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(218,119,86,0.5)'
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(-9, 0); ctx.lineTo(-16, 8)
        ctx.moveTo(9, 0);  ctx.lineTo(16, 8)
        ctx.strokeStyle = 'rgba(218,119,86,0.5)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.rect(-6, -6, 12, 12)
        ctx.strokeStyle = 'rgba(242,192,167,0.6)'
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.beginPath()
        ctx.rect(-3, -3, 6, 6)
        ctx.fillStyle = 'rgba(242,192,167,0.3)'
        ctx.fill()
      }
      ctx.restore()
    }

    const drawBullet = (x: number, y: number, color: string): void => {
      ctx.save()
      ctx.beginPath()
      ctx.rect(x - 1.5, y - 6, 3, 12)
      const g = ctx.createLinearGradient(x, y - 6, x, y + 6)
      g.addColorStop(0, color)
      g.addColorStop(1, 'transparent')
      ctx.fillStyle = g
      ctx.fill()
      ctx.restore()
    }

    const drawExplosion = (ex: Explosion): void => {
      const progress = 1 - ex.life / ex.maxLife
      ctx.save()
      ctx.translate(ex.x, ex.y)
      for (const p of ex.particles) {
        const px = p.vx * progress * 40
        const py = p.vy * progress * 40
        ctx.beginPath()
        ctx.arc(px, py, p.r * (1 - progress * 0.7), 0, Math.PI * 2)
        ctx.fillStyle = `rgba(218,119,86,${(1 - progress) * 0.9})`
        ctx.fill()
      }
      ctx.restore()
    }

    // ── AI auto-aim ────────────────────────────────────
    const autoAim = (t: number): void => {
      const alive = enemies.filter(e => e.alive)
      if (alive.length === 0) return
      const nearest = alive.reduce((a, b) =>
        Math.abs(b.x - player.x) < Math.abs(a.x - player.x) ? b : a,
      )
      let tx = nearest.x + Math.sin(t * 0.02) * 60
      tx = Math.max(30, Math.min(W - 30, tx))
      player.targetX = tx
    }

    let frame = 0
    let animId: number

    const loop = (): void => {
      animId = requestAnimationFrame(loop)
      frame++

      // Clear with trail
      ctx.fillStyle = 'rgba(10,10,15,0.18)'
      ctx.fillRect(0, 0, W, H)

      // Stars
      for (const s of stars) {
        s.y += s.speed
        if (s.y > H) { s.y = 0; s.x = Math.random() * W }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(240,237,232,${s.alpha})`
        ctx.fill()
      }

      // Respawn
      const alive = enemies.filter(e => e.alive)
      if (alive.length === 0) {
        spawnEnemies()
        enemySpeed = Math.min(enemySpeed + 0.1, 1.2)
        enemyBullets.length = 0
        bullets.length = 0
      }

      // Enemy movement
      enemyMoveTimer++
      if (enemyMoveTimer > 45) {
        enemyMoveTimer = 0
        const liveEnemies = enemies.filter(e => e.alive)
        if (liveEnemies.length > 0) {
          const minX = Math.min(...liveEnemies.map(e => e.x))
          const maxX = Math.max(...liveEnemies.map(e => e.x))
          if ((enemyDir === 1 && maxX > W - 80) || (enemyDir === -1 && minX < 80)) {
            enemyDir *= -1
            enemies.forEach(e => { if (e.alive) e.y += 18 })
          }
          enemies.forEach(e => { if (e.alive) e.x += enemyDir * (22 + enemySpeed * 8) })
        }
      }

      // Enemy fire
      if (frame % 55 === 0) {
        const shooters = enemies.filter(e => e.alive)
        if (shooters.length > 0) {
          const s = shooters[Math.floor(Math.random() * shooters.length)]
          enemyBullets.push({ x: s.x, y: s.y + 10, speed: 3.5 })
        }
      }

      // Draw enemies
      for (const e of enemies) {
        if (!e.alive) continue
        drawEnemy(e.x, e.y, e.type, e.wobble, frame)
      }

      // Player AI movement
      autoAim(frame)
      player.x += (player.targetX - player.x) * 0.06

      // Player fire
      player.cooldown--
      if (player.cooldown <= 0) {
        bullets.push({ x: player.x, y: player.y - 10 })
        player.cooldown = player.fireRate
      }

      // Player bullets
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 7
        if (bullets[i].y < -10) { bullets.splice(i, 1); continue }
        drawBullet(bullets[i].x, bullets[i].y, 'rgba(242,192,167,1)')

        // Hit detection
        let hit = false
        for (const e of enemies) {
          if (!e.alive) continue
          if (
            Math.abs(bullets[i].x - e.x) < 18 &&
            Math.abs(bullets[i].y - e.y) < 18
          ) {
            e.alive = false
            hit = true
            explosions.push({
              x: e.x, y: e.y,
              life: 30, maxLife: 30,
              particles: Array.from({ length: 8 }, () => ({
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                r: Math.random() * 3 + 1,
              })),
            })
            break
          }
        }
        if (hit) { bullets.splice(i, 1) }
      }

      // Enemy bullets
      for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].y += enemyBullets[i].speed
        if (enemyBullets[i].y > H + 10) { enemyBullets.splice(i, 1); continue }
        drawBullet(enemyBullets[i].x, enemyBullets[i].y, 'rgba(218,119,86,0.6)')
      }

      // Explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        drawExplosion(explosions[i])
        explosions[i].life--
        if (explosions[i].life <= 0) explosions.splice(i, 1)
      }

      // Player
      drawPlayer(player.x, player.y)

      // HUD
      const killed = ENEMY_ROWS * ENEMY_COLS - enemies.filter(e => e.alive).length
      ctx.font = '11px "Space Mono"'
      ctx.fillStyle = 'rgba(218,119,86,0.3)'
      ctx.fillText(`SCORE: ${killed * 100}`, 20, H - 20)
    }

    loop()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.45,
      }}
    />
  )
}

export default GalagaBg