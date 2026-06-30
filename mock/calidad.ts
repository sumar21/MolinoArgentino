// ─────────────────────────────────────────────────────────────────────────────
// MOCK — Módulo Calidad e Inocuidad
// Planta de huevo en polvo y líquido · ISO 22000 / ISO-TS 22002-1 / FSSC 22000
// Datos estáticos de ejemplo. Reemplazar por backend más adelante.
// ─────────────────────────────────────────────────────────────────────────────

// ── Certificaciones ──────────────────────────────────────────────────────────
export type EstadoCert = 'Vigente' | 'Por vencer' | 'En recertificación' | 'Vencida';

export interface Certificacion {
  id: string;
  norma: string;
  nombre: string;
  organismo: string;
  alcance: string;
  estado: EstadoCert;
  emision: string;          // ISO date
  vencimiento: string;      // ISO date
  proximaAuditoria: string; // ISO date
  diasParaVencer: number;
  cobertura: number;        // % avance del ciclo de certificación
}

export const CERTIFICACIONES: Certificacion[] = [
  {
    id: 'cert-1',
    norma: 'ISO 22000:2018',
    nombre: 'Sistema de Gestión de Inocuidad Alimentaria',
    organismo: 'TÜV Rheinland',
    alcance: 'Producción de huevo líquido pasteurizado y huevo en polvo',
    estado: 'Vigente',
    emision: '2024-09-12',
    vencimiento: '2027-09-11',
    proximaAuditoria: '2026-09-08',
    diasParaVencer: 443,
    cobertura: 68,
  },
  {
    id: 'cert-2',
    norma: 'ISO/TS 22002-1:2009',
    nombre: 'Programas de Prerrequisitos (PPR) — Fabricación de alimentos',
    organismo: 'TÜV Rheinland',
    alcance: 'Higiene, layout, control de plagas y prerrequisitos de planta',
    estado: 'Vigente',
    emision: '2024-09-12',
    vencimiento: '2027-09-11',
    proximaAuditoria: '2026-09-08',
    diasParaVencer: 443,
    cobertura: 68,
  },
  {
    id: 'cert-3',
    norma: 'FSSC 22000 v6',
    nombre: 'Food Safety System Certification',
    organismo: 'SGS Argentina',
    alcance: 'Esquema GFSI — inocuidad, food defense y food fraud',
    estado: 'Por vencer',
    emision: '2023-08-01',
    vencimiento: '2026-07-31',
    proximaAuditoria: '2026-07-14',
    diasParaVencer: 36,
    cobertura: 91,
  },
  {
    id: 'cert-4',
    norma: 'SENASA — Habilitación',
    nombre: 'Establecimiento habilitado para exportación',
    organismo: 'SENASA',
    alcance: 'Producto de origen avícola — tránsito federal y exportación',
    estado: 'En recertificación',
    emision: '2025-03-20',
    vencimiento: '2026-08-19',
    proximaAuditoria: '2026-07-02',
    diasParaVencer: 55,
    cobertura: 80,
  },
];

// ── No conformidades / desvíos (CAPA) ────────────────────────────────────────
export type Severidad = 'Crítica' | 'Mayor' | 'Menor' | 'Observación';
export type EstadoNC = 'Abierta' | 'En análisis' | 'En ejecución' | 'Verificación' | 'Cerrada';
export type OrigenNC =
  | 'Auditoría interna'
  | 'Auditoría externa'
  | 'Reclamo de cliente'
  | 'Control de proceso'
  | 'Análisis de laboratorio'
  | 'Inspección de planta';

export interface AccionCAPA {
  id: string;
  tipo: 'Contención' | 'Correctiva' | 'Preventiva';
  descripcion: string;
  responsable: string;
  fechaCompromiso: string;
  estado: 'Pendiente' | 'En curso' | 'Completada' | 'Verificada';
  eficacia?: 'Eficaz' | 'No eficaz' | 'En evaluación';
}

export interface NoConformidad {
  id: string;
  codigo: string;
  titulo: string;
  fecha: string;
  origen: OrigenNC;
  severidad: Severidad;
  estado: EstadoNC;
  responsable: string;
  sector: string;
  clausula?: string;
  descripcion: string;
  metodoAnalisis?: '5 Porqués' | 'Ishikawa (6M)' | 'Árbol de fallas';
  causaRaiz?: string;
  porques?: string[];
  acciones: AccionCAPA[];
  vencimiento: string;
}

export const NO_CONFORMIDADES: NoConformidad[] = [
  {
    id: 'nc-1',
    codigo: 'NC-2026-014',
    titulo: 'Desvío de temperatura en pasteurizador L1',
    fecha: '2026-06-21',
    origen: 'Control de proceso',
    severidad: 'Crítica',
    estado: 'En ejecución',
    responsable: 'M. Fernández',
    sector: 'Pasteurización',
    clausula: 'ISO 22000 §8.5.4 — Control de PCC',
    descripcion:
      'Durante el turno noche el registro automático del PCC-1 mostró 2 lecturas consecutivas por debajo de 60 °C (mínimo 64 °C / 180 s) en huevo líquido entero. Se retuvo el lote LH-2026-0620-07 (4.200 L).',
    metodoAnalisis: '5 Porqués',
    causaRaiz:
      'Falla intermitente en la válvula de derivación de flujo (FDV) por desgaste del actuador neumático; no derivó producto subprocesado a recirculación.',
    porques: [
      '¿Por qué bajó la temperatura de salida? → Cayó el caudal de vapor al intercambiador.',
      '¿Por qué cayó el caudal de vapor? → La válvula moduladora no abrió al setpoint.',
      '¿Por qué no abrió? → El actuador neumático respondió con retardo.',
      '¿Por qué respondió con retardo? → Desgaste del diafragma y baja presión de aire de instrumentación.',
      '¿Por qué no se detectó antes? → No estaba incluido en el plan de mantenimiento preventivo de la válvula FDV.',
    ],
    vencimiento: '2026-07-05',
    acciones: [
      {
        id: 'cap-1',
        tipo: 'Contención',
        descripcion: 'Retención y bloqueo del lote LH-2026-0620-07. Reproceso/descarte según análisis micro.',
        responsable: 'M. Fernández',
        fechaCompromiso: '2026-06-21',
        estado: 'Completada',
        eficacia: 'Eficaz',
      },
      {
        id: 'cap-2',
        tipo: 'Correctiva',
        descripcion: 'Reemplazo del actuador y diafragma de la válvula moduladora de vapor del pasteurizador L1.',
        responsable: 'Mantenimiento',
        fechaCompromiso: '2026-06-28',
        estado: 'En curso',
        eficacia: 'En evaluación',
      },
      {
        id: 'cap-3',
        tipo: 'Preventiva',
        descripcion: 'Incorporar la válvula FDV/moduladora al plan preventivo trimestral y verificar presión de aire de instrumentación.',
        responsable: 'Jefe de Mantenimiento',
        fechaCompromiso: '2026-07-04',
        estado: 'Pendiente',
      },
    ],
  },
  {
    id: 'nc-2',
    codigo: 'NC-2026-013',
    titulo: 'Humedad de huevo en polvo fuera de especificación',
    fecha: '2026-06-18',
    origen: 'Análisis de laboratorio',
    severidad: 'Mayor',
    estado: 'En análisis',
    responsable: 'L. Gómez',
    sector: 'Deshidratación (Spray)',
    clausula: 'Especificación PT-EP-002 — Humedad ≤ 4,0 %',
    descripcion:
      'Lote de huevo entero en polvo EP-2026-0617-02 con humedad 4,8 % (límite 4,0 %). Riesgo de aglomeración y reducción de vida útil.',
    metodoAnalisis: 'Ishikawa (6M)',
    causaRaiz: 'En análisis — hipótesis principal: caída de temperatura de aire de entrada del secador spray por obstrucción parcial de filtro.',
    vencimiento: '2026-07-02',
    acciones: [
      {
        id: 'cap-4',
        tipo: 'Contención',
        descripcion: 'Segregar y reclasificar lote para uso industrial no crítico. Bloqueo de despacho.',
        responsable: 'L. Gómez',
        fechaCompromiso: '2026-06-18',
        estado: 'Completada',
        eficacia: 'Eficaz',
      },
      {
        id: 'cap-5',
        tipo: 'Correctiva',
        descripcion: 'Verificar y limpiar filtros de aire de entrada del secador; calibrar termocupla de cámara.',
        responsable: 'Mantenimiento',
        fechaCompromiso: '2026-06-30',
        estado: 'En curso',
      },
    ],
  },
  {
    id: 'nc-3',
    codigo: 'NC-2026-012',
    titulo: 'Registro de cloro libre incompleto en lavado de huevo',
    fecha: '2026-06-15',
    origen: 'Auditoría interna',
    severidad: 'Menor',
    estado: 'Verificación',
    responsable: 'R. Díaz',
    sector: 'Lavado y Ovoscopía',
    clausula: 'ISO 22000 §8.5.4 — Monitoreo de PC',
    descripcion:
      'Faltan 3 registros de concentración de cloro libre (ppm) en el agua de lavado durante el turno tarde del 12/06. Control no liberado a tiempo.',
    metodoAnalisis: '5 Porqués',
    causaRaiz: 'Planilla de registro en papel traspapelada; el operario no contaba con el formato R-218 en el puesto.',
    vencimiento: '2026-06-29',
    acciones: [
      {
        id: 'cap-6',
        tipo: 'Correctiva',
        descripcion: 'Reposición de talonarios R-218 en puesto y recapacitación del operario de lavado.',
        responsable: 'R. Díaz',
        fechaCompromiso: '2026-06-22',
        estado: 'Completada',
        eficacia: 'En evaluación',
      },
      {
        id: 'cap-7',
        tipo: 'Preventiva',
        descripcion: 'Digitalizar el registro a pie de máquina con tablet para evitar omisiones.',
        responsable: 'Calidad',
        fechaCompromiso: '2026-07-10',
        estado: 'Pendiente',
      },
    ],
  },
  {
    id: 'nc-4',
    codigo: 'NC-2026-011',
    titulo: 'Cuerpo extraño detectado en línea de cascado',
    fecha: '2026-06-10',
    origen: 'Inspección de planta',
    severidad: 'Mayor',
    estado: 'Cerrada',
    responsable: 'M. Fernández',
    sector: 'Quebrado / Cascado',
    clausula: 'ISO-TS 22002-1 §10 — Materias extrañas',
    descripcion:
      'Fragmento de plástico azul (precinto) hallado en tamiz post-cascado. Sin liberación de producto afectado.',
    metodoAnalisis: 'Árbol de fallas',
    causaRaiz: 'Precinto de canasto de transporte de huevo fresco no contemplado en el control de elementos plásticos quebradizos.',
    vencimiento: '2026-06-24',
    acciones: [
      {
        id: 'cap-8',
        tipo: 'Contención',
        descripcion: 'Inspección 100 % del lote y revisión de tamices. Sin producto comprometido despachado.',
        responsable: 'M. Fernández',
        fechaCompromiso: '2026-06-10',
        estado: 'Verificada',
        eficacia: 'Eficaz',
      },
      {
        id: 'cap-9',
        tipo: 'Preventiva',
        descripcion: 'Cambio a precintos metálicos detectables y actualización del registro de elementos plásticos.',
        responsable: 'Calidad',
        fechaCompromiso: '2026-06-20',
        estado: 'Verificada',
        eficacia: 'Eficaz',
      },
    ],
  },
  {
    id: 'nc-5',
    codigo: 'NC-2026-010',
    titulo: 'Reclamo de cliente — grumos en huevo en polvo',
    fecha: '2026-06-05',
    origen: 'Reclamo de cliente',
    severidad: 'Mayor',
    estado: 'En ejecución',
    responsable: 'L. Gómez',
    sector: 'Envasado',
    clausula: 'ISO 22000 §10.2 — No conformidad y acción correctiva',
    descripcion:
      'Cliente industrial reporta presencia de grumos y dificultad de disolución en lote EP-2026-0528-04. Relacionado con humedad y sellado de bolsa.',
    metodoAnalisis: 'Ishikawa (6M)',
    causaRaiz: 'Sellado deficiente de bolsa con válvula desgastada permitió reabsorción de humedad ambiente durante almacenamiento.',
    vencimiento: '2026-07-08',
    acciones: [
      {
        id: 'cap-10',
        tipo: 'Contención',
        descripcion: 'Retiro voluntario del lote en el cliente y reposición. Análisis de muestras de contramuestra.',
        responsable: 'L. Gómez',
        fechaCompromiso: '2026-06-09',
        estado: 'Completada',
        eficacia: 'Eficaz',
      },
      {
        id: 'cap-11',
        tipo: 'Correctiva',
        descripcion: 'Reemplazo de mordazas de la selladora y verificación de hermeticidad por lote.',
        responsable: 'Mantenimiento',
        fechaCompromiso: '2026-07-01',
        estado: 'En curso',
      },
    ],
  },
  {
    id: 'nc-6',
    codigo: 'NC-2026-009',
    titulo: 'Trazabilidad incompleta de materia prima (granja)',
    fecha: '2026-05-28',
    origen: 'Auditoría interna',
    severidad: 'Menor',
    estado: 'Cerrada',
    responsable: 'R. Díaz',
    sector: 'Recepción de Huevo',
    clausula: 'ISO 22000 §8.3 — Trazabilidad',
    descripcion: 'Remito de recepción sin número de lote de granja origen en 2 ingresos del 25/05.',
    causaRaiz: 'Campo opcional en planilla de recepción; no se exigía el lote de granja.',
    vencimiento: '2026-06-11',
    acciones: [
      {
        id: 'cap-12',
        tipo: 'Correctiva',
        descripcion: 'Hacer obligatorio el lote de granja en la planilla de recepción R-201.',
        responsable: 'R. Díaz',
        fechaCompromiso: '2026-06-08',
        estado: 'Verificada',
        eficacia: 'Eficaz',
      },
    ],
  },
  {
    id: 'nc-7',
    codigo: 'NC-2026-008',
    titulo: 'Observación — rótulo de alérgenos sin actualizar',
    fecha: '2026-05-20',
    origen: 'Auditoría externa',
    severidad: 'Observación',
    estado: 'Abierta',
    responsable: 'L. Gómez',
    sector: 'Envasado',
    clausula: 'FSSC 22000 — Gestión de alérgenos',
    descripcion: 'El instructivo de rotulado no referencia la última versión del listado de alérgenos del cliente.',
    vencimiento: '2026-07-15',
    acciones: [
      {
        id: 'cap-13',
        tipo: 'Correctiva',
        descripcion: 'Actualizar instructivo IT-ENV-004 y capacitar a envasado.',
        responsable: 'Calidad',
        fechaCompromiso: '2026-07-12',
        estado: 'Pendiente',
      },
    ],
  },
  {
    id: 'nc-8',
    codigo: 'NC-2026-007',
    titulo: 'Cámara de frío con temperatura elevada (huevo líquido)',
    fecha: '2026-05-14',
    origen: 'Control de proceso',
    severidad: 'Mayor',
    estado: 'Cerrada',
    responsable: 'M. Fernández',
    sector: 'Cámaras de Frío',
    clausula: 'ISO 22000 §8.5.4 — Cadena de frío',
    descripcion: 'Cámara 2 registró 6 °C (límite ≤ 4 °C) durante 40 min por falla de evaporador.',
    causaRaiz: 'Escarcha excesiva en evaporador por ciclo de desescarche mal programado.',
    vencimiento: '2026-05-28',
    acciones: [
      {
        id: 'cap-14',
        tipo: 'Correctiva',
        descripcion: 'Reprogramar ciclos de desescarche y verificar producto por análisis micro.',
        responsable: 'Mantenimiento',
        fechaCompromiso: '2026-05-22',
        estado: 'Verificada',
        eficacia: 'Eficaz',
      },
    ],
  },
];

// Serie para gráfico — NC abiertas vs cerradas por mes (2026)
export const NC_POR_MES = [
  { mes: 'Ene', Abiertas: 5, Cerradas: 4 },
  { mes: 'Feb', Abiertas: 3, Cerradas: 5 },
  { mes: 'Mar', Abiertas: 6, Cerradas: 4 },
  { mes: 'Abr', Abiertas: 4, Cerradas: 6 },
  { mes: 'May', Abiertas: 5, Cerradas: 3 },
  { mes: 'Jun', Abiertas: 4, Cerradas: 5 },
];

// ── Registros de control a pie de máquina ────────────────────────────────────
export type EstadoParametro = 'OK' | 'Alerta' | 'Desvío';

export interface ParametroProceso {
  nombre: string;
  valor: number | string;
  unidad: string;
  limite: string;
  estado: EstadoParametro;
}

export interface RegistroProceso {
  id: string;
  proceso: 'Pasteurización' | 'Deshidratación (Spray)' | 'Lavado de Huevo' | 'Quebrado / Cascado';
  tipoControl: string; // PCC-1, PC-2, etc.
  linea: string;
  lote: string;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  operario: string;
  hora: string;
  registro: string;    // código del formulario
  parametros: ParametroProceso[];
  estado: EstadoParametro;
  observaciones?: string;
}

export const REGISTROS_PROCESO: RegistroProceso[] = [
  {
    id: 'rp-1',
    proceso: 'Pasteurización',
    tipoControl: 'PCC-1',
    linea: 'Pasteurizador L1',
    lote: 'LH-2026-0625-03',
    turno: 'Mañana',
    operario: 'J. Pereyra',
    hora: '08:40',
    registro: 'R-210 — Control de Pasteurización',
    estado: 'OK',
    parametros: [
      { nombre: 'Temperatura', valor: 64.6, unidad: '°C', limite: '≥ 64,0', estado: 'OK' },
      { nombre: 'Tiempo de retención', valor: 187, unidad: 's', limite: '≥ 180', estado: 'OK' },
      { nombre: 'Caudal', valor: 4180, unidad: 'L/h', limite: '4.000–4.500', estado: 'OK' },
      { nombre: 'Presión diferencial', valor: 1.4, unidad: 'bar', limite: '> 1,0', estado: 'OK' },
    ],
  },
  {
    id: 'rp-2',
    proceso: 'Pasteurización',
    tipoControl: 'PCC-1',
    linea: 'Pasteurizador L2',
    lote: 'LH-2026-0625-05',
    turno: 'Mañana',
    operario: 'C. Ramírez',
    hora: '09:15',
    registro: 'R-210 — Control de Pasteurización',
    estado: 'Alerta',
    observaciones: 'Temperatura cercana al límite inferior, se aumentó vapor.',
    parametros: [
      { nombre: 'Temperatura', valor: 64.1, unidad: '°C', limite: '≥ 64,0', estado: 'Alerta' },
      { nombre: 'Tiempo de retención', valor: 181, unidad: 's', limite: '≥ 180', estado: 'OK' },
      { nombre: 'Caudal', valor: 4320, unidad: 'L/h', limite: '4.000–4.500', estado: 'OK' },
      { nombre: 'Presión diferencial', valor: 1.2, unidad: 'bar', limite: '> 1,0', estado: 'OK' },
    ],
  },
  {
    id: 'rp-3',
    proceso: 'Deshidratación (Spray)',
    tipoControl: 'PC-3',
    linea: 'Torre Spray T1',
    lote: 'EP-2026-0625-01',
    turno: 'Mañana',
    operario: 'S. Acosta',
    hora: '10:05',
    registro: 'R-214 — Control de Secado Spray',
    estado: 'OK',
    parametros: [
      { nombre: 'Temp. aire entrada', valor: 178, unidad: '°C', limite: '170–185', estado: 'OK' },
      { nombre: 'Temp. aire salida', valor: 82, unidad: '°C', limite: '78–88', estado: 'OK' },
      { nombre: 'Humedad del polvo', valor: 3.6, unidad: '%', limite: '≤ 4,0', estado: 'OK' },
      { nombre: 'Caudal de alimentación', valor: 620, unidad: 'L/h', limite: '550–680', estado: 'OK' },
    ],
  },
  {
    id: 'rp-4',
    proceso: 'Deshidratación (Spray)',
    tipoControl: 'PC-3',
    linea: 'Torre Spray T1',
    lote: 'EP-2026-0617-02',
    turno: 'Noche',
    operario: 'D. Sosa',
    hora: '02:30',
    registro: 'R-214 — Control de Secado Spray',
    estado: 'Desvío',
    observaciones: 'Humedad fuera de especificación → ver NC-2026-013.',
    parametros: [
      { nombre: 'Temp. aire entrada', valor: 166, unidad: '°C', limite: '170–185', estado: 'Desvío' },
      { nombre: 'Temp. aire salida', valor: 76, unidad: '°C', limite: '78–88', estado: 'Alerta' },
      { nombre: 'Humedad del polvo', valor: 4.8, unidad: '%', limite: '≤ 4,0', estado: 'Desvío' },
      { nombre: 'Caudal de alimentación', valor: 640, unidad: 'L/h', limite: '550–680', estado: 'OK' },
    ],
  },
  {
    id: 'rp-5',
    proceso: 'Lavado de Huevo',
    tipoControl: 'PC-2',
    linea: 'Lavadora LV-1',
    lote: 'LV-2026-0625-02',
    turno: 'Mañana',
    operario: 'M. Luna',
    hora: '07:30',
    registro: 'R-218 — Control de Lavado y Cloro',
    estado: 'OK',
    parametros: [
      { nombre: 'Temp. agua de lavado', valor: 42, unidad: '°C', limite: '40–45', estado: 'OK' },
      { nombre: 'Cloro libre', valor: 110, unidad: 'ppm', limite: '100–150', estado: 'OK' },
      { nombre: 'pH del agua', valor: 9.8, unidad: '', limite: '9,5–11,0', estado: 'OK' },
      { nombre: 'Presión de duchas', valor: 2.1, unidad: 'bar', limite: '> 1,8', estado: 'OK' },
    ],
  },
  {
    id: 'rp-6',
    proceso: 'Quebrado / Cascado',
    tipoControl: 'PC-4',
    linea: 'Cascadora CA-2',
    lote: 'LH-2026-0625-03',
    turno: 'Mañana',
    operario: 'F. Benítez',
    hora: '08:10',
    registro: 'R-220 — Control de Cascado y Tamizado',
    estado: 'OK',
    parametros: [
      { nombre: 'Temp. de huevo', valor: 10, unidad: '°C', limite: '≤ 12', estado: 'OK' },
      { nombre: 'Malla de tamiz', valor: '0,8 mm', unidad: '', limite: 'íntegra', estado: 'OK' },
      { nombre: 'Rechazo / merma', valor: 1.8, unidad: '%', limite: '≤ 3,0', estado: 'OK' },
    ],
  },
];

// ── Auditorías internas / externas ───────────────────────────────────────────
export type EstadoAuditoria = 'Programada' | 'En curso' | 'Completada' | 'Reprogramada';

export interface Auditoria {
  id: string;
  codigo: string;
  tipo: 'Interna' | 'Externa (certificadora)' | 'Cliente' | 'Proveedor' | 'Autoridad (SENASA)';
  norma: string;
  alcance: string;
  fecha: string;
  estado: EstadoAuditoria;
  auditorLider: string;
  duracionDias: number;
  hallazgosMayores: number;
  hallazgosMenores: number;
  observaciones: number;
  avanceChecklist: number; // %
}

export const AUDITORIAS: Auditoria[] = [
  {
    id: 'au-1',
    codigo: 'AI-2026-03',
    tipo: 'Interna',
    norma: 'ISO 22000:2018',
    alcance: 'Pasteurización y cadena de frío',
    fecha: '2026-07-02',
    estado: 'Programada',
    auditorLider: 'R. Díaz',
    duracionDias: 1,
    hallazgosMayores: 0,
    hallazgosMenores: 0,
    observaciones: 0,
    avanceChecklist: 0,
  },
  {
    id: 'au-2',
    codigo: 'AE-2026-01',
    tipo: 'Externa (certificadora)',
    norma: 'FSSC 22000 v6',
    alcance: 'Recertificación — planta completa',
    fecha: '2026-07-14',
    estado: 'Programada',
    auditorLider: 'SGS — Aud. externo',
    duracionDias: 2,
    hallazgosMayores: 0,
    hallazgosMenores: 0,
    observaciones: 0,
    avanceChecklist: 0,
  },
  {
    id: 'au-3',
    codigo: 'AI-2026-02',
    tipo: 'Interna',
    norma: 'ISO-TS 22002-1',
    alcance: 'Programas de prerrequisitos — higiene y plagas',
    fecha: '2026-06-12',
    estado: 'En curso',
    auditorLider: 'L. Gómez',
    duracionDias: 2,
    hallazgosMayores: 0,
    hallazgosMenores: 2,
    observaciones: 3,
    avanceChecklist: 65,
  },
  {
    id: 'au-4',
    codigo: 'AC-2026-01',
    tipo: 'Cliente',
    norma: 'Estándar cliente — Industria alimentaria',
    alcance: 'Auditoría de proveedor — huevo en polvo',
    fecha: '2026-05-19',
    estado: 'Completada',
    auditorLider: 'Cliente (auditor)',
    duracionDias: 1,
    hallazgosMayores: 0,
    hallazgosMenores: 1,
    observaciones: 2,
    avanceChecklist: 100,
  },
  {
    id: 'au-5',
    codigo: 'AI-2026-01',
    tipo: 'Interna',
    norma: 'ISO 22000:2018',
    alcance: 'Trazabilidad y recall',
    fecha: '2026-04-22',
    estado: 'Completada',
    auditorLider: 'R. Díaz',
    duracionDias: 1,
    hallazgosMayores: 0,
    hallazgosMenores: 1,
    observaciones: 1,
    avanceChecklist: 100,
  },
  {
    id: 'au-6',
    codigo: 'AS-2026-01',
    tipo: 'Autoridad (SENASA)',
    norma: 'Habilitación de establecimiento',
    alcance: 'Inspección de habilitación para exportación',
    fecha: '2026-07-02',
    estado: 'Programada',
    auditorLider: 'SENASA — Inspector',
    duracionDias: 1,
    hallazgosMayores: 0,
    hallazgosMenores: 0,
    observaciones: 0,
    avanceChecklist: 0,
  },
];

// Checklist de la auditoría en curso (AI-2026-02) — para la vista de detalle
export interface ItemChecklistAuditoria {
  id: string;
  punto: string;
  requisito: string;
  resultado: 'Conforme' | 'No conforme' | 'Observación' | 'Pendiente';
}

export const CHECKLIST_AUDITORIA_EN_CURSO: ItemChecklistAuditoria[] = [
  { id: 'ck-1', punto: '4.1', requisito: 'Diseño higiénico de equipos y layout de flujo', resultado: 'Conforme' },
  { id: 'ck-2', punto: '4.2', requisito: 'Programa de limpieza y desinfección (CIP/COP)', resultado: 'Conforme' },
  { id: 'ck-3', punto: '5.1', requisito: 'Control integrado de plagas — estaciones y registros', resultado: 'Observación' },
  { id: 'ck-4', punto: '6.3', requisito: 'Gestión de residuos y subproductos (cáscara)', resultado: 'Conforme' },
  { id: 'ck-5', punto: '7.2', requisito: 'Agua de proceso — análisis fisicoquímico y microbiológico', resultado: 'No conforme' },
  { id: 'ck-6', punto: '8.1', requisito: 'Higiene del personal y vestimenta en zona limpia', resultado: 'Conforme' },
  { id: 'ck-7', punto: '9.4', requisito: 'Control de vidrios y plásticos quebradizos', resultado: 'Observación' },
  { id: 'ck-8', punto: '10.2', requisito: 'Calibración de instrumentos de medición de PCC', resultado: 'Pendiente' },
];
