import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './ProfilePage.css';

/**
 * ProfilePage - Displays user profile information
 */
function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Fetch user profile on component mount
     */
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found. Please login first.');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        const response = await apiClient.get('/api/user/profile');
        setUser(response.data.user);
      } catch (err) {
        console.error('Profile error:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return <div className="profile-container"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return <div className="profile-container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1 className="profile-title">User Profile</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        {user && (
          <div className="profile-content">
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="profile-info">
              <div className="info-group">
                <label>Name</label>
                <p>{user.name || 'Not provided'}</p>
              </div>

              <div className="info-group">
                <label>Email</label>
                <p>{user.email || 'Not provided'}</p>
              </div>

              <div className="info-group">
                <label>Auth Provider</label>
                <p>{user.provider || 'Email/Password'}</p>
              </div>

              {user.picture && (
                <div className="info-group">
                  <label>Picture</label>
                  <img src={user.picture} alt="User" className="user-picture" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
