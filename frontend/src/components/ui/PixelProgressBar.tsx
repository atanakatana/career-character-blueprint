import { cn } from '@/lib/utils'

interface PixelProgressBarProps {
  currentStep: number
  totalSteps:  number
  labels?:     string[]
  className?:  string
}

export function PixelProgressBar({
  currentStep,
  totalSteps,
  labels,
  className,
}: PixelProgressBarProps) {
  return (
    <div className={cn('w-full', className)} role="progressbar" aria-valuenow={currentStep} aria-valuemax={totalSteps}>
      <div className="flex items-start">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum   = index + 1
          const completed = stepNum < currentStep
          const current   = stepNum === currentStep
          const upcoming  = stepNum > currentStep

          return (
            <div key={index} className="flex items-center flex-1">

              {/* Step node + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-7 h-7 flex items-center justify-center font-press text-[0.5rem] border-2 transition-colors duration-150',
                    completed && 'bg-pixel-green border-pixel-green text-pixel-bg',
                    current   && 'bg-pixel-gold  border-pixel-gold  text-pixel-bg',
                    upcoming  && 'bg-pixel-panel border-pixel-border text-pixel-muted',
                  )}
                >
                  {completed ? '✓' : stepNum}
                </div>

                {labels?.[index] && (
                  <span
                    className={cn(
                      'font-press text-[0.42rem] text-center whitespace-nowrap leading-tight',
                      current   ? 'text-pixel-gold'  : 'text-pixel-muted',
                      completed ? 'text-pixel-green' : '',
                    )}
                  >
                    {labels[index]}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 mb-4 transition-colors duration-150',
                    stepNum < currentStep ? 'bg-pixel-green' : 'bg-pixel-border',
                  )}
                />
              )}

            </div>
          )
        })}
      </div>
    </div>
  )
}
