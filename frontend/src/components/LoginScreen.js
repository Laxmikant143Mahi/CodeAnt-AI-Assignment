import React from 'react';
import './LoginScreen.css';

const LoginScreen = () => {
  return (
    <div className="login-screen">
      <h1>Welcome to CodeAnt AI</h1>
      <div className="login-options">
        <button>Sign in with GitHub</button>
        <button>Sign in with Bitbucket</button>
        <button>Sign in with Azure DevOps</button>
        <button>Sign in with GitLab</button>
      </div>
    </div>
  );
};

export default LoginScreen;
