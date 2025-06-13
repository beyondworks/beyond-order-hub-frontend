import React from 'react';

const ErrorsPageSimple: React.FC = () => {
  return (
    <div className="main-content">
      <h1>오류 관리</h1>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
        <h3>🚨 시스템 오류 관리</h3>
        <p>애플리케이션에서 발생하는 오류를 모니터링하고 관리하는 페이지입니다.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h4>주요 기능:</h4>
          <ul>
            <li>실시간 오류 모니터링</li>
            <li>오류 로그 분석</li>
            <li>오류 해결 상태 추적</li>
            <li>알림 및 보고서 생성</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <h4>오류 통계:</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px', textAlign: 'center' }}>
              <strong>경고</strong><br />
              <span style={{ fontSize: '24px', color: '#856404' }}>0</span>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px', textAlign: 'center' }}>
              <strong>오류</strong><br />
              <span style={{ fontSize: '24px', color: '#721c24' }}>0</span>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#d1ecf1', borderRadius: '4px', textAlign: 'center' }}>
              <strong>정보</strong><br />
              <span style={{ fontSize: '24px', color: '#0c5460' }}>0</span>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
          <strong>✅ 현재 상태:</strong> 모든 시스템이 정상 작동 중입니다.
        </div>
      </div>
    </div>
  );
};

export default ErrorsPageSimple;