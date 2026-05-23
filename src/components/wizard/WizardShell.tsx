import { useCharacterStore } from '../../store/characterStore'
import StepIndicator from './StepIndicator'
import Step1ClassLevel from '../steps/Step1ClassLevel'
import Step2Race from '../steps/Step2Race'
import Step3Background from '../steps/Step3Background'
import Step4AbilityScores from '../steps/Step4AbilityScores'
import Step5ClassDetails from '../steps/Step5ClassDetails'
import Step6Spells from '../steps/Step6Spells'
import Step7Naming from '../steps/Step7Naming'

const STEPS = [
  Step1ClassLevel,
  Step2Race,
  Step3Background,
  Step4AbilityScores,
  Step5ClassDetails,
  Step6Spells,
  Step7Naming,
]

export default function WizardShell() {
  const { currentStep, nextStep, prevStep, classes, reset } = useCharacterStore()

  const StepComponent = STEPS[currentStep - 1]
  const canGoNext = currentStep < 7

  return (
    <div className="min-h-screen flex flex-col">
      {/* 頁首 */}
      <header className="bg-dnd-dark border-b border-dnd-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚔</span>
          <div>
            <h1 className="text-dnd-gold font-bold text-lg leading-tight font-serif">
              D&D 5R 角色創建器
            </h1>
            <p className="text-gray-500 text-xs">XPHB 2024 修訂版</p>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('確定要重置所有選擇嗎？')) reset()
          }}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded border border-dnd-border hover:border-gray-500"
        >
          重置
        </button>
      </header>

      {/* 主體 */}
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6">
        {/* 步驟指示器 */}
        <div className="mb-8">
          <StepIndicator currentStep={currentStep} totalSteps={7} />
        </div>

        {/* 當前步驟內容 */}
        <div className="animate-fadeIn">
          <StepComponent />
        </div>

        {/* 底部導覽 */}
        <div className="mt-8 flex items-center justify-between border-t border-dnd-border pt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary"
          >
            ← 上一步
          </button>

          <div className="flex items-center gap-3">
            {classes.length > 0 && (
              <span className="text-xs text-gray-500">
                {classes.map(c => `${c.className} Lv${c.level}`).join(' + ')}
              </span>
            )}
          </div>

          {currentStep < 7 ? (
            <button
              onClick={nextStep}
              disabled={!canGoNext}
              className="btn-primary"
            >
              下一步 →
            </button>
          ) : (
            <div className="w-28" />
          )}
        </div>
      </main>
    </div>
  )
}
