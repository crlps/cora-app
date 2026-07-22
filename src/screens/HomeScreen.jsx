import { useState, useEffect } from 'react'
import { EVENTS, FEATURED_EVENTS, EXPLORE_FILTERS, INTEREST_META } from '../data/events'
import { fetchParticipantCount } from '../lib/participation'
import './HomeScreen.css'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// Avatares ilustrativos por evento (mock enquanto a base de usuários cresce)
const MOCK_AVATARS = [
  { initials: 'LM', bg: '#E97B73' },
  { initials: 'RS', bg: '#7DB89B' },
  { initials: 'AP', bg: '#D4956A' },
  { initials: 'CM', bg: '#A07DB8' },
]

function initials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDays = new Date(year, month, 0).getDate()
  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, current: false })
  for (let d = 1; d <= daysInMonth; d++)  cells.push({ day: d, current: true })
  while (cells.length % 7 !== 0)          cells.push({ day: cells.length - daysInMonth - firstDay + 1, current: false })
  return cells
}

/* ── Ícones ── */
const IconPin = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2"/>
  </svg>
)
const IconCal = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 2v4M16 2v4M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const NAV_ITEMS = [
  {
    id: 'home', label: 'Início',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path d="M3 12L12 4l9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'explore', label: 'Explorar',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
        <path d="M21 21l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'agenda', label: 'Agenda',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 2v4M16 2v4M3 9h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'profile', label: 'Perfil',
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const WA_ICON_PATHS = (
  <>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.544 5.874L.057 23.428a.5.5 0 00.609.61l5.657-1.473A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.898 0-3.68-.51-5.21-1.395l-.374-.216-3.872 1.008 1.036-3.764-.234-.386A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
  </>
)

export default function HomeScreen({
  userName = '',
  interests = [],
  confirmedEvents = {},
  onToggleConfirm,
  onSelectEvent,
}) {
  const today = new Date()
  const [activeNav, setActiveNav] = useState('home')
  const [whatsappModal, setWhatsappModal] = useState(null)
  const [exploreFilter, setExploreFilter] = useState('todos')
  const [calendarDate, setCalendarDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(today.getDate())
  const [showNotifications, setShowNotifications] = useState(false)
  const [realCounts, setRealCounts] = useState({}) // eventId -> total real de confirmados
  const [fullNotice, setFullNotice] = useState(null) // evento que acabou de lotar

  const isConfirmed = (id) => !!confirmedEvents[id]

  // Eventos com limite de vagas precisam da contagem REAL do banco (não só
  // do estado local), já que a lotação depende de todas as pessoas, não só de mim.
  const capacityEvents = EVENTS.filter(e => e.capacity != null)

  async function refreshCount(eventId) {
    const n = await fetchParticipantCount(eventId)
    setRealCounts(prev => ({ ...prev, [eventId]: n }))
  }

  useEffect(() => {
    capacityEvents.forEach(e => refreshCount(e.id))
  }, [])

  // Notificações: uma por evento confirmado, lembrando data/local do encontro
  const notifications = EVENTS
    .filter(e => isConfirmed(e.id))
    .map(e => ({
      id: e.id,
      icon: e.icon,
      iconBg: e.categoryBg,
      title: e.title,
      text: `Sua presença está confirmada — ${e.dateShort} às ${e.time}, em ${e.location}.`,
    }))

  // Total exibido = base do evento + o próprio usuário, se confirmado
  const displayCount = (event) => event.baseConfirmed + (isConfirmed(event.id) ? 1 : 0)

  // Total de confirmados considerando participantes fictícios (mock) do evento
  function attendeeCount(event) {
    if (event.capacity != null) {
      const real = realCounts[event.id] ?? 0
      return (event.mockParticipants?.length ?? 0) + real
    }
    return displayCount(event)
  }

  function isFull(event) {
    return event.capacity != null
      && attendeeCount(event) >= event.capacity
      && !isConfirmed(event.id)
  }

  async function toggleConfirm(e, event) {
    e.stopPropagation()
    if (isFull(event)) return // turma lotada, botão já deveria estar desabilitado

    const wasConfirmed = isConfirmed(event.id)
    const result = await onToggleConfirm?.(event.id)

    if (event.capacity != null) refreshCount(event.id) // reflete vaga ocupada/liberada

    if (!wasConfirmed) {
      if (result?.full) {
        setFullNotice(event.id)
        setTimeout(() => setFullNotice(null), 4000)
      } else if (result?.ok !== false) {
        setWhatsappModal(event)
      }
    }
  }

  /* ── Feed (Início) ── */
  // Ordem: eventos oficiais Cora (pinned) primeiro, depois os que batem
  // com os interesses da pessoa, depois os demais.
  const rank = (e) => e.pinned ? 0 : interests.includes(e.interestId) ? 1 : 2
  const sortedFeatured = [...FEATURED_EVENTS].sort((a, b) => rank(a) - rank(b))

  /* ── Agenda ── */
  const calYear  = calendarDate.getFullYear()
  const calMonth = calendarDate.getMonth()
  const eventsInMonth = EVENTS.filter(e => e.year === calYear && e.month === calMonth)
  const confirmedDaysSet = new Set(eventsInMonth.filter(e => isConfirmed(e.id)).map(e => e.day))
  const activityDaysSet  = new Set(eventsInMonth.map(e => e.day))
  const eventsOnDay = eventsInMonth.filter(e => e.day === selectedDay)
  const confirmedList = EVENTS.filter(e => isConfirmed(e.id))
  const cells = buildCalendar(calYear, calMonth)

  function prevMonth() { setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); setSelectedDay(null) }
  function nextMonth() { setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); setSelectedDay(null) }

  /* ── Explorar ── */
  const exploreList = exploreFilter === 'todos'
    ? EVENTS
    : EVENTS.filter(e => e.interestId === exploreFilter)

  const agendaCard = (event, meta) => (
    <div key={event.id} className={`agenda-card${isConfirmed(event.id) ? ' is-confirmed' : ''}`}>
      <div className="agenda-card-icon" style={{ background: event.categoryBg }}>{event.icon}</div>
      <div className="agenda-card-info">
        <p className="agenda-card-title">{event.title}</p>
        <p className="agenda-card-meta">{meta}</p>
      </div>
      {isConfirmed(event.id) && <span className="agenda-card-badge">Confirmado ✓</span>}
    </div>
  )

  return (
    <div className="home">

      {/* Header */}
      <header className="home-header">
        <img src="/assets/logo-cora.png" alt="Cora" className="home-logo" />
        <button
          className="home-bell"
          aria-label="Notificações"
          onClick={() => setShowNotifications(v => !v)}
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {notifications.length > 0 && <span className="home-bell-dot" />}
        </button>
      </header>

      {/* Painel de notificações */}
      {showNotifications && (
        <div className="notif-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notif-panel" onClick={e => e.stopPropagation()}>
            <p className="notif-panel-header">Notificações</p>
            {notifications.length > 0 ? (
              <div className="notif-list">
                {notifications.map(n => (
                  <div key={n.id} className="notif-item">
                    <div className="notif-item-icon" style={{ background: n.iconBg }}>{n.icon}</div>
                    <p className="notif-item-text">
                      <strong>{n.title}</strong><br />
                      {n.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="notif-empty">
                Nenhuma notificação ainda. Confirme uma atividade para acompanhar por aqui.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Início ── */}
      {activeNav === 'home' && (
        <>
          <div className="home-greeting">
            <p className="home-greeting-name">{greeting()}{userName ? `, ${userName}` : ''}! 👋</p>
            <p className="home-greeting-sub">O que fazemos juntos esta semana?</p>
          </div>

          <p className="home-section-title">
            {interests.length > 0 ? 'Escolhido para você' : 'Perto de você'}
          </p>

          <div className="home-cards">
            {sortedFeatured.map(event => {
              const match = interests.includes(event.interestId)
              const count = attendeeCount(event)
              const extra = Math.max(0, count - MOCK_AVATARS.length)
              const full = isFull(event)
              const vagasRestantes = event.capacity != null ? Math.max(0, event.capacity - count) : null
              return (
                <article
                  key={event.id}
                  className={`activity-card${match ? ' card-match' : ''}`}
                  onClick={() => onSelectEvent?.(event.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="card-top-row">
                    <div className="card-category" style={{ background: event.categoryBg, color: event.categoryColor }}>
                      <span aria-hidden="true">{event.icon}</span>
                      {event.category}
                    </div>
                    {event.pinned
                      ? <div className="card-pinned-badge">⭐ Evento Cora</div>
                      : match && <div className="card-match-badge">✨ Para você</div>}
                  </div>

                  <h2 className="card-title">{event.title}</h2>

                  <div className="card-info">
                    <div className="card-info-row"><IconPin />{event.location}</div>
                    <div className="card-info-row"><IconCal />{event.date} · {event.time}</div>
                  </div>

                  <div className="card-footer">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {event.capacity != null ? (
                        <span className="card-confirmed" style={{ marginLeft: 0 }}>
                          {full
                            ? '🚫 Turma lotada'
                            : `${vagasRestantes} de ${event.capacity} vagas disponíveis`}
                        </span>
                      ) : event.baseConfirmed > 0 ? (
                        <>
                          <div className="card-avatars">
                            {MOCK_AVATARS.map((av, i) => (
                              <div key={i} className="avatar" style={{ background: av.bg, zIndex: MOCK_AVATARS.length - i }}>
                                {av.initials}
                              </div>
                            ))}
                            {extra > 0 && <div className="avatar avatar-overflow" style={{ zIndex: 0 }}>+{extra}</div>}
                          </div>
                          <span className="card-confirmed">{count} confirmados</span>
                        </>
                      ) : (
                        <span className="card-confirmed" style={{ marginLeft: 0 }}>
                          {count > 0 ? `${count} confirmado${count > 1 ? 's' : ''}` : '✨ Vagas abertas'}
                        </span>
                      )}
                    </div>

                    <button
                      className={`btn-quero-ir${isConfirmed(event.id) ? ' confirmed' : ''}`}
                      onClick={(e) => toggleConfirm(e, event)}
                      disabled={full}
                      aria-pressed={isConfirmed(event.id)}
                    >
                      {isConfirmed(event.id) ? 'Confirmado ✓' : full ? 'Turma lotada' : 'Quero ir'}
                    </button>
                  </div>

                  {event.id === fullNotice && (
                    <p className="card-full-notice">
                      Que pena! A turma lotou antes de confirmarmos sua vaga. 💛
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </>
      )}

      {/* ── Explorar ── */}
      {activeNav === 'explore' && (
        <div className="explore-view">
          <div className="explore-search">
            <svg className="explore-search-icon" width="20" height="20" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="explore-search-placeholder">Buscar atividades em Recife…</span>
          </div>

          <div className="explore-filters">
            {EXPLORE_FILTERS.map(f => (
              <button
                key={f.id}
                className={`explore-filter-chip${exploreFilter === f.id ? ' active' : ''}`}
                onClick={() => setExploreFilter(f.id)}
              >
                <span aria-hidden="true">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          <p className="explore-section-label">
            {exploreList.length} {exploreList.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}
          </p>

          <div className="explore-cards">
            {exploreList.map(event => (
              <div key={event.id} className="explore-card" onClick={() => onSelectEvent?.(event.id)}>
                <div className="explore-card-top">
                  <div className="card-category" style={{ background: event.categoryBg, color: event.categoryColor }}>
                    <span aria-hidden="true">{event.icon}</span>
                    {event.category}
                  </div>
                  <span className="explore-confirmed-count">
                    {displayCount(event) > 0 ? `👥 ${displayCount(event)}` : '✨ Novo'}
                  </span>
                </div>

                <h2 className="explore-card-title">{event.title}</h2>

                <div className="explore-card-row"><IconPin />{event.location}</div>
                <div className="explore-card-row"><IconCal />{event.dateShort} · {event.time}</div>

                <div className="explore-card-bottom">
                  <span style={{ fontSize: 14, color: '#9C7A65', fontWeight: 600 }}>
                    {displayCount(event) > 0 ? `${displayCount(event)} confirmados` : 'Vagas abertas'}
                  </span>
                  <button
                    className={`btn-explore-ir${isConfirmed(event.id) ? ' confirmed' : ''}`}
                    onClick={(e) => toggleConfirm(e, event)}
                  >
                    {isConfirmed(event.id) ? 'Confirmado ✓' : 'Quero ir'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Agenda ── */}
      {activeNav === 'agenda' && (
        <div className="agenda-view">
          <div className="agenda-month-header">
            <button className="agenda-nav-btn" onClick={prevMonth} aria-label="Mês anterior">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="agenda-month-label">{MONTHS_PT[calMonth]} {calYear}</span>
            <button className="agenda-nav-btn" onClick={nextMonth} aria-label="Próximo mês">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {WEEKDAYS.map(d => <div key={d} className="calendar-weekday">{d}</div>)}
            </div>
            <div className="calendar-days">
              {cells.map((cell, i) => {
                const todayCell = cell.current &&
                  cell.day === today.getDate() &&
                  calYear === today.getFullYear() &&
                  calMonth === today.getMonth()
                const selected = cell.current && cell.day === selectedDay && !todayCell
                return (
                  <button
                    key={i}
                    className={[
                      'calendar-day',
                      !cell.current ? 'calendar-day-empty is-other-month' : '',
                      todayCell ? 'is-today' : '',
                      selected ? 'is-selected' : '',
                    ].join(' ')}
                    onClick={() => cell.current && setSelectedDay(cell.day)}
                    disabled={!cell.current}
                  >
                    <span className="calendar-day-num">{cell.day}</span>
                    {cell.current && activityDaysSet.has(cell.day) && (
                      <span className={`calendar-dot${confirmedDaysSet.has(cell.day) ? ' confirmed' : ''}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="agenda-section-title">
              {selectedDay ? `${selectedDay} de ${MONTHS_PT[calMonth]}` : 'Suas atividades confirmadas'}
            </p>
            {selectedDay
              ? (eventsOnDay.length > 0
                  ? eventsOnDay.map(e => agendaCard(e, `${e.location} · ${e.time}`))
                  : <p className="agenda-empty">Nenhuma atividade neste dia.</p>)
              : (confirmedList.length > 0
                  ? confirmedList.map(e => agendaCard(e, `${e.dateShort} · ${e.time}`))
                  : <p className="agenda-empty">Confirme uma atividade no feed para ver aqui.</p>)}
          </div>
        </div>
      )}

      {/* ── Perfil ── */}
      {activeNav === 'profile' && (
        <div className="profile-view">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">{initials(userName)}</div>
            <div className="profile-avatar-ring" />
          </div>
          <p className="profile-name">{userName || 'Meu perfil'}</p>
          <p className="profile-subtitle">Membro Cora</p>
          <div className="profile-divider" />
          <div className="profile-section">
            <p className="profile-section-title">Meus interesses</p>
            {interests.length > 0 ? (
              <div className="profile-chips">
                {interests.map(id => {
                  const meta = INTEREST_META[id]
                  return meta && (
                    <div key={id} className="profile-chip">
                      <span className="profile-chip-icon" aria-hidden="true">{meta.icon}</span>
                      {meta.label}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="profile-empty">Nenhum interesse selecionado ainda.</p>
            )}
          </div>
        </div>
      )}

      {/* Modal WhatsApp */}
      {whatsappModal && (
        <div className="wa-overlay" onClick={() => setWhatsappModal(null)}>
          <div className="wa-card" onClick={e => e.stopPropagation()}>
            <div className="wa-icon">{whatsappModal.icon}</div>
            <p className="wa-title">Você está confirmado! 🎉</p>
            <p className="wa-subtitle">
              Que ótimo! Entre no grupo do WhatsApp da{' '}
              <strong>{whatsappModal.title}</strong> para combinar os detalhes com o grupo.
            </p>
            <button
              className="btn-wa-join"
              onClick={() => {
                window.open(whatsappModal.whatsappLink, '_blank', 'noopener')
                setWhatsappModal(null)
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">{WA_ICON_PATHS}</svg>
              Entrar no grupo
            </button>
            <button className="btn-wa-skip" onClick={() => setWhatsappModal(null)}>
              Entrar depois
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav" aria-label="Navegação principal">
        {NAV_ITEMS.map(({ id, label, icon }) => (
          <button
            key={id}
            className={`nav-item${activeNav === id ? ' active' : ''}`}
            onClick={() => setActiveNav(id)}
            aria-current={activeNav === id ? 'page' : undefined}
          >
            {icon}
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

    </div>
  )
}
