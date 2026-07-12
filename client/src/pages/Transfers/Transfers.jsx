import React, { useRef } from 'react';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import { FiPlus, FiArrowRight } from 'react-icons/fi';

const mockTransfers = [
  { id: 'TRF-902', asset: 'MacBook Pro 16" M3 Max', source: 'Warehouse A', destination: 'HQ - Floor 3', date: '2026-07-10', status: 'Approved' },
  { id: 'TRF-903', asset: 'Cisco Core Switch', source: 'Warehouse B', destination: 'Server Room', date: '2026-07-11', status: 'Pending' },
  { id: 'TRF-904', asset: 'Herman Miller Aeron Chair', source: 'HQ - Floor 2', destination: 'Warehouse A', date: '2026-07-12', status: 'Completed' },
];

export const Transfers = () => {
  const containerRef = useRef(null);
  useGsapReveal(containerRef, { y: 20, duration: 0.8 });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge-success">Completed</span>;
      case 'Pending':
        return <span className="badge-warning">Pending</span>;
      case 'Approved':
        return <span className="badge-info">Approved</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Resource Transfers</h1>
          <p className="page-subtitle">Initiate and authorize movement of enterprise hardware and equipment between locations.</p>
        </div>
        <div>
          <button className="btn-primary flex items-center space-x-2">
            <FiPlus className="h-4 w-4" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>

      {/* Transfers List */}
      <div className="card overflow-hidden p-0 border border-slate-200">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Transfer ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Asset</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Routing</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mockTransfers.map((trf) => (
                <tr key={trf.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-650">{trf.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{trf.asset}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center space-x-2">
                      <span>{trf.source}</span>
                      <FiArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span>{trf.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{trf.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(trf.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
