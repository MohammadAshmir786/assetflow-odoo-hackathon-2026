export const selectAllAssets    = (state) => state.assets.items;
export const selectSelectedAsset = (state) => state.assets.selectedAsset;
export const selectAssetsLoading = (state) => state.assets.loading;
export const selectAssetsSubmitting = (state) => state.assets.submitting;
export const selectAssetsError  = (state) => state.assets.error;
export const selectAssetsSubmitError = (state) => state.assets.submitError;
export const selectAssetsFilters = (state) => state.assets.filters;

/** Client-side filtered list (search + status + category) */
export const selectFilteredAssets = (state) => {
  const { items, filters } = state.assets;
  const search = (filters.search || '').toLowerCase().trim();
  return items.filter((asset) => {
    const matchSearch =
      !search ||
      asset.name?.toLowerCase().includes(search) ||
      asset.assetTag?.toLowerCase().includes(search) ||
      asset.serialNumber?.toLowerCase().includes(search) ||
      asset.category?.toLowerCase().includes(search);
    const matchStatus = !filters.status || filters.status === 'All' || asset.status === filters.status;
    const matchCategory = !filters.category || filters.category === 'All' || asset.category === filters.category;
    return matchSearch && matchStatus && matchCategory;
  });
};

/** Unique categories derived from loaded items */
export const selectAssetCategories = (state) => {
  const cats = new Set(state.assets.items.map((a) => a.category).filter(Boolean));
  return ['All', ...cats];
};
