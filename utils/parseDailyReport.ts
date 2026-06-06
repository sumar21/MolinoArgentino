import { WorkOrderDraft, WorkOrderOrigin, Priority } from '../types';

// ─── Heurísticas de TAG y nombres conocidos ──────────────────────────────────
const TAG_REGEX = /\b(\d{2}M\d{3})\b/;

const KNOWN_ASSETS: { pattern: RegExp; name: string }[] = [
  { pattern: /Banco\s+[CT]\d+/i,           name: '' },   // nombre dinámico
  { pattern: /Humedecanter/i,               name: 'Humedecanter' },
  { pattern: /Soplante\s+Repicky\s+pellets?\s+51M001/i, name: 'Soplante Repicky 51M001' },
  { pattern: /Soplante\s+Repicky/i,         name: 'Soplante Repicky' },
  { pattern: /Esclusa\s+10M008/i,           name: 'Esclusa 10M008' },
  { pattern: /Rosca\s+10M010/i,             name: 'Rosca 10M010' },
  { pattern: /Sasores/i,                    name: 'Sasores' },
  { pattern: /Filtro\s+de\s+ensilaje|trasilaje/i, name: 'Filtro de ensilaje/trasilaje' },
  { pattern: /Filtro\s+de\s+Sasores/i,      name: 'Filtro de Sasores / pulmón' },
  { pattern: /Esclusas?\s+filtros?/i,       name: 'Esclusas filtros TN / Sasores / pulmón' },
  { pattern: /MTKB/i,                       name: 'MTKB' },
  { pattern: /redler/i,                     name: '' },   // nombre dinámico del texto
];

const LOCATION_REGEX = /(\d+°?\s?(?:piso|P|E)\b|terraza\s+de\s+trigo|TN\b|sala\s+de\s+compresores|tanque\s+principal)/i;

// ─── Detectar sector por palabras clave ──────────────────────────────────────
function inferSector(text: string, location?: string): string {
  const t = text.toLowerCase();
  const l = (location || '').toLowerCase();
  if (/filtro|soplante|esclusa|neumático|manga|pulmón/i.test(t)) return 'Neumático/Filtros';
  if (/caldera/i.test(t)) return 'Caldera';
  if (/compresor|secador\s+de\s+aire/i.test(t)) return 'Aire Comprimido';
  if (/eléctric|tablero|luminaria|botonera|guinche/i.test(t)) return 'Electricidad';
  if (/edilicio|pintura|caño\s+de\s+agua|termotanque|ducha|vestuario/i.test(t)) return 'Edilicio';
  if (/autoelevador|vehículo|barredora/i.test(t)) return 'Vehículos';
  if (/molino\s+a\s+martillo|SORTEX|MYFC|mojador/i.test(t) || /TN/i.test(l)) return 'Producción/Molienda';
  return 'Producción/Molienda';
}

// ─── Detectar prioridad por palabras clave ───────────────────────────────────
function inferPriority(text: string, noUrgente: boolean): Priority {
  if (noUrgente) return Priority.LOW;
  if (/no\s+para|pérdida\s+de\s+(?:producto|trigo)|falla\s+en|bornera del motor/i.test(text)) return Priority.HIGH;
  return Priority.MEDIUM;
}

// ─── Extraer nombre de equipo del texto del ítem ─────────────────────────────
function extractAssetName(text: string): { assetName: string; tag?: string } {
  const tagMatch = text.match(TAG_REGEX);
  const tag = tagMatch?.[1];

  // Banco dinámico
  const bancoMatch = text.match(/Banco\s+([CT]\d+)/i);
  if (bancoMatch) return { assetName: `Banco ${bancoMatch[1]}`, tag };

  // Motor con TAG
  const motorMatch = text.match(/Motor\s+(\d{2}M\d{3})/i);
  if (motorMatch) return { assetName: `Motor ${motorMatch[1]}`, tag: motorMatch[1] };

  // Reductor con TAG
  const reductorMatch = text.match(/Reductor\s+(\d{2}M\d{3})/i);
  if (reductorMatch) return { assetName: `Reductor ${reductorMatch[1]}`, tag: reductorMatch[1] };

  for (const ka of KNOWN_ASSETS) {
    if (ka.pattern.test(text)) {
      const matchedText = text.match(ka.pattern)?.[0] || '';
      return { assetName: ka.name || matchedText, tag };
    }
  }

  // Fallback: primeras palabras del texto (hasta ":"" o ","")
  const firstPhrase = text.split(/[:,(]/)[0].trim().slice(0, 40);
  return { assetName: firstPhrase, tag };
}

// ─── Extraer location del texto ───────────────────────────────────────────────
function extractLocation(text: string): string | undefined {
  const m = text.match(LOCATION_REGEX);
  return m ? m[0].trim() : undefined;
}

// ─── Generar título corto ─────────────────────────────────────────────────────
function makeTitle(assetName: string, activity: string): string {
  const words = activity.split(/\s+/).slice(0, 6).join(' ');
  return `${assetName} — ${words}`;
}

// ─── PARSER PRINCIPAL ─────────────────────────────────────────────────────────
/**
 * Parsea el mensaje de WhatsApp del parte diario y devuelve borradores de OT.
 * Función pura, aislada: reemplazable por extracción LLM sin tocar la UI.
 */
export function parseDailyReport(text: string, _reportDate: string): WorkOrderDraft[] {
  const drafts: WorkOrderDraft[] = [];

  // Normalizar saltos de línea
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  let currentBlock: WorkOrderOrigin | null = null;
  let currentContractor: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    // ── Detectar cabecera de bloque ─────────────────────────────────────────
    if (/^Tareas\s+\w+\s+\d{1,2}\/\d{1,2}\/\d{2,4}/i.test(raw)) {
      currentBlock = WorkOrderOrigin.DAILY_TASK;
      currentContractor = null;
      continue;
    }
    if (/^Relevamiento\s+de\s+[JjOo]\s+y\s+[JjOo]\s+rodamientos/i.test(raw) ||
        /^Relevamiento\s+de\s+rodamientos/i.test(raw)) {
      currentBlock = WorkOrderOrigin.INSPECTION;
      currentContractor = null;
      continue;
    }
    if (/^Trabajos\s+de\s+y\s+con\s+terceros/i.test(raw)) {
      currentBlock = WorkOrderOrigin.THIRD_PARTY;
      currentContractor = null;
      continue;
    }

    if (currentBlock === null) continue;

    // ── Bloque DAILY_TASK e INSPECTION: ítems numerados ─────────────────────
    if (currentBlock === WorkOrderOrigin.DAILY_TASK || currentBlock === WorkOrderOrigin.INSPECTION) {
      // Ítem numerado: "1-", "1.", "1) "
      if (!/^\d+[-.)]\s/.test(raw)) continue;

      const itemText = raw.replace(/^\d+[-.)]\s*/, '').trim();

      // Detectar NO URGENTE / a programar
      const noUrgente = /NO\s+ES\s+URGENTE|a\s+programar|seguir\s+evolución/i.test(itemText);

      const location = extractLocation(itemText);
      const { assetName, tag } = extractAssetName(itemText);
      const priority = inferPriority(itemText, noUrgente);
      const sector = inferSector(itemText, location);
      const specialty = /eléctric|tablero|motor|bornera/i.test(itemText) ? 'Eléctrico'
        : /lubric|aceite|reductor/i.test(itemText) ? 'Lubricación'
        : 'Mecánica';

      drafts.push({
        title: makeTitle(assetName, itemText),
        description: itemText,
        assetName,
        tag,
        sector,
        location,
        activity: itemText,
        origin: currentBlock,
        priority,
        needsScheduling: noUrgente || undefined,
        specialtyRequired: specialty,
      });
    }

    // ── Bloque THIRD_PARTY: líneas por tercero ───────────────────────────────
    if (currentBlock === WorkOrderOrigin.THIRD_PARTY) {
      // Detectar cambio de contratista: "- Nombre: tareas."  o "- Edilicio: Hugo Vera:"
      const contractorLineMatch = raw.match(
        /^[-–]\s*(?:Edilicio:\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){0,2}(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?):|^[-–]\s*Tercerizados?:\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)/
      );
      if (contractorLineMatch) {
        currentContractor = (contractorLineMatch[1] || contractorLineMatch[2] || '').trim();

        // Extraer las tareas que vienen después del ":"
        const afterColon = raw.replace(/^[-–]\s*(?:Edilicio:\s+)?[^:]+:\s*/, '').trim();
        if (afterColon) {
          // Puede haber múltiples tareas separadas por "."
          const tasks = afterColon.split(/\.\s+/).filter(t => t.trim().length > 3);
          tasks.forEach(taskText => {
            const cleanTask = taskText.replace(/\.$/, '').trim();
            if (!cleanTask) return;
            const location = extractLocation(cleanTask);
            const sector = inferSector(cleanTask, location);
            const priority = inferPriority(cleanTask, false);
            drafts.push({
              title: makeTitle(currentContractor || 'Tercero', cleanTask),
              description: cleanTask,
              assetName: extractAssetName(cleanTask).assetName || 'General',
              sector,
              location,
              activity: cleanTask,
              contractor: currentContractor || undefined,
              origin: WorkOrderOrigin.THIRD_PARTY,
              priority,
              specialtyRequired: /eléctric|luminaria|botonera/i.test(cleanTask) ? 'Eléctrico'
                : /edilicio|pintura|caño\s+de\s+agua|termotanque|ducha/i.test(cleanTask) ? 'Edilicio'
                : 'General',
            });
          });
        }
        continue;
      }

      // Línea de continuación del mismo contratista (sin "-")
      if (currentContractor && raw.length > 5) {
        const tasks = raw.split(/\.\s+/).filter(t => t.trim().length > 3);
        tasks.forEach(taskText => {
          const cleanTask = taskText.replace(/\.$/, '').trim();
          if (!cleanTask) return;
          const location = extractLocation(cleanTask);
          const sector = inferSector(cleanTask, location);
          const priority = inferPriority(cleanTask, false);
          drafts.push({
            title: makeTitle(currentContractor || 'Tercero', cleanTask),
            description: cleanTask,
            assetName: extractAssetName(cleanTask).assetName || 'General',
            sector,
            location,
            activity: cleanTask,
            contractor: currentContractor || undefined,
            origin: WorkOrderOrigin.THIRD_PARTY,
            priority,
            specialtyRequired: /eléctric|luminaria|botonera/i.test(cleanTask) ? 'Eléctrico'
              : /edilicio|pintura|caño\s+de\s+agua|termotanque|ducha/i.test(cleanTask) ? 'Edilicio'
              : 'General',
          });
        });
      }
    }
  }

  return drafts;
}
