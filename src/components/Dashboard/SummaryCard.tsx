import React from 'react';

interface SummaryCardProps {
  title: string;
  count: number | string;
  isError?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, count, isError }) => {
  const cardId = `summary-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={`summary-card ${isError ? 'error-card' : ''}`} role="region" aria-labelledby={cardId}>
      <h3 id={cardId}>{title}</h3>
      <p className="count">{count}</p>
    </div>
  );
};

export default SummaryCard;
