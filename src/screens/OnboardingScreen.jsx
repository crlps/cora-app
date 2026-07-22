import { useState, useRef, useEffect } from 'react'
import { INTEREST_META } from '../data/events'
import '../App.css'

const INTERESTS = Object.entries(INTEREST_META).map(([id, meta]) => ({ id, ...meta }))

const MAX = 3

export default function OnboardingScreen({ onNext }) {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState([])
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (step === 1) inputRef.current?.focus()
  }, [step])

  function toggle(id) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : prev.length < MAX ? [...prev, id] : prev
    )
  }

  const isFull = selected.length === MAX

  const hint =
    selected.length === 0 ? ' ' :
    selected.length === 1 ? '1 escolhida — escolha até mais 2' :
    selected.length === 2 ? '2 escolhidas — escolha até mais 1' :
    'Ótimo! Você escolheu 3 interesses'

  return (
    <div className="onboarding">

      <header className="onboarding-header">
        <img src="/assets/logo-cora.png" alt="Cora" className="logo-img" />
      </header>

      {/* 2 etapas */}
      <div className="step-indicator" role="progressbar" aria-valuenow={step + 1} aria-valuemax={2}>
        <div className={`step-dot${step === 0 ? ' active' : ''}`} />
        <div className={`step-dot${step === 1 ? ' active' : ''}`} />
      </div>

      {step === 0 && (
        <>
          <h1 className="onboarding-headline">O que você gosta de fazer?</h1>
          <p className="onboarding-subtext">
            Escolha até 3 interesses para encontrar pessoas com afinidades parecidas com as suas.
          </p>

          <div className="chips-grid" role="group" aria-label="Interesses">
            {INTERESTS.map(({ id, label, icon }) => {
              const isSelected = selected.includes(id)
              return (
                <button
                  key={id}
                  className={`chip${isSelected ? ' selected' : ''}`}
                  onClick={() => toggle(id)}
                  disabled={isFull && !isSelected}
                  aria-pressed={isSelected}
                >
                  <span className="chip-icon" aria-hidden="true">{icon}</span>
                  {label}
                </button>
              )
            })}
          </div>

          <p className={`selection-hint${isFull ? ' full' : ''}`} aria-live="polite">
            {hint}
          </p>

          <div className="spacer" />

          <button
            className="btn-proximo"
            disabled={selected.length === 0}
            onClick={() => setStep(1)}
          >
            Próximo
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="onboarding-headline">Qual nome você usa no dia a dia?</h1>
          <p className="onboarding-subtext">
            Pode ser seu nome, apelido — do jeito que preferir.
          </p>

          <div className="name-input-wrap">
            <input
              ref={inputRef}
              className="name-input"
              type="text"
              placeholder="Ex: Maria, Lúcia, Bete..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={32}
              autoComplete="given-name"
              aria-label="Seu nome ou apelido"
            />
          </div>

          <div className="spacer" />

          <button
            className="btn-proximo"
            disabled={name.trim().length === 0}
            onClick={() => onNext({ interests: selected, name: name.trim() })}
          >
            Começar
          </button>
        </>
      )}

    </div>
  )
}
