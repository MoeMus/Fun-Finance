import React, { useState } from 'react';
import './CalendarImport.css';

const CalendarImport = ({ onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('Personal');
  const [uploading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Please select a file first.');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);

    try {
      const response = await fetch('http://127.0.0.1:5000/calendar/import', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.events) {
        setMessage(`Success! Imported ${data.count} events from ${source}.`);
        onImportSuccess(data.events);
        setFile(null);
      } else {
        setMessage(data.error || 'Import failed.');
      }
    } catch (err) {
      setMessage('Server error. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calendar-import-card">
      <h3>Import Multi-Calendar</h3>
      <form onSubmit={handleUpload} className="import-form">
        <div className="import-row">
          <label>Source:</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="Personal">🏠 Personal</option>
            <option value="Work">💼 Work</option>
            <option value="Social">🍻 Social</option>
            <option value="Family">👨‍👩‍👧‍👦 Family</option>
          </select>
        </div>
        
        <div className="import-row">
          <input 
            type="file" 
            accept=".ics" 
            onChange={handleFileChange} 
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-label">
            {file ? file.name : 'Choose .ics File'}
          </label>
        </div>

        <button type="submit" className="import-btn" disabled={uploading}>
          {uploading ? 'PARSING...' : 'ADD TO VAULT'}
        </button>
      </form>
      {message && <p className="import-message">{message}</p>}
    </div>
  );
};

export default CalendarImport;
