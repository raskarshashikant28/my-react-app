// Global database using deployed backend
const BACKEND_URL = 'https://my-react-app-iy79.onrender.com/api/users';

export const fetchAllUsers = async () => {
  try {
    const response = await fetch(BACKEND_URL);
    const users = await response.json();
    console.log('✅ Fetched from global database:', users.length, 'users');
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to localStorage if backend is down
    const saved = localStorage.getItem('amc_backup_users');
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveUserGlobally = async (userData) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    const newUser = await response.json();
    console.log('✅ Saved to global database!');
    
    // Also backup locally
    const saved = localStorage.getItem('amc_backup_users');
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem('amc_backup_users', JSON.stringify([...existing, newUser]));
    
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    // Fallback to localStorage if backend is down
    const newUser = { ...userData, id: Date.now() };
    const saved = localStorage.getItem('amc_backup_users');
    const existing = saved ? JSON.parse(saved) : [];
    localStorage.setItem('amc_backup_users', JSON.stringify([...existing, newUser]));
    return newUser;
  }
};

export const deleteUserGlobally = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${userId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      console.log('✅ Deleted from global database!');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

export const updateUserGlobally = async (userId, userData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      console.log('✅ Updated in global database!');
    }
  } catch (error) {
    console.error('Error updating user:', error);
  }
};