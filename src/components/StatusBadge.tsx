import React from 'react';
import type { BookingStatus } from '../types';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  INQUIRY: { label: 'Inquiry', className: 'bg-purple-100 text-purple-700' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700' },
  FULLY_PAID: { label: 'Lunas', className: 'bg-indigo-100 text-indigo-700' },
  CHECKED_IN: { label: 'Check-in', className: 'bg-blue-600 text-white' },
  CHECKED_OUT: { label: 'Check-out', className: 'bg-gray-100 text-gray-600' },
  CANCELLED: { label: 'Batal', className: 'bg-red-100 text-red-700' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
