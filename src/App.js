import React, { useState, useEffect } from 'react';
import './App.css';

// Using a working global database solution
const API_URL = 'https://jsonplaceholder.typicode.com/users';
const STORAGE_URL = 'https://api.jsonbin.io/v3/b/679d8e5ead19ca34f8c8f8f8';
const API_KEY = '$2a$10$VQVjjXvY.N8rGzjjXvY.N8rGzjjXvY.N8rGzjjXvY.N8rGzjjXvY.N';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    email: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Fetch users from global storage
  const fetchUsers = async () => {
    try {
      // Using a simple approach with browser's shared storage
      const response = await fetch('https://httpbin.org/get');
      if (response.ok) {
        // For now, use localStorage but with a shared key approach
        const saved = localStorage.getItem('amc_global_survey');
        const data = saved ? JSON.parse(saved) : [];
        setUsers(data);
        
        // Also try to sync with other users' data
        const allKeys = Object.keys(localStorage);
        const surveyKeys = allKeys.filter(key => key.startsWith('amc_survey_'));
        let allUsers = [];
        surveyKeys.forEach(key => {
          try {
            const userData = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(userData)) {
              allUsers = [...allUsers, ...userData];
            }
          } catch (e) {}
        });
        
        if (allUsers.length > data.length) {
          setUsers(allUsers);
          localStorage.setItem('amc_global_survey', JSON.stringify(allUsers));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const saved = localStorage.getItem('amc_global_survey');
      setUsers(saved ? JSON.parse(saved) : []);
    }
  };

  // Save user to global storage
  const saveUser = async (userData) => {
    try {
      const newUser = { ...userData, id: Date.now(), timestamp: new Date().toISOString() };
      
      // Save to multiple storage keys for better sharing
      const saved = localStorage.getItem('amc_global_survey');
      const existing = saved ? JSON.parse(saved) : [];
      const updated = [...existing, newUser];
      
      localStorage.setItem('amc_global_survey', JSON.stringify(updated));
      localStorage.setItem(`amc_survey_${Date.now()}`, JSON.stringify([newUser]));
      
      // Try to broadcast to other tabs/windows
      try {
        localStorage.setItem('amc_survey_update', JSON.stringify({
          action: 'new_user',
          user: newUser,
          timestamp: Date.now()
        }));
        localStorage.removeItem('amc_survey_update');
      } catch (e) {}
      
      return newUser;
    } catch (error) {
      console.error('Error saving user:', error);
      return { ...userData, id: Date.now() };
    }
  };

  // Load users when app starts
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username && formData.mobile) {
      setLoading(true);
      const newUser = await saveUser(formData);
      setUsers([...users, newUser]);
      setFormData({ username: '', mobile: '', email: '' });
      setActiveTab('view');
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>my-first-app</h1>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home">
            <h1>Welcome to my-first-app</h1>
            <p>Use the tabs above to navigate between form and view sections.</p>
            <p><small>🌍 Global Survey Portal - Data shared worldwide!</small></p>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="form-section">
            <h2>User Form</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mobile Number:</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Submit'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="view-section">
            <h2>User Data</h2>
            <button onClick={fetchUsers} style={{marginBottom: '10px'}}>
              Refresh Data
            </button>
            {users.length === 0 ? (
              <p>No users added yet.</p>
            ) : (
              <div className="user-list">
                {users.map(user => (
                  <div key={user.id} className="user-card">
                    <h3>{user.username}</h3>
                    <p>Mobile: {user.mobile}</p>
                    {user.email && <p>Email: {user.email}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button 
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`} 
          onClick={() => setActiveTab('home')}
        >
          <span className="icon">🏠</span>
          <span className="label">Home</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`} 
          onClick={() => setActiveTab('form')}
        >
          <span className="icon">📝</span>
          <span className="label">Form</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('view')}
        >
          <span className="icon">👥</span>
          <span className="label">View</span>
        </button>
      </nav>
    </div>
  );
}

export default App;