import React, { useRef } from 'react';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import { FiPlus, FiTool } from 'react-icons/fi';

const mockMaintenance = [
  { id: 'MNT-101', asset: 'Enterprise Core Switch Cisco', type: 'Repairs', priority: 'High', date: '2026-07-13', assignee: 'Jane Cooper' },
  { id: 'MNT-102', asset: 'Dell UltraSharp 32" 4K Monitor', type: 'Calibration', priority: 'Medium', date: '2026-07-15', assignee: 'Alex Rivera' },
  { id: 'MNT-103', asset: 'Herman Miller Aeron Chair', type: 'Cleaning/Lubrication', priority: 'Low', date: '2026-07-20', assignee: 'Tom Bradley' },
];

export const Maintenance = () => {
  const containerRef = useRef(null);
  useGsapReveal(containerRef, { y: 20, duration: 0.8 });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="badge-danger">High</span>;
      case 'Medium':
        return <span className="badge-warning">Medium</span>;
      case 'Low':
        return <span className="badge-success">Low</span>;
      default:
        return <span className="badge">{priority}</span>;
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Asset Maintenance</h1>
          <p className="page-subtitle">Schedule, allocate, and monitor calibration and repairs for equipment.</p>
        </div>
        <div>
          <button className="btn-primary flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 shadow-orange-600/10 hover:shadow-orange-600/25 border-orange-200">
            <FiPlus className="h-4 w-4" />
            <span>Create Log</span>
          </button>
        </div>
      </div>

      {/* Maintenance Grid */}
      <div className="card overflow-hidden p-0 border border-slate-200">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Log ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Asset Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Service Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Priority</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mockMaintenance.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-650">{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{item.asset}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className="inline-flex items-center space-x-1.5">
                      <FiTool className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(item.priority)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">{item.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
