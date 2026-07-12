import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectNotifications, dismissNotification } from '../../features/notifications/notificationsSlice';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastItem = ({ notification }) => {
  const dispatch = useAppDispatch();
  const { id, type, message, duration } = notification;

  useEffect(() => {
    if (duration === 0) return;
    const timer = setTimeout(() => {
      dispatch(dismissNotification(id));
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, dispatch]);

  const icons = {
    success: <FiCheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <FiAlertCircle className="h-5 w-5 text-red-500" />,
    info: <FiInfo className="h-5 w-5 text-blue-500" />,
  };

  const borderClasses = {
    success: 'bg-white border-emerald-150 shadow-emerald-50/50',
    error: 'bg-white border-red-150 shadow-red-50/50',
    info: 'bg-white border-indigo-150 shadow-indigo-50/50',
  };

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-xl border shadow-lg max-w-sm w-full pointer-events-auto transition-all duration-300 transform translate-y-0 ${borderClasses[type] || borderClasses.info}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800 leading-relaxed break-words">{message}</p>
      </div>
      <button
        onClick={() => dispatch(dismissNotification(id))}
        className="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const notifications = useAppSelector(selectNotifications);

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="assertive"
    >
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} />
      ))}
    </div>
  );
};

export default ToastContainer;
