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
      welcome: 'Welcome to Survey App',
      description: 'Complete surveys and view responses from all participants',
      username: 'Full Name',
      mobile: 'Mobile Number',
      email: 'Email Address',
      submit: 'Submit Survey',
      update: 'Update Response',
      cancel: 'Cancel',
      home: 'Home',
      survey: 'Survey',
      responses: 'Responses',
      editUser: 'Edit Response',
      surveyForm: 'Survey Form',
      responseData: 'Survey Responses',
      deleteConfirm: 'Are you sure you want to delete this response?',
      deleteTitle: 'Delete Response',
      yes: 'Yes, Delete',
      no: 'Cancel'
    },
    mr: {
      welcome: 'सर्वेक्षण अॅपमध्ये आपले स्वागत आहे',
      description: 'सर्वेक्षण पूर्ण करा आणि सर्व सहभागींचे प्रतिसाद पहा',
      username: 'पूर्ण नाव',
      mobile: 'मोबाइल नंबर',
      email: 'ईमेल पत्ता',
      submit: 'सर्वेक्षण सबमिट करा',
      update: 'प्रतिसाद अपडेट करा',
      cancel: 'रद्द करा',
      home: 'होम',
      survey: 'सर्वेक्षण',
      responses: 'प्रतिसाद',
      editUser: 'प्रतिसाद संपादित करा',
      surveyForm: 'सर्वेक्षण फॉर्म',
      responseData: 'सर्वेक्षण प्रतिसाद',
      deleteConfirm: 'तुम्हाला खात्री आहे की तुम्ही हा प्रतिसाद हटवू इच्छिता?',
      deleteTitle: 'प्रतिसाद हटवा',
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
          <h1>📊 Survey App</h1>
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
              मर
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <div className="home">
            <div className="welcome-content">
              <div className="survey-icon">📋</div>
              <h1>{t.welcome}</h1>
              <p>{t.description}</p>
              <div className="stats">
                <div className="stat-item">
                  <span className="stat-number">{users.length}</span>
                  <span className="stat-label">Total Responses</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">🌍</span>
                  <span className="stat-label">Global Survey</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'form' && (
          <div className="form-section">
            <h2>{editingUser ? t.editUser : t.surveyForm}</h2>
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
              <h2>{t.responseData}</h2>
              <span onClick={fetchUsers} className="refresh-icon" title="Refresh">
                🔄
              </span>
            </div>
            {users.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">📝</div>
                <p>No survey responses yet</p>
                <p><small>Be the first to complete the survey!</small></p>
              </div>
            ) : (
              <div className="user-list">
                {users.map(user => (
                  <div key={user.id} className="response-card">
                    <div className="response-info">
                      <div className="response-header">
                        <h3>{user.username}</h3>
                        <div className="response-actions">
                          <span onClick={() => handleEdit(user)} className="edit-icon" title="Edit">
                            ✏️
                          </span>
                          <span onClick={() => handleDelete(user)} className="delete-icon" title="Delete">
                            🗑️
                          </span>
                        </div>
                      </div>
                      <div className="response-details">
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
          <span className="label">{t.survey}</span>
        </button>
        <button 
          className={`nav-btn ${activeTab === 'view' ? 'active' : ''}`} 
          onClick={() => setActiveTab('view')}
        >
          <span className="icon">📊</span>
          <span className="label">{t.responses}</span>
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