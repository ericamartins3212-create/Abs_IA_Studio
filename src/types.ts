export interface AbsenteismoRow {
  nome: string;
  data: string; // stored as YYYY-MM-DD or DD/MM/YYYY
  horas: number;
  empresa: string;
  cidAtestado: string;
  descricaoCid: string;
  setor: string;
  tipo: 'atestado' | 'falta' | 'atraso' | string;
  sexo: string;
}

export interface HeadcountRow {
  competencia: string; // dd/mm/aaaa or mm/aaaa
  quantidade: number;
}

export interface DashboardFilters {
  anos: number[]; // e.g. [2024]
  meses: number[]; // 1-indexed: 1 = Jan, 12 = Dec
  setores: string[];
  sexos: string[];
  empresas: string[];
  tipos: string[];
  searchNome?: string;
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}
