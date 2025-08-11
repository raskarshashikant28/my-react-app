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
  const [showDeletePopup, setShowDeletePopup] = useState(null);
  const [language, setLanguage] = useState('en');

  const texts = {
    en: {
      welcome: 'Welcome to My App',
      description: 'Add your information and view all entries from users',
      username: 'Full Name',
      mobile: 'Mobile Number',
      email: 'Email Address',
      submit: 'Submit',
      update: 'Update',
      cancel: 'Cancel',
      home: 'Home',
      form: 'Form',
      list: 'List',
      editUser: 'Edit Entry',
      userForm: 'User Form',
      userData: 'User Data',
      deleteConfirm: 'Are you sure you want to delete this entry?',
      deleteTitle: 'Delete Entry',
      yes: 'Yes, Delete',
      no: 'Cancel'
    },
    mr: {
      welcome: 'माझ्या अॅपमध्ये आपले स्वागत आहे',
      description: 'आपली माहिती जोडा आणि सर्व वापरकर्त्यांच्या नोंदी पहा',
      username: 'पूर्ण नाव',
      mobile: 'मोबाइल नंबर',
      email: 'ईमेल पत्ता',
      submit: 'सबमिट करा',
      update: 'अपडेट करा',
      cancel: 'रद्द करा',
      home: 'होम',
      form: 'फॉर्म',
      list: 'यादी',
      editUser: 'नोंद संपादित करा',
      userForm: 'वापरकर्ता फॉर्म',
      userData: 'वापरकर्ता डेटा',
      deleteConfirm: 'तुम्हाला खात्री आहे की तुम्ही ही नोंद हटवू इच्छिता?',
      deleteTitle: 'नोंद हटवा',
      yes: 'होय, हटवा',
      no: 'रद्द करा'
    }
  };

  const t = texts[language];

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
    setShowDeletePopup(user);
  };

  const confirmDelete = async () => {
    if (showDeletePopup) {
      setLoading(true);
      await deleteUserGlobally(showDeletePopup.id);
      const updatedUsers = users.filter(u => u.id !== showDeletePopup.id);
      setUsers(updatedUsers);
      setShowDeletePopup(null);
      setLoading(false);
      console.log('✅ User deleted globally:', showDeletePopup.username);
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
        <div className="header-content">
          <h1>📱 My App</h1>
          <div className="language-toggle">
            <button 
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button 
              className={language === 'mr' ? 'active' : ''}
              onClick={() => setLanguage('mr')}
            >
              मराठी
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home">
            <div className="welcome-content">
              <div className="app-icon">📱</div>
              <h1>{t.welcome}</h1>
              <p>{t.description}</p>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">Total Users</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">🌍</span>
                  <span className="stat-label">Global App</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="form-section">
            <h2>{editingUser ? t.editUser : t.userForm}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>{t.username}:</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.mobile}:</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.email}:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? '⏳' : (editingUser ? t.update : t.submit)}
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
                  {t.cancel}
                </button>
              )}
            </form>
          </div>
        )}

        {activeTab === 'view' && (
          <div className="view-section">
            <div className="view-header">
              <h2>{t.userData}</h2>
              <span onClick={fetchUsers} className="refresh-icon" title="Refresh">
                🔄
              </span>
            </div>
            {users.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📝</div>
                <p>No users added yet</p>
                <p><small>Be the first to add your information!</small></p>
              </div>
            ) : (
              <div className="user-list">
                {users.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <div className="user-header">
                        <h3>{user.username}</h3>
                        <div className="user-actions">
                          <span onClick={() => handleEdit(user)} className="edit-icon" title="Edit">
                            ✏️
                          </span>
                          <span onClick={() => handleDelete(user)} className="delete-icon" title="Delete">
                            🗑️
                          </span>
                        </div>
                      </div>
                      <div className="user-details">
                        <p>📱 {user.mobile}</p>
                        {user.email && <p>📧 {user.email}</p>}
                      </div>
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
          <span className="label">{t.home}</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'form' ? 'active' : ''}`} 
          onClick={() => setActiveTab('form')}
        >
          <span className="icon">📝</span>
          <span className="label">{t.form}</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('view')}
        >
          <span className="icon">📊</span>
          <span className="label">{t.list}</span>
        </button>
      </nav>

      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <div className="popup-header">
              <h3>{t.deleteTitle}</h3>
            </div>
            <div className="popup-content">
              <p>{t.deleteConfirm}</p>
              <p><strong>{showDeletePopup.username}</strong></p>
            </div>
            <div className="popup-actions">
              <button onClick={() => setShowDeletePopup(null)} className="cancel-btn">
                {t.no}
              </button>
              <button onClick={confirmDelete} className="delete-btn" disabled={loading}>
                {loading ? '⏳' : t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;