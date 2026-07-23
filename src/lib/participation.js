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

// Confirma presença do usuário atual em um evento.
// Retorna { ok: true } ou { ok: false, full: true } se a turma já lotou
// (bloqueado pelo trigger de capacidade no banco, não só na UI).
export async function joinEvent(eventId) {
  const { error } = await supabase
    .from('event_participants')
    .upsert(
      { event_id: eventId, profile_id: getOrCreateUserId() },
      { onConflict: 'event_id,profile_id' }
    )
  if (error) {
    const isFull = error.message?.includes('CAPACITY_FULL')
    if (!isFull) console.error('[Supabase] Erro ao confirmar presença:', error.message)
    return { ok: false, full: isFull }
  }
  return { ok: true, full: false }
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

// Remove a presença de um participante específico pelo profile_id — usado
// na lista "Quem vai" para remover duplicatas ou desistências, já que sem
// login o "cancelar" comum só funciona no mesmo navegador que confirmou
// (ex: se a pessoa abriu o link do WhatsApp em outra aba/sessão, o app
// gera um perfil anônimo novo e ela perde o vínculo com a inscrição antiga).
export async function removeParticipant(eventId, profileId) {
  const { error } = await supabase
    .from('event_participants')
    .delete()
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
  if (error) console.error('[Supabase] Erro ao remover participante:', error.message)
  return !error
}

// Contagem de participantes reais de um evento (mais leve que trazer a lista toda)
export async function fetchParticipantCount(eventId) {
  const { count, error } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
  if (error) {
    console.error('[Supabase] Erro ao contar participantes:', error.message)
    return 0
  }
  return count ?? 0
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
