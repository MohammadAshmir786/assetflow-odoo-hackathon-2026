/**
 * Helper utilities to reconcile MongoDB '_id' and standard client 'id' attributes.
 */

export const getObjectId = (obj) => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj._id || obj.id || '';
};

export const matchIds = (objA, objB) => {
  const idA = getObjectId(objA);
  const idB = getObjectId(objB);
  return !!(idA && idB && idA === idB);
};

export const normalizeId = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return {
    ...obj,
    id: obj.id || obj._id,
    _id: obj._id || obj.id,
  };
};
