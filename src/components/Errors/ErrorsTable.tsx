import React from 'react';
import { ErrorLogEntry } from '../../types';
import { getErrorLevelClassName } from '../../utils';
import { SparklesIcon } from '../../assets/icons';

interface ErrorsTableProps {
    errors: ErrorLogEntry[];
    onResolveError: (id: string) => void;
    onAnalyzeError: (id: string) => void;
}

const ErrorsTable: React.FC<ErrorsTableProps> = ({ errors, onResolveError, onAnalyzeError, ...props }) => {
    return (
        <div className="orders-table-container"> {/* Reusing orders-table-container for consistent styling */}
            <table className="errors-table orders-table" aria-label="Error Logs"> {/* Reusing orders-table for base styles */}
                <thead>
                    <tr>
                        <th>발생시간</th>
                        <th>등급</th>
                        <th>서비스</th>
                        <th>메시지</th>
                        <th>처리상태</th>
                        <th>조치</th>
                    </tr>
                </thead>
                <tbody>
                    {errors.length === 0 ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center' }}>오류 내역이 없습니다.</td>
                        </tr>
                    ) : (
                        Array.isArray(errors) ? errors.map(err => (
                            <tr key={err.id}>
                                <td>{err.timestamp}</td>
                                <td><span className={getErrorLevelClassName(err.level)}>{err.level.toUpperCase()}</span></td>
                                <td>{err.service}</td>
                                <td className="error-message-cell">{err.message}</td>
                                <td><span className={err.status === '미해결' ? 'status-cancelled' : (err.status === '재시도 중' ? 'status-processing' : 'status-shipped') }>{err.status}</span></td>
                                <td>
                                    <button 
                                        onClick={() => onAnalyzeError(err.id)} 
                                        className="action-button" 
                                        style={{marginRight: '5px'}}
                                        aria-label={`Get AI analysis for error ${err.id}`}
                                        title="AI 오류 분석"
                                    >
                                        <SparklesIcon /> 분석
                                    </button>
                                    {err.status === '미해결' && 
                                        <button 
                                            onClick={() => onResolveError(err.id)} 
                                            className="action-button primary"
                                            aria-label={`Mark error ${err.id} as resolved`}
                                        >
                                            해결
                                        </button>
                                    }
                                    {/* Placeholder for a general details button if needed in future */}
                                    {/* <button className="action-button" aria-label={`Details for error ${err.id}`}>상세</button> */}
                                </td>
                            </tr>
                        )) : null
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ErrorsTable;