import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  });
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

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.mobile) {
      setUsers([...users, { ...formData, id: Date.now() }]);
      setFormData({ username: '', mobile: '', email: '' });
      setActiveTab('view');
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">MyApp</div>
        <div className="tabs">
          <button 
            className={activeTab === 'home' ? 'active' : ''} 
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button 
            className={activeTab === 'form' ? 'active' : ''} 
            onClick={() => setActiveTab('form')}
          >
            Form
          </button>
          <button 
            className={activeTab === 'view' ? 'active' : ''} 
            onClick={() => setActiveTab('view')}
          >
            View
          </button>
        </div>
      </nav>

      <div className="content">
        {activeTab === 'home' && (
          <div className="home">
            <h1>Welcome to MyApp1</h1>
            <p>Use the tabs above to navigate between form and view sections.</p>
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
              <button type="submit">Submit</button>
            </form>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="view-section">
            <h2>User Data</h2>
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
      </div>
    </div>
  );
}

export default App;
