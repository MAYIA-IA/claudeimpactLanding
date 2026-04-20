import './HeroSection.css'
import type { JSX } from 'react'

interface Stat {
  value: string
  label: string
}

const STATS: Stat[] = [
  { value: '800+', label: 'Datasets disponibles' },
  { value: 'MCP',  label: 'Protocolo estándar'  },
  { value: 'CDMX', label: 'Ciudad de México'    },
  { value: 'Open', label: 'Código abierto'      },
]

const HeroSection = (): JSX.Element => {
  return (
    <section id="inicio" className="hero">
      <div className="hero__grid-overlay" />

      <div className="container hero__inner">

        {/* Badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          <span className="mono">Model Context Protocol · CDMX</span>
        </div>

        {/* Title */}
        <h1 className="hero__title">
          <span className="gradient-text">Datos Abiertos</span>
          <br />
          <span className="hero__title-sub">de la Ciudad de México</span>
          <br />
          <span className="hero__title-mcp">vía MCP</span>
        </h1>

        {/* Subtitle */}
        <p className="hero__subtitle">
          Un servidor <span className="mono hero__inline-code">MCP</span> que expone
          todos los conjuntos de datos públicos del portal{' '}
          <a
            href="https://datos.cdmx.gob.mx/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__link"
          >
            datos.cdmx.gob.mx
          </a>{' '}
          para que cualquier modelo de lenguaje pueda consultarlos en tiempo real.
        </p>

        {/* CTAs */}
        <div className="hero__ctas">
          <a
            href="https://github.com/mayia-team-hack"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__btn hero__btn--primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            Ver en GitHub
          </a>
          <a
            href="https://datos.cdmx.gob.mx/"
            target="_blank"
            rel="noopener noreferrer"
            className="hero__btn hero__btn--secondary"
          >
            Portal de Datos →
          </a>
        </div>

        {/* Stats */}
        <div className="hero__stats">
          {STATS.map(s => (
            <div key={s.label} className="hero__stat">
              <span className="hero__stat-value">{s.value}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero__scroll-indicator">
        <span className="mono">scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </section>
  )
}

export default HeroSection