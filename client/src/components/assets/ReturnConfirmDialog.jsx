import React, { useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { returnAsset } from '../../features/assets/assetsThunks';
import { selectAssetsSubmitting, selectAssetsSubmitError } from '../../features/assets/assetsSelectors';
import { clearAssetError } from '../../features/assets/assetsSlice';
import { fetchDashboardStats } from '../../features/dashboard/dashboardThunks';
import { FiAlertTriangle, FiX } from 'react-icons/fi';
import gsap from 'gsap';

export const ReturnConfirmDialog = ({ asset, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectAssetsSubmitting);
  const submitError = useAppSelector(selectAssetsSubmitError);
  const panelRef = useRef(null);

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

  const handleConfirm = async () => {
    const result = await dispatch(returnAsset(asset._id || asset.id));
    if (returnAsset.fulfilled.match(result)) {
      // Refresh dashboard stats where practical
      dispatch(fetchDashboardStats());
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
      <div ref={panelRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <FiAlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Confirm Return</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer">
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to mark <span className="font-semibold text-slate-900">{asset?.name}</span> as returned?
            The asset status will be updated to <span className="font-semibold text-emerald-700">Available</span>.
          </p>

          {submitError && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {typeof submitError === 'string' ? submitError : submitError?.message}
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-1">
            <button onClick={onClose} className="btn-secondary cursor-pointer" disabled={submitting}>Cancel</button>
            <button onClick={handleConfirm} className="btn-primary cursor-pointer" disabled={submitting}>
              {submitting ? 'Processing…' : 'Confirm Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnConfirmDialog;
