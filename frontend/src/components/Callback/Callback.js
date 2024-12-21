import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Callback = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      
      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/auth/github/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }

        const { token, user } = await response.json();
        localStorage.setItem('token', token);
        setUser(user);
        navigate('/');
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate with GitHub');
      }
    };

    handleCallback();
  }, [location, navigate, setUser]);

  if (error) {
    return (
      <div className="callback-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="callback-loading">
      <h2>Authenticating...</h2>
      <p>Please wait while we complete your sign-in.</p>
    </div>
  );
};

export default Callback;
