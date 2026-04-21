import './LogoCarousel.css'
import type { JSX } from 'react'

interface LogoItem {
  name: string
  href: string
  logo: JSX.Element
}

const MayiaLogo = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <polygon
      points="18,2 33,10 33,26 18,34 3,26 3,10"
      fill="none"
      stroke="#DA7756"
      strokeWidth="1.8"
    />
    <text
      x="18"
      y="23"
      textAnchor="middle"
      fontFamily="'Syne', sans-serif"
      fontWeight="800"
      fontSize="13"
      fill="#DA7756"
      letterSpacing="0.5"
    >
      M
    </text>
  </svg>
)

const PortalDatosLogo = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect x="3" y="8" width="30" height="20" rx="3" stroke="#DA7756" strokeWidth="1.8" fill="none" />
    <circle cx="18" cy="18" r="5" stroke="#DA7756" strokeWidth="1.5" fill="none" />
    <line x1="3" y1="14" x2="33" y2="14" stroke="#DA7756" strokeWidth="1.2" opacity="0.5" />
    <line x1="3" y1="22" x2="33" y2="22" stroke="#DA7756" strokeWidth="1.2" opacity="0.5" />
  </svg>
)

const MCPLogo = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 48 46" fill="none" aria-hidden="true">
    <path
      fill="#DA7756"
      d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z"
    />
  </svg>
)

const FlaiLogo = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <path
      d="M18 5 C10 5 5 11 5 18 C5 22 7 25 10 27 L10 31 L14 29 C15.3 29.6 16.6 30 18 30 C26 30 31 24 31 18 C31 11 26 5 18 5Z"
      stroke="#DA7756"
      strokeWidth="1.8"
      fill="none"
    />
    <path d="M12 17 L16 13 L18 17 L22 12 L24 17" stroke="#DA7756" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

const GitHubLogo = (): JSX.Element => (
  <svg width="34" height="34" viewBox="0 0 19 19" aria-hidden="true">
    <path
      fill="#DA7756"
      fillRule="evenodd"
      d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844"
      clipRule="evenodd"
    />
  </svg>
)

const ESCOMLogo = (): JSX.Element => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <circle cx="18" cy="18" r="14" stroke="#DA7756" strokeWidth="1.8" fill="none" />
    <path d="M10 22 L18 10 L26 22" stroke="#DA7756" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <line x1="13" y1="19" x2="23" y2="19" stroke="#DA7756" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

const LOGOS: LogoItem[] = [
  {
    name: 'MAYiA',
    href: 'https://mayia.mx/',
    logo: <MayiaLogo />,
  },
  {
    name: 'Portal Datos CDMX',
    href: 'https://datos.cdmx.gob.mx/',
    logo: <PortalDatosLogo />,
  },
  {
    name: 'MCP Protocol',
    href: 'https://modelcontextprotocol.io/',
    logo: <MCPLogo />,
  },
  {
    name: 'FLAI · Nube Soberana',
    href: 'https://mayia.mx/',
    logo: <FlaiLogo />,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/mayia-team-hack',
    logo: <GitHubLogo />,
  },
  {
    name: 'ESCOM · IPN',
    href: 'https://www.escom.ipn.mx/',
    logo: <ESCOMLogo />,
  },
]

const LogoCarousel = (): JSX.Element => {
  const doubled = [...LOGOS, ...LOGOS]

  return (
    <section className="logo-carousel" aria-label="Organizaciones asociadas">
      <div className="logo-carousel__label mono">// Impulsado por</div>
      <div className="logo-carousel__mask">
        <div className="logo-carousel__track">
          {doubled.map((item, i) => (
            <a
              key={`${item.name}-${i}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="logo-carousel__item"
              aria-label={item.name}
            >
              <div className="logo-carousel__icon">{item.logo}</div>
              <span className="logo-carousel__name mono">{item.name}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LogoCarousel
