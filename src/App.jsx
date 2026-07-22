import { useState, useEffect } from 'react'
import OnboardingScreen from './screens/OnboardingScreen'
import HomeScreen from './screens/HomeScreen'
import EventDetailScreen from './screens/EventDetailScreen'
import { supabase } from './lib/supabase'
import {
  getOrCreateUserId,
  joinEvent,
  leaveEvent,
  fetchMyParticipations,
} from './lib/participation'

const STORAGE_KEY = 'cora_user'

function loadUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch { return null }
}

function saveUser(user) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(user)) } catch {}
}

async function saveProfileToSupabase({ name, interests }) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: getOrCreateUserId(), name, interests, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
  if (error) console.error('[Supabase] Erro ao salvar perfil:', error.message)
}

export default function App() {
  const isReset = new URLSearchParams(window.location.search).has('reset')
  if (isReset) {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('cora_uid')
    window.history.replaceState({}, '', window.location.pathname)
  }

  const saved = isReset ? null : loadUser()

  const [screen, setScreen] = useState(saved ? 'home' : 'onboarding')
  const [user, setUser] = useState(saved ?? { name: '', interests: [] })
  const [selectedEventId, setSelectedEventId] = useState(null)

  // Confirmações do usuário — sincronizadas com event_participants no Supabase
  const [confirmedEvents, setConfirmedEvents] = useState({})

  useEffect(() => {
    fetchMyParticipations().then(ids => {
      setConfirmedEvents(Object.fromEntries(ids.map(id => [id, true])))
    })
  }, [])

  // Retorna { ok, full } para quem precisa saber o resultado real do insert
  // (ex: EventDetailScreen só recarrega "Quem vai" depois disso, e reverte
  // o estado local se a turma lotou entre o clique e a confirmação no banco).
  async function handleConfirm(id) {
    setConfirmedEvents(prev => ({ ...prev, [id]: true }))
    const result = await joinEvent(id)
    if (!result.ok) setConfirmedEvents(prev => ({ ...prev, [id]: false }))
    return result
  }

  async function handleToggleConfirm(id) {
    const wasConfirmed = confirmedEvents[id]
    setConfirmedEvents(prev => ({ ...prev, [id]: !wasConfirmed }))

    if (wasConfirmed) {
      await leaveEvent(id)
      return { ok: true, full: false }
    }

    const result = await joinEvent(id)
    if (!result.ok) setConfirmedEvents(prev => ({ ...prev, [id]: false }))
    return result
  }

  async function handleOnboardingDone({ name, interests }) {
    const newUser = { name, interests }
    setUser(newUser)
    saveUser(newUser)
    setScreen('home')
    saveProfileToSupabase(newUser)
  }

  if (screen === 'event-detail') {
    return (
      <EventDetailScreen
        eventId={selectedEventId}
        userInterests={user.interests}
        isConfirmed={!!confirmedEvents[selectedEventId]}
        onConfirm={() => handleConfirm(selectedEventId)}
        onBack={() => setScreen('home')}
      />
    )
  }

  if (screen === 'home') {
    return (
      <HomeScreen
        userName={user.name}
        interests={user.interests}
        confirmedEvents={confirmedEvents}
        onToggleConfirm={handleToggleConfirm}
        onSelectEvent={(id) => { setSelectedEventId(id); setScreen('event-detail') }}
      />
    )
  }

  return <OnboardingScreen onNext={handleOnboardingDone} />
}
