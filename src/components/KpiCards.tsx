import React from 'react';
import { AbsenteismoRow, HeadcountRow } from '../types';
import { countBusinessDays, getPeriodDates } from '../lib/holidays';
import { Clock, Calendar, Users, Percent, ShieldAlert, BadgeAlert, AlertCircle, Briefcase } from 'lucide-react';

interface KpiCardsProps {
  filteredData: AbsenteismoRow[];
  headcountData: HeadcountRow[];
  selectedYears: number[];
  selectedMonths: number[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  filteredData,
  headcountData,
  selectedYears,
  selectedMonths,
}) => {
  // 1. Calculate Sum of hours by Type
  const atestadosHoras = filteredData
    .filter((r) => r.tipo === 'atestado')
    .reduce((sum, r) => sum + r.horas, 0);

  const faltasHoras = filteredData
    .filter((r) => r.tipo === 'falta')
    .reduce((sum, r) => sum + r.horas, 0);

  const atrasosHoras = filteredData
    .filter((r) => r.tipo === 'atraso')
    .reduce((sum, r) => sum + r.horas, 0);

  const totalAbsenteeismHoras = atestadosHoras + faltasHoras + atrasosHoras;

  // 2. Count Business Days for Selected Period
  const { startDate, endDate } = getPeriodDates(selectedYears, selectedMonths);
  const businessDays = countBusinessDays(startDate, endDate);

  // 3. Get Headcount (Quantidade de funcionários)
  const getHeadcount = (): { headcount: number; isAverage: boolean; count: number } => {
    if (headcountData.length === 0) return { headcount: 0, isAverage: false, count: 0 };

    const filtered = headcountData.filter((row) => {
      const parts = row.competencia.split('-');
      if (parts.length < 2) return false;
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]);

      const yearMatches = selectedYears.length === 0 || selectedYears.includes(y);
      const monthMatches = selectedMonths.length === 0 || selectedMonths.includes(m);
      return yearMatches && monthMatches;
    });

    if (filtered.length === 0) {
      // Fallback: search within years only
      const yearFiltered = headcountData.filter((row) => {
        const y = parseInt(row.competencia.split('-')[0]);
        return selectedYears.length === 0 || selectedYears.includes(y);
      });

      const fallbackList = yearFiltered.length > 0 ? yearFiltered : headcountData;
      // Sort to get the latest
      const sorted = [...fallbackList].sort((a, b) => b.competencia.localeCompare(a.competencia));
      return { headcount: sorted[0]?.quantidade || 0, isAverage: false, count: 1 };
    }

    if (filtered.length === 1) {
      return { headcount: filtered[0].quantidade, isAverage: false, count: 1 };
    }

    // Average over the selected months
    const sum = filtered.reduce((acc, curr) => acc + curr.quantidade, 0);
    return {
      headcount: Math.round(sum / filtered.length),
      isAverage: true,
      count: filtered.length,
    };
  };

  const { headcount, isAverage, count: headcountMonthsCount } = getHeadcount();

  // 4. Calculate Expected Work Hours & Actual Worked Hours
  // "total de horas trabalhadas (por dia são 8,8 horas trabalhadas) onde ele faz total de funcionários * total de dias trabalhados – total de atestados+faltas+atrasos em horas."
  const totalHorasDisponiveis = headcount * businessDays * 8.8;
  const totalHorasTrabalhadas = Math.max(0, totalHorasDisponiveis - totalAbsenteeismHoras);

  // Calculate absenteismo index
  const absenteismoRate = totalHorasDisponiveis > 0 
    ? (totalAbsenteeismHoras / totalHorasDisponiveis) * 100 
    : 0;

  const formatHours = (h: number) => {
    return h.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'h';
  };

  const formatDatesPT = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD ATESTADOS */}
        <div id="kpi-card-atestados" className="bg-[#171717] border border-[#262626] rounded-2xl p-5 shadow-lg hover:border-neutral-700 transition-all flex items-start gap-4">
          <div className="p-3 bg-[#262626] text-emerald-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Total de Atestados (h)</p>
            <h3 className="text-2xl font-bold text-emerald-400 font-mono mt-1">{formatHours(atestadosHoras)}</h3>
            <p className="text-xs text-[#a3a3a3] mt-1">Horas abonadas por atestado médico</p>
          </div>
        </div>

        {/* CARD FALTAS */}
        <div id="kpi-card-faltas" className="bg-[#171717] border border-[#262626] rounded-2xl p-5 shadow-lg hover:border-neutral-700 transition-all flex items-start gap-4">
          <div className="p-3 bg-[#262626] text-rose-500 rounded-xl">
            <BadgeAlert className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Total de Faltas (h)</p>
            <h3 className="text-2xl font-bold text-rose-500 font-mono mt-1">{formatHours(faltasHoras)}</h3>
            <p className="text-xs text-[#a3a3a3] mt-1">Horas perdidas por faltas injustificadas</p>
          </div>
        </div>

        {/* CARD ATRASOS */}
        <div id="kpi-card-atrasos" className="bg-[#171717] border border-[#262626] rounded-2xl p-5 shadow-lg hover:border-neutral-700 transition-all flex items-start gap-4">
          <div className="p-3 bg-[#262626] text-amber-400 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Total de Atrasos (h)</p>
            <h3 className="text-2xl font-bold text-amber-400 font-mono mt-1">{formatHours(atrasosHoras)}</h3>
            <p className="text-xs text-[#a3a3a3] mt-1">Horas de atraso acumuladas</p>
          </div>
        </div>

        {/* CARD TOTAL ABSENTEÍSMO */}
        <div id="kpi-card-total-absenteismo" className="bg-[#171717] border border-blue-500/30 bg-blue-500/5 rounded-2xl p-5 shadow-lg hover:border-blue-500/50 transition-all flex items-start gap-4 text-white">
          <div className="p-3 bg-blue-950/40 text-blue-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Total Horas Ausências</p>
            <h3 className="text-2xl font-bold text-blue-400 font-mono mt-1">{formatHours(totalAbsenteeismHoras)}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Percent className="w-3.5 h-3.5 text-[#737373]" />
              <p className="text-xs text-[#a3a3a3]">
                Taxa de Absenteísmo: <span className="font-semibold text-blue-400">{absenteismoRate.toFixed(2)}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* CARD DIAS ÚTEIS TRABALHADOS */}
        <div id="kpi-card-dias-uteis" className="bg-[#171717] border border-[#262626] rounded-2xl p-5 shadow-lg hover:border-neutral-700 transition-all flex items-start gap-4">
          <div className="p-3 bg-[#262626] text-indigo-400 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Dias Úteis no Período</p>
            <h3 className="text-2xl font-bold text-white font-mono mt-1">
              {businessDays} {businessDays === 1 ? 'Dia' : 'Dias'}
            </h3>
            <p className="text-[10px] text-[#a3a3a3] mt-1 truncate">
              {formatDatesPT(startDate)} até {formatDatesPT(endDate)} (sem FDS e Feriados)
            </p>
          </div>
        </div>

        {/* CARD QUANTIDADE FUNCIONÁRIOS */}
        <div id="kpi-card-funcionarios" className="bg-[#171717] border border-[#262626] rounded-2xl p-5 shadow-lg hover:border-neutral-700 transition-all flex items-start gap-4">
          <div className="p-3 bg-[#262626] text-cyan-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Quantidade de Funcionários</p>
            <h3 className="text-2xl font-bold text-white font-mono mt-1">
              {headcount} {headcount === 1 ? 'Colaborador' : 'Colaboradores'}
            </h3>
            <p className="text-xs text-[#a3a3a3] mt-1">
              {isAverage ? `Média ponderada (${headcountMonthsCount} meses)` : 'Competência selecionada'}
            </p>
          </div>
        </div>

        {/* CARD TOTAL HORAS TRABALHADAS */}
        <div id="kpi-card-horas-trabalhadas" className="bg-[#171717] border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-5 shadow-lg hover:border-emerald-500/50 transition-all flex items-start gap-4 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-emerald-950/40 text-emerald-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#737373] uppercase tracking-wider font-sans">Trabalhadas (h)</p>
            <h3 className="text-2xl font-bold text-emerald-500 font-mono mt-1">{formatHours(totalHorasTrabalhadas)}</h3>
            <p className="text-xs text-[#a3a3a3] mt-1">
              {formatHours(totalHorasDisponiveis)} esperadas - ausências
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
