import React, { useRef } from 'react';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiBox, FiActivity, FiAlertCircle } from 'react-icons/fi';

const data = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 5000 },
  { name: 'Mar', value: 6500 },
  { name: 'Apr', value: 5800 },
  { name: 'May', value: 8200 },
  { name: 'Jun', value: 9500 },
];

export const Dashboard = () => {
  const containerRef = useRef(null);
  useGsapReveal(containerRef, { y: 20, duration: 0.8 });

  const stats = [
    { title: 'Total Assets', value: '1,248', change: '+12% this month', icon: FiBox, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { title: 'Net Asset Value', value: '$4.2M', change: '+8.4% growth', icon: FiTrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Pending Transfers', value: '38', change: '12 urgent requests', icon: FiActivity, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Active Incidents', value: '7', change: '2 high severity', icon: FiAlertCircle, color: 'text-red-600 bg-red-50 border-red-100' },
  ];

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="page-title">Enterprise Dashboard</h1>
        <p className="page-subtitle">Overview of current corporate assets, active transfers, and ongoing maintenance activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card flex items-center space-x-4">
              <div className={`p-3 rounded-xl border ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{stat.value}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800">Asset Value Valuation Growth</h3>
            <p className="text-xs text-slate-500 mt-0.5">Historical growth of enterprise resource valuations over time</p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Realtime Analytics
          </span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                labelStyle={{ fontWeight: '600', color: '#1e293b' }}
              />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
