import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransfers, createTransfer, approveTransfer, rejectTransfer } from '../../features/transfers/transfersThunks';
import { fetchAssets } from '../../features/assets/assetsThunks';
import {
  selectFilteredTransfers,
  selectTransfersLoading,
  selectTransfersSubmitting,
  selectTransfersActionLoadingId,
  selectTransfersError,
  selectTransfersFilter,
} from '../../features/transfers/transfersSelectors';
import { selectAllAssets } from '../../features/assets/assetsSelectors';
import { setTransferFilter } from '../../features/transfers/transfersSlice';
import { selectCurrentUser } from '../../features/auth/authSelectors';
import { getUsers } from '../../services/userService';

import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { getStatusClass } from '../../utils/statusHelpers';
import { getObjectId, normalizeId } from '../../utils/idHelpers';

import { FiPlus, FiShuffle, FiX, FiCheck, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import gsap from 'gsap';

export const Transfers = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const transfers = useAppSelector(selectFilteredTransfers);
  const loading = useAppSelector(selectTransfersLoading);
  const submitting = useAppSelector(selectTransfersSubmitting);
  const actionLoadingId = useAppSelector(selectTransfersActionLoadingId);
  const error = useAppSelector(selectTransfersError);
  const filter = useAppSelector(selectTransferFilter);
  const assets = useAppSelector(selectAllAssets);
  const currentUser = useAppSelector(selectCurrentUser);

  const isManagement = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  const [showFormModal, setShowFormModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [reason, setReason] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const listRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const loadData = useCallback(() => {
    dispatch(fetchTransfers());
    dispatch(fetchAssets());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle route state redirection from Asset Allocation warning
  useEffect(() => {
    if (location.state?.asset) {
      const asset = location.state.asset;
      setSelectedAssetId(getObjectId(asset));
      setShowFormModal(true);
      // Clear route state to prevent opening modal on refreshing
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Load employees
  useEffect(() => {
    if (showFormModal) {
      setEmployeesLoading(true);
      getUsers({ role: 'employee' })
        .then((res) => {
          const data = res.data?.data ?? res.data;
          setEmployees(Array.isArray(data) ? data : (data?.users ?? []));
        })
        .catch(() => setFormError('Could not load employees list.'))
        .finally(() => setEmployeesLoading(false));
    }
  }, [showFormModal]);

  // GSAP animation for list items
  useEffect(() => {
    if (!loading && !error && transfers.length > 0 && !hasAnimatedRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        hasAnimatedRef.current = true;
        return;
      }
      const ctx = gsap.context(() => {
        gsap.fromTo('.transfer-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power1.out' }
        );
      }, listRef);
      hasAnimatedRef.current = true;
      return () => ctx.revert();
    }
  }, [loading, error, transfers.length]);

  const handleFilterChange = (e) => {
    dispatch(setTransferFilter(e.target.value));
    hasAnimatedRef.current = false;
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedAssetId || !targetEmployeeId) {
      setFormError('Please select both an asset and target destination employee.');
      return;
    }

    const asset = assets.find((a) => getObjectId(a) === selectedAssetId);
    if (!asset) {
      setFormError('Selected asset not found.');
      return;
    }

    const currentHolderId = getObjectId(asset.currentHolder);
    if (currentHolderId && currentHolderId === targetEmployeeId) {
      setFormError('The destination employee cannot be the same as the current holder.');
      return;
    }

    const payload = {
      assetId: selectedAssetId,
      targetEmployeeId,
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    };

    const result = await dispatch(createTransfer(payload));
    if (createTransfer.fulfilled.match(result)) {
      setShowFormModal(false);
      setSelectedAssetId('');
      setTargetEmployeeId('');
      setReason('');
      loadData();
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this transfer request?')) {
      const result = await dispatch(approveTransfer(id));
      if (approveTransfer.fulfilled.match(result)) {
        loadData();
      }
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    const result = await dispatch(rejectTransfer({ id: showRejectModal, reason: rejectReason.trim() }));
    if (rejectTransfer.fulfilled.match(result)) {
      setShowRejectModal(null);
      setRejectReason('');
      loadData();
    }
  };

  const selectedAsset = assets.find((a) => getObjectId(a) === selectedAssetId);
  const currentHolderName = selectedAsset?.currentHolder?.name || selectedAsset?.currentHolder || 'Unassigned / Available';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transfer Requests"
        subtitle="Manage and track relocation of enterprise hardware equipment"
        actions={
          <button
            onClick={() => {
              setFormError('');
              setShowFormModal(true);
            }}
            className="btn-primary flex items-center space-x-2 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Request Transfer</span>
          </button>
        }
      />

      {/* Filter bar */}
      <div className="card py-4 px-5 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filter Status</span>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="input-field py-1.5 text-xs w-auto focus:ring-1 focus:ring-indigo-500"
        >
          <option value="All">All Requests</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-16 bg-white" />
          ))}
        </div>
      )}

      {!loading && error && (
        <ErrorMessage message={`Failed to load transfer logs: ${error}`} onRetry={loadData} />
      )}

      {!loading && !error && transfers.length === 0 && (
        <EmptyState
          icon={FiShuffle}
          title="No transfers logged"
          description="There are no active or historic asset relocations matching your filters."
        />
      )}

      {/* Main List */}
      {!loading && !error && transfers.length > 0 && (
        <div ref={listRef} className="space-y-4">
          {/* Desktop view */}
          <div className="hidden md:block card overflow-hidden p-0 border border-slate-200">
            <table className="data-table">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Asset</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Routing Path</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Requested By</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  {isManagement && <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {transfers.map((item) => {
                  const id = getObjectId(item);
                  const isPending = item.status === 'Pending';
                  return (
                    <tr key={id} className="transfer-row hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-850 text-sm">{item.asset?.name || 'Unknown Asset'}</div>
                        <div className="text-xs text-slate-400 font-mono">{item.asset?.assetTag || '—'}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-slate-700">{item.currentHolder?.name || item.currentHolder || 'Unassigned'}</span>
                          <FiArrowRight className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold text-indigo-700">{item.targetEmployee?.name || item.targetEmployee || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-650">{item.requestedBy?.name || item.requestedBy || 'System'}</td>
                      <td className="px-5 py-4 text-sm text-slate-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-4">
                        <span className={getStatusClass(item.status)}>{item.status}</span>
                      </td>
                      {isManagement && (
                        <td className="px-5 py-4 text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleApprove(id)}
                                disabled={actionLoadingId === id}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Approve"
                              >
                                <FiCheck className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setRejectReason('');
                                  setShowRejectModal(id);
                                }}
                                disabled={actionLoadingId === id}
                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Reject"
                              >
                                <FiX className="h-5 w-5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">No actions</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {transfers.map((item) => {
              const id = getObjectId(item);
              const isPending = item.status === 'Pending';
              return (
                <div key={id} className="transfer-row card p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-850">{item.asset?.name || 'Unknown Asset'}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{item.asset?.assetTag || '—'}</p>
                    </div>
                    <span className={getStatusClass(item.status)}>{item.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 space-y-1 py-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-700">{item.currentHolder?.name || item.currentHolder || 'Unassigned'}</span>
                      <FiArrowRight className="h-3 w-3" />
                      <span className="font-semibold text-indigo-700">{item.targetEmployee?.name || item.targetEmployee || '—'}</span>
                    </div>
                    <p className="mt-1">Requested by: <span className="font-medium text-slate-700">{item.requestedBy?.name || item.requestedBy || 'System'}</span></p>
                    {item.reason && <p className="italic text-slate-400 mt-1">" {item.reason} "</p>}
                  </div>
                  {isManagement && isPending && (
                    <div className="flex space-x-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleApprove(id)}
                        disabled={actionLoadingId === id}
                        className="flex-1 btn-secondary text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-250 py-1 cursor-pointer flex justify-center items-center space-x-1"
                      >
                        <FiCheck className="h-4 w-4" />
                        <span className="text-xs">Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setRejectReason('');
                          setShowRejectModal(id);
                        }}
                        disabled={actionLoadingId === id}
                        className="flex-1 btn-secondary text-red-650 hover:bg-red-50 hover:text-red-700 border-red-250 py-1 cursor-pointer flex justify-center items-center space-x-1"
                      >
                        <FiX className="h-4 w-4" />
                        <span className="text-xs">Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowFormModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <FiShuffle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Request Relocation</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Relocate asset to employee destination</p>
                </div>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
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
                  <option value="">Select asset to move…</option>
                  {assets.map((a) => (
                    <option key={getObjectId(a)} value={getObjectId(a)}>
                      {a.name} ({a.assetTag || 'No Tag'}) - {a.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Current Holder</label>
                <div className="input-field bg-slate-50 border-slate-200 text-slate-550 select-none">
                  {currentHolderName}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Destination Employee <span className="text-red-500">*</span></label>
                {employeesLoading ? (
                  <div className="input-field text-slate-400">Loading list…</div>
                ) : (
                  <select
                    required
                    value={targetEmployeeId}
                    onChange={(e) => {
                      setTargetEmployeeId(e.target.value);
                      setFormError('');
                    }}
                    className="input-field"
                    disabled={submitting}
                  >
                    <option value="">Select destination employee…</option>
                    {employees.map((e) => (
                      <option key={getObjectId(e)} value={getObjectId(e)}>
                        {e.name} ({e.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Reason for Relocation <span className="text-slate-400 font-normal">(optional)</span></label>
                <textarea
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context for this transfer request…"
                  className="input-field resize-none"
                  disabled={submitting}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="btn-secondary cursor-pointer" disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary cursor-pointer" disabled={submitting || !selectedAssetId || !targetEmployeeId}>
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setShowRejectModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Reject Request</h3>
              <button onClick={() => setShowRejectModal(null)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">Reason for Rejection <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="State the reason for rejecting this transfer request…"
                  className="input-field resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-1">
                <button type="button" onClick={() => setShowRejectModal(null)} className="btn-secondary cursor-pointer">Cancel</button>
                <button type="submit" className="btn-danger cursor-pointer" disabled={!rejectReason.trim()}>
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
