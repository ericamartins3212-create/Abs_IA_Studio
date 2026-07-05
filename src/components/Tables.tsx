import React, { useState, useMemo } from 'react';
import { AbsenteismoRow } from '../types';
import { Search, ChevronDown, ChevronUp, ArrowUpDown, ShieldAlert, BadgeAlert, AlertCircle, Calendar, HelpCircle } from 'lucide-react';

interface TablesProps {
  filteredData: AbsenteismoRow[];
}

export const Tables: React.FC<TablesProps> = ({ filteredData }) => {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'ocorrencias'>('colaboradores');

  // PAGINATION AND SEARCH FOR TABLE 1 (Colaboradores)
  const [colabSearch, setColabSearch] = useState('');
  const [colabSortField, setColabSortField] = useState<'nome' | 'setor' | 'horas'>('horas');
  const [colabSortDirection, setColabSortDirection] = useState<'asc' | 'desc'>('desc');
  const [colabPage, setColabPage] = useState(1);
  const colabPageSize = 8;

  // PAGINATION AND SEARCH FOR TABLE 2 (Ocorrencias)
  const [ocSearch, setOcSearch] = useState('');
  const [ocSortField, setOcSortField] = useState<'nome' | 'data' | 'horas' | 'tipo' | 'setor'>('data');
  const [ocSortDirection, setOcSortDirection] = useState<'asc' | 'desc'>('desc');
  const [ocPage, setOcPage] = useState(1);
  const ocPageSize = 8;

  // --- PROCESSING TABLE 1: COLABORADORES (Grouped by name + sector, summing hours) ---
  const colaboradoresData = useMemo(() => {
    const map = new Map<string, { nome: string; setor: string; horas: number }>();
    
    filteredData.forEach((row) => {
      const key = `${row.nome.toLowerCase().trim()}_${row.setor.toLowerCase().trim()}`;
      const existing = map.get(key);
      if (existing) {
        existing.horas += row.horas;
      } else {
        map.set(key, {
          nome: row.nome,
          setor: row.setor || 'Não Informado',
          horas: row.horas,
        });
      }
    });

    return Array.from(map.values());
  }, [filteredData]);

  const sortedAndFilteredColab = useMemo(() => {
    let result = [...colaboradoresData];

    // Search filter
    if (colabSearch.trim() !== '') {
      const searchLower = colabSearch.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.nome.toLowerCase().includes(searchLower) ||
          c.setor.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[colabSortField];
      let valB: any = b[colabSortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return colabSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return colabSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [colaboradoresData, colabSearch, colabSortField, colabSortDirection]);

  // Paginated Collaborators
  const paginatedColab = useMemo(() => {
    const startIndex = (colabPage - 1) * colabPageSize;
    return sortedAndFilteredColab.slice(startIndex, startIndex + colabPageSize);
  }, [sortedAndFilteredColab, colabPage]);

  const totalColabPages = Math.ceil(sortedAndFilteredColab.length / colabPageSize) || 1;


  // --- PROCESSING TABLE 2: OCORRÊNCIAS (Individual rows) ---
  const sortedAndFilteredOc = useMemo(() => {
    let result = [...filteredData];

    // Search filter
    if (ocSearch.trim() !== '') {
      const searchLower = ocSearch.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.nome.toLowerCase().includes(searchLower) ||
          o.setor.toLowerCase().includes(searchLower) ||
          o.tipo.toLowerCase().includes(searchLower) ||
          (o.cidAtestado && o.cidAtestado.toLowerCase().includes(searchLower)) ||
          (o.descricaoCid && o.descricaoCid.toLowerCase().includes(searchLower))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let valA: any = a[ocSortField];
      let valB: any = b[ocSortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return ocSortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return ocSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [filteredData, ocSearch, ocSortField, ocSortDirection]);

  // Paginated Ocurrences
  const paginatedOc = useMemo(() => {
    const startIndex = (ocPage - 1) * ocPageSize;
    return sortedAndFilteredOc.slice(startIndex, startIndex + ocPageSize);
  }, [sortedAndFilteredOc, ocPage]);

  const totalOcPages = Math.ceil(sortedAndFilteredOc.length / ocPageSize) || 1;


  // --- HELPERS ---
  const handleColabSort = (field: 'nome' | 'setor' | 'horas') => {
    if (colabSortField === field) {
      setColabSortDirection(colabSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setColabSortField(field);
      setColabSortDirection('desc'); // Default to highest hours or reverse alphabetical
    }
    setColabPage(1);
  };

  const handleOcSort = (field: 'nome' | 'data' | 'horas' | 'tipo' | 'setor') => {
    if (ocSortField === field) {
      setOcSortDirection(ocSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOcSortField(field);
      setOcSortDirection(field === 'data' || field === 'horas' ? 'desc' : 'asc');
    }
    setOcPage(1);
  };

  const formatDatePT = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const renderTipoPill = (tipo: string) => {
    const normalized = tipo.toLowerCase();
    if (normalized === 'atestado') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-rose-950/30 text-rose-400 border border-rose-900/30">
          <ShieldAlert className="w-3 h-3" />
          Atestado
        </span>
      );
    }
    if (normalized === 'falta') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-950/30 text-amber-400 border border-amber-900/30">
          <BadgeAlert className="w-3 h-3" />
          Falta
        </span>
      );
    }
    if (normalized === 'atraso') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-950/30 text-orange-400 border border-orange-900/30">
          <AlertCircle className="w-3 h-3" />
          Atraso
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300">
        {tipo}
      </span>
    );
  };

  return (
    <div className="bg-[#171717] border border-[#262626] rounded-2xl shadow-lg overflow-hidden mb-6">
      {/* TABS HEADER */}
      <div className="flex border-b border-[#262626] bg-[#0a0a0b]/50 p-1.5 gap-2">
        <button
          id="tab-colaboradores"
          onClick={() => setActiveTab('colaboradores')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'colaboradores'
              ? 'bg-[#262626] text-indigo-400 shadow-sm border border-[#404040]/30'
              : 'text-[#737373] hover:text-white hover:bg-[#262626]/30'
          }`}
        >
          Resumo por Colaborador
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'colaboradores' ? 'bg-indigo-950 text-indigo-400' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {sortedAndFilteredColab.length}
          </span>
        </button>
        <button
          id="tab-ocorrencias"
          onClick={() => setActiveTab('ocorrencias')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'ocorrencias'
              ? 'bg-[#262626] text-indigo-400 shadow-sm border border-[#404040]/30'
              : 'text-[#737373] hover:text-white hover:bg-[#262626]/30'
          }`}
        >
          Lista de Ocorrências
          <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-bold ${
            activeTab === 'ocorrencias' ? 'bg-indigo-950 text-indigo-400' : 'bg-neutral-800 text-neutral-400'
          }`}>
            {sortedAndFilteredOc.length}
          </span>
        </button>
      </div>

      {/* TAB 1: COLABORADORES */}
      {activeTab === 'colaboradores' && (
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Totalizadores de Ausência</h3>
              <p className="text-xs text-[#737373]">Total acumulado de horas por colaborador (Soma de atestados, faltas e atrasos)</p>
            </div>
            {/* Search filter for this table */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="colab-table-search"
                type="text"
                placeholder="Filtrar colaborador ou setor..."
                value={colabSearch}
                onChange={(e) => {
                  setColabSearch(e.target.value);
                  setColabPage(1);
                }}
                className="pl-9 pr-4 py-1.5 w-full sm:w-60 bg-[#0a0a0b] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-[#262626] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0a0b] text-[#737373] text-xs font-semibold border-b border-[#262626]">
                  <th className="py-3 px-4">
                    <button
                      id="sort-colab-nome"
                      onClick={() => handleColabSort('nome')}
                      className="flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Colaborador
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      id="sort-colab-setor"
                      onClick={() => handleColabSort('setor')}
                      className="flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Setor
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      id="sort-colab-horas"
                      onClick={() => handleColabSort('horas')}
                      className="ml-auto flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Total Ausente (Horas)
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="text-neutral-300 text-xs divide-y divide-[#262626]">
                {paginatedColab.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-[#737373]">
                      Nenhum registro encontrado para a busca atual.
                    </td>
                  </tr>
                ) : (
                  paginatedColab.map((colab, index) => (
                    <tr key={`${colab.nome}-${colab.setor}-${index}`} className="hover:bg-[#262626]/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{colab.nome}</td>
                      <td className="py-3 px-4 text-[#a3a3a3]">{colab.setor}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {colab.horas.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalColabPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-[#737373]">
                Mostrando <span className="font-semibold text-[#a3a3a3]">{Math.min(sortedAndFilteredColab.length, (colabPage - 1) * colabPageSize + 1)}</span> a{' '}
                <span className="font-semibold text-[#a3a3a3]">{Math.min(sortedAndFilteredColab.length, colabPage * colabPageSize)}</span> de{' '}
                <span className="font-semibold text-[#a3a3a3]">{sortedAndFilteredColab.length}</span> colaboradores
              </span>
              <div className="flex gap-1.5">
                <button
                  id="colab-prev-page"
                  disabled={colabPage === 1}
                  onClick={() => setColabPage(colabPage - 1)}
                  className="px-3 py-1.5 border border-[#262626] rounded-lg text-[#a3a3a3] hover:bg-[#262626] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-medium"
                >
                  Anterior
                </button>
                <div className="flex items-center px-3 font-semibold text-[#a3a3a3]">
                  {colabPage} de {totalColabPages}
                </div>
                <button
                  id="colab-next-page"
                  disabled={colabPage === totalColabPages}
                  onClick={() => setColabPage(colabPage + 1)}
                  className="px-3 py-1.5 border border-[#262626] rounded-lg text-[#a3a3a3] hover:bg-[#262626] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-medium"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OCORRÊNCIAS */}
      {activeTab === 'ocorrencias' && (
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Registro Individual de Ocorrências</h3>
              <p className="text-xs text-[#737373]">Todas as ausências registradas no período aplicados os filtros gerais</p>
            </div>
            {/* Search filter for this table */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="oc-table-search"
                type="text"
                placeholder="Filtrar por nome, CID, tipo..."
                value={ocSearch}
                onChange={(e) => {
                  setOcSearch(e.target.value);
                  setOcPage(1);
                }}
                className="pl-9 pr-4 py-1.5 w-full sm:w-60 bg-[#0a0a0b] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-[#262626] rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0a0b] text-[#737373] text-xs font-semibold border-b border-[#262626]">
                  <th className="py-3 px-4">
                    <button
                      id="sort-oc-nome"
                      onClick={() => handleOcSort('nome')}
                      className="flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Colaborador
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      id="sort-oc-data"
                      onClick={() => handleOcSort('data')}
                      className="flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Data
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      id="sort-oc-horas"
                      onClick={() => handleOcSort('horas')}
                      className="ml-auto flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Horas
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      id="sort-oc-tipo"
                      onClick={() => handleOcSort('tipo')}
                      className="flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Tipo
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4">
                    <button
                      id="sort-oc-setor"
                      onClick={() => handleOcSort('setor')}
                      className="flex items-center gap-1.5 hover:text-indigo-400 focus:outline-none cursor-pointer text-[#737373]"
                    >
                      Setor
                      <ArrowUpDown className="w-3.5 h-3.5 shrink-0" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-[#737373]">CID / Detalhes</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300 text-xs divide-y divide-[#262626]">
                {paginatedOc.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#737373]">
                      Nenhum registro encontrado para a busca atual.
                    </td>
                  </tr>
                ) : (
                  paginatedOc.map((oc, index) => (
                    <tr key={`${oc.nome}-${oc.data}-${oc.horas}-${index}`} className="hover:bg-[#262626]/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{oc.nome}</td>
                      <td className="py-3 px-4 font-mono text-[#a3a3a3]">{formatDatePT(oc.data)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {oc.horas.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}h
                      </td>
                      <td className="py-3 px-4">{renderTipoPill(oc.tipo)}</td>
                      <td className="py-3 px-4 text-[#a3a3a3]">{oc.setor}</td>
                      <td className="py-3 px-4">
                        {oc.cidAtestado ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-neutral-200">{oc.cidAtestado}</span>
                            <span className="text-[10px] text-[#737373] max-w-[160px] truncate" title={oc.descricaoCid}>
                              {oc.descricaoCid}
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalOcPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-xs">
              <span className="text-[#737373]">
                Mostrando <span className="font-semibold text-[#a3a3a3]">{Math.min(sortedAndFilteredOc.length, (ocPage - 1) * ocPageSize + 1)}</span> a{' '}
                <span className="font-semibold text-[#a3a3a3]">{Math.min(sortedAndFilteredOc.length, ocPage * ocPageSize)}</span> de{' '}
                <span className="font-semibold text-[#a3a3a3]">{sortedAndFilteredOc.length}</span> ocorrências
              </span>
              <div className="flex gap-1.5">
                <button
                  id="oc-prev-page"
                  disabled={ocPage === 1}
                  onClick={() => setOcPage(ocPage - 1)}
                  className="px-3 py-1.5 border border-[#262626] rounded-lg text-[#a3a3a3] hover:bg-[#262626] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-medium"
                >
                  Anterior
                </button>
                <div className="flex items-center px-3 font-semibold text-[#a3a3a3]">
                  {ocPage} de {totalOcPages}
                </div>
                <button
                  id="oc-next-page"
                  disabled={ocPage === totalOcPages}
                  onClick={() => setOcPage(ocPage + 1)}
                  className="px-3 py-1.5 border border-[#262626] rounded-lg text-[#a3a3a3] hover:bg-[#262626] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer font-medium"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
