import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';
import { ReactComponent as Logo } from '../../assets/icons/logo.svg';
import { ReactComponent as GithubIcon } from '../../assets/icons/github.svg';
import { ReactComponent as BitbucketIcon } from '../../assets/icons/bitbucket.svg';
import { ReactComponent as AzureIcon } from '../../assets/icons/azure.svg';
import { ReactComponent as GitlabIcon } from '../../assets/icons/gitlab.svg';
import { ReactComponent as SSOIcon } from '../../assets/icons/sso.svg';

const Login = () => {
  const [selectedOption, setSelectedOption] = useState('saas');
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }

    // Check for error in URL
    const params = new URLSearchParams(window.location.search);
    const errorFromUrl = params.get('error');
    if (errorFromUrl) {
      setError(errorFromUrl);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user, navigate]);

  const handleGitHubLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/github/url');
      if (!response.ok) {
        throw new Error('Failed to get GitHub authorization URL');
      }
      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error initiating GitHub login:', error);
      setError('Failed to initiate GitHub login');
    }
  };

  const renderLoginButtons = () => {
    const buttons = [
      {
        icon: <GithubIcon />,
        text: 'Sign in with Github',
        key: 'github',
        show: selectedOption === 'saas',
        onClick: handleGitHubLogin
      },
      {
        icon: <GitlabIcon />,
        text: 'Sign in with GitLab',
        key: 'gitlab',
        show: selectedOption === 'saas',
        onClick: () => console.log('GitLab login not implemented')
      },
      {
        icon: <BitbucketIcon />,
        text: 'Sign in with Bitbucket',
        key: 'bitbucket',
        show: selectedOption === 'saas',
        onClick: () => console.log('Bitbucket login not implemented')
      },
      {
        icon: <AzureIcon />,
        text: 'Sign in with Azure DevOps',
        key: 'azure',
        show: selectedOption === 'saas',
        onClick: () => console.log('Azure login not implemented')
      },
      {
        icon: <SSOIcon />,
        text: 'Sign in with SSO',
        key: 'sso',
        show: selectedOption === 'self',
        onClick: () => console.log('SSO login not implemented')
      }
    ];

    return buttons
      .filter(button => button.show)
      .map(button => (
        <button 
          key={button.key} 
          className="login-button"
          onClick={button.onClick}
          type="button"
        >
          {button.icon}
          {button.text}
        </button>
      ));
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <Logo className="logo" />
          <h1>Welcome to CodeAnt AI</h1>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="hosting-options">
          <button
            className={`hosting-button ${selectedOption === 'saas' ? 'active' : ''}`}
            onClick={() => setSelectedOption('saas')}
          >
            SAAS
          </button>
          <button
            className={`hosting-button ${selectedOption === 'self' ? 'active' : ''}`}
            onClick={() => setSelectedOption('self')}
          >
            Self Hosted
          </button>
        </div>

        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">30+</div>
            <div className="stat-label">Language Support</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">10K+</div>
            <div className="stat-label">Developers</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">100K+</div>
            <div className="stat-label">Hours Saved</div>
          </div>
        </div>

        <div className="issues-fixed">
          <div className="stat-circle">
            <span className="percentage">↗ 14%</span>
            <span className="time-period">This week</span>
          </div>
          <div className="issues-text">
            <div className="issues-label">Issues Fixed</div>
            <div className="issues-count">500K+</div>
          </div>
        </div>

        <div className="login-options">
          {renderLoginButtons()}
        </div>

        <div className="privacy-notice">
          By signing up you agree to the <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
