import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import './ResourceStatus.css';

export const ResourceStatus = ({ status = 'pending' }) => {
  const normStatus = (status || 'pending').toLowerCase();

  switch (normStatus) {
    case 'ready':
    case 'completed':
      return (
        <span className="resource-status-badge resource-status-ready">
          <CheckCircle2 size={13} />
          <span>Ready</span>
        </span>
      );
    case 'processing':
      return (
        <span className="resource-status-badge resource-status-processing">
          <Loader2 size={13} className="status-spinner" />
          <span>Processing</span>
        </span>
      );
    case 'failed':
      return (
        <span className="resource-status-badge resource-status-failed">
          <AlertCircle size={13} />
          <span>Failed</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="resource-status-badge resource-status-pending">
          <Clock size={13} />
          <span>Pending</span>
        </span>
      );
  }
};
