import './LogoCarousel.css'
import type { JSX } from 'react'

// ── SVG logo components ─────────────────────────────────
const MayiaIcon = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <polygon points="18,2 33,10 33,26 18,34 3,26 3,10" stroke="currentColor" strokeWidth="1.8" />
    <text x="18" y="23" textAnchor="middle" fontFamily="'Syne',sans-serif" fontWeight="800"
      fontSize="13" fill="currentColor" letterSpacing="0.5">M</text>
  </svg>
)

const PortalDatosIcon = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect x="3" y="8" width="30" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="18" cy="18" r="5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="3" y1="14" x2="33" y2="14" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
    <line x1="3" y1="22" x2="33" y2="22" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
  </svg>
)

const MCPIcon = (): JSX.Element => (
  <svg width="32" height="32" viewBox="0 0 48 46" aria-hidden="true">
    <path fill="currentColor"
      d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
    />
  </svg>
)

const FlaiIcon = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <path d="M18 5C10 5 5 11 5 18c0 4 2 7 5 9v4l4-2c1.3.6 2.6 1 4 1 8 0 13-6 13-12C31 11 26 5 18 5z"
      stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 17l4-4 2 4 4-5 2 5" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GitHubIcon = (): JSX.Element => (
  <svg width="34" height="34" viewBox="0 0 19 19" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd"
      d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844"
      clipRule="evenodd"
    />
  </svg>
)

const EscomIcon = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 23l8-12 8 12" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
    <line x1="13" y1="19" x2="23" y2="19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

// ── Data — stores component refs, not JSX ───────────────
interface LogoItem {
  name: string
  href: string
  Icon: () => JSX.Element
}

const LOGOS: LogoItem[] = [
  { name: 'MAYiA',             href: 'https://mayia.mx/',                      Icon: MayiaIcon       },
  { name: 'Portal Datos CDMX', href: 'https://datos.cdmx.gob.mx/',             Icon: PortalDatosIcon },
  { name: 'MCP Protocol',      href: 'https://modelcontextprotocol.io/',        Icon: MCPIcon         },
  { name: 'FLAI · Nube',       href: 'https://mayia.mx/',                      Icon: FlaiIcon        },
  { name: 'GitHub',            href: 'https://github.com/mayia-team-hack',     Icon: GitHubIcon      },
  { name: 'ESCOM · IPN',       href: 'https://www.escom.ipn.mx/',              Icon: EscomIcon       },
]

// ── Component ────────────────────────────────────────────
const LogoCarousel = (): JSX.Element => {
  const items = [...LOGOS, ...LOGOS]

  return (
    <div className="logo-carousel">
      <p className="logo-carousel__label mono">// Tecnologías y aliados</p>

      <div className="logo-carousel__viewport">
        <ul className="logo-carousel__track" aria-label="Organizaciones asociadas">
          {items.map(({ name, href, Icon }, i) => (
            <li key={`${name}-${i}`} className="logo-carousel__item">
              <a href={href} target="_blank" rel="noopener noreferrer" title={name}>
                <span className="logo-carousel__icon">
                  <Icon />
                </span>
                <span className="logo-carousel__name mono">{name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default LogoCarousel
