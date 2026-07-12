import { useDispatch, useSelector } from 'react-redux';

/**
 * Reusable app-level dispatch hook.
 * Wraps react-redux useDispatch.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Reusable app-level selector hook.
 * Wraps react-redux useSelector.
 */
export const useAppSelector = useSelector;
