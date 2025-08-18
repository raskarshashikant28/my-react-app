// Global database using deployed backend only
const BACKEND_URL = 'https://my-react-app-iy79.onrender.com/api/users';

export const fetchAllUsers = async () => {
  try {
    const response = await fetch(BACKEND_URL);
    const users = await response.json();
    console.log('✅ Fetched from backend:', users.length, 'users');
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
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
    console.log('✅ Saved to backend:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    return { ...userData, id: Date.now() };
  }
};

export const deleteUserGlobally = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${userId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      console.log('✅ Deleted from backend:', userId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
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
      console.log('✅ Updated in backend:', userId);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// Clear any old localStorage data
if (typeof window !== 'undefined') {
  localStorage.removeItem('amc_backup_users');
  localStorage.removeItem('amc_survey_users');
  localStorage.removeItem('amc_global_survey');
  localStorage.removeItem('amc_users');
  localStorage.removeItem('users');
}