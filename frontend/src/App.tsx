import type { JSX } from 'react'
import { CopilotKit } from "@copilotkit/react-core"
import { CopilotPopup } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"

import GalagaBg from './Components/GalagaBg'
import Header from './Components/Header'
import HeroSection from './Components/Herosection'
import TeamSection from './Components/TeamSection'
import DocsSection from './Components/DocsSection'
import MayiaSection from './Components/MayiaSection'
import PlaygroundSection from './Components/PlaygroundSection.tsx'
import './App.css'

function App(): JSX.Element {
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
      publicLicenseKey={import.meta.env.VITE_COPILOTKIT_LICENSE_TOKEN}
    >
      <CopilotPopup
        instructions="Eres MayiA, la asistente de IA soberana de la CDMX. Ayuda al usuario a consultar datos sobre movilidad, medio ambiente y finanzas de la CDMX utilizando las herramientas MCP disponibles."
        labels={{
          title: "MayiA Intelligence",
          initial: "Hola, soy MayiA. ¿En qué puedo ayudarte hoy con los datos de la CDMX?",
        }}
        defaultOpen={false}
        clickOutsideToClose={false}
      />
      {/* Animated background — self-playing Galaga */}
      <GalagaBg />

      {/* Gradient radial glow behind content */}
      <div className="app__ambient" />

      {/* Navigation */}
      <Header />

      {/* Main content */}
      <main>
        <HeroSection />
        <PlaygroundSection />
        <TeamSection />
        <DocsSection />
        <MayiaSection />
      </main>
    </CopilotKit>
  )
}

export default App