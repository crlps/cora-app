import { supabase } from './supabase'

export function getOrCreateUserId() {
  const key = 'cora_uid'
  let uid = localStorage.getItem(key)
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem(key, uid)
  }
  return uid
}

// Confirma presença do usuário atual em um evento
export async function joinEvent(eventId) {
  const { error } = await supabase
    .from('event_participants')
    .upsert(
      { event_id: eventId, profile_id: getOrCreateUserId() },
      { onConflict: 'event_id,profile_id' }
    )
  if (error) console.error('[Supabase] Erro ao confirmar presença:', error.message)
  return !error
}

// Cancela a presença do usuário atual
export async function leaveEvent(eventId) {
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('profile_id', getOrCreateUserId())
  if (error) console.error('[Supabase] Erro ao cancelar presença:', error.message)
  return !error
}

// Lista os ids dos eventos que o usuário atual confirmou
export async function fetchMyParticipations() {
  const { data, error } = await supabase
    .from('event_participants')
    .select('event_id')
    .eq('profile_id', getOrCreateUserId())
  if (error) {
    console.error('[Supabase] Erro ao carregar participações:', error.message)
    return []
  }
  return data.map(row => row.event_id)
}

// Participantes reais de um evento, com nome e interesses do perfil
export async function fetchEventParticipants(eventId) {
  const { data, error } = await supabase
    .from('event_participants')
    .select('profile_id, profiles ( name, interests )')
    .eq('event_id', eventId)
  if (error) {
    console.error('[Supabase] Erro ao carregar participantes:', error.message)
    return []
  }
  return data
    .filter(row => row.profiles)
    .map(row => ({
      id: row.profile_id,
      name: row.profiles.name,
      interests: row.profiles.interests ?? [],
    }))
}
