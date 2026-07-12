import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMaintenance,
  createMaintenance,
  approveMaintenance,
  startMaintenance,
  resolveMaintenance,
} from '../../features/maintenance/maintenanceThunks';
import { fetchAssets } from '../../features/assets/assetsThunks';
import {
  selectFilteredMaintenance,
  selectMaintenanceLoading,
  selectMaintenanceSubmitting,
  selectMaintenanceActionLoadingId,
  selectMaintenanceError,
  selectMaintenanceFilters,
} from '../../features/maintenance/maintenanceSelectors';
import { selectAllAssets } from '../../features/assets/assetsSelectors';
import { setMaintenanceFilter, clearMaintenanceFilters } from '../../features/maintenance/maintenanceSlice';
import { selectCurrentUser } from '../../features/auth/authSelectors';

import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { getStatusClass } from '../../utils/statusHelpers';
import { getObjectId } from '../../utils/idHelpers';

import { FiPlus, FiTool, FiX, FiCheck, FiPlay, FiCheckCircle, FiSearch, FiFilter, FiAlertTriangle } from 'react-icons/fi';
import gsap from 'gsap';

export const Maintenance = () => {
  const dispatch = useAppDispatch();

  const maintenanceList = useAppSelector(selectFilteredMaintenance);
  const loading = useAppSelector(selectMaintenanceLoading);
  const submitting = useAppSelector(selectMaintenanceSubmitting);
  const actionLoadingId = useAppSelector(selectMaintenanceActionLoadingId);
  const error = useAppSelector(selectMaintenanceError);
  const filters = useAppSelector(selectMaintenanceFilters);
  const assets = useAppSelector(selectAllAssets);
  const currentUser = useAppSelector(selectCurrentUser);

  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [showLogModal, setShowLogModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [formError, setFormError] = useState('');

  const listRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const loadData = useCallback(() => {
    dispatch(fetchMaintenance());
    dispatch(fetchAssets());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // GSAP animation for initial list reveal
  useEffect(() => {
    if (!loading && !error && maintenanceList.length > 0 && !hasAnimatedRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        hasAnimatedRef.current = true;
        return;
      }
      const ctx = gsap.context(() => {
        gsap.fromTo('.maintenance-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power1.out' }
        );
      }, listRef);
      hasAnimatedRef.current = true;
      return () => ctx.revert();
    }
  }, [loading, error, maintenanceList.length]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowLogModal(false);
        setShowResolveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFilterChange = (field, value) => {
    dispatch(setMaintenanceFilter({ [field]: value }));
    hasAnimatedRef.current = false;
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedAssetId || !issueDescription.trim()) {
      setFormError('Please select an asset and write an issue description.');
      return;
    }

    const payload = {
      asset: selectedAssetId,
      issueDescription: issueDescription.trim(),
      priority,
    };

    const result = await dispatch(createMaintenance(payload));
    if (createMaintenance.fulfilled.match(result)) {
      setShowLogModal(false);
      setSelectedAssetId('');
      setIssueDescription('');
      setPriority('Medium');
      loadData();
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Approve this asset for maintenance?')) {
      const result = await dispatch(approveMaintenance(id));
      if (approveMaintenance.fulfilled.match(result)) loadData();
    }
  };

  const handleStart = async (id) => {
    if (window.confirm('Start repair operations on this asset?')) {
      const result = await dispatch(startMaintenance(id));
      if (startMaintenance.fulfilled.match(result)) loadData();
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) return;

    const result = await dispatch(resolveMaintenance({ id: showResolveModal, resolutionNotes: resolutionNotes.trim() }));
    if (resolveMaintenance.fulfilled.match(result)) {
      setShowResolveModal(null);
      setResolutionNotes('');
      loadData();
    }
  };

  const getPriorityBadgeClass = (p) => {
    switch (p) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Maintenance"
        subtitle="Schedule, log, and resolve hardware equipment calibration and repairs"
        actions={
          <button
            onClick={() => {
              setFormError('');
              setShowLogModal(true);
            }}
            className="btn-primary flex items-center space-x-2 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Create Log</span>
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="card py-4 px-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search logs, tag, issue…"
            className="input-field pl-9 py-1.5 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="input-field py-1.5 text-xs w-auto focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          {/* Priority */}
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="input-field py-1.5 text-xs w-auto focus:ring-1 focus:ring-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-16 bg-white" />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorMessage message={`Failed to load maintenance logs: ${error}`} onRetry={loadData} />
      )}

      {!loading && !error && maintenanceList.length === 0 && (
        <EmptyState
          icon={FiTool}
          title="No maintenance logged"
          description="There are no active or historic equipment tickets matching your filters."
        />
      )}

      {/* Main List Grid */}
      {!loading && !error && maintenanceList.length > 0 && (
        <div ref={listRef} className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block card overflow-hidden p-0 border border-slate-200">
            <table className="data-table">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Asset</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Issue Description</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Priority</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Requester</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Date</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  {isManagement && <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Workflow</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {maintenanceList.map((item) => {
                  const id = getObjectId(item);
                  return (
                    <tr key={id} className="maintenance-row hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-850 text-sm">{item.asset?.name || 'Unknown Asset'}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.asset?.assetTag || '—'}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-650 max-w-xs truncate" title={item.issueDescription}>
                        {item.issueDescription}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border font-semibold ${getPriorityBadgeClass(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-650">{item.requestedBy?.name || item.requestedBy || 'System'}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={getStatusClass(item.status)}>{item.status}</span>
                      </td>
                      {isManagement && (
                        <td className="px-5 py-4 text-right">
                          <WorkflowActions
                            item={item}
                            loadingId={actionLoadingId}
                            onApprove={() => handleApprove(id)}
                            onStart={() => handleStart(id)}
                            onResolve={() => setShowResolveModal(id)}
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {maintenanceList.map((item) => {
              const id = getObjectId(item);
              return (
                <div key={id} className="maintenance-row card p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-850">{item.asset?.name || 'Unknown Asset'}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.asset?.assetTag || '—'}</p>
                    </div>
                    <span className={getStatusClass(item.status)}>{item.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">"{item.issueDescription}"</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border font-semibold ${getPriorityBadgeClass(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-slate-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                  {isManagement && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <WorkflowActions
                        item={item}
                        loadingId={actionLoadingId}
                        onApprove={() => handleApprove(id)}
                        onStart={() => handleStart(id)}
                        onResolve={() => setShowResolveModal(id)}
                        btnClass="flex-1 text-center justify-center py-1.5"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowLogModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                  <FiTool className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Log</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Submit equipment for repair or service</p>
                </div>
              </div>
              <button onClick={() => setShowLogModal(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-xs text-red-750 flex items-start space-x-2">
                  <FiAlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Asset <span className="text-red-500">*</span></label>
                <select
                  required
                  value={selectedAssetId}
                  onChange={(e) => {
                    setSelectedAssetId(e.target.value);
                    setFormError('');
                  }}
                  className="input-field"
                  disabled={submitting}
                >
                  <option value="">Select asset to log…</option>
                  {assets.map((a) => (
                    <option key={getObjectId(a)} value={getObjectId(a)}>
                      {a.name} ({a.assetTag || 'No Tag'}) - {a.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field"
                  disabled={submitting}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Issue Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows="4"
                  value={issueDescription}
                  onChange={(e) => {
                    setIssueDescription(e.target.value);
                    setFormError('');
                  }}
                  placeholder="Describe the failure, calibration error or required maintenance..."
                  className="input-field resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowLogModal(false)} className="btn-secondary cursor-pointer" disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary cursor-pointer bg-orange-600 hover:bg-orange-700 shadow-orange-600/10 hover:shadow-orange-600/20 active:scale-95" disabled={submitting || !selectedAssetId || !issueDescription.trim()}>
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowResolveModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Resolve Maintenance</h3>
              <button onClick={() => setShowResolveModal(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Resolution Notes <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows="4"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Provide resolution remarks (parts replaced, tests run, etc.)..."
                  className="input-field resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-1">
                <button type="button" onClick={() => setShowResolveModal(null)} className="btn-secondary cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary cursor-pointer bg-emerald-650 hover:bg-emerald-700 shadow-emerald-600/10 hover:shadow-emerald-600/20" disabled={!resolutionNotes.trim()}>
                  Confirm Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/** Action controls for current workflow phase: Pending -> Approved -> In Progress -> Resolved */
const WorkflowActions = ({ item, loadingId, onApprove, onStart, onResolve, btnClass = '' }) => {
  const id = getObjectId(item);
  const loading = loadingId === id;

  switch (item.status) {
    case 'Pending':
      return (
        <button
          onClick={onApprove}
          disabled={loading}
          className={`btn-secondary text-indigo-650 border-indigo-200 py-1.5 px-3 flex items-center space-x-1 hover:bg-indigo-50 cursor-pointer ${btnClass}`}
        >
          <FiCheck className="h-4 w-4" />
          <span className="text-xs font-bold">Approve</span>
        </button>
      );
    case 'Approved':
      return (
        <button
          onClick={onStart}
          disabled={loading}
          className={`btn-secondary text-amber-650 border-amber-200 py-1.5 px-3 flex items-center space-x-1 hover:bg-amber-50 cursor-pointer ${btnClass}`}
        >
          <FiPlay className="h-4 w-4" />
          <span className="text-xs font-bold">Start Service</span>
        </button>
      );
    case 'In Progress':
      return (
        <button
          onClick={onResolve}
          disabled={loading}
          className={`btn-secondary text-emerald-650 border-emerald-250 py-1.5 px-3 flex items-center space-x-1 hover:bg-emerald-50 cursor-pointer ${btnClass}`}
        >
          <FiCheckCircle className="h-4 w-4" />
          <span className="text-xs font-bold">Resolve Ticket</span>
        </button>
      );
    default:
      return <span className="text-xs text-slate-400 font-medium">No actions</span>;
  }
};

export default Maintenance;
