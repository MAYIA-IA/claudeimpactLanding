import { useEffect, useRef } from 'react'
import './TeamSection.css'
import type { JSX } from 'react'

// ── Types ────────────────────────────────────────────────
interface TeamMember {
  name: string
  role: string
  school: string
  initials: string
  color: string
  bio: string
  tags: string[]
  icon: string
}

// ── Data ─────────────────────────────────────────────────
const TEAM: TeamMember[] = [
  {
    name: 'Martín Cortés',
    role: 'Ing. Sistemas Computacionales',
    school: 'ESCOM-IPN',
    initials: 'AR',
    color: '#DA7756',
    bio: 'Egresado de ESCOM especializado en arquitectura de software y sistemas distribuidos. Desarrolla la infraestructura del servidor MCP y gestiona la integración con las APIs de datos abiertos de la CDMX.',
    tags: ['Backend', 'MCP', 'Node.js'],
    icon: '⬡',
  },
  {
    name: 'Josué Serrano',
    role: 'Ing. en Inteligencia Artificial',
    school: 'ESCOM-IPN',
    initials: 'VM',
    color: '#E8956D',
    bio: 'Egresado del programa de IA de ESCOM. Diseña los prompts especializados y los recursos estructurados del servidor para maximizar la precisión de los modelos de lenguaje al consultar datos urbanos.',
    tags: ['IA', 'Prompts', 'Data Science'],
    icon: '◈',
  },
  {
    name: 'Gerardo Macías',
    role: 'Lic. Matemáticas',
    school: 'UNAM',
    initials: 'CI',
    color: '#F2C0A7',
    bio: 'Egresado de la licenciatura en matemáticas de la facultad de ciencias. Responsable del diseño y desarrollo de herramientas del MCP y de la conexión con fuente de datos.',
    tags: ['LLMs', 'APIs', 'Python'],
    icon: '◆',
  },
  {
    name: 'Victor Gonzalez',
    role: 'Lic. Física y Matemáticas',
    school: 'ESFM-IPN',
    initials: 'VG',
    color: '#DA7756',
    bio: 'Egresado de la Lic. de Física y Matemáticas. Apoyo en diseño de la capa de ingesta y/o webscraping.',
    tags: ['Backend', 'Python', 'Webscraping'],
    icon: '◇',
  },
  {
    name: 'Dr. Carlos Reyes',
    role: 'Especialista en IA Aplicada',
    school: 'ADA-CIDE',
    initials: 'CR',
    color: '#E8956D',
    bio: 'Especialista en inteligencia artificial aplicada, arquitectura de sistemas y analítica avanzada, para el desarrollo de soluciones tecnológicas enfocadas a problemas económicos, empresariales y de política pública.',
    tags: ['IA', 'Arquitectura', 'Analítica'],
    icon: '◉',
  },
]

// ── MemberCard ───────────────────────────────────────────
interface MemberCardProps {
  member: TeamMember
  idx: number
}

const MemberCard = ({ member, idx }: MemberCardProps): JSX.Element => {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const style = {
    '--delay':  `${idx * 0.12}s`,
    '--accent': member.color,
  } as React.CSSProperties

  return (
    <div ref={cardRef} className="member-card" style={style}>

      {/* Avatar */}
      <div className="member-card__avatar">
        <div className="member-card__avatar-ring" />
        <div className="member-card__avatar-inner">
          <span className="member-card__avatar-icon">{member.icon}</span>
          <span className="member-card__initials">{member.initials}</span>
        </div>
        <div className="member-card__avatar-glow" />
      </div>

      {/* Info */}
      <div className="member-card__info">
        <div className="member-card__school mono">{member.school}</div>
        <h3 className="member-card__name">{member.name}</h3>
        <p className="member-card__role">{member.role}</p>
        <p className="member-card__bio">{member.bio}</p>
        <div className="member-card__tags">
          {member.tags.map(tag => (
            <span key={tag} className="member-card__tag mono">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── TeamSection ──────────────────────────────────────────
const TeamSection = (): JSX.Element => {
  const headRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = headRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('visible') },
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="nosotros" className="team">
      <div className="team__bg-accent" />
      <div className="container">

        {/* Header */}
        <div ref={headRef} className="team__header reveal-up">
          <span className="team__eyebrow mono">// El equipo</span>
          <h2 className="team__title">Quiénes somos</h2>
          <p className="team__subtitle">
            Estudiantes, egresados y desarrolladores comprometidos con democratizar
            el acceso a los datos públicos de la Ciudad de México mediante inteligencia artificial.
          </p>
        </div>

        {/* Grid */}
        <div className="team__grid">
          {TEAM.map((member, i) => (
            <MemberCard key={member.name} member={member} idx={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TeamSection