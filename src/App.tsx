import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import StudyCapsulesPage from './pages/StudyCapsulesPage'
import { Navbar } from './components/landing/Navbar'
import { Hero } from './components/landing/Hero'
import { Features } from './components/landing/Features'
import { WhyStudySpark } from './components/landing/WhyStudySpark'
import { CTA } from './components/landing/CTA'
import type { View } from './types/navigation'

function App() {
  const [view, setView] = useState<View>('landing')

  if (view === 'dashboard') {
    return (
      <DashboardPage
        onBack={() => setView('landing')}
        onNavigate={(v) => setView(v)}
      />
    )
  }

  if (view === 'capsules') {
    return <StudyCapsulesPage onNavigate={(v) => setView(v)} />
  }

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <Navbar onNavigate={setView} />
      <main>
        <Hero onNavigate={setView} />
        <Features />
        <WhyStudySpark />
        <CTA onNavigate={setView} />
      </main>
    </div>
  )
}

export default App
