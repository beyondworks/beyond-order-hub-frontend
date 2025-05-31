
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { ErrorLogEntry, ErrorLogLevel } from '../types';
import { SearchIcon, RefreshIcon } from '../assets/icons';
import ErrorsTable from '../components/Errors/ErrorsTable';
import PaginationControls from '../components/Common/PaginationControls';
import ErrorAnalysisModal from '../components/Errors/ErrorAnalysisModal';
import { ToastContext } from '../contexts/ToastContext';
import * as api from '../services/api'; // For calling backend Gemini analysis

interface ErrorLogPageProps {
  initialErrorLogs: ErrorLogEntry[];
  onResolveError: (errorId: string) => Promise<void>;
}

const ErrorLogPage: React.FC<ErrorLogPageProps> = ({ initialErrorLogs, onResolveError }) => {
  const [errorLogs, setErrorLogs] = useState<ErrorLogEntry[]>(initialErrorLogs);
  const [displayedErrorLogs, setDisplayedErrorLogs] = useState<ErrorLogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedErrorForAnalysis, setSelectedErrorForAnalysis] = useState<ErrorLogEntry | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const toastContext = useContext(ToastContext);

  // Update local errorLogs state when initialErrorLogs prop changes
  useEffect(() => {
    setErrorLogs(initialErrorLogs);
  }, [initialErrorLogs]);

  const availableLevels: (ErrorLogLevel | 'all')[] = ['all', 'critical', 'warning', 'info'];
  // Dynamically create availableServices based on current errorLogs
  const availableServices = ['전체', ...new Set(errorLogs.map(log => log.service).filter(Boolean).sort())]; 
  
  const [filters, setFilters] = useState({
    level: 'all' as (ErrorLogLevel | 'all'),
    service: '전체',
    startDate: '',
    endDate: '',
    searchTerm: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: name === 'level' ? value as (ErrorLogLevel | 'all') : value }));
  };

  const resetFilters = () => {
    setFilters({ level: 'all', service: '전체', startDate: '', endDate: '', searchTerm: '' });
  };
  
  const handleResolveErrorUI = async (errorId: string) => {
    // The actual API call and state update is handled in App.tsx by onResolveError prop
    await onResolveError(errorId); 
  };

  const handleOpenAnalysisModal = async (errorEntry: ErrorLogEntry) => {
    setSelectedErrorForAnalysis(errorEntry);
    setIsAnalysisModalOpen(true);
    setIsAnalysisLoading(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
      const response = await api.analyzeErrorViaBackend(errorEntry.message, errorEntry.service, errorEntry.level);
      setAnalysisResult(response.analysisText);
    } catch (e: any) {
      console.error("Error calling backend for AI analysis:", e);
      const errorMessage = e.message || "AI 분석 중 알 수 없는 오류가 발생했습니다.";
      setAnalysisError(errorMessage);
      toastContext?.addToast(errorMessage, 'error');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setSelectedErrorForAnalysis(null);
    setAnalysisResult(null);
    setIsAnalysisLoading(false);
    setAnalysisError(null);
  };

  const applyFiltersAndSearchForErrors = useCallback(() => {
    let filtered = errorLogs; // Use the local errorLogs state which is synced with props
    if (filters.level !== 'all') filtered = filtered.filter(log => log.level === filters.level);
    if (filters.service !== '전체') {
      const normalizedFilterService = filters.service.toLowerCase().replace(/[\s-]+/g, '');
      filtered = filtered.filter(log => log.service && log.service.toLowerCase().replace(/[\s-]+/g, '').includes(normalizedFilterService));
    }
    if (filters.startDate) filtered = filtered.filter(log => new Date(log.timestamp.split(' ')[0]) >= new Date(filters.startDate));
    if (filters.endDate) filtered = filtered.filter(log => new Date(log.timestamp.split(' ')[0]) <= new Date(filters.endDate));
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(log => log.message.toLowerCase().includes(term) || log.id.toLowerCase().includes(term));
    }
    return filtered.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [filters, errorLogs]); // Depend on local errorLogs

  useEffect(() => {
    const filteredAndSearched = applyFiltersAndSearchForErrors();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedErrorLogs(filteredAndSearched.slice(startIndex, endIndex));
  }, [filters, currentPage, itemsPerPage, applyFiltersAndSearchForErrors]);


  useEffect(() => {
    setCurrentPage(1); 
  }, [filters.level, filters.service, filters.startDate, filters.endDate, filters.searchTerm, errorLogs]); // Also reset page if errorLogs itself changes

  const totalPages = Math.ceil(applyFiltersAndSearchForErrors().length / itemsPerPage);

  return (
    <main className="main-content error-log-page" role="main" aria-labelledby="error-log-page-title">
      <div className="page-header-container">
        <h2 id="error-log-page-title">오류 내역</h2>
        <p className="page-description">시스템 운영 중 발생한 오류 내역을 확인하고 관리합니다. '분석' 버튼을 클릭하여 AI의 도움을 받을 수 있습니다.</p>
      </div>
      <div className="filters-toolbar" role="search" aria-label="Filter error logs">
        <div className="filter-group">
            <label htmlFor="level-filter-errors">오류등급:</label>
            <select id="level-filter-errors" name="level" value={filters.level} onChange={handleFilterChange}>
                {availableLevels.map(l => <option key={l} value={l}>{l === 'all' ? '전체' : l.toUpperCase()}</option>)}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="service-filter-errors">서비스:</label>
            <select id="service-filter-errors" name="service" value={filters.service} onChange={handleFilterChange}>
                {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="date-start-filter-errors">기간(시작):</label>
            <input type="date" id="date-start-filter-errors" name="startDate" value={filters.startDate} onChange={handleFilterChange} aria-label="Filter by start date" />
        </div>
        <div className="filter-group">
            <label htmlFor="date-end-filter-errors">기간(종료):</label>
            <input type="date" id="date-end-filter-errors" name="endDate" value={filters.endDate} onChange={handleFilterChange} aria-label="Filter by end date" />
        </div>
        <div className="filter-group search-group">
            <input type="text" name="searchTerm" placeholder="오류 메시지, ID 검색..." value={filters.searchTerm} onChange={handleFilterChange} aria-label="Search error messages text" />
            <button type="button" onClick={() => setCurrentPage(1)}><SearchIcon/>검색</button>
        </div>
         <button type="button" className="action-button secondary" onClick={resetFilters}><RefreshIcon />초기화</button>
      </div>
      <ErrorsTable errors={displayedErrorLogs} onResolveError={handleResolveErrorUI} onAnalyzeError={handleOpenAnalysisModal} />
      {totalPages > 0 && <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>}
      <ErrorAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={handleCloseAnalysisModal}
        errorEntry={selectedErrorForAnalysis}
        analysisResult={analysisResult}
        isLoading={isAnalysisLoading}
        analysisError={analysisError}
      />
    </main>
  );
};
export default ErrorLogPage;
