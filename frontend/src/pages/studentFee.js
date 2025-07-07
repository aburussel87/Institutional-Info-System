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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePay = async (feeId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/studentFee/pay/${feeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) throw new Error('Payment failed.');
      else{
        const data = await res.json();
        alert(data.payment[0].msg || 'Payment successful!');
      }
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Payment failed. Please try again.');
    }
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
          if (response.status === 401) setError('Unauthorized. Please log in.');
          else if (response.status === 404) setError('Fee details not found.');
          else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch fee data');
          }
        }

        const data = await response.json();
        setFeeData(data.fee);
      } catch (err) {
        console.error(err);
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
        <div className="content-area">
          <h1 className="student-fee-title">Student Fee Dashboard</h1>
          <p className="student-fee-loading">Loading fee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-fee-container">
        <Header />
        <div className="content-area">
          <h1 className="student-fee-title">Student Fee Dashboard</h1>
          <p className="student-fee-error">Error: {error}</p>
          <p className="student-fee-error-suggestion">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  if (!feeData || (Object.keys(feeData.paid).length === 0 && Object.keys(feeData.unpaid).length === 0 && Object.keys(feeData.due).length === 0)) {
    return (
      <div className="student-fee-container">
        <Header />
        <div className="content-area">
          <h1 className="student-fee-title">Student Fee Dashboard</h1>
          <p className="student-fee-no-data">No fee information available at this time.</p>
        </div>
      </div>
    );
  }

  const allFeeTypes = Array.from(new Set([
    ...Object.keys(feeData.paid),
    ...Object.keys(feeData.unpaid)
  ]));

  return (
    <div className="student-fee-container">
      <Header />
      <div className="content-area">
        <h1 className="student-fee-title">Student Fee Dashboard</h1> {/* Removed 💳 */}

        {allFeeTypes.length > 0 ? (
          allFeeTypes.map((feeType) => (
            <div key={feeType} className="student-fee-card">
              <div className="student-fee-header" onClick={() => toggleExpand(feeType)}>
                <h2 className="student-fee-type-title">{feeType}</h2>
                <button className="student-fee-toggle-btn">
                  {expandedFeeType === feeType ? '▲' : '▼'}
                </button>
              </div>

              <div className="student-fee-section student-fee-unpaid-section">
                <h3 className="student-fee-unpaid-title">Unpaid Dues:</h3>
                {feeData.unpaid[feeType] && feeData.unpaid[feeType].length > 0 ? (
                  <ul className="student-fee-list student-fee-unpaid-list">
                    {feeData.unpaid[feeType].map((fee) => (
                      <li key={fee.student_fee_id} className="student-fee-item student-fee-unpaid-item">
                        <div className="fee-info">
                          <span>Amount: <strong className="amount-due">৳{fee.amount}</strong></span>
                          <span>Due Date: <strong className="date-due">{formatDate(fee.due_date)}</strong></span>
                        </div>
                        <button
                          className="student-fee-pay-btn"
                          onClick={(e) => {
                            e.stopPropagation(); 
                            handlePay(fee.student_fee_id);
                          }}
                        >
                          Pay Now
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="student-fee-none student-fee-no-dues">No dues to clear for {feeType}.</p>
                )}
              </div>

              {expandedFeeType === feeType && (
                <div className="student-fee-section student-fee-paid-section">
                  <h3 className="student-fee-paid-title">Paid History:</h3>
                  {feeData.paid[feeType] && feeData.paid[feeType].length > 0 ? (
                    <ul className="student-fee-list student-fee-paid-list">
                      {feeData.paid[feeType]
                        .sort((a, b) => new Date(b.paid_on) - new Date(a.paid_on))
                        .map((fee) => (
                          <li key={fee.student_fee_id} className="student-fee-item student-fee-paid-item">
                            <div className="fee-info">
                              <span>Amount: <strong className="amount-paid">৳{fee.amount}</strong></span>
                              <span>Paid On: <strong className="date-paid">{formatDate(fee.paid_on)}</strong></span>
                            </div>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="student-fee-none student-fee-no-history">No paid history for {feeType} yet.</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="student-fee-no-data">No fee information available at this time.</p>
        )}
      </div>
    </div>
  );
};

export default StudentFee;