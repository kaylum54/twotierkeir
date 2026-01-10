'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart, ComposedChart } from 'recharts';
import { Poll } from '@/lib/types';
import { format } from 'date-fns';

interface PollChartProps {
  polls: Poll[];
  height?: number;
  variant?: 'default' | 'terminal';
}

export default function PollChart({ polls, height = 300, variant = 'default' }: PollChartProps) {
  const data = polls.map((poll) => ({
    date: format(new Date(poll.date), 'MMM d'),
    approval: poll.approval_rating,
    disapproval: poll.disapproval_rating,
    pollster: poll.pollster,
  }));

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${
        variant === 'terminal' ? 'text-terminal-green font-mono' : 'text-secondary-500'
      }`}>
        {variant === 'terminal' ? '> NO DATA FEED AVAILABLE_' : 'No polling data available'}
      </div>
    );
  }

  // Terminal/retro style
  if (variant === 'terminal') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {/* Grid lines styled as terminal grid */}
          <defs>
            <pattern id="terminalGrid" patternUnits="userSpaceOnUse" width="20" height="20">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ff0020" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#terminalGrid)" />

          <XAxis
            dataKey="date"
            stroke="#00ff00"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: '#00ff00', strokeWidth: 1 }}
            tick={{ fill: '#00ff00', fontFamily: 'monospace' }}
          />
          <YAxis
            stroke="#00ff00"
            fontSize={10}
            tickLine={false}
            axisLine={{ stroke: '#00ff00', strokeWidth: 1 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: '#00ff00', fontFamily: 'monospace' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#001100',
              border: '1px solid #00ff00',
              borderRadius: '0',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#00ff00' }}
            itemStyle={{ color: '#00ff00' }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name === 'approval' ? 'APPROVAL' : 'DISAPPROVAL'
            ]}
            cursor={{ stroke: '#00ff0050' }}
          />
          <ReferenceLine y={50} stroke="#00ff0040" strokeDasharray="5 5" label={{ value: '50%', fill: '#00ff0060', fontSize: 10 }} />

          {/* Area fill for dramatic effect */}
          <Area
            type="monotone"
            dataKey="disapproval"
            fill="#ff000020"
            stroke="transparent"
          />

          <Line
            type="monotone"
            dataKey="approval"
            stroke="#00ff00"
            strokeWidth={2}
            dot={{ fill: '#00ff00', strokeWidth: 0, r: 2 }}
            activeDot={{ r: 4, fill: '#00ff00', stroke: '#001100', strokeWidth: 2 }}
            name="approval"
          />
          <Line
            type="monotone"
            dataKey="disapproval"
            stroke="#ff4444"
            strokeWidth={2}
            dot={{ fill: '#ff4444', strokeWidth: 0, r: 2 }}
            activeDot={{ r: 4, fill: '#ff4444', stroke: '#001100', strokeWidth: 2 }}
            name="disapproval"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Default style
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ color: '#94a3b8' }}
          formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
        />
        <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="approval"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: '#22c55e', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#22c55e' }}
          name="Approval"
        />
        <Line
          type="monotone"
          dataKey="disapproval"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: '#ef4444' }}
          name="Disapproval"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
