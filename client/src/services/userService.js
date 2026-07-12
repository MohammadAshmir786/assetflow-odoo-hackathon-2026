import api from './api';

export const getUsers = (params) => api.get('/users', { params });

const userService = { getUsers };
export default userService;
