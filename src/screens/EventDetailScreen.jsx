import { useState, useEffect } from 'react'
import { getEventById, INTEREST_META } from '../data/events'
import { fetchEventParticipants, getOrCreateUserId } from '../lib/participation'
import './EventDetailScreen.css'

const AVATAR_COLORS = ['#E97B73', '#7DB89B', '#D4956A', '#A07DB8', '#4A6FA5', '#A8458A']

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

// "também gosta de caminhada e artes" — interesses em comum com o usuário
function commonInterestsLabel(participantInterests, userInterests) {
  const common = participantInterests.filter(i => userInterests.includes(i))
  const labels = common.map(i => INTEREST_META[i]?.label.toLowerCase()).filter(Boolean)
  if (labels.length === 0) return 'novo por aqui'
  if (labels.length === 1) return `também gosta de ${labels[0]}`
  return `também gosta de ${labels.slice(0, -1).join(', ')} e ${labels.at(-1)}`
}

function IconBack() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
function IconCalendar() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 2v4M16 2v4M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function IconPin() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}
function IconPeople() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 3.13a4 4 0 010 7.75M21 20c0-3-1.8-5.5-4.5-6.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function IconWhatsApp() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.544 5.874L.057 23.428a.5.5 0 00.609.61l5.657-1.473A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.68-.51-5.21-1.395l-.374-.216-3.872 1.008 1.036-3.764-.234-.386A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

/* Capa ilustrada (placeholder até termos fotos reais dos eventos) */
function CoverIllustration() {
  return (
    <svg width="100%" height="220" viewBox="0 0 480 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A9E84"/>
          <stop offset="100%" stopColor="#7DB89B"/>
        </linearGradient>
      </defs>
      <rect width="480" height="220" fill="url(#sky)"/>
      <circle cx="380" cy="55" r="32" fill="#F5C97A" opacity="0.55"/>
      <ellipse cx="240" cy="230" rx="280" ry="60" fill="#5A9E87"/>
      <path d="M200 220 Q240 180 280 220" fill="none" stroke="#FAF2E8" strokeWidth="8" opacity="0.4" strokeLinecap="round"/>
      <ellipse cx="60" cy="148" rx="38" ry="50" fill="#3D7A66"/>
      <ellipse cx="60" cy="142" rx="30" ry="42" fill="#4A9E84"/>
      <rect x="56" y="185" width="8" height="22" fill="#2D5A48"/>
      <ellipse cx="110" cy="158" rx="28" ry="38" fill="#3D7A66"/>
      <ellipse cx="110" cy="153" rx="22" ry="32" fill="#5AB89B"/>
      <rect x="107" y="188" width="7" height="18" fill="#2D5A48"/>
      <ellipse cx="420" cy="145" rx="40" ry="52" fill="#3D7A66"/>
      <ellipse cx="420" cy="138" rx="32" ry="44" fill="#4A9E84"/>
      <rect x="416" y="185" width="8" height="22" fill="#2D5A48"/>
      <ellipse cx="370" cy="160" rx="26" ry="36" fill="#3D7A66"/>
      <ellipse cx="370" cy="155" rx="20" ry="30" fill="#5AB89B"/>
      <rect x="367" y="188" width="7" height="18" fill="#2D5A48"/>
      <ellipse cx="240" cy="140" rx="32" ry="44" fill="#3D7A66"/>
      <ellipse cx="240" cy="133" rx="26" ry="37" fill="#4FAF8C"/>
      <rect x="236" y="180" width="8" height="26" fill="#2D5A48"/>
      <path d="M150 70 Q155 65 160 70" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round"/>
      <path d="M165 60 Q171 54 177 60" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function EventDetailScreen({
  eventId,
  userInterests = [],
  isConfirmed = false,
  onConfirm,
  onBack,
}) {
  const event = getEventById(eventId)
  const [showModal, setShowModal] = useState(false)
  const [showFullNotice, setShowFullNotice] = useState(false)
  const [realParticipants, setRealParticipants] = useState([])
  const [loadingParticipants, setLoadingParticipants] = useState(true)

  const myId = getOrCreateUserId()

  useEffect(() => {
    if (!eventId) return
    setLoadingParticipants(true)
    fetchEventParticipants(eventId).then(list => {
      setRealParticipants(list)
      setLoadingParticipants(false)
    })
  }, [eventId]) // carrega ao abrir o evento

  if (!event) {
    return (
      <div className="event-detail">
        <div className="event-content" style={{ paddingTop: 80 }}>
          <h1 className="event-title">Evento não encontrado</h1>
          <button className="btn-confirm" onClick={onBack}>Voltar</button>
        </div>
      </div>
    )
  }

  // "Quem vai" combina participantes fictícios (base do evento) com
  // pessoas reais que confirmaram presença pelo app.
  const participants = [...event.mockParticipants, ...realParticipants]
  const totalConfirmed = participants.length
  const isFull = event.capacity != null && totalConfirmed >= event.capacity && !isConfirmed
  const vagasRestantes = event.capacity != null ? Math.max(0, event.capacity - totalConfirmed) : null

  async function handleConfirm() {
    if (isFull) return // botão já deveria estar desabilitado

    // Eventos sem limite: feedback imediato, não depende do Supabase.
    // Eventos com capacidade: espera confirmar de verdade antes de comemorar,
    // já que a vaga pode ter lotado entre o clique e a resposta do banco.
    if (event.capacity == null) setShowModal(true)

    const result = await onConfirm?.()
    const freshList = await fetchEventParticipants(eventId)
    setRealParticipants(freshList)

    if (result?.full) setShowFullNotice(true)
    else if (event.capacity != null) setShowModal(true)
  }

  return (
    <div className="event-detail">

      {/* Cover — foto real do evento quando houver, ilustração como fallback */}
      <div className="event-cover">
        {event.coverImage
          ? <img src={event.coverImage} alt={event.title} className="cover-photo" />
          : <CoverIllustration />}
        <button className="cover-back" onClick={onBack} aria-label="Voltar">
          <IconBack />
        </button>
        <div className="cover-badge">
          <span>{event.icon}</span>
          {event.capacity != null
            ? (isFull ? 'Turma lotada' : `${vagasRestantes} vagas restantes`)
            : (totalConfirmed > 0 ? `${totalConfirmed} confirmados` : 'Vagas abertas')}
        </div>
      </div>

      {/* Body */}
      <div className="event-content">

        <div className="event-category" style={{ background: event.categoryBg, color: event.categoryColor }}>
          <span aria-hidden="true">{event.icon}</span>
          {event.category}
        </div>

        <h1 className="event-title">{event.title}</h1>

        <div className="event-meta">
          <div className="event-meta-row">
            <div className="meta-icon"><IconCalendar /></div>
            {event.date} · {event.time}
          </div>
          <div className="event-meta-row">
            <div className="meta-icon"><IconPin /></div>
            {event.location}
          </div>
          <div className="event-meta-row">
            <div className="meta-icon"><IconPeople /></div>
            {event.capacity != null
              ? (isFull
                  ? '🚫 Turma lotada'
                  : `${vagasRestantes} de ${event.capacity} vagas disponíveis`)
              : totalConfirmed > 0
                ? `${totalConfirmed} ${totalConfirmed === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}`
                : 'Vagas abertas — turma exclusiva Cora'}
          </div>
        </div>

        <div className="divider" />

        <p className="event-description">{event.description}</p>

        <div className="divider" />

        {/* Quem vai — participantes reais do Supabase */}
        <p className="section-title">Quem vai</p>

        {participants.length === 0 ? (
          <p className="participants-empty">
            {loadingParticipants
              ? 'Carregando participantes…'
              : 'Seja a primeira pessoa a confirmar presença! 💚'}
          </p>
        ) : (
          <div className="participant-list">
            {participants.map((p, i) => (
              <div key={p.id} className="participant-row">
                <div
                  className="participant-avatar"
                  style={{ background: p.bg ?? AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {initials(p.name)}
                </div>
                <div className="participant-info">
                  <span className="participant-name">
                    {p.name}{p.id === myId ? ' (você)' : ''}
                  </span>
                  <span className="participant-common">
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="currentColor" opacity="0.7"/>
                    </svg>
                    {p.id === myId
                      ? 'presença confirmada'
                      : commonInterestsLabel(p.interests, userInterests)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* CTA fixo */}
      <div className="event-cta">
        <button
          className={`btn-confirm${isConfirmed ? ' confirmed' : ''}`}
          onClick={handleConfirm}
          disabled={isConfirmed || isFull}
        >
          {isConfirmed ? 'Presença confirmada ✓' : isFull ? 'Turma lotada' : 'Confirmar presença'}
        </button>
      </div>

      {/* Modal de sucesso */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <p className="modal-title">Você está dentro!</p>
            <p className="modal-text">
              Sua presença foi confirmada na {event.title}.{'\n'}
              O grupo já está te esperando no WhatsApp — entre para combinar os detalhes.
            </p>
            <button
              className="btn-whatsapp"
              onClick={() => window.open(event.whatsappLink, '_blank', 'noopener')}
            >
              <IconWhatsApp />
              Entrar no grupo
            </button>
            <button className="btn-modal-close" onClick={() => setShowModal(false)}>
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* Aviso: a turma lotou entre o clique e a confirmação no banco */}
      {showFullNotice && (
        <div className="modal-overlay" onClick={() => setShowFullNotice(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">💛</div>
            <p className="modal-title">Ih, acabaram as vagas!</p>
            <p className="modal-text">
              Que pena — a turma da {event.title} lotou bem na hora em que você
              confirmou. Fique de olho nas próximas turmas!
            </p>
            <button className="btn-modal-close" onClick={() => setShowFullNotice(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
