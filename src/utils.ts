import { PlatformConfig, ThreePLConfig, ErrorLogLevel } from '../types';

export const getStatusClassName = (status: string) => {
  switch (status) {
    case '신규': return 'status-new';
    case '처리중': return 'status-processing';
    case '발송완료': return 'status-shipped';
    case '취소': return 'status-cancelled';
    case '3PL대기': return 'status-3pl-pending';
    case '3PL완료': return 'status-3pl-completed';
    case '출고대기': return 'status-ready-to-ship';
    default: return '';
  }
};

export const getPlatformStatusInfo = (status: PlatformConfig['connectionStatus'] | ThreePLConfig['connectionStatus']) => {
  switch (status) {
    case 'connected': return { text: '연결됨', className: 'status-connected' };
    case 'disconnected': return { text: '연결 끊김', className: 'status-disconnected' };
    case 'error': return { text: '오류', className: 'status-error' };
    case 'not_configured':
    default: return { text: '미설정', className: 'status-not-configured' };
  }
};

export const getErrorLevelClassName = (level: ErrorLogLevel) => {
  switch (level) {
    case 'critical': return 'error-level-critical';
    case 'warning': return 'error-level-warning';
    case 'info': return 'error-level-info';
    default: return '';
  }
};
