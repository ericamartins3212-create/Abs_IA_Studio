import React, { useState } from 'react';
import { DashboardFilters } from '../types';
import { Search, RotateCcw, Filter, ChevronDown, Check, Calendar, Users, Briefcase } from 'lucide-react';

interface FiltersProps {
  filters: DashboardFilters;
  onChange: (newFilters: DashboardFilters) => void;
  availableOptions: {
    anos: number[];
    setores: string[];
    sexos: string[];
    empresas: string[];
    tipos: string[];
  };
  onReset: () => void;
}

export const MONTHS_PT = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' }
];

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onChange,
  availableOptions,
  onReset,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleToggleValue = <K extends keyof DashboardFilters>(
    key: K,
    value: any
  ) => {
    const currentValues = (filters[key] as any[]) || [];
    let newValues: any[];

    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }

    onChange({
      ...filters,
      [key]: newValues,
    });
  };

  const handleSelectAll = <K extends keyof DashboardFilters>(
    key: K,
    allValues: any[]
  ) => {
    onChange({
      ...filters,
      [key]: allValues,
    });
  };

  const handleClearAll = <K extends keyof DashboardFilters>(key: K) => {
    onChange({
      ...filters,
      [key]: [],
    });
  };

  return (
    <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#262626] text-indigo-400 rounded-lg">
            <Filter className="w-5 h-5" id="filter-icon" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white font-sans tracking-tight">Filtros Dinâmicos</h2>
            <p className="text-xs text-[#737373]">Refine a análise utilizando os critérios abaixo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-name-input"
              type="text"
              placeholder="Buscar colaborador..."
              value={filters.searchNome || ''}
              onChange={(e) => onChange({ ...filters, searchNome: e.target.value })}
              className="pl-9 pr-4 py-2 w-full sm:w-64 border border-[#262626] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-white bg-[#0a0a0b]/60"
            />
          </div>

          <button
            id="reset-filters-btn"
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#a3a3a3] hover:text-white hover:bg-[#262626] rounded-xl border border-[#262626] hover:border-indigo-500/30 font-medium transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* ANO */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#737373] mb-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" /> Ano
          </label>
          <button
            id="filter-year-dropdown"
            onClick={() => toggleDropdown('ano')}
            className="flex items-center justify-between w-full px-3 py-2.5 border border-[#262626] rounded-xl text-sm text-[#e2e8f0] hover:border-indigo-500/50 focus:outline-none transition-all bg-[#0a0a0b]/40 font-medium text-left"
          >
            <span className="truncate">
              {filters.anos.length === 0
                ? 'Todos'
                : filters.anos.length === 1
                ? filters.anos[0]
                : `${filters.anos.length} anos`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
          </button>

          {activeDropdown === 'ano' && (
            <div className="absolute z-30 w-full mt-2 bg-[#171717] border border-[#262626] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
              <div className="flex justify-between pb-2 border-b border-[#262626] mb-2 text-xs">
                <button
                  id="select-all-years"
                  onClick={() => handleSelectAll('anos', availableOptions.anos)}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Todos
                </button>
                <button
                  id="clear-all-years"
                  onClick={() => handleClearAll('anos')}
                  className="text-[#737373] hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {availableOptions.anos.map((year) => (
                  <button
                    key={year}
                    id={`year-option-${year}`}
                    onClick={() => handleToggleValue('anos', year)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors text-left"
                  >
                    <span>{year}</span>
                    {filters.anos.includes(year) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MÊS */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#737373] mb-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-indigo-400" /> Mês
          </label>
          <button
            id="filter-month-dropdown"
            onClick={() => toggleDropdown('mes')}
            className="flex items-center justify-between w-full px-3 py-2.5 border border-[#262626] rounded-xl text-sm text-[#e2e8f0] hover:border-indigo-500/50 focus:outline-none transition-all bg-[#0a0a0b]/40 font-medium text-left"
          >
            <span className="truncate">
              {filters.meses.length === 0
                ? 'Todos'
                : filters.meses.length === 1
                ? MONTHS_PT.find((m) => m.value === filters.meses[0])?.label
                : `${filters.meses.length} meses`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
          </button>

          {activeDropdown === 'mes' && (
            <div className="absolute z-30 w-56 mt-2 bg-[#171717] border border-[#262626] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
              <div className="flex justify-between pb-2 border-b border-[#262626] mb-2 text-xs">
                <button
                  id="select-all-months"
                  onClick={() => handleSelectAll('meses', MONTHS_PT.map((m) => m.value))}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Todos
                </button>
                <button
                  id="clear-all-months"
                  onClick={() => handleClearAll('meses')}
                  className="text-[#737373] hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {MONTHS_PT.map((m) => (
                  <button
                    key={m.value}
                    id={`month-option-${m.value}`}
                    onClick={() => handleToggleValue('meses', m.value)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors text-left"
                  >
                    <span>{m.label}</span>
                    {filters.meses.includes(m.value) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SETOR */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#737373] mb-1.5 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Setor
          </label>
          <button
            id="filter-sector-dropdown"
            onClick={() => toggleDropdown('setor')}
            className="flex items-center justify-between w-full px-3 py-2.5 border border-[#262626] rounded-xl text-sm text-[#e2e8f0] hover:border-indigo-500/50 focus:outline-none transition-all bg-[#0a0a0b]/40 font-medium text-left"
          >
            <span className="truncate">
              {filters.setores.length === 0
                ? 'Todos'
                : filters.setores.length === 1
                ? filters.setores[0]
                : `${filters.setores.length} setores`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
          </button>

          {activeDropdown === 'setor' && (
            <div className="absolute z-30 w-56 mt-2 bg-[#171717] border border-[#262626] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
              <div className="flex justify-between pb-2 border-b border-[#262626] mb-2 text-xs">
                <button
                  id="select-all-sectors"
                  onClick={() => handleSelectAll('setores', availableOptions.setores)}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Todos
                </button>
                <button
                  id="clear-all-sectors"
                  onClick={() => handleClearAll('setores')}
                  className="text-[#737373] hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {availableOptions.setores.map((setor) => (
                  <button
                    key={setor}
                    id={`sector-option-${setor.replace(/\s+/g, '-')}`}
                    onClick={() => handleToggleValue('setores', setor)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors text-left"
                  >
                    <span className="truncate">{setor || 'Não Informado'}</span>
                    {filters.setores.includes(setor) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SEXO */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#737373] mb-1.5 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Sexo
          </label>
          <button
            id="filter-gender-dropdown"
            onClick={() => toggleDropdown('sexo')}
            className="flex items-center justify-between w-full px-3 py-2.5 border border-[#262626] rounded-xl text-sm text-[#e2e8f0] hover:border-indigo-500/50 focus:outline-none transition-all bg-[#0a0a0b]/40 font-medium text-left"
          >
            <span className="truncate">
              {filters.sexos.length === 0
                ? 'Todos'
                : filters.sexos.length === 1
                ? filters.sexos[0] === 'M' ? 'Masculino' : filters.sexos[0] === 'F' ? 'Feminino' : filters.sexos[0]
                : `${filters.sexos.length} sexos`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
          </button>

          {activeDropdown === 'sexo' && (
            <div className="absolute z-30 w-full mt-2 bg-[#171717] border border-[#262626] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
              <div className="flex justify-between pb-2 border-b border-[#262626] mb-2 text-xs">
                <button
                  id="select-all-genders"
                  onClick={() => handleSelectAll('sexos', availableOptions.sexos)}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Todos
                </button>
                <button
                  id="clear-all-genders"
                  onClick={() => handleClearAll('sexos')}
                  className="text-[#737373] hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {availableOptions.sexos.map((sexo) => (
                  <button
                    key={sexo}
                    id={`gender-option-${sexo}`}
                    onClick={() => handleToggleValue('sexos', sexo)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors text-left"
                  >
                    <span>{sexo === 'M' ? 'Masculino (M)' : sexo === 'F' ? 'Feminino (F)' : sexo}</span>
                    {filters.sexos.includes(sexo) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* EMPRESA */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#737373] mb-1.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-indigo-400" /> Empresa
          </label>
          <button
            id="filter-company-dropdown"
            onClick={() => toggleDropdown('empresa')}
            className="flex items-center justify-between w-full px-3 py-2.5 border border-[#262626] rounded-xl text-sm text-[#e2e8f0] hover:border-indigo-500/50 focus:outline-none transition-all bg-[#0a0a0b]/40 font-medium text-left"
          >
            <span className="truncate">
              {filters.empresas.length === 0
                ? 'Todas'
                : filters.empresas.length === 1
                ? filters.empresas[0]
                : `${filters.empresas.length} empresas`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
          </button>

          {activeDropdown === 'empresa' && (
            <div className="absolute z-30 w-56 mt-2 bg-[#171717] border border-[#262626] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
              <div className="flex justify-between pb-2 border-b border-[#262626] mb-2 text-xs">
                <button
                  id="select-all-companies"
                  onClick={() => handleSelectAll('empresas', availableOptions.empresas)}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Todas
                </button>
                <button
                  id="clear-all-companies"
                  onClick={() => handleClearAll('empresas')}
                  className="text-[#737373] hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {availableOptions.empresas.map((empresa) => (
                  <button
                    key={empresa}
                    id={`company-option-${empresa.replace(/\s+/g, '-')}`}
                    onClick={() => handleToggleValue('empresas', empresa)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors text-left"
                  >
                    <span className="truncate">{empresa || 'Não Informada'}</span>
                    {filters.empresas.includes(empresa) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TIPO */}
        <div className="relative">
          <label className="block text-xs font-semibold text-[#737373] mb-1.5 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" /> Tipo
          </label>
          <button
            id="filter-type-dropdown"
            onClick={() => toggleDropdown('tipo')}
            className="flex items-center justify-between w-full px-3 py-2.5 border border-[#262626] rounded-xl text-sm text-[#e2e8f0] hover:border-indigo-500/50 focus:outline-none transition-all bg-[#0a0a0b]/40 font-medium text-left"
          >
            <span className="truncate uppercase">
              {filters.tipos.length === 0
                ? 'Todos'
                : filters.tipos.length === 1
                ? filters.tipos[0]
                : `${filters.tipos.length} tipos`}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373] shrink-0" />
          </button>

          {activeDropdown === 'tipo' && (
            <div className="absolute z-30 w-full mt-2 bg-[#171717] border border-[#262626] rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
              <div className="flex justify-between pb-2 border-b border-[#262626] mb-2 text-xs">
                <button
                  id="select-all-types"
                  onClick={() => handleSelectAll('tipos', availableOptions.tipos)}
                  className="text-indigo-400 font-medium hover:underline"
                >
                  Todos
                </button>
                <button
                  id="clear-all-types"
                  onClick={() => handleClearAll('tipos')}
                  className="text-[#737373] hover:text-white"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {availableOptions.tipos.map((tipo) => (
                  <button
                    key={tipo}
                    id={`type-option-${tipo}`}
                    onClick={() => handleToggleValue('tipos', tipo)}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 text-xs text-[#a3a3a3] rounded-lg hover:bg-[#262626] hover:text-white transition-colors text-left"
                  >
                    <span className="capitalize">{tipo}</span>
                    {filters.tipos.includes(tipo) && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CLICK OUTSIDE DROPDOWNS DETECTION BACKDROP */}
      {activeDropdown && (
        <div
          id="dropdown-backdrop"
          className="fixed inset-0 z-20"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};
