import React, { useRef } from 'react';
import { useGsapReveal } from '../../hooks/useGsapReveal';
import { FiPlus, FiSearch } from 'react-icons/fi';

const mockAssets = [
  { id: 'AST-2026-001', name: 'MacBook Pro 16" M3 Max', category: 'Hardware', value: '$3,499', status: 'Active', location: 'HQ - Floor 3' },
  { id: 'AST-2026-002', name: 'Dell UltraSharp 32" 4K Monitor', category: 'Hardware', value: '$899', status: 'Active', location: 'HQ - Floor 3' },
  { id: 'AST-2026-003', name: 'Herman Miller Aeron Chair', category: 'Furniture', value: '$1,200', status: 'In Storage', location: 'Warehouse A' },
  { id: 'AST-2026-004', name: 'Enterprise Core Switch Cisco', category: 'Networking', value: '$12,500', status: 'In Maintenance', location: 'Server Room' },
  { id: 'AST-2026-005', name: 'Disposed ThinkPad L14 Gen 2', category: 'Hardware', value: '$1,100', status: 'Disposed', location: 'None' },
];

export const Assets = () => {
  const containerRef = useRef(null);
  useGsapReveal(containerRef, { y: 20, duration: 0.8 });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="badge-success">Active</span>;
      case 'In Storage':
        return <span className="badge-warning">In Storage</span>;
      case 'In Maintenance':
        return <span className="badge-maintenance">In Maintenance</span>;
      case 'Disposed':
        return <span className="badge-danger">Disposed</span>;
      default:
        return <span className="badge-info">{status}</span>;
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Enterprise Assets</h1>
          <p className="page-subtitle">Manage, track, and audit physical and digital corporate assets.</p>
        </div>
        <div>
          <button className="btn-primary flex items-center space-x-2">
            <FiPlus className="h-4 w-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card flex flex-col sm:flex-row gap-4 justify-between items-center py-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <FiSearch className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="input-field pl-9 py-1.5"
            placeholder="Search assets by tag, category..."
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select className="input-field py-1.5 text-xs w-full sm:w-auto">
            <option>All Statuses</option>
            <option>Active</option>
            <option>In Storage</option>
            <option>In Maintenance</option>
            <option>Disposed</option>
          </select>
          <select className="input-field py-1.5 text-xs w-full sm:w-auto">
            <option>All Categories</option>
            <option>Hardware</option>
            <option>Furniture</option>
            <option>Networking</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="card overflow-hidden p-0 border border-slate-200">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Asset ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Asset Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Cost/Value</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {mockAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-650">{asset.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{asset.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{asset.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(asset.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{asset.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Assets;
