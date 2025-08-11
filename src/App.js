import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchAllUsers, saveUserGlobally, deleteUserGlobally, updateUserGlobally } from './globalDB';

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

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
      setLoading(true);
      await deleteUserGlobally(user.id);
      const updatedUsers = users.filter(u => u.id !== user.id);
      setUsers(updatedUsers);
      setLoading(false);
      console.log('✅ User deleted globally:', user.username);
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
        await updateUserGlobally(editingUser.id, formData);
        const updatedUsers = users.map(user => 
          user.id === editingUser.id 
            ? { ...user, ...formData }
            : user
        );
        setUsers(updatedUsers);
        setEditingUser(null);
        console.log('✅ User updated globally!');
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
            <button onClick={fetchUsers} className="refresh-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Refresh
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
                        disabled={loading}
                        title="Edit User"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(user)}
                        className="delete-btn"
                        disabled={loading}
                        title="Delete User"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
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
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </span>
          <span className="label">Home</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`} 
          onClick={() => setActiveTab('form')}
        >
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </span>
          <span className="label">Add</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('view')}
        >
          <span className="icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </span>
          <span className="label">List</span>
        </button>
      </nav>
    </div>
  );
}

export default App;