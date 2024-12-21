import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Check for token in URL parameters
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      const errorFromUrl = params.get('error');

      if (errorFromUrl) {
        setError(errorFromUrl);
        setLoading(false);
        navigate('/login');
        return;
      }

      // If token is in URL, save it
      if (tokenFromUrl) {
        localStorage.setItem('token', tokenFromUrl);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Check for existing token
      const token = tokenFromUrl || localStorage.getItem('token');

      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const userData = await response.json();
          setUser(userData);
          setError(null);

          // Redirect to home if on login page
          if (window.location.pathname === '/login') {
            navigate('/');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const initiateOAuth = (provider) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    initiateOAuth,
    logout,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
