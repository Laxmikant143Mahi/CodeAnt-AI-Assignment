import React, { useState, useEffect, useRef } from 'react';
import AddRepositoryModal from '../AddRepositoryModal/AddRepositoryModal';
import './MainContent.css';
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg';
import { ReactComponent as RefreshIcon } from '../../assets/icons/refresh.svg';
import { ReactComponent as PlusIcon } from '../../assets/icons/plus.svg';
import { ReactComponent as MenuIcon } from '../../assets/icons/menu.svg';
import { useAuth } from '../../context/AuthContext';

const MainContent = () => {
  const { user, logout } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/repositories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      console.error('Error fetching repositories:', error);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRepositories().finally(() => {
      setIsRefreshing(false);
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddRepository = async (repositoryData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(repositoryData),
      });

      if (!response.ok) {
        throw new Error('Failed to add repository');
      }

      const newRepo = await response.json();
      setRepositories(prev => [newRepo, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding repository:', error);
    }
  };

  const handleDeleteRepository = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/repositories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete repository');
      }

      setRepositories(prev => prev.filter(repo => repo.id !== id));
    } catch (error) {
      console.error('Error deleting repository:', error);
    }
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="main-content">
      <div className="content-header">
        <div className="header-top">
          <div className="title-section">
            <h1 className="repositories-title">Repositories</h1>
            <span className="total-repos">{repositories.length} total repositories</span>
          </div>
          <div className="user-section">
            <img src={user.avatarUrl} alt={user.username} className="user-avatar" />
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
          {isMobile ? (
            <div className="mobile-menu" ref={menuRef}>
              <button className="menu-button" onClick={toggleMenu}>
                <MenuIcon />
              </button>
              {isMenuOpen && (
                <div className="menu-dropdown">
                  <button className="menu-item" onClick={handleRefresh}>
                    <RefreshIcon />
                    Refresh
                  </button>
                  <button className="menu-item" onClick={() => setIsModalOpen(true)}>
                    <PlusIcon />
                    Add Repo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="button-group">
              <button
                className={"refresh-button " + (isRefreshing ? 'spinning' : '')}
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshIcon />
                Refresh All
              </button>
              <button 
                className="add-repo-button"
                onClick={() => setIsModalOpen(true)}
              >
                <PlusIcon />
                Add Repository
              </button>
            </div>
          )}
        </div>
        
        <div className="actions-container">
          <div className="search-box">
            <span className="search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder={isMobile ? "Search" : "Search Repositories"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="repository-list">
        {filteredRepos.map((repo, index) => (
          <div key={index} className="repository-item">
            <div className="repo-header">
              <span className="repo-name">{repo.name}</span>
              <span className={"visibility-tag " + repo.visibility.toLowerCase()}>
                {repo.visibility}
              </span>
              <button onClick={() => handleDeleteRepository(repo.id)} className="delete-button">Delete</button>
            </div>
            <div className="repo-details">
              <div className="language-indicator">
                <span 
                  className="language-dot" 
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
                />
                <span>{repo.language}</span>
              </div>
              <span>{repo.size}</span>
              <span>Updated {repo.updated}</span>
              {repo.contributors && repo.contributors.map((contributor, i) => (
                <span key={i} className="contributor-tag">
                  {contributor}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddRepositoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddRepository}
      />
    </main>
  );
};

const getLanguageColor = (language) => {
  const colors = {
    'React': '#61DAFB',
    'Javascript': '#F7DF1E',
    'Python': '#3572A5',
    'Swift': '#FFAC45',
    'Java': '#B07219',
    'HTML/CSS': '#E34C26',
    'PHP': '#4F5D95'
  };
  return colors[language] || '#888888';
};

export default MainContent;
