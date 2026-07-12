import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { allocateAsset } from '../../features/assets/assetsThunks';
import { selectAssetsSubmitting, selectAssetsSubmitError } from '../../features/assets/assetsSelectors';
import { clearAssetError } from '../../features/assets/assetsSlice';
import { getUsers } from '../../services/userService';
import { FiX, FiUserCheck, FiAlertTriangle, FiShuffle } from 'react-icons/fi';
import gsap from 'gsap';

export const AllocateModal = ({ asset, onClose, onSuccess, onTransferRequest }) => {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectAssetsSubmitting);
  const submitError = useAppSelector(selectAssetsSubmitError);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');

  const panelRef = useRef(null);

  // GSAP modal entrance
  useEffect(() => {
    dispatch(clearAssetError());
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current,
        { opacity: 0, scale: 0.95, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    });
    return () => ctx.revert();
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load users
  useEffect(() => {
    setUsersLoading(true);
    getUsers({ role: 'employee' })
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setUsers(Array.isArray(data) ? data : (data?.users ?? []));
      })
      .catch(() => setUsersError('Could not load employees list.'))
      .finally(() => setUsersLoading(false));
  }, []);

  const isAlreadyAllocated = asset?.status === 'Allocated';
  const holderName = asset?.currentHolder?.name || asset?.currentHolder || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) return;
    // Centralized request body — easy to adjust for backend changes
    const payload = {
      userId: employeeId,
      ...(expectedReturnDate ? { expectedReturnDate } : {}),
    };
    const result = await dispatch(allocateAsset({ id: asset._id || asset.id, payload }));
    if (allocateAsset.fulfilled.match(result)) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={panelRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
              <FiUserCheck className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Allocate Asset</h3>
              <p className="text-xs text-slate-500 truncate max-w-[220px]">{asset?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Already-allocated warning */}
        {isAlreadyAllocated && (
          <div className="mx-6 mt-5 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start space-x-3">
            <FiAlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Already Allocated</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {holderName ? `This asset is currently allocated to ${holderName}.` : 'This asset is currently allocated.'}
              </p>
              <button
                onClick={() => { onClose(); onTransferRequest?.(asset); }}
                className="mt-3 flex items-center space-x-1.5 text-xs font-semibold text-indigo-650 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <FiShuffle className="h-3.5 w-3.5" />
                <span>Create Transfer Request</span>
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!isAlreadyAllocated && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {submitError && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {typeof submitError === 'string' ? submitError : submitError?.message}
              </p>
            )}
            {usersError && <p className="text-xs text-red-700">{usersError}</p>}

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Assign To <span className="text-red-500">*</span>
              </label>
              {usersLoading ? (
                <div className="input-field text-slate-400">Loading employees…</div>
              ) : (
                <select
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="input-field"
                  disabled={submitting}
                >
                  <option value="">Select employee…</option>
                  {users.map((u) => (
                    <option key={u._id || u.id} value={u._id || u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Expected Return Date <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                disabled={submitting}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary cursor-pointer" disabled={submitting}>Cancel</button>
              <button type="submit" className="btn-primary cursor-pointer" disabled={submitting || usersLoading || !employeeId}>
                {submitting ? 'Allocating…' : 'Confirm Allocation'}
              </button>
            </div>
          </form>
        )}

        {/* Footer when already allocated */}
        {isAlreadyAllocated && (
          <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
            <button onClick={onClose} className="btn-secondary cursor-pointer">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocateModal;
