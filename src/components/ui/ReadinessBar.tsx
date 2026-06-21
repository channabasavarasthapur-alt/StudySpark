// src/components/ui/ReadinessBar.tsx
import { Info } from 'lucide-react';

type ReadinessBarProps = {
  percentage: number;
  label?: string;
  showTooltip?: boolean;
};

export function ReadinessBar({ percentage, label = 'Readiness', showTooltip = true }: ReadinessBarProps) {
  // Clamp the percentage to a safe range 0‑100
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const ariaLabel = `${label}: ${safePercentage}%`;
  return (
    <div className="relative" role="progressbar" aria-valuenow={safePercentage} aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
      <div className="h-2 w-full rounded-full bg-muted/10 border border-purple/15 shadow-inner pointer-events-none" />
      <div
        className="h-2 rounded-full bg-purple absolute top-0 left-0 transition-[width] duration-700 ease-out"
        style={{ width: `${safePercentage}%` }}
      />
      {showTooltip && (
        <button
          type="button"
          className="absolute -right-6 top-0 flex items-center rounded-sm text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Readiness calculation info"
          title="Readiness = completed study minutes ÷ planned study minutes."
        >
          <Info size={16} />
        </button>
      )}
    </div>
  );
}
