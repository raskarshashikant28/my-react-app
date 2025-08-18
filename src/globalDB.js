// Global database using deployed backend only
const BACKEND_URL = 'https://my-react-app-iy79.onrender.com/api/users';

export const fetchAllUsers = async () => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const users = await response.json();
    console.log('✅ Fetched from backend:', users.length, 'users');
    
    // Ensure we return an array
    if (Array.isArray(users)) {
      return users;
    } else {
      console.warn('Backend returned non-array data:', users);
      return [];
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    // Don't throw error - let UI handle gracefully
    return null; // Return null to indicate error, not empty array
  }
};

export const saveUserGlobally = async (userData) => {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const newUser = await response.json();
    console.log('✅ Saved to backend:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    // Create local user with timestamp ID as fallback
    const fallbackUser = { ...userData, id: Date.now() };
    console.log('⚠️ Using fallback save:', fallbackUser);
    return fallbackUser;
  }
};

export const deleteUserGlobally = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${userId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ Deleted from backend:', userId);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserGlobally = async (userId, userData) => {
  try {
    const response = await fetch(`${BACKEND_URL}/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ Updated in backend:', userId);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
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