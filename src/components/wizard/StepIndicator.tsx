interface Props {
  currentStep: number
  totalSteps: number
}

const STEP_LABELS = [
  '職業與等級',
  '種族',
  '背景',
  '能力值',
  '職業細節',
  '法術',
  '命名',
]

export default function StepIndicator({ currentStep, totalSteps }: Props) {
  return (
    <div className="w-full">
      {/* 進度條 */}
      <div className="w-full bg-dnd-border rounded-full h-1.5 mb-4">
        <div
          className="bg-dnd-gold h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>

      {/* 步驟標籤（桌面版） */}
      <div className="hidden sm:flex justify-between">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1
          const isDone = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div
              key={step}
              className="flex flex-col items-center gap-1"
              style={{ width: `${100 / totalSteps}%` }}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                  transition-all duration-300
                  ${isDone ? 'bg-dnd-gold text-dnd-darker' : ''}
                  ${isCurrent ? 'bg-dnd-red text-white ring-2 ring-dnd-red ring-offset-2 ring-offset-dnd-darker' : ''}
                  ${!isDone && !isCurrent ? 'bg-dnd-border text-gray-400' : ''}
                `}
              >
                {isDone ? '✓' : step}
              </div>
              <span
                className={`text-xs text-center leading-tight
                  ${isCurrent ? 'text-dnd-gold font-semibold' : 'text-gray-500'}
                  ${isDone ? 'text-gray-400' : ''}
                `}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* 手機版：只顯示當前步驟 */}
      <div className="sm:hidden flex items-center justify-between text-sm">
        <span className="text-gray-400">步驟 {currentStep} / {totalSteps}</span>
        <span className="text-dnd-gold font-semibold">{STEP_LABELS[currentStep - 1]}</span>
      </div>
    </div>
  )
}
