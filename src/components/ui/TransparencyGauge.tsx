import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TransparencyGaugeProps {
  score: number;
}

export function TransparencyGauge({ score }: TransparencyGaugeProps) {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (val: number) => {
    if (val >= 80) return '#10b981'; // Emerald
    if (val >= 60) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="relative w-full h-40 flex flex-col items-center justify-center">
      <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={65}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={10}
            >
              <Cell fill={getColor(score)} className="transition-all duration-1000 ease-out" />
              <Cell fill="#ffffff" className="opacity-5" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-4xl font-black tracking-tighter" style={{ color: getColor(score) }}>
          {score}%
        </span>
        <span className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-black mt-1">
          Efficiency
        </span>
      </div>
    </div>
  );
}
