import { useEffect, useState, useRef } from 'react'
import type { JSX } from 'react'
import { z } from 'zod'
import { useCopilotChatHeadless_c as useCopilotChat } from '@copilotkit/react-core'
import {
  useFrontendTool,
} from '@copilotkit/react-core/v2'
import './PlaygroundSection.css'

// We will simulate Generative UI components right here
const PlaygroundSection = (): JSX.Element => {
  const sectionRef = useRef<HTMLElement>(null)

  // Example state that the AI agent can modify
  const [dataPoints, setDataPoints] = useState<{ label: string; value: number }[]>([])
  const [loadingDataset, setLoadingDataset] = useState<string | null>(null)
  const { sendMessage } = useCopilotChat()

  const handlePromptClick = (text: string) => {
    sendMessage({
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
    })
  }

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // 1. Tool for rendering a dynamic chart (Generative UI)
  useFrontendTool({
    name: 'renderDataChart',
    description: 'Genera y muestra una gráfica de datos en el Playground interactivo basado en una consulta al servidor MCP.',
    parameters: z.object({
      title: z.string().describe('El título del dataset'),
      data: z.array(z.object({
        label: z.string(),
        value: z.number()
      })).describe('Un array de objetos con label y value'),
    }),
    handler: async ({ title, data }) => {
      setLoadingDataset(title)
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 800))
      setDataPoints(data)
      setLoadingDataset(null)
      return `Chart for ${title} rendered successfully.`
    },
  })

  // 2. Default render tool (Tool Fallback Card) to show exactly what's happening
  // Note: we use useFrontendTool with a name that doesn't match to act as a fallback if needed, 
  // or simply rely on the UI's default handling. For now, we'll keep the UI clean.

  return (
    <section className="playground" ref={sectionRef}>
      <div className="container playground__inner">
        <div className="playground__copy">
          <span className="playground__eyebrow mono">// Generative UI + MCP</span>
          <h2 className="playground__title">
            <span className="gradient-text">Playground</span> Interactivo
          </h2>
          <p className="playground__desc">
            Interactúa con el asistente <strong>MayiA</strong> utilizando el chat lateral. 
            MayiA está conectada a nuestro servidor <strong>MCP de la CDMX</strong> y es capaz de generar 
            componentes visuales en tiempo real según lo que le solicites.
          </p>
          <ul className="playground__prompts mono">
            <li onClick={() => handlePromptClick("Muestra las 5 alcaldías con más bicicletas")}>
              → "Muestra las 5 alcaldías con más bicicletas"
            </li>
            <li onClick={() => handlePromptClick("Consulta el presupuesto de movilidad 2023")}>
              → "Consulta el presupuesto de movilidad 2023"
            </li>
            <li onClick={() => handlePromptClick("Genera un gráfico del reporte de baches")}>
              → "Genera un gráfico del reporte de baches"
            </li>
          </ul>
        </div>

        <div className="playground__visual">
          {loadingDataset ? (
            <div className="playground__loading">
              <span className="playground__spinner" />
              <p className="mono">Consultando datos: {loadingDataset}...</p>
            </div>
          ) : dataPoints.length > 0 ? (
            <div className="playground__chart">
              <h3 className="playground__chart-title mono text-sm mb-4">
                Dataset activo
              </h3>
              <div className="playground__chart-bars">
                {dataPoints.map((dp, i) => (
                  <div key={i} className="playground__chart-bar-container">
                    <div className="playground__chart-label">{dp.label}</div>
                    <div className="playground__chart-bar-wrap">
                      <div
                        className="playground__chart-bar"
                        style={{ width: `${Math.min(dp.value, 100)}%` }}
                      />
                    </div>
                    <div className="playground__chart-value mono">{dp.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="playground__empty mono">
              <p>El lienzo está vacío.</p>
              <p>Pídele algo al asistente para empezar.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PlaygroundSection
