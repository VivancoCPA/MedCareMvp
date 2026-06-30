import type { FreeNote } from '@/types'
import { SEED_IDS } from './ids'

export let mockFreeNotes: FreeNote[] = [
  {
    id: SEED_IDS.freeNotes.fn0001,
    groupId: SEED_IDS.groups.familiaGarcia,
    memberId: SEED_IDS.users.adminGarcia,
    memberType: 'user',
    title: 'Síntomas antes de control cardiológico',
    body: 'Durante la semana tuve dos episodios de palpitaciones al subir escaleras. También noté mareos leves por las mañanas.',
    createdAt: '2026-04-08T20:00:00Z',
    updatedAt: '2026-04-08T20:00:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.freeNotes.fn0002,
    groupId: SEED_IDS.groups.familiaGarcia,
    memberId: SEED_IDS.users.memberMaria,
    memberType: 'user',
    title: null,
    body: 'Garganta irritada desde hace 2 días. Fiebre de 38°C desde ayer a la tarde. Dolor al tragar.',
    createdAt: '2026-05-04T19:30:00Z',
    updatedAt: '2026-05-04T19:30:00Z',
    deletedAt: null,
  },
  {
    id: SEED_IDS.freeNotes.fn0003,
    groupId: SEED_IDS.groups.familiaGarcia,
    memberId: SEED_IDS.nonAccount.sofiaGarcia,
    memberType: 'nonAccount',
    title: 'Nota pre-control pediátrico',
    body: 'Preguntar al médico sobre el crecimiento. Sofía está en el percentil 45. También consultar sobre las alergias estacionales.',
    createdAt: '2026-06-19T21:00:00Z',
    updatedAt: '2026-06-19T21:00:00Z',
    deletedAt: null,
  },
]
