import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAssets } from '../../features/assets/assetsThunks';
import {
  selectFilteredAssets,
  selectAssetCategories,
  selectAssetsLoading,
  selectAssetsError,
  selectAssetsFilters,
} from '../../features/assets/assetsSelectors';
import { setFilter } from '../../features/assets/assetsSlice';
import { selectCurrentUser } from '../../features/auth/authSelectors';

import { PageHeader } from '../../components/ui/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { AssetStatusBadge } from '../../components/ui/AssetStatusBadge';
import { AssetTableSkeleton } from '../../components/assets/AssetTableSkeleton';
import { AssetForm } from '../../components/assets/AssetForm';
import { AllocateModal } from '../../components/assets/AllocateModal';
import { ReturnConfirmDialog } from '../../components/assets/ReturnConfirmDialog';

import {
  FiPlus, FiSearch, FiEye, FiEdit2, FiUserCheck,
  FiRotateCcw, FiBox, FiFilter,
} from 'react-icons/fi';
import gsap from 'gsap';

const STATUSES = ['All', 'Available', 'Allocated', 'Under Maintenance', 'Lost', 'Retired'];

// Rules for which actions are allowed per status
const CAN_ALLOCATE = (status) => status === 'Available';
const CAN_RETURN   = (status) => status === 'Allocated';

export const Assets = () => {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();

  const assets     = useAppSelector(selectFilteredAssets);
  const categories = useAppSelector(selectAssetCategories);
  const loading    = useAppSelector(selectAssetsLoading);
  const error      = useAppSelector(selectAssetsError);
  const filters    = useAppSelector(selectAssetsFilters);
  const user       = useAppSelector(selectCurrentUser);

  const isManagement = user?.role === 'admin' || user?.role === 'manager';

  const [showForm,     setShowForm]     = useState(false);
  const [editAsset,    setEditAsset]    = useState(null);
  const [allocateTarget, setAllocateTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);

  const listRef    = useRef(null);
  const hasAnimatedRef = useRef(false);

  const load = useCallback(() => {
    dispatch(fetchAssets());
    hasAnimatedRef.current = false; // allow re-animation on retry
  }, [dispatch]);

  useEffect(() => { load(); }, [load]);

  // Animate cards only on initial successful load — not on every filter change
  useEffect(() => {
    if (!loading && !error && assets.length > 0 && !hasAnimatedRef.current) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) { hasAnimatedRef.current = true; return; }
      const ctx = gsap.context(() => {
        gsap.fromTo('.asset-row',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power1.out' }
        );
      }, listRef);
      hasAnimatedRef.current = true;
      return () => ctx.revert();
    }
  }, [loading, error, assets.length]);

  const handleSearchChange = (e) => {
    dispatch(setFilter({ search: e.target.value }));
  };

  const openRegister = () => { setEditAsset(null); setShowForm(true); };
  const openEdit = (asset) => { setEditAsset(asset); setShowForm(true); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Directory"
        subtitle="Manage, allocate, and track all corporate assets"
        actions={
          isManagement && (
            <button onClick={openRegister} className="btn-primary flex items-center space-x-2 cursor-pointer">
              <FiPlus className="h-4 w-4" />
              <span>Register Asset</span>
            </button>
          )
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
            onChange={handleSearchChange}
            placeholder="Search name, tag, serial…"
            className="input-field pl-9 py-1.5"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          {/* Status */}
          <select
            value={filters.status}
            onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
            className="input-field py-1.5 text-xs w-auto"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => dispatch(setFilter({ category: e.target.value }))}
            className="input-field py-1.5 text-xs w-auto"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <AssetTableSkeleton />}

      {/* Error with retry */}
      {!loading && error && (
        <ErrorMessage message={`Failed to load assets: ${error}`} onRetry={load} />
      )}

      {/* Empty state */}
      {!loading && !error && assets.length === 0 && (
        <EmptyState
          icon={FiBox}
          title="No assets found"
          description={filters.search || filters.status !== 'All' || filters.category !== 'All'
            ? 'No assets match your current filters. Try clearing them.'
            : 'No assets have been registered yet. Click "Register Asset" to add the first one.'}
          actionLabel={isManagement ? 'Register Asset' : undefined}
          onAction={isManagement ? openRegister : undefined}
        />
      )}

      {/* Desktop Table */}
      {!loading && !error && assets.length > 0 && (
        <div ref={listRef}>
          <div className="hidden md:block card overflow-hidden p-0 border border-slate-200">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Asset Name', 'Category', 'Tag / S/N', 'Status', 'Location', 'Current Holder', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {assets.map((asset) => {
                    const id = asset._id || asset.id;
                    const holderName = asset.currentHolder?.name || asset.currentHolder || '—';
                    return (
                      <tr key={id} className="asset-row hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-semibold text-slate-900 text-sm whitespace-nowrap">{asset.name}</td>
                        <td className="px-5 py-4 text-slate-500 text-sm">{asset.category}</td>
                        <td className="px-5 py-4 text-slate-500 text-xs font-mono">
                          {asset.assetTag || '—'}<br />
                          <span className="text-[10px] text-slate-400">{asset.serialNumber || ''}</span>
                        </td>
                        <td className="px-5 py-4"><AssetStatusBadge status={asset.status} /></td>
                        <td className="px-5 py-4 text-slate-500 text-sm">{asset.location || '—'}</td>
                        <td className="px-5 py-4 text-slate-500 text-sm">{holderName}</td>
                        <td className="px-5 py-4">
                          <ActionButtons
                            asset={asset}
                            isManagement={isManagement}
                            onEdit={() => openEdit(asset)}
                            onAllocate={() => setAllocateTarget(asset)}
                            onReturn={() => setReturnTarget(asset)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {assets.map((asset) => {
              const id = asset._id || asset.id;
              const holderName = asset.currentHolder?.name || asset.currentHolder || null;
              return (
                <div key={id} className="asset-row card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{asset.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{asset.category}</p>
                    </div>
                    <AssetStatusBadge status={asset.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                    {asset.assetTag && <span>Tag: <span className="font-mono text-slate-700">{asset.assetTag}</span></span>}
                    {asset.location && <span>📍 {asset.location}</span>}
                    {holderName && <span className="col-span-2">👤 {holderName}</span>}
                  </div>
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-100">
                    <ActionButtons
                      asset={asset}
                      isManagement={isManagement}
                      onEdit={() => openEdit(asset)}
                      onAllocate={() => setAllocateTarget(asset)}
                      onReturn={() => setReturnTarget(asset)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <AssetForm
          asset={editAsset}
          onClose={() => { setShowForm(false); setEditAsset(null); }}
          onSuccess={load}
        />
      )}
      {allocateTarget && (
        <AllocateModal
          asset={allocateTarget}
          onClose={() => setAllocateTarget(null)}
          onSuccess={load}
          onTransferRequest={(a) => navigate('/transfers', { state: { asset: a } })}
        />
      )}
      {returnTarget && (
        <ReturnConfirmDialog
          asset={returnTarget}
          onClose={() => setReturnTarget(null)}
          onSuccess={load}
        />
      )}
    </div>
  );
};

/** Row / card action buttons — status-aware and role-aware */
const ActionButtons = ({ asset, isManagement, onEdit, onAllocate, onReturn }) => {
  const canAllocate = isManagement && CAN_ALLOCATE(asset.status);
  const canReturn   = isManagement && CAN_RETURN(asset.status);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {isManagement && (
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 transition-colors cursor-pointer"
          title="Edit"
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
      )}
      {canAllocate && (
        <button
          onClick={onAllocate}
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
          title="Allocate"
        >
          <FiUserCheck className="h-4 w-4" />
        </button>
      )}
      {canReturn && (
        <button
          onClick={onReturn}
          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
          title="Return"
        >
          <FiRotateCcw className="h-4 w-4" />
        </button>
      )}
      {/* Allocate button still shows for already-allocated so user can see the double-allocation message */}
      {isManagement && asset.status === 'Allocated' && (
        <button
          onClick={onAllocate}
          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-650 hover:bg-indigo-50 transition-colors cursor-pointer"
          title="Re-allocate / Transfer"
        >
          <FiUserCheck className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default Assets;
