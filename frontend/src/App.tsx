import type { JSX } from 'react'
import GalagaBg from './Components/GalagaBg'
import Header from './Components/Header'
import HeroSection from './Components/Herosection'
import TeamSection from './Components/TeamSection'
import DocsSection from './Components/DocsSection'
import MayiaSection from './Components/MayiaSection'
import './App.css'

function App(): JSX.Element {
  return (
    <>
      {/* Animated background — self-playing Galaga */}
      <GalagaBg />

      {/* Gradient radial glow behind content */}
      <div className="app__ambient" />

      {/* Navigation */}
      <Header />

      {/* Main content */}
      <main>
        <HeroSection />
        <TeamSection />
        <DocsSection />
        <MayiaSection />
      </main>
    </>
  )
}

export default App