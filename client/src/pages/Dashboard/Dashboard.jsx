import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchDashboardStats } from '../../features/dashboard/dashboardThunks';
import {
  selectDashboardStats, selectDashboardLoading, selectDashboardRefreshing,
  selectDashboardError, selectDashboardLastUpdated,
} from '../../features/dashboard/dashboardSelectors';
import { selectCurrentUser } from '../../features/auth/authSelectors';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { RefreshButton } from '../../components/ui/RefreshButton';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { EmptyState } from '../../components/common/EmptyState';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FiBox, FiCheckCircle, FiUserCheck, FiTool, FiShuffle, FiAlertTriangle, FiPlus, FiEye,
} from 'react-icons/fi';
import gsap from 'gsap';

export const Dashboard = () => {
  const dispatch     = useAppDispatch();
  const navigate     = useNavigate();
  const stats        = useAppSelector(selectDashboardStats);
  const loading      = useAppSelector(selectDashboardLoading);
  const refreshing   = useAppSelector(selectDashboardRefreshing);
  const error        = useAppSelector(selectDashboardError);
  const lastUpdated  = useAppSelector(selectDashboardLastUpdated);
  const currentUser  = useAppSelector(selectCurrentUser);
  const hasAnimated  = useRef(false);

  useEffect(() => {
    if (!stats) dispatch(fetchDashboardStats());
  }, [dispatch, stats]);

  useEffect(() => {
    if (stats && !loading && !hasAnimated.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { hasAnimated.current = true; return; }
      const ctx = gsap.context(() => {
        gsap.fromTo('.kpi-card', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power1.out' });
        gsap.fromTo(['.chart-panel', '.sidebar-panel'], { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.2, ease: 'power2.out' });
      });
      hasAnimated.current = true;
      return () => ctx.revert();
    }
  }, [stats, loading]);

  if (loading && !stats) return <DashboardSkeleton />;
  if (error && !stats) return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Real-time resources overview" />
      <ErrorMessage message={`Error loading dashboard: ${error}`} onRetry={() => dispatch(fetchDashboardStats())} />
    </div>
  );
  if (!stats) return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Real-time resources overview" />
      <EmptyState title="No data" description="Dashboard statistics could not be loaded." actionLabel="Try Again" onAction={() => dispatch(fetchDashboardStats())} />
    </div>
  );

  const total = stats.totalAssets || 0;
  const available = stats.availableAssets || 0;
  const allocated = stats.allocatedAssets || 0;
  const maintenance = stats.underMaintenance || 0;
  const other = Math.max(0, total - (available + allocated + maintenance));

  const chartData = [
    { name: 'Available', value: available, color: '#10b981' },
    { name: 'Allocated', value: allocated, color: '#4f46e5' },
    { name: 'Maintenance', value: maintenance, color: '#f97316' },
    { name: 'Other', value: other, color: '#cbd5e1' },
  ].filter((d) => d.value > 0);

  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const quickActions = isManagement
    ? [
        { label: 'Register Asset', path: '/assets', icon: FiPlus, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
        { label: 'Review Transfers', path: '/transfers', icon: FiShuffle, color: 'bg-slate-800 hover:bg-slate-900 text-white' },
        { label: 'Review Maintenance', path: '/maintenance', icon: FiTool, color: 'bg-orange-600 hover:bg-orange-700 text-white' },
      ]
    : [
        { label: 'View Assets', path: '/assets', icon: FiEye, color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
        { label: 'My Transfers', path: '/transfers', icon: FiShuffle, color: 'bg-slate-800 hover:bg-slate-900 text-white' },
        { label: 'Raise Maintenance', path: '/maintenance', icon: FiTool, color: 'bg-orange-600 hover:bg-orange-700 text-white' },
      ];

  const kpis = [
    { id: 'total', title: 'Total Assets', value: stats.totalAssets, icon: FiBox, cls: 'text-indigo-600 bg-indigo-50 border-indigo-100', desc: 'Registered items' },
    { id: 'available', title: 'Available', value: stats.availableAssets, icon: FiCheckCircle, cls: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Ready to allocate' },
    { id: 'allocated', title: 'Allocated', value: stats.allocatedAssets, icon: FiUserCheck, cls: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Assigned to staff' },
    { id: 'maintenance', title: 'Maintenance', value: stats.underMaintenance, icon: FiTool, cls: 'text-orange-600 bg-orange-50 border-orange-100', desc: 'In service bay' },
    { id: 'transfers', title: 'Pending Transfers', value: stats.pendingTransfers, icon: FiShuffle, cls: 'text-amber-600 bg-amber-50 border-amber-100', desc: 'Active routings' },
    { id: 'overdue', title: 'Overdue', value: stats.overdueReturns, icon: FiAlertTriangle, cls: 'text-red-600 bg-red-50 border-red-100', desc: 'Needs collection' },
  ];

  const recentActivities = stats.recentActivities || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time enterprise statistics and resource hub"
        actions={<RefreshButton onClick={() => dispatch(fetchDashboardStats())} refreshing={refreshing} lastUpdated={lastUpdated} />}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.id} id={`kpi-${kpi.id}`} className="kpi-card card flex items-center space-x-4 p-5">
              <div className={`p-3 rounded-xl border flex-shrink-0 ${kpi.cls}`}><Icon className="h-6 w-6" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">{kpi.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">{kpi.value ?? '—'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{kpi.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="chart-panel lg:col-span-2">
          <SectionCard title="Resource Allocation Ratio" subtitle="Breakdown of current asset deployment statuses">
            <div className="flex flex-col sm:flex-row items-center justify-around py-4 gap-6">
              <div className="h-60 w-60 relative flex items-center justify-center flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value">
                      {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-slate-800">{total}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total</p>
                </div>
              </div>
              <div className="space-y-3 w-full max-w-[240px]">
                {chartData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-2.5">
                      <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="sidebar-panel space-y-6">
          <SectionCard title="Quick Operations" subtitle="Frequently used workflows">
            <div className="grid grid-cols-1 gap-2.5">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button key={i} onClick={() => navigate(action.path)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer shadow-sm ${action.color}`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard title="Recent Activities" subtitle="Latest system updates">
            {recentActivities.length > 0 ? (
              <ul className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {recentActivities.map((act, i) => (
                  <li key={i} className="flex items-start space-x-2.5">
                    <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <FiBox className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-800">{act.message}</p>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState className="py-4" title="No recent activity" description="Activity logs will appear here once changes are recorded." />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
