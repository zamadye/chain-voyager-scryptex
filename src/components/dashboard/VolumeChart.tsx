
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VolumeChart = () => {
  const data = [
    { time: '00:00', volume: 120000, chains: 6 },
    { time: '04:00', volume: 180000, chains: 7 },
    { time: '08:00', volume: 250000, chains: 8 },
    { time: '12:00', volume: 320000, chains: 8 },
    { time: '16:00', volume: 280000, chains: 7 },
    { time: '20:00', volume: 380000, chains: 9 },
    { time: '24:00', volume: 420000, chains: 8 }
  ];

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>24h Trading Volume</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">$2.4M</div>
            <div className="text-sm text-slate-400">+12.5% from yesterday</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#64748b" 
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f1f5f9'
                }}
                formatter={(value: any) => [`$${(value / 1000).toFixed(0)}k`, 'Volume']}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#volumeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeChart;
