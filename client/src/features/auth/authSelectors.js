/**
 * Auth state selectors and helpers.
 */

export const selectCurrentUser = (state) => state.auth.user;

export const selectIsAuthenticated = (state) => !!state.auth.token;

export const selectIsAdmin = (state) => {
  const user = selectCurrentUser(state);
  return user?.role === 'admin';
};

export const selectIsManager = (state) => {
  const user = selectCurrentUser(state);
  return user?.role === 'manager';
};

export const selectCanManageAssets = (state) => {
  const user = selectCurrentUser(state);
  return user?.role === 'admin' || user?.role === 'manager';
};
