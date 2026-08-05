// ─────────────────────────────────────────────────────────────────────────────
// MOCK — Módulo Producción
// Planta de huevo en polvo y líquido · Lotes, líneas y OEE
// Datos estáticos de ejemplo. Reemplazar por backend más adelante.
// ─────────────────────────────────────────────────────────────────────────────

// ── Líneas de producción ─────────────────────────────────────────────────────
export type EstadoLinea = 'En marcha' | 'Parada' | 'Setup / Cambio' | 'Limpieza CIP' | 'Mantenimiento';

export interface Linea {
  id: string;
  nombre: string;
  producto: string;
  estado: EstadoLinea;
  oee: number;            // %
  disponibilidad: number; // %
  rendimiento: number;    // %
  calidad: number;        // %
  velocidad: string;
  loteActual?: string;
  turno: string;
}

export const LINEAS: Linea[] = [
  {
    id: 'ln-1',
    nombre: 'Pasteurización L1',
    producto: 'Huevo líquido entero',
    estado: 'En marcha',
    oee: 86,
    disponibilidad: 92,
    rendimiento: 95,
    calidad: 98,
    velocidad: '4.180 L/h',
    loteActual: 'LH-2026-0625-03',
    turno: 'Mañana',
  },
  {
    id: 'ln-2',
    nombre: 'Pasteurización L2',
    producto: 'Clara líquida',
    estado: 'En marcha',
    oee: 79,
    disponibilidad: 88,
    rendimiento: 91,
    calidad: 99,
    velocidad: '4.320 L/h',
    loteActual: 'LH-2026-0625-05',
    turno: 'Mañana',
  },
  {
    id: 'ln-3',
    nombre: 'Torre Spray T1',
    producto: 'Huevo entero en polvo',
    estado: 'En marcha',
    oee: 81,
    disponibilidad: 90,
    rendimiento: 90,
    calidad: 99,
    velocidad: '620 L/h',
    loteActual: 'EP-2026-0625-01',
    turno: 'Mañana',
  },
  {
    id: 'ln-4',
    nombre: 'Torre Spray T2',
    producto: 'Clara en polvo',
    estado: 'Limpieza CIP',
    oee: 0,
    disponibilidad: 0,
    rendimiento: 0,
    calidad: 0,
    velocidad: '—',
    turno: 'Mañana',
  },
  {
    id: 'ln-5',
    nombre: 'Envasado E1',
    producto: 'Bolsa 25 kg / bin',
    estado: 'Setup / Cambio',
    oee: 0,
    disponibilidad: 0,
    rendimiento: 0,
    calidad: 0,
    velocidad: '—',
    turno: 'Mañana',
  },
  {
    id: 'ln-6',
    nombre: 'Cascado / Quebrado',
    producto: 'Huevo fresco → líquido',
    estado: 'Parada',
    oee: 0,
    disponibilidad: 0,
    rendimiento: 0,
    calidad: 0,
    velocidad: '—',
    turno: 'Mañana',
  },
];

// ── Lotes ────────────────────────────────────────────────────────────────────
export type EstadoLote = 'En curso' | 'Pausado' | 'Finalizado' | 'Liberado' | 'Retenido';
export type Producto =
  | 'Huevo líquido entero pasteurizado'
  | 'Clara líquida pasteurizada'
  | 'Yema líquida pasteurizada'
  | 'Huevo entero en polvo'
  | 'Clara en polvo';

export interface Trazabilidad {
  materiaPrima: string;
  loteRecepcion: string;
  granjaOrigen: string;
  pasteurizacion?: string;
  destino: string;
  responsable: string;
}

export interface Lote {
  id: string;
  codigo: string;
  producto: Producto;
  fecha: string;
  turno: 'Mañana' | 'Tarde' | 'Noche';
  linea: string;
  cantidad: number;
  unidad: 'L' | 'kg';
  avance: number; // %
  estado: EstadoLote;
  liberadoCalidad: boolean;
  trazabilidad: Trazabilidad;
}

export const LOTES: Lote[] = [
  {
    id: 'lt-1',
    codigo: 'LH-2026-0625-03',
    producto: 'Huevo líquido entero pasteurizado',
    fecha: '2026-06-25',
    turno: 'Mañana',
    linea: 'Pasteurización L1',
    cantidad: 12500,
    unidad: 'L',
    avance: 64,
    estado: 'En curso',
    liberadoCalidad: false,
    trazabilidad: {
      materiaPrima: 'Huevo fresco categoría industrial',
      loteRecepcion: 'REC-2026-0624-11',
      granjaOrigen: 'Granja San Javier (RNE 04-001)',
      pasteurizacion: 'PCC-1 OK — 64,6 °C / 187 s',
      destino: 'Cámara de frío 1 → despacho cliente A',
      responsable: 'J. Pereyra',
    },
  },
  {
    id: 'lt-2',
    codigo: 'LH-2026-0625-05',
    producto: 'Clara líquida pasteurizada',
    fecha: '2026-06-25',
    turno: 'Mañana',
    linea: 'Pasteurización L2',
    cantidad: 8200,
    unidad: 'L',
    avance: 41,
    estado: 'En curso',
    liberadoCalidad: false,
    trazabilidad: {
      materiaPrima: 'Clara separada en cascado',
      loteRecepcion: 'REC-2026-0624-11',
      granjaOrigen: 'Granja Don Aldo (RNE 04-017)',
      pasteurizacion: 'PCC-1 — en monitoreo',
      destino: 'Cámara de frío 2',
      responsable: 'C. Ramírez',
    },
  },
  {
    id: 'lt-3',
    codigo: 'EP-2026-0625-01',
    producto: 'Huevo entero en polvo',
    fecha: '2026-06-25',
    turno: 'Mañana',
    linea: 'Torre Spray T1',
    cantidad: 1850,
    unidad: 'kg',
    avance: 58,
    estado: 'En curso',
    liberadoCalidad: false,
    trazabilidad: {
      materiaPrima: 'Huevo líquido pasteurizado LH-2026-0624-09',
      loteRecepcion: 'REC-2026-0623-08',
      granjaOrigen: 'Granja San Javier (RNE 04-001)',
      pasteurizacion: 'Origen pasteurizado lote LH-2026-0624-09',
      destino: 'Depósito de polvo → envasado',
      responsable: 'S. Acosta',
    },
  },
  {
    id: 'lt-4',
    codigo: 'LH-2026-0624-09',
    producto: 'Huevo líquido entero pasteurizado',
    fecha: '2026-06-24',
    turno: 'Tarde',
    linea: 'Pasteurización L1',
    cantidad: 13100,
    unidad: 'L',
    avance: 100,
    estado: 'Liberado',
    liberadoCalidad: true,
    trazabilidad: {
      materiaPrima: 'Huevo fresco categoría industrial',
      loteRecepcion: 'REC-2026-0623-08',
      granjaOrigen: 'Granja San Javier (RNE 04-001)',
      pasteurizacion: 'PCC-1 OK — 65,1 °C / 192 s',
      destino: 'Secado spray T1 (EP-2026-0625-01)',
      responsable: 'M. Luna',
    },
  },
  {
    id: 'lt-5',
    codigo: 'EP-2026-0617-02',
    producto: 'Huevo entero en polvo',
    fecha: '2026-06-17',
    turno: 'Noche',
    linea: 'Torre Spray T1',
    cantidad: 1620,
    unidad: 'kg',
    avance: 100,
    estado: 'Retenido',
    liberadoCalidad: false,
    trazabilidad: {
      materiaPrima: 'Huevo líquido pasteurizado LH-2026-0616-05',
      loteRecepcion: 'REC-2026-0615-04',
      granjaOrigen: 'Granja Don Aldo (RNE 04-017)',
      pasteurizacion: 'Origen pasteurizado lote LH-2026-0616-05',
      destino: 'Retenido — humedad fuera de spec (NC-2026-013)',
      responsable: 'D. Sosa',
    },
  },
  {
    id: 'lt-6',
    codigo: 'LY-2026-0624-02',
    producto: 'Yema líquida pasteurizada',
    fecha: '2026-06-24',
    turno: 'Mañana',
    linea: 'Pasteurización L2',
    cantidad: 5400,
    unidad: 'L',
    avance: 100,
    estado: 'Liberado',
    liberadoCalidad: true,
    trazabilidad: {
      materiaPrima: 'Yema separada en cascado',
      loteRecepcion: 'REC-2026-0623-08',
      granjaOrigen: 'Granja San Javier (RNE 04-001)',
      pasteurizacion: 'PCC-1 OK — 61,2 °C / 210 s',
      destino: 'Cámara de frío 1 → despacho cliente B',
      responsable: 'C. Ramírez',
    },
  },
  {
    id: 'lt-7',
    codigo: 'EP-2026-0623-03',
    producto: 'Clara en polvo',
    fecha: '2026-06-23',
    turno: 'Tarde',
    linea: 'Torre Spray T2',
    cantidad: 940,
    unidad: 'kg',
    avance: 100,
    estado: 'Finalizado',
    liberadoCalidad: false,
    trazabilidad: {
      materiaPrima: 'Clara líquida pasteurizada LH-2026-0622-06',
      loteRecepcion: 'REC-2026-0622-07',
      granjaOrigen: 'Granja Don Aldo (RNE 04-017)',
      pasteurizacion: 'Origen pasteurizado lote LH-2026-0622-06',
      destino: 'En espera de liberación de calidad',
      responsable: 'D. Sosa',
    },
  },
];

// ── KPIs por turno (hoy) ─────────────────────────────────────────────────────
export interface KpiTurno {
  turno: string;
  litrosLiquido: number;
  kgPolvo: number;
  lotes: number;
}

export const PRODUCCION_POR_TURNO: KpiTurno[] = [
  { turno: 'Noche (00–06)', litrosLiquido: 9800, kgPolvo: 1620, lotes: 3 },
  { turno: 'Mañana (06–14)', litrosLiquido: 14200, kgPolvo: 1850, lotes: 4 },
  { turno: 'Tarde (14–22)', litrosLiquido: 12600, kgPolvo: 1180, lotes: 3 },
];

// Serie semanal para gráficos — litros de líquido y kg de polvo por día
export const PRODUCCION_SEMANAL = [
  { dia: 'Lun', liquido: 34200, polvo: 4100 },
  { dia: 'Mar', liquido: 36800, polvo: 4650 },
  { dia: 'Mié', liquido: 31500, polvo: 3980 },
  { dia: 'Jue', liquido: 38100, polvo: 5020 },
  { dia: 'Vie', liquido: 36600, polvo: 4650 },
  { dia: 'Sáb', liquido: 22400, polvo: 2600 },
  { dia: 'Dom', liquido: 0, polvo: 0 },
];

// Mix de producto (kg/L equivalentes de la semana) para el donut
export const MIX_PRODUCTO = [
  { name: 'Huevo líquido entero', value: 142000 },
  { name: 'Clara líquida', value: 58000 },
  { name: 'Yema líquida', value: 31000 },
  { name: 'Huevo en polvo', value: 24600 },
  { name: 'Clara en polvo', value: 8200 },
];
