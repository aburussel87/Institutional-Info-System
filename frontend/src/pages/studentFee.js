import React, { useState, useEffect } from 'react';
import Header from './header';
import '../styles/studentFee.css';
import API_BASE_URL from '../config/config';

const StudentFee = () => {
  const [feeData, setFeeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFeeType, setExpandedFeeType] = useState(null);

  const toggleExpand = (feeType) => {
    setExpandedFeeType(expandedFeeType === feeType ? null : feeType);
  };

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/studentFee`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized. Please log in.');
          } else if (response.status === 404) {
            setError('Fee details not found.');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch fee data');
          }
        }

        const data = await response.json();
        setFeeData(data.fee);
      } catch (err) {
        console.error('Error fetching fee data:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeData();
  }, []);

  if (isLoading) {
    return (
      <div className="student-fee-container">
        <Header />
        <h1 className="student-fee-title">Student Fee Dashboard</h1>
        <p className="student-fee-loading">Loading fee details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-fee-container">
        <Header />
        <h1 className="student-fee-title">Student Fee Dashboard</h1>
        <p className="student-fee-error">Error: {error}</p>
        <p className="student-fee-error-suggestion">Please try again later or contact support.</p>
      </div>
    );
  }

  if (!feeData || (Object.keys(feeData.paid).length === 0 && Object.keys(feeData.unpaid).length === 0)) {
    return (
      <div className="student-fee-container">
        <Header />
        <h1 className="student-fee-title">Student Fee Dashboard</h1>
        <p className="student-fee-no-data">No fee information available at this time.</p>
      </div>
    );
  }

  return (
    <div className="student-fee-container">
      <Header />
      <h1 className="student-fee-title">Student Fee Dashboard</h1>

      {Object.keys(feeData.paid).map((feeType) => (
        <div key={feeType} className="student-fee-card">
          <div className="student-fee-header" onClick={() => toggleExpand(feeType)}>
            <h2 className="student-fee-type-title">{feeType}</h2>
            <span className="student-fee-expand-icon">
              {expandedFeeType === feeType ? '-' : '+'}
            </span>
          </div>

          <div className="student-fee-unpaid-section">
            <h3 className="student-fee-unpaid-title">Unpaid Dues:</h3>
            {feeData.unpaid[feeType] && feeData.unpaid[feeType].length > 0 ? (
              <ul className="student-fee-unpaid-list">
                {feeData.unpaid[feeType].map((fee) => (
                  <li key={fee.id || `${feeType}-${fee.amount}-${fee.date}`} className="student-fee-unpaid-item">
                    Amount: ${fee.amount} | Due Date: {fee.date}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="student-fee-no-dues">No dues to clear for {feeType}.</p>
            )}
          </div>

          {expandedFeeType === feeType && (
            <div className="student-fee-paid-section">
              <h3 className="student-fee-paid-title">Paid History:</h3>
              {feeData.paid[feeType] && feeData.paid[feeType].length > 0 ? (
                <ul className="student-fee-paid-list">
                  {feeData.paid[feeType]
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((fee) => (
                      <li key={fee.id || `${feeType}-${fee.amount}-${fee.date}`} className="student-fee-paid-item">
                        Amount: ${fee.amount} | Paid On: {fee.date}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="student-fee-no-history">No paid history for {feeType}.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentFee;
