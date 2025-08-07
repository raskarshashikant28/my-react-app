import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchAllUsers, saveUserGlobally } from './globalDB';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    email: ''
  });
  const [editingUser, setEditingUser] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchUsers = async () => {
    const users = await fetchAllUsers();
    setUsers(users);
  };

  const saveUser = async (userData) => {
    return await saveUserGlobally(userData);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      mobile: user.mobile,
      email: user.email || ''
    });
    setActiveTab('form');
  };

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      console.log('✅ User deleted:', user.username);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.username && formData.mobile) {
      setLoading(true);
      
      if (editingUser) {
        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...formData }
            : user
        );
        setUsers(updatedUsers);
        setEditingUser(null);
        console.log('✅ User updated!');
      } else {
        const newUser = await saveUser(formData);
        setUsers([...users, newUser]);
      }
      
      setFormData({ username: '', mobile: '', email: '' });
      setActiveTab('view');
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AMC Survey Portal</h1>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home">
            <h1>Welcome to AMC Survey Portal</h1>
            <p>Use the tabs above to navigate between form and view sections.</p>
            <p><small>🌍 Global Survey Portal - Data shared worldwide!</small></p>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="form-section">
            <h2>{editingUser ? 'Edit User' : 'User Form'}</h2>
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
                {loading ? 'Saving...' : (editingUser ? 'Update' : 'Submit')}
              </button>
              {editingUser && (
                <button 
                  type="button" 
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({ username: '', mobile: '', email: '' });
                  }}
                  style={{marginLeft: '10px', background: '#6c757d'}}
                >
                  Cancel
                </button>
              )}
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
                    <div className="user-info">
                      <h3>{user.username}</h3>
                      <p>Mobile: {user.mobile}</p>
                      {user.email && <p>Email: {user.email}</p>}
                    </div>
                    <div className="user-actions">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="edit-btn"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
                        className="delete-btn"
                      >
                        🗑️ Delete
                      </button>
                    </div>
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