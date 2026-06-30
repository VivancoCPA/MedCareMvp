export const SEED_IDS = {
  users: {
    superAdmin: 'u-001',
    adminGarcia: 'u-002',
    adminLopez: 'u-003',
    memberMaria: 'u-004',
    memberCarlos: 'u-005',
    memberSinGrupo: 'u-006',
  },
  groups: {
    familiaGarcia: 'g-001',
    familiaLopez: 'g-002',
  },
  nonAccount: {
    sofiaGarcia: 'na-001',
    maxGarcia: 'na-002',
  },
  specialties: {
    medicinaGeneral: 'sp-001',
    pediatria: 'sp-002',
    cardiologia: 'sp-003',
    dermatologia: 'sp-004',
    traumatologia: 'sp-005',
    veterinaria: 'sp-006',
  },
  doctors: {
    drRamirez: 'dr-001',
    draMendoza: 'dr-002',
    drTorres: 'dr-003',
    draVega: 'dr-004',
  },
  medicalCenters: {
    clinicaSalud: 'mc-001',
    hospitalCentral: 'mc-002',
    labAnalisis: 'mc-003',
  },
  insurers: {
    rimac: 'ins-001',
    pacifico: 'ins-002',
  },
  pharmacies: {
    inkafarma: 'ph-001',
    mifarma: 'ph-002',
  },
  appointments: {
    cita001: 'apt-001',
    cita002: 'apt-002',
    cita003: 'apt-003',
    cita004: 'apt-004',
    cita005: 'apt-005',
  },
  consultationResults: {
    cr0001: 'cr-001',
    cr0002: 'cr-002',
  },
  auxiliaryExams: {
    ex0001: 'ex-001',
    ex0002: 'ex-002',
    ex0003: 'ex-003',
  },
  freeNotes: {
    fn0001: 'fn-001',
    fn0002: 'fn-002',
    fn0003: 'fn-003',
  },
  groupRepos: {
    groupDoctors: {
      gd001: 'gd-001',
      gd002: 'gd-002',
      gd003: 'gd-003',
      gd004: 'gd-004',
    },
    groupMedicalCenters: {
      gmc001: 'gmc-001',
      gmc002: 'gmc-002',
      gmc003: 'gmc-003',
    },
    groupInsurers: {
      gi001: 'gi-001',
    },
    groupPharmacies: {
      gp001: 'gp-001',
      gp002: 'gp-002',
    },
  },
} as const
