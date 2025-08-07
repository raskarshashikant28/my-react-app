import React, { useState, useEffect } from 'react';
import './App.css';

// Using Firebase Realtime Database for global data sharing
const FIREBASE_URL = 'https://amc-survey-default-rtdb.firebaseio.com/users.json';

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

  // Fetch users from global shared database
  const fetchUsers = async () => {
    try {
      const response = await fetch(FIREBASE_URL);
      const data = await response.json();
      
      if (data) {
        // Convert Firebase object to array
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  // Save user to global shared database
  const saveUser = async (userData) => {
    try {
      const userId = Date.now().toString();
      const response = await fetch(`https://amc-survey-default-rtdb.firebaseio.com/users/${userId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        return { id: userId, ...userData };
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      return { id: Date.now().toString(), ...userData };
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
        <h1>my-app</h1>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home">
            <h1>Welcome to my-app</h1>
            <p>Use the tabs above to navigate between form and view sections.</p>
            <p><small>✅ Data is shared between all users worldwide!</small></p>
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