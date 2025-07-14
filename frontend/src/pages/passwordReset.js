import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/config';

const Header = () => (
  <header className="bg-primary text-white py-4 shadow-sm">
    <div className="container d-flex justify-content-between align-items-center">
      <h1 className="h4 mb-0 font-weight-bold">RESET YOUR PASSWORD: LINK WILL BE VALID FOR 5 MINUTES</h1>
    </div>
  </header>
);


const PasswordReset = () => {
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    const resetToken = localStorage.getItem('resetToken');
    if (!token || !resetToken) {
      setError('You are not logged in. Please login first.');
      setIsLoading(false);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          resetToken,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to reset password.');
      } else {
        setSuccess('Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light-subtle py-4">
        <div className="card shadow-lg p-4 p-md-5 w-100" style={{ maxWidth: '480px', borderRadius: '1rem' }}>
          <h2 className="text-center mb-4 font-weight-bold">Reset Your Password</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="oldPasswordInput" className="form-label">
                Old Password:
              </label>
              <input
                id="oldPasswordInput"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="form-control form-control-lg"
                placeholder="Enter old password"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="newPasswordInput" className="form-label">
                New Password:
              </label>
              <input
                id="newPasswordInput"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="form-control form-control-lg"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPasswordInput" className="form-label">
                Confirm New Password:
              </label>
              <input
                id="confirmPasswordInput"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="form-control form-control-lg"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="alert alert-danger fade show mb-3" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success fade show mb-3" role="alert">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordReset;