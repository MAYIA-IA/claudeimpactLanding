import { useEffect, useRef } from 'react'
import './MayiaSection.css'
import type { JSX } from 'react'
import LogoCarousel from './LogoCarousel'

// ── Types ────────────────────────────────────────────────
interface Pillar {
  icon: string
  label: string
  desc: string
}

interface FooterLink {
  label: string
  href: string
}

// ── Data ─────────────────────────────────────────────────
const PILLARS: Pillar[] = [
  { icon: '⬡', label: 'IA Soberana',  desc: 'Nube FLAI 100% mexicana'        },
  { icon: '◈', label: 'Agentes IA',   desc: 'Empleados digitales escalables' },
  { icon: '◆', label: 'Datos CDMX',   desc: 'Portal datos.cdmx.gob.mx'       },
]

const FOOTER_LINKS: FooterLink[] = [
  { label: 'Portal Datos', href: 'https://datos.cdmx.gob.mx/' },
  { label: 'Mayia',        href: 'https://mayia.mx/'          },
  { label: 'GitHub',       href: 'https://github.com/mayia-team-hack' },
]

const CODE_PREVIEW = `{
  "org": "Mayia TEAM",
  "mission": "Democratizar IA en México",
  "project": "CDMX MCP Server",
  "data_source": "datos.cdmx.gob.mx",
  "protocol": "Model Context Protocol",
  "cloud": "FLAI · EdgeNet · 30 DCs",
  "members": [
    "ISC · ESCOM",
    "Ing. IA · ESCOM",
    "AI Developer",
    "AI Developer"
  ],
  "status": "active"
}`

// ── Component ────────────────────────────────────────────
const MayiaSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <>
      {/* ── Mayia banner ─────────────────────────── */}
      <section className="mayia" ref={sectionRef}>
        <div className="mayia__grid-lines" />
        <div className="container mayia__inner">

          {/* Left — copy */}
          <div className="mayia__copy">
            <span className="mayia__eyebrow mono">// Impulsado por</span>
            <h2 className="mayia__title">
              <span className="gradient-text">Mayia</span> TEAM
            </h2>

            <p className="mayia__desc">
              Este proyecto es desarrollado bajo el impulso y visión de{' '}
              <a
                href="https://mayia.mx/"
                target="_blank"
                rel="noopener noreferrer"
                className="mayia__link"
              >
                Mayia
              </a>
              , la fábrica de agentes de IA más grande de México y organización líder en la
              democratización de la inteligencia artificial a lo largo del territorio nacional.
            </p>

            <p className="mayia__desc">
              Mayia fabrica, adapta y comercializa soluciones de IA respaldadas por{' '}
              <strong>FLAI</strong>, su nube soberana mexicana, con presencia en más de{' '}
              <strong>30 centros de datos EdgeNet</strong> distribuidos en el país, garantizando
              seguridad, gobernanza y acompañamiento integral para empresas y gobiernos.
            </p>

            {/* Pillars */}
            <div className="mayia__pillars">
              {PILLARS.map(p => (
                <div key={p.label} className="mayia__pillar">
                  <span className="mayia__pillar-icon">{p.icon}</span>
                  <div>
                    <div className="mayia__pillar-label">{p.label}</div>
                    <div className="mayia__pillar-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://mayia.mx/"
              target="_blank"
              rel="noopener noreferrer"
              className="mayia__cta"
            >
              Conocer Mayia →
            </a>
          </div>

          {/* Right — code card */}
          <div className="mayia__visual">
            <div className="mayia__card">
              <div className="mayia__card-header mono">
                <span className="mayia__card-dot mayia__card-dot--r" />
                <span className="mayia__card-dot mayia__card-dot--y" />
                <span className="mayia__card-dot mayia__card-dot--g" />
                <span>mayia_team.config</span>
              </div>
              <div className="mayia__card-body">
                <pre className="mayia__code">{CODE_PREVIEW}</pre>
              </div>
            </div>

            {/* Floating badges */}
            <div className="mayia__badge mayia__badge--1">MCP</div>
            <div className="mayia__badge mayia__badge--2">CDMX</div>
            <div className="mayia__badge mayia__badge--3">FLAI</div>
          </div>
        </div>
      </section>

      {/* ── Logo carousel ───────────────────────── */}
      <LogoCarousel />

      {/* ── Footer ───────────────────────────────── */}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__logo">
            <span className="footer__logo-icon">⬡</span>
            <span className="mono">
              MCP<span style={{ color: 'var(--claude-coral)' }}> CDMX</span>
            </span>
          </div>

          <p className="footer__copy mono">
            © {new Date().getFullYear()} Mayia TEAM · Datos Abiertos CDMX
          </p>

          <nav className="footer__links" aria-label="Footer links">
            {FOOTER_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  )
}

export default MayiaSection