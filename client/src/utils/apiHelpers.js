/**
 * Safely extracts arrays or objects from various Odoo/custom API response structures.
 */
export const extractDataArray = (response) => {
  if (!response) return [];
  
  // Extract response.data if nested by Axios
  const payload = response.data !== undefined ? response.data : response;
  
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.transfers)) return payload.transfers;
  if (payload && Array.isArray(payload.maintenance)) return payload.maintenance;
  if (payload && Array.isArray(payload.assets)) return payload.assets;
  if (payload && Array.isArray(payload.users)) return payload.users;
  
  return [];
};

export const extractDataObject = (response) => {
  if (!response) return null;
  
  const payload = response.data !== undefined ? response.data : response;
  
  if (payload && payload.success && payload.data !== undefined) {
    return payload.data;
  }
  return payload;
};
