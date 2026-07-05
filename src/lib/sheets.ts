import { AbsenteismoRow, HeadcountRow } from '../types';

/**
 * Extracts a Google Spreadsheet ID from a URL, or returns the string if it is already an ID.
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  
  // Regex to extract ID from standard spreadsheet URL
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Normalizes different date formats (e.g., dd/mm/aaaa, yyyy-mm-dd) to standard YYYY-MM-DD
 */
export function normalizeDate(val: any): string {
  if (!val) return '';
  const s = String(val).trim();
  
  // dd/mm/yyyy or dd/mm/yy
  const ddmmyyyy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (ddmmyyyy) {
    let year = ddmmyyyy[3];
    if (year.length === 2) {
      year = '20' + year; // assume 21st century
    }
    const month = ddmmyyyy[2].padStart(2, '0');
    const day = ddmmyyyy[1].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // yyyy-mm-dd
  const yyyymmdd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (yyyymmdd) {
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    return `${yyyymmdd[1]}-${month}-${day}`;
  }
  
  return s;
}

/**
 * Normalizes numbers that might use decimal commas (e.g. 8,8 -> 8.8) or time durations (e.g. 08:48 -> 8.8, 08:00:00 -> 8.0)
 */
export function normalizeNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  const s = String(val).trim().toLowerCase();
  if (s === '') return 0;

  // Check for time format / duration (e.g., "08:48", "08:00:00")
  if (s.includes(':')) {
    const parts = s.split(':');
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours + (minutes / 60) + (seconds / 3600);
  }

  const cleaned = s.replace(/[^0-9.,-]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Normalizes 'Tipo' column (atestado, falta, atraso)
 */
export function normalizeTipo(val: any): string {
  if (!val) return 'outros';
  const s = String(val)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // strip accents (e.g. atraso, falta)
  
  if (s.includes('atestado')) return 'atestado';
  if (s.includes('falta') || s.includes('ausencia') || s.includes('ausente')) return 'falta';
  if (s.includes('atraso')) return 'atraso';
  
  return s;
}

/**
 * Normalizes header strings to find column indices dynamically
 */
function normalizeHeader(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, ''); // keep only alphanumeric
}

/**
 * Helper to dynamically and safely resolve column index by matching headers
 */
function findColumnIndex(
  headers: string[],
  exactTerms: string[],
  fallbackTerms: string[],
  excludeTerms: string[],
  defaultIdx: number
): number {
  if (headers.length === 0) return defaultIdx;

  // 1. Try exact matches
  for (const term of exactTerms) {
    const idx = headers.indexOf(term);
    if (idx !== -1) return idx;
  }
  
  // 2. Try partial matches that don't contain excluded terms
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const matchesFallback = fallbackTerms.some(term => h.includes(term));
    const matchesExclude = excludeTerms.some(term => h.includes(term));
    if (matchesFallback && !matchesExclude) {
      return i;
    }
  }
  
  return defaultIdx;
}

/**
 * Simple and robust CSV parser to parse public Google Sheets export data
 * Supports both comma and semicolon delimiters (highly relevant for Brazilian locales)
 */
export function parseCSV(csvText: string): string[][] {
  const sample = csvText.slice(0, 1000);
  const commaCount = (sample.match(/,/g) || []).length;
  const semicolonCount = (sample.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const result: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let entry = '';

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        entry += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      row.push(entry);
      entry = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      row.push(entry);
      result.push(row);
      row = [];
      entry = '';
    } else {
      entry += char;
    }
  }

  if (row.length > 0 || entry !== '') {
    row.push(entry);
    result.push(row);
  }

  // Filter out completely empty rows
  return result.filter(r => r.some(cell => cell.trim() !== ''));
}

/**
 * Fetches rows from the 'abs' tab of Fato_abs spreadsheet
 */
export async function fetchAbsenteismoData(
  spreadsheetId: string,
  accessToken?: string | null
): Promise<AbsenteismoRow[]> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('ID ou URL da planilha Fato_abs é inválido.');

  let rows: any[][] = [];

  if (accessToken) {
    // Range matches: Tab "abs", Columns A to I
    const range = 'abs!A:I';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(range)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}));
      console.error('API Error details:', errorDetails);
      throw new Error(`Erro ao buscar dados da planilha (Código ${response.status}). Verifique se a aba "abs" existe e se você possui permissão.`);
    }

    const data = await response.json();
    rows = data.values || [];
  } else {
    // Fetch as public CSV
    const url = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=abs`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Acesso público falhou. Verifique se a planilha está compartilhada como "Qualquer pessoa com o link pode ler" ou faça login.');
    }
    const text = await response.text();
    rows = parseCSV(text);
  }

  if (rows.length <= 1) {
    return []; // Only header or empty
  }

  // Row 0 is the header row. Map column names to index positions dynamically with high accuracy
  const headers = (rows[0] || []).map(h => normalizeHeader(String(h || '')));
  
  const nomeIdx = findColumnIndex(headers, ['nome', 'colaborador', 'funcionario', 'nomecolaborador'], ['nome', 'colab', 'func'], [], 0);
  const dataIdx = findColumnIndex(headers, ['data', 'dia', 'dataocorrencia', 'datafim', 'datainicio'], ['data', 'dia'], [], 1);
  const horasIdx = findColumnIndex(headers, ['horas', 'horasausentes', 'horasdescontadas', 'tempo', 'duracao'], ['horas', 'tempo', 'duracao'], ['trabalhadas', 'uteis', 'disponiveis', 'contrato', 'totaldehoras', 'meta'], 2);
  const empresaIdx = findColumnIndex(headers, ['empresa', 'unidade', 'filial'], ['empresa', 'unidade', 'filial'], [], 3);
  const cidIdx = findColumnIndex(headers, ['cid', 'cidatestado', 'codigocid'], ['cid', 'atestado'], ['descricao', 'desc'], 4);
  const descCidIdx = findColumnIndex(headers, ['descricaocid', 'descricaodocid', 'descricao', 'diagnostico'], ['desc', 'diag'], ['cod', 'codigo'], 5);
  const setorIdx = findColumnIndex(headers, ['setor', 'departamento', 'area'], ['setor', 'depart', 'area'], [], 6);
  const tipoIdx = findColumnIndex(headers, ['tipo', 'tipodeausencia', 'categoria', 'tipoocorrencia'], ['tipo', 'cat'], ['cid'], 7);
  const sexoIdx = findColumnIndex(headers, ['sexo', 'genero'], ['sexo', 'gen'], [], 8);

  console.log('Detected column indexes:', { nomeIdx, dataIdx, horasIdx, empresaIdx, cidIdx, descCidIdx, setorIdx, tipoIdx, sexoIdx });

  const parsedRows: AbsenteismoRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || r[nomeIdx] === undefined || String(r[nomeIdx]).trim() === '') continue; // Skip empty rows

    parsedRows.push({
      nome: String(r[nomeIdx] || '').trim(),
      data: normalizeDate(r[dataIdx]),
      horas: normalizeNumber(r[horasIdx]),
      empresa: String(r[empresaIdx] || '').trim(),
      cidAtestado: String(r[cidIdx] || '').trim(),
      descricaoCid: String(r[descCidIdx] || '').trim(),
      setor: String(r[setorIdx] || '').trim(),
      tipo: normalizeTipo(r[tipoIdx]),
      sexo: String(r[sexoIdx] || '').trim().toUpperCase(),
    });
  }

  return parsedRows;
}

/**
 * Fetches rows from the 'dim_NºFunc' spreadsheet/tab
 */
export async function fetchHeadcountData(
  spreadsheetId: string,
  accessToken?: string | null,
  tabName: string = 'dim_NºFunc'
): Promise<HeadcountRow[]> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  if (!cleanId) throw new Error('ID ou URL da planilha dim_NºFunc é inválido.');

  let rows: any[][] = [];

  if (accessToken) {
    // Column A - competência dd/mm/aaaa, Column B - quantidade
    // We match tab name dynamically (it might be in a different sheet, or same sheet and tab is dim_NºFunc)
    const range = `${tabName}!A:B`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(range)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorDetails = await response.json().catch(() => ({}));
      console.error('API Error details:', errorDetails);
      throw new Error(`Erro ao buscar headcount (Código ${response.status}). Verifique se a aba "${tabName}" existe.`);
    }

    const data = await response.json();
    rows = data.values || [];
  } else {
    // Fetch as public CSV
    const url = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Acesso público falhou para a aba de headcount. Verifique se a planilha está compartilhada como "Qualquer pessoa com o link pode ler" e se a aba "${tabName}" existe.`);
    }
    const text = await response.text();
    rows = parseCSV(text);
  }

  if (rows.length <= 1) {
    return [];
  }

  // Row 0 is the header row. Map column names dynamically with high accuracy
  const headers = (rows[0] || []).map(h => normalizeHeader(String(h || '')));
  const compIdx = findColumnIndex(headers, ['competencia', 'mes', 'periodo', 'data'], ['comp', 'mes', 'per', 'dat'], [], 0);
  const quantIdx = findColumnIndex(headers, ['quantidade', 'funcionarios', 'headcount', 'nfunc', 'colaboradores', 'numfunc'], ['quant', 'func', 'colab', 'head'], [], 1);

  console.log('Detected headcount column indexes:', { compIdx, quantIdx });

  const parsedRows: HeadcountRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || r[compIdx] === undefined || String(r[compIdx]).trim() === '') continue;

    parsedRows.push({
      competencia: normalizeDate(r[compIdx]), // convert dd/mm/yyyy to standard yyyy-mm-dd for parsing
      quantidade: Math.round(normalizeNumber(r[quantIdx])),
    });
  }

  return parsedRows;
}
