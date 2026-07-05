import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { AbsenteismoRow } from '../types';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';

interface ChartsProps {
  filteredData: AbsenteismoRow[];
}

const COLORS = [
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#64748b', // Slate
];

export const SectorPieChart: React.FC<ChartsProps> = ({ filteredData }) => {
  // Group atestado + falta + atraso hours by Sector
  const sectorMap = new Map<string, number>();

  filteredData.forEach((row) => {
    const totalHours = row.horas;
    if (totalHours <= 0) return;
    
    const sectorName = row.setor || 'Não Informado';
    const current = sectorMap.get(sectorName) || 0;
    sectorMap.set(sectorName, current + totalHours);
  });

  const rawChartData = Array.from(sectorMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // sort by highest hours first

  const totalAllSectors = rawChartData.reduce((sum, item) => sum + item.value, 0);

  // Group smaller sectors beyond the top 6 to prevent overlapping label clutter
  const maxSlices = 7;
  let chartData = rawChartData;
  if (rawChartData.length > maxSlices) {
    const topSectors = rawChartData.slice(0, maxSlices - 1);
    const otherSectors = rawChartData.slice(maxSlices - 1);
    const otherValue = otherSectors.reduce((sum, item) => sum + item.value, 0);
    chartData = [
      ...topSectors,
      { name: 'Outros Setores', value: otherValue }
    ];
  }

  // Custom label renderer for Recharts Pie that shows name, hours, and percentage
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    // Push the label slightly outside the pie
    const radius = outerRadius + 24;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Simple line boundary checks
    const textAnchor = x > cx ? 'start' : 'end';

    // Truncate very long sector names to prevent text overlapping
    const displayName = name.length > 15 ? `${name.substring(0, 13)}...` : name;

    return (
      <text
        x={x}
        y={y}
        fill="#a3a3a3"
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-[10px] sm:text-[11px] font-semibold font-sans"
      >
        {`${displayName}: ${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h (${(percent * 100).toFixed(1)}%)`}
      </text>
    );
  };

  return (
    <div className="bg-[#171717] border border-[#262626] rounded-2xl p-6 shadow-lg flex flex-col h-full min-h-[520px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#262626] text-indigo-400 rounded-lg">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-sans tracking-tight">Horas por Setor (%)</h3>
            <p className="text-xs text-[#737373]">Total acumulado de atestados, faltas e atrasos (horas)</p>
          </div>
        </div>
        <div className="bg-[#0a0a0b] border border-[#262626] rounded-lg px-3 py-1 text-right">
          <span className="text-[10px] text-[#737373] block font-medium uppercase tracking-wider">Total</span>
          <span className="text-sm font-bold text-white font-mono">
            {totalAllSectors.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h
          </span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[340px] relative">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-[#737373] gap-2 h-full py-12">
            <p className="text-sm font-medium">Nenhum dado de ausência disponível para o período</p>
            <p className="text-xs text-[#737373]">Tente ajustar os filtros do dashboard.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={{ stroke: '#404040', strokeWidth: 1 }}
                label={renderCustomizedLabel}
                outerRadius={105}
                innerRadius={65}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}h`, 'Horas Ausentes']}
                contentStyle={{
                  backgroundColor: '#171717',
                  border: '1px solid #262626',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                  fontSize: '12px',
                  color: '#e2e8f0',
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={40} 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: '#a3a3a3', paddingTop: '15px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
