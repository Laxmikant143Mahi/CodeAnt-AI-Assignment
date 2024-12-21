import React, { useState } from 'react';
import './AddRepositoryModal.css';

const AddRepositoryModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    language: 'React',
    visibility: 'Public'
  });

  const languages = ['React', 'Javascript', 'Python', 'Swift', 'Java', 'HTML/CSS', 'PHP'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!onClose) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Repository</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Repository Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter repository name"
              required
            />
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Visibility</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="visibility"
                  value="Public"
                  checked={formData.visibility === 'Public'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                />
                Public
              </label>
              <label>
                <input
                  type="radio"
                  name="visibility"
                  value="Private"
                  checked={formData.visibility === 'Private'}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                />
                Private
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Repository
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepositoryModal;
