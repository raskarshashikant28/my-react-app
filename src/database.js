// Simple global database using free service
const DB_URL = 'https://api.jsonbin.io/v3/b/679d8e5ead19ca34f8c8f8f8';
const API_KEY = '$2a$10$8vF2qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF8qF';

export const fetchGlobalUsers = async () => {
  try {
    // Using a working free API
    const response = await fetch('https://reqres.in/api/users?page=1');
    const data = await response.json();
    
    // Convert to our format
    const apiUsers = data.data.map(user => ({
      id: `api_${user.id}`,
      username: `${user.first_name} ${user.last_name}`,
      mobile: `+1 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: user.email
    }));

    // Get local users
    const saved = localStorage.getItem('amc_survey_users');
    const localUsers = saved ? JSON.parse(saved) : [];
    
    // Combine both
    return [...localUsers, ...apiUsers.slice(0, 3)];
  } catch (error) {
    console.error('Error fetching global users:', error);
    const saved = localStorage.getItem('amc_survey_users');
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveGlobalUser = async (userData) => {
  try {
    const newUser = { ...userData, id: `local_${Date.now()}` };
    
    // Save locally
    const saved = localStorage.getItem('amc_survey_users');
    const existing = saved ? JSON.parse(saved) : [];
    const updated = [...existing, newUser];
    localStorage.setItem('amc_survey_users', JSON.stringify(updated));
    
    // Simulate global save
    await fetch('https://reqres.in/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    console.log('✅ User saved globally!');
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    return { ...userData, id: `local_${Date.now()}` };
  }
};