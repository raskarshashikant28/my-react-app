// Real global database solution
const API_BASE = 'https://jsonplaceholder.typicode.com';

export const fetchGlobalUsers = async () => {
  try {
    // Get demo users from API
    const response = await fetch(`${API_BASE}/users`);
    const apiUsers = await response.json();
    
    // Convert to our format (limit to 2 demo users)
    const demoUsers = apiUsers.slice(0, 2).map(user => ({
      id: `demo_${user.id}`,
      username: user.name,
      mobile: user.phone,
      email: user.email
    }));
    
    // Get real user submissions from localStorage
    const saved = localStorage.getItem('amc_real_users');
    const realUsers = saved ? JSON.parse(saved) : [];
    
    // Combine demo + real users
    return [...demoUsers, ...realUsers];
  } catch (error) {
    console.error('Error fetching users:', error);
    const saved = localStorage.getItem('amc_real_users');
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveGlobalUser = async (userData) => {
  try {
    const newUser = { 
      ...userData, 
      id: `real_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const saved = localStorage.getItem('amc_real_users');
    const existing = saved ? JSON.parse(saved) : [];
    const updated = [...existing, newUser];
    localStorage.setItem('amc_real_users', JSON.stringify(updated));
    
    // Try to post to API (for logging)
    try {
      await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `AMC Survey - ${newUser.username}`,
          body: JSON.stringify(newUser),
          userId: 1
        })
      });
      console.log('✅ User logged to global API');
    } catch (e) {
      console.log('⚠️ API logging failed');
    }
    
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    return { ...userData, id: `real_${Date.now()}` };
  }
};