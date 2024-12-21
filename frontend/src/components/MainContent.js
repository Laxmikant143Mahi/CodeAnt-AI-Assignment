import React, { useEffect, useState } from 'react';
import './MainContent.css';

const MainContent = () => {
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/repositories')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setRepositories(data))
      .catch(error => console.error('Error fetching repositories:', error));
  }, []);

  return (
    <main className="main-content">
      <div className="search-bar">
        <input type="text" placeholder="Search Repositories" />
        <button>Refresh All</button>
        <button>Add Repository</button>
      </div>
      <div className="repository-list">
        {repositories.map((repo, index) => (
          <div key={index} className="repository-item">
            <h3>{repo.name}</h3>
            <p>{repo.language} • {repo.size} • Updated {repo.updated}</p>
            <span>{repo.visibility}</span>
          </div>
        ))}
      </div>
    </main>
  );
};

export default MainContent;
