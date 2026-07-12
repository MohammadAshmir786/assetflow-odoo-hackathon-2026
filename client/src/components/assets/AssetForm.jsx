import React, { useRef, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createAsset, updateAsset } from '../../features/assets/assetsThunks';
import { selectAssetsSubmitting, selectAssetsSubmitError } from '../../features/assets/assetsSelectors';
import { clearAssetError } from '../../features/assets/assetsSlice';
import { FiX, FiSave } from 'react-icons/fi';
import gsap from 'gsap';

const CATEGORIES = ['Hardware', 'Software', 'Furniture', 'Networking', 'Vehicle', 'Other'];
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Broken'];

const EMPTY_FORM = {
  name: '', category: '', assetTag: '', serialNumber: '',
  condition: '', location: '', acquisitionDate: '', acquisitionCost: '',
};

const Field = ({ label, id, error, required, children }) => (
  <div>
    <label htmlFor={id} className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

function buildInitial(asset) {
  if (!asset) return EMPTY_FORM;
  return {
    name: asset.name || '',
    category: asset.category || '',
    assetTag: asset.assetTag || '',
    serialNumber: asset.serialNumber || '',
    condition: asset.condition || '',
    location: asset.location || '',
    acquisitionDate: asset.acquisitionDate ? asset.acquisitionDate.slice(0, 10) : '',
    acquisitionCost: asset.acquisitionCost != null ? String(asset.acquisitionCost) : '',
  };
}

export const AssetForm = ({ asset, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector(selectAssetsSubmitting);
  const submitError = useAppSelector(selectAssetsSubmitError);

  const isEdit = !!asset;
  const panelRef = useRef(null);
  const [form, setForm] = useState(() => buildInitial(asset));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(clearAssetError());
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current,
        { opacity: 0, scale: 0.96, y: 12 },
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

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.category) errs.category = 'Category is required.';
    if (!form.condition) errs.condition = 'Condition is required.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (form.acquisitionCost && (isNaN(Number(form.acquisitionCost)) || Number(form.acquisitionCost) < 0)) {
      errs.acquisitionCost = 'Cost must be a non-negative number.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      category: form.category,
      condition: form.condition,
      location: form.location.trim(),
      ...(form.assetTag.trim() ? { assetTag: form.assetTag.trim() } : {}),
      ...(form.serialNumber.trim() ? { serialNumber: form.serialNumber.trim() } : {}),
      ...(form.acquisitionDate ? { acquisitionDate: form.acquisitionDate } : {}),
      ...(form.acquisitionCost ? { acquisitionCost: Number(form.acquisitionCost) } : {}),
    };

    const result = isEdit
      ? await dispatch(updateAsset({ id: asset._id || asset.id, data: payload }))
      : await dispatch(createAsset(payload));

    const actionCreator = isEdit ? updateAsset : createAsset;
    if (actionCreator.fulfilled.match(result)) {
      onSuccess?.();
      onClose();
    }
  };

  const errorMsg = submitError
    ? (typeof submitError === 'string' ? submitError : submitError?.message)
    : null;
  const isDuplicate = submitError?.status === 409;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />
      <div ref={panelRef} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900">{isEdit ? 'Edit Asset' : 'Register New Asset'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{isEdit ? `Updating: ${asset.name}` : 'Add a new asset to the directory'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className={`p-3 rounded-xl text-xs ${isDuplicate ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                {isDuplicate ? `Duplicate Asset Tag: ${errorMsg}` : errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Asset Name" id="name" required error={fieldErrors.name}>
                <input id="name" value={form.name} onChange={set('name')} className="input-field" placeholder="e.g. MacBook Pro 16 inch" disabled={submitting} />
              </Field>
              <Field label="Category" id="category" required error={fieldErrors.category}>
                <select id="category" value={form.category} onChange={set('category')} className="input-field" disabled={submitting}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Asset Tag" id="assetTag" error={fieldErrors.assetTag}>
                <input id="assetTag" value={form.assetTag} onChange={set('assetTag')} className="input-field" placeholder="e.g. AST-2026-001" disabled={submitting} />
              </Field>
              <Field label="Serial Number" id="serialNumber" error={fieldErrors.serialNumber}>
                <input id="serialNumber" value={form.serialNumber} onChange={set('serialNumber')} className="input-field" placeholder="Manufacturer S/N" disabled={submitting} />
              </Field>
              <Field label="Condition" id="condition" required error={fieldErrors.condition}>
                <select id="condition" value={form.condition} onChange={set('condition')} className="input-field" disabled={submitting}>
                  <option value="">Select condition…</option>
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Location" id="location" required error={fieldErrors.location}>
                <input id="location" value={form.location} onChange={set('location')} className="input-field" placeholder="e.g. HQ Floor 2" disabled={submitting} />
              </Field>
              <Field label="Acquisition Date" id="acquisitionDate" error={fieldErrors.acquisitionDate}>
                <input id="acquisitionDate" type="date" value={form.acquisitionDate} onChange={set('acquisitionDate')} className="input-field" disabled={submitting} />
              </Field>
              <Field label="Acquisition Cost (USD)" id="acquisitionCost" error={fieldErrors.acquisitionCost}>
                <input id="acquisitionCost" type="number" min="0" step="0.01" value={form.acquisitionCost} onChange={set('acquisitionCost')} className="input-field" placeholder="0.00" disabled={submitting} />
              </Field>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
            <button type="button" onClick={onClose} className="btn-secondary cursor-pointer" disabled={submitting}>Cancel</button>
            <button type="submit" className="btn-primary flex items-center space-x-2 cursor-pointer" disabled={submitting}>
              <FiSave className="h-4 w-4" />
              <span>{submitting ? (isEdit ? 'Saving…' : 'Registering…') : (isEdit ? 'Save Changes' : 'Register Asset')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm;
