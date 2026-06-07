import { RotateCw } from 'lucide-react'

interface FlashcardProps {
  question: string
  answer: string
  isFlipped: boolean
  onFlip: () => void
}

export function Flashcard({ question, answer, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="group relative h-[400px] w-full max-w-2xl cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div className={`relative h-full w-full transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[2.5rem] border-2 border-border bg-card p-10 text-center shadow-xl transition-all group-hover:border-purple/30 group-hover:shadow-2xl group-hover:shadow-purple/5">
            <span className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-purple">Question</span>
            <h3 className="text-2xl font-black text-foreground sm:text-3xl lg:text-4xl leading-tight">
              {question}
            </h3>
            <div className="mt-12 flex items-center gap-2 text-muted font-medium">
              <RotateCw size={18} className="animate-spin-slow" />
              <span>Click to flip</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden">
          <div className="flex h-full w-full flex-col items-center justify-center rounded-[2.5rem] border-2 border-teal/20 bg-teal/5 p-10 text-center shadow-xl backdrop-blur-sm">
            <span className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-teal">Answer</span>
            <div className="text-xl font-bold text-foreground sm:text-2xl lg:text-3xl leading-relaxed">
              {answer}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      `}} />
    </div>
  )
}
