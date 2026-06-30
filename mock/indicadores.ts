// ─────────────────────────────────────────────────────────────────────────────
// MOCK — Módulo Indicadores / Eficiencia
// KPIs transversales de planta. Conecta conceptualmente con el lucro cesante
// que ya expone el módulo de Mantenimiento.
// Datos estáticos de ejemplo. Reemplazar por backend más adelante.
// ─────────────────────────────────────────────────────────────────────────────

export type EstadoKpi = 'bueno' | 'alerta' | 'critico';
export type Tendencia = 'up' | 'down' | 'neutral';

export interface KpiTransversal {
  id: string;
  titulo: string;
  valor: string;
  tendencia: Tendencia;
  delta: string;
  objetivo: string;
  estado: EstadoKpi;
  detalle: string;
}

export const KPIS_TRANSVERSALES: KpiTransversal[] = [
  {
    id: 'kpi-prod',
    titulo: 'Productividad global',
    valor: '94,3 %',
    tendencia: 'up',
    delta: '+2,1 pp',
    objetivo: 'Meta ≥ 92 %',
    estado: 'bueno',
    detalle: 'Producción real vs. plan de producción del mes',
  },
  {
    id: 'kpi-oee',
    titulo: 'OEE planta',
    valor: '82,4 %',
    tendencia: 'up',
    delta: '+1,4 pp',
    objetivo: 'Meta ≥ 85 %',
    estado: 'alerta',
    detalle: 'Disponibilidad × Rendimiento × Calidad (líneas críticas)',
  },
  {
    id: 'kpi-paradas',
    titulo: 'Horas de parada no plan.',
    valor: '38 h',
    tendencia: 'down',
    delta: '-9 h',
    objetivo: 'Meta ≤ 30 h',
    estado: 'alerta',
    detalle: 'Paradas no programadas acumuladas en el mes',
  },
  {
    id: 'kpi-scrap',
    titulo: 'Scrap / merma',
    valor: '2,4 %',
    tendencia: 'down',
    delta: '-0,3 pp',
    objetivo: 'Meta ≤ 3 %',
    estado: 'bueno',
    detalle: 'Producto descartado / reprocesado sobre total procesado',
  },
  {
    id: 'kpi-prev',
    titulo: 'Cumplimiento preventivos',
    valor: '88 %',
    tendencia: 'up',
    delta: '+6 pp',
    objetivo: 'Meta ≥ 90 %',
    estado: 'alerta',
    detalle: 'OT preventivas ejecutadas vs. programadas (PL-006)',
  },
  {
    id: 'kpi-lucro',
    titulo: 'Lucro cesante por paradas',
    valor: '$ 4,8 M',
    tendencia: 'down',
    delta: '-$ 1,1 M',
    objetivo: 'Meta ≤ $ 4 M',
    estado: 'critico',
    detalle: 'Pérdida estimada por indisponibilidad (vincula con Mantenimiento)',
  },
];

// Productividad y cumplimiento preventivo por mes (2026)
export const PRODUCTIVIDAD_MENSUAL = [
  { mes: 'Ene', productividad: 89, preventivos: 76 },
  { mes: 'Feb', productividad: 90, preventivos: 80 },
  { mes: 'Mar', productividad: 92, preventivos: 78 },
  { mes: 'Abr', productividad: 91, preventivos: 84 },
  { mes: 'May', productividad: 93, preventivos: 85 },
  { mes: 'Jun', productividad: 94, preventivos: 88 },
];

// Horas de parada por causa (mes actual) — incluye mantenimiento (link conceptual)
export const PARADAS_POR_CAUSA = [
  { causa: 'Mant. correctivo', horas: 14 },
  { causa: 'Cambio de formato', horas: 9 },
  { causa: 'Limpieza CIP extra', horas: 6 },
  { causa: 'Falta de insumo', horas: 5 },
  { causa: 'Falla de servicios', horas: 4 },
];

// Evolución del lucro cesante por mes ($) — coherente con Mantenimiento
export const LUCRO_CESANTE_MENSUAL = [
  { mes: 'Ene', monto: 7.2 },
  { mes: 'Feb', monto: 6.5 },
  { mes: 'Mar', monto: 6.9 },
  { mes: 'Abr', monto: 5.9 },
  { mes: 'May', monto: 5.5 },
  { mes: 'Jun', monto: 4.8 },
];

// Scrap por línea (%) — barras
export const SCRAP_POR_LINEA = [
  { linea: 'Pasteurización L1', scrap: 1.8 },
  { linea: 'Pasteurización L2', scrap: 2.1 },
  { linea: 'Spray T1', scrap: 3.2 },
  { linea: 'Spray T2', scrap: 2.7 },
  { linea: 'Envasado', scrap: 1.2 },
];

// Tabla resumen por área para el cierre del tablero
export interface ResumenArea {
  area: string;
  oee: number;
  cumplimiento: number;
  scrap: number;
  estado: EstadoKpi;
}

export const RESUMEN_POR_AREA: ResumenArea[] = [
  { area: 'Pasteurización', oee: 86, cumplimiento: 91, scrap: 1.9, estado: 'bueno' },
  { area: 'Deshidratación (Spray)', oee: 81, cumplimiento: 84, scrap: 3.1, estado: 'alerta' },
  { area: 'Lavado / Cascado', oee: 88, cumplimiento: 93, scrap: 2.0, estado: 'bueno' },
  { area: 'Envasado', oee: 79, cumplimiento: 82, scrap: 1.2, estado: 'alerta' },
  { area: 'Servicios / Utilities', oee: 90, cumplimiento: 95, scrap: 0.0, estado: 'bueno' },
];
