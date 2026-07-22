// Fonte única de eventos do Cora (mock — futuramente virá do Supabase)

export const INTEREST_META = {
  caminhada:    { label: 'Caminhada',   icon: '🚶' },
  cafe:         { label: 'Café',         icon: '☕' },
  artes:        { label: 'Artes',        icon: '🎨' },
  voluntariado: { label: 'Voluntariado', icon: '🤝' },
  danca:        { label: 'Dança',        icon: '💃' },
  culinaria:    { label: 'Culinária',    icon: '🍳' },
  leitura:      { label: 'Leitura',      icon: '📖' },
  artesanato:   { label: 'Artesanato',   icon: '🧶' },
  bemestar:     { label: 'Bem-estar',    icon: '🧘' },
}

const CATEGORY_STYLE = {
  caminhada:    { bg: '#E8F5F0', color: '#5A9E87' },
  cafe:         { bg: '#FEF3E2', color: '#B07830' },
  artes:        { bg: '#F0EBF8', color: '#7A55A8' },
  voluntariado: { bg: '#FEF9E2', color: '#8A7A1A' },
  danca:        { bg: '#FDE8F5', color: '#A8458A' },
  culinaria:    { bg: '#FEF0E2', color: '#A85A2A' },
  leitura:      { bg: '#E8F0FB', color: '#4A6FA5' },
  artesanato:   { bg: '#F5EBE0', color: '#8A5A2A' },
  bemestar:     { bg: '#F3EDE4', color: '#9A7B4F' },
}

function makeEvent(e) {
  const meta  = INTEREST_META[e.interestId]
  const style = CATEGORY_STYLE[e.interestId]
  const base = {
    ...e,
    // Eventos especiais podem definir categoria/ícone/cores próprias
    category:      e.category      ?? meta.label,
    icon:          e.icon          ?? meta.icon,
    categoryBg:    e.categoryBg    ?? style?.bg,
    categoryColor: e.categoryColor ?? style?.color,
  }
  return { ...base, mockParticipants: buildMockParticipants(base) }
}

// Pool de pessoas fictícias usadas para preencher "Quem vai" enquanto a
// base de usuários reais ainda é pequena. Determinístico por evento (mesma
// lista sempre, sem sortear a cada render).
const MOCK_NAME_POOL = [
  'Lúcia Mendes', 'Roberto Silva', 'Ana Paula Costa', 'Carlos Mota',
  'Marta Fernandes', 'José Alves', 'Beatriz Lima', 'Sônia Ramos',
  'Nilton Teixeira', 'Célia Andrade', 'Douglas Pereira', 'Rita Souza',
  'Fernando Dias', 'Helena Campos', 'Antônio Barros', 'Vera Nogueira',
]
const MOCK_AVATAR_COLORS = ['#E97B73', '#7DB89B', '#D4956A', '#A07DB8', '#4A6FA5', '#A8458A']

const OTHER_INTERESTS = Object.keys(INTEREST_META)

// Gera N participantes fictícios para um evento, com nome, cor e interesses
// (sempre incluindo o interesse do próprio evento, para dar "em comum").
function buildMockParticipants(event) {
  const count = event.baseConfirmed
  const list = []
  for (let i = 0; i < count; i++) {
    const nameIdx  = (event.id.length + i * 7) % MOCK_NAME_POOL.length
    const extraIdx = (event.id.length + i * 3) % OTHER_INTERESTS.length
    const extra    = OTHER_INTERESTS[extraIdx]
    list.push({
      id: `mock-${event.id}-${i}`,
      name: MOCK_NAME_POOL[nameIdx],
      bg: MOCK_AVATAR_COLORS[i % MOCK_AVATAR_COLORS.length],
      interests: extra === event.interestId ? [event.interestId] : [event.interestId, extra],
      isMock: true,
    })
  }
  return list
}

// featured: aparece no feed "Início"; os demais só no Explorar
// pinned: evento oficial Cora — sempre no topo do feed, independente de preferências
export const EVENTS = [
  makeEvent({
    id: 'yogaterapia-vidya',
    interestId: 'bemestar',
    featured: true,
    pinned: true,
    category: 'Bem-estar',
    icon: '🧘',
    categoryBg: '#F3EDE4',
    categoryColor: '#9A7B4F',
    title: 'Yogaterapia no Vidya',
    location: 'Vidya — R. Figueira Filho, 105, Parnamirim',
    date: 'Quinta, 30 de julho', dateShort: 'Qui, 30 jul',
    time: '16h45', day: 30, month: 6, year: 2026,
    baseConfirmed: 0,
    capacity: 20,
    coverImage: '/assets/evento-vidya.jpg',
    whatsappLink: 'https://chat.whatsapp.com/EOCrxoc1Tg03cuBHTHfrf1',
    description:
      'Uma tarde pensada especialmente para a comunidade Cora. No acolhedor espaço Vidya, em Parnamirim, vamos praticar yogaterapia: uma aula guiada com calma, que respeita o ritmo e as possibilidades de cada corpo. Não precisa ter experiência, nem flexibilidade — só vontade de se cuidar e roupas confortáveis. Tapetes e apoios são fornecidos pelo espaço. Depois da prática, ficamos juntos para um coffee com comidinhas: o melhor momento para conversar, trocar histórias e sair de lá com companhias novas.',
  }),
  makeEvent({
    id: 'jaqueira',
    interestId: 'caminhada',
    featured: true,
    title: 'Caminhada na Jaqueira',
    location: 'Parque da Jaqueira, Graças',
    date: 'Sábado, 25 de julho', dateShort: 'Sáb, 25 jul',
    time: '7h30', day: 25, month: 6, year: 2026,
    baseConfirmed: 8,
    coverImage: '/assets/evento-jaqueira.jpg',
    whatsappLink: 'https://chat.whatsapp.com/CoraJaqueira2026PE',
    description:
      'Uma caminhada leve pelo Parque da Jaqueira, um dos mais bonitos de Recife. O grupo se reúne na entrada principal, faz o percurso completo do parque e termina com um café coletivo em volta dos bancos da praça central. Ritmo tranquilo, para todos os fôlegos.',
  }),
  makeEvent({
    id: 'cafe-literario',
    interestId: 'cafe',
    featured: true,
    title: 'Café Literário',
    location: 'Livraria Jangada, Boa Viagem',
    date: 'Domingo, 26 de julho', dateShort: 'Dom, 26 jul',
    time: '10h', day: 26, month: 6, year: 2026,
    baseConfirmed: 5,
    coverImage: '/assets/evento-cafe-literario.jpg',
    whatsappLink: 'https://chat.whatsapp.com/CoraCafeLiterarioBV',
    description:
      'Um encontro para conversar sobre livros tomando um bom café. Cada pessoa traz um livro que marcou sua vida para compartilhar com o grupo. Não precisa ser leitor assíduo — basta gostar de boas histórias.',
  }),
  makeEvent({
    id: 'aquarela',
    interestId: 'artes',
    featured: true,
    title: 'Oficina de Aquarela',
    location: 'Galeria Amparo 60, Recife Antigo',
    date: 'Terça, 28 de julho', dateShort: 'Ter, 28 jul',
    time: '14h', day: 28, month: 6, year: 2026,
    baseConfirmed: 12,
    coverImage: '/assets/evento-aquarela.jpg',
    whatsappLink: 'https://chat.whatsapp.com/CoraAquarelaRecifeAntigo',
    description:
      'Oficina para iniciantes no Recife Antigo. Todo o material é fornecido: papel, tintas e pincéis. A proposta é pintar cenas do bairro em um ambiente descontraído, com pausa para café.',
  }),
  makeEvent({
    id: 'roda-leitura',
    interestId: 'leitura',
    title: 'Roda de Leitura',
    location: 'Biblioteca Pública, Derby',
    date: 'Quinta, 23 de julho', dateShort: 'Qui, 23 jul',
    time: '15h', day: 23, month: 6, year: 2026,
    baseConfirmed: 9,
    whatsappLink: 'https://chat.whatsapp.com/CoraRodaLeitura',
    description:
      'Leitura compartilhada de contos brasileiros na Biblioteca Pública do Derby. A cada encontro, um conto novo — lido em voz alta e conversado em grupo.',
  }),
  makeEvent({
    id: 'forro',
    interestId: 'danca',
    title: 'Aula de Forró',
    location: 'Casa de Cultura, Santo Antônio',
    date: 'Sexta, 24 de julho', dateShort: 'Sex, 24 jul',
    time: '18h', day: 24, month: 6, year: 2026,
    baseConfirmed: 14,
    whatsappLink: 'https://chat.whatsapp.com/CoraForroRecife',
    description:
      'Aula de forró pé-de-serra para todos os níveis na Casa de Cultura. Não precisa de par — a turma se reveza. Professores pacientes e música ao vivo no final.',
  }),
  makeEvent({
    id: 'horta',
    interestId: 'voluntariado',
    title: 'Horta Comunitária',
    location: 'Parque 13 de Maio, Soledade',
    date: 'Sábado, 25 de julho', dateShort: 'Sáb, 25 jul',
    time: '7h', day: 25, month: 6, year: 2026,
    baseConfirmed: 6,
    whatsappLink: 'https://chat.whatsapp.com/CoraHortaRecife',
    description:
      'Manhã de plantio e colheita na horta comunitária do Parque 13 de Maio. O que é colhido vai para instituições do bairro. Traga chapéu e garrafa de água.',
  }),
  makeEvent({
    id: 'tear',
    interestId: 'artesanato',
    title: 'Oficina de Tear',
    location: 'Casa das Artes, Boa Vista',
    date: 'Domingo, 26 de julho', dateShort: 'Dom, 26 jul',
    time: '10h', day: 26, month: 6, year: 2026,
    baseConfirmed: 7,
    whatsappLink: 'https://chat.whatsapp.com/CoraTearBoaVista',
    description:
      'Aprenda os primeiros pontos do tear manual e leve para casa sua primeira peça. Material incluso, turma pequena e acolhedora.',
  }),
  makeEvent({
    id: 'culinaria-ne',
    interestId: 'culinaria',
    title: 'Culinária Nordestina',
    location: 'SESC Recife, Boa Vista',
    date: 'Segunda, 27 de julho', dateShort: 'Seg, 27 jul',
    time: '14h', day: 27, month: 6, year: 2026,
    baseConfirmed: 11,
    whatsappLink: 'https://chat.whatsapp.com/CoraCulinariaRecife',
    description:
      'Cozinha coletiva de receitas nordestinas no SESC. Nesta edição: cuscuz recheado e doce de jaca. Todos cozinham juntos e almoçam juntos.',
  }),
  makeEvent({
    id: 'capibaribe',
    interestId: 'caminhada',
    title: 'Caminhada no Capibaribe',
    location: 'Cais José Estelita, São José',
    date: 'Terça, 28 de julho', dateShort: 'Ter, 28 jul',
    time: '6h30', day: 28, month: 6, year: 2026,
    baseConfirmed: 18,
    whatsappLink: 'https://chat.whatsapp.com/CoraCapibaribeRecife',
    description:
      'Caminhada ao nascer do sol pela orla do Capibaribe, saindo do Cais José Estelita. Percurso plano de 4km com pausas para alongamento.',
  }),
  makeEvent({
    id: 'papo-domingo',
    interestId: 'cafe',
    title: 'Papo de Domingo',
    location: 'Café Mocotó, Boa Viagem',
    date: 'Domingo, 26 de julho', dateShort: 'Dom, 26 jul',
    time: '9h', day: 26, month: 6, year: 2026,
    baseConfirmed: 4,
    whatsappLink: 'https://chat.whatsapp.com/CoraPapoDomingo',
    description:
      'Café da manhã sem pauta: só boa conversa para começar o domingo acompanhado. Mesa reservada em nome do Cora.',
  }),
  makeEvent({
    id: 'banco-alimentos',
    interestId: 'voluntariado',
    title: 'Banco de Alimentos',
    location: 'Igreja do Carmo, Santo Antônio',
    date: 'Sábado, 25 de julho', dateShort: 'Sáb, 25 jul',
    time: '8h', day: 25, month: 6, year: 2026,
    baseConfirmed: 23,
    whatsappLink: 'https://chat.whatsapp.com/CoraBancoAlimentos',
    description:
      'Montagem de cestas básicas para famílias da comunidade. Trabalho leve, sentado, em equipe — e muita conversa boa no processo.',
  }),
]

export const FEATURED_EVENTS = EVENTS.filter(e => e.featured)

export const EXPLORE_FILTERS = [
  { id: 'todos', label: 'Todos', icon: '🗺️' },
  ...Object.entries(INTEREST_META).map(([id, m]) => ({ id, label: m.label, icon: m.icon })),
]

export function getEventById(id) {
  return EVENTS.find(e => e.id === id) ?? null
}
