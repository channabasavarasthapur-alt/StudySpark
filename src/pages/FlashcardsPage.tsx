import { useState, useMemo } from 'react'
import { Sidebar } from '../components/dashboard/Sidebar'
import { Flashcard } from '../components/flashcards/Flashcard'
import { DeckCard } from '../components/flashcards/DeckCard'
import { ProgressCard } from '../components/flashcards/ProgressCard'
import { StudyStatsCard } from '../components/flashcards/StudyStatsCard'
import {
  Sparkles,
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Play,
  RotateCcw,
  Calculator,
  Atom,
  Beaker,
  Dna,
  Zap
} from 'lucide-react'

interface FlashcardsPageProps {
  onBack: () => void
  onNavigate: (view: 'landing' | 'dashboard' | 'capsules' | 'flashcards') => void
}

const mockFlashcards = [
  { id: 1, question: "What is the primary function of Mitochondria?", answer: "To generate most of the chemical energy needed to power the cell's biochemical reactions through cellular respiration." },
  { id: 2, question: "State Newton's Second Law of Motion.", answer: "The acceleration of an object as produced by a net force is directly proportional to the magnitude of the net force, in the same direction as the net force, and inversely proportional to the mass of the object (F = ma)." },
  { id: 3, question: "What are the four bases of DNA?", answer: "Adenine (A), Cytosine (C), Guanine (G), and Thymine (T)." },
  { id: 4, question: "What is the value of the Speed of Light in a vacuum?", answer: "Approximately 299,792,458 meters per second (approx. 3.00 × 10⁸ m/s)." },
  { id: 5, question: "Who developed the Theory of General Relativity?", answer: "Albert Einstein, published in 1915." }
]

const mockDecks = [
  { subject: 'Mathematics', icon: Calculator, cardsCount: 42, progress: 85, lastStudied: '2 hours ago', color: 'purple' as const },
  { subject: 'Physics', icon: Atom, cardsCount: 28, progress: 64, lastStudied: 'Yesterday', color: 'teal' as const },
  { subject: 'Chemistry', icon: Beaker, cardsCount: 35, progress: 42, lastStudied: '3 days ago', color: 'purple' as const },
  { subject: 'Biology', icon: Dna, cardsCount: 50, progress: 92, lastStudied: '1 week ago', color: 'teal' as const },
]

export default function FlashcardsPage({ onBack, onNavigate }: FlashcardsPageProps) {
  const [cards, setCards] = useState(mockFlashcards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completedCount, setCompletedCount] = useState(2) // Mock starting progress

  const currentCard = cards[currentIndex]
  const totalCards = cards.length

  const handleNext = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalCards)
      if (currentIndex === completedCount - 1 && completedCount < totalCards) {
        setCompletedCount(prev => prev + 1)
      }
    }, 150)
  }

  const handlePrev = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards)
    }, 150)
  }

  const handleShuffle = () => {
    setIsFlipped(false)
    setTimeout(() => {
      const shuffled = [...cards].sort(() => Math.random() - 0.5)
      setCards(shuffled)
      setCurrentIndex(0)
    }, 150)
  }

  const masteryScore = useMemo(() => {
    return Math.round((completedCount / totalCards) * 100)
  }, [completedCount, totalCards])

  return (
    <div className="min-h-screen bg-background text-foreground lg:pl-64">
      <Sidebar onBack={onBack} onNavigate={onNavigate} activeItem="Flashcards" />

      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {/* Hero Section */}
        <header className="relative mb-16">
          <div className="absolute -left-20 -top-20 -z-10 h-80 w-80 rounded-full bg-purple/10 blur-[120px]" />
          <div className="absolute right-0 bottom-0 -z-10 h-64 w-64 rounded-full bg-teal/10 blur-[100px]" />

          <div className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-4 py-1.5 text-sm font-bold text-teal mb-6">
            <Sparkles size={16} />
            <span>Active Recall Mastery</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Smart <span className="bg-gradient-to-r from-purple to-teal bg-clip-text text-transparent">Flashcards</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            Boost your long-term retention with our intelligent flashcard system designed for spaced repetition and active recall.
          </p>
        </header>

        {/* Deck Overview & Main Experience */}
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="space-y-12">
            {/* Flashcard Player */}
            <section className="flex flex-col items-center gap-10">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground">Biology: Fundamentals</h2>
                  <p className="text-sm font-medium text-muted">Card {currentIndex + 1} of {totalCards}</p>
                </div>
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold transition hover:border-purple/50"
                >
                  <Shuffle size={18} className="text-purple" />
                  Shuffle
                </button>
              </div>

              <Flashcard
                question={currentCard.question}
                answer={currentCard.answer}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(!isFlipped)}
              />

              <div className="flex items-center gap-6">
                <button
                  onClick={handlePrev}
                  className="grid size-14 place-items-center rounded-2xl border border-border bg-card text-foreground transition-all hover:border-purple/50 hover:bg-purple/5"
                  aria-label="Previous card"
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="rounded-2xl bg-foreground px-10 py-4 text-lg font-black text-background transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isFlipped ? "Hide Answer" : "Reveal Answer"}
                </button>

                <button
                  onClick={handleNext}
                  className="grid size-14 place-items-center rounded-2xl border border-border bg-card text-foreground transition-all hover:border-teal/50 hover:bg-teal/5"
                  aria-label="Next card"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            </section>

            {/* Subject Decks */}
            <section>
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-black text-foreground">Your Decks</h2>
                <button className="text-sm font-bold text-purple hover:underline">Create New Deck</button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {mockDecks.map((deck) => (
                  <DeckCard key={deck.subject} {...deck} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-8">
            <div className="rounded-[2rem] border border-border bg-card/50 p-8 backdrop-blur-sm">
              <h3 className="mb-8 text-2xl font-black text-foreground">Study Progress</h3>
              <div className="space-y-6">
                <ProgressCard
                  label="Daily Goal"
                  current={completedCount}
                  total={totalCards}
                  color="purple"
                />

                <div className="grid gap-4">
                  <StudyStatsCard
                    label="Current Streak"
                    value="14 Days"
                    icon={Flame}
                    color="teal"
                    trend="+2 today"
                  />
                  <StudyStatsCard
                    label="Mastery Score"
                    value={`${masteryScore}%`}
                    icon={Trophy}
                    color="purple"
                  />
                </div>
              </div>

              <div className="mt-10 space-y-4">
                <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-purple py-4 text-lg font-black text-white shadow-xl shadow-purple/20 transition-all hover:brightness-110">
                  <Play size={20} fill="currentColor" />
                  Start Session
                </button>
                <button className="flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-background py-4 text-lg font-black text-foreground transition-all hover:border-purple/30">
                  <RotateCcw size={20} />
                  Review Weak Topics
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-teal/20 bg-teal/5 p-8">
              <div className="mb-4 grid size-12 place-items-center rounded-xl bg-teal/10 text-teal">
                <Zap size={24} fill="currentColor" />
              </div>
              <h4 className="text-xl font-black text-foreground">Pro Tip</h4>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Studying in short, 15-minute bursts twice a day is more effective than one long marathon session. Consistency is the key to active recall.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
