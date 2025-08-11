const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get all users
app.get('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// Add new user
app.post('/api/users', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const users = JSON.parse(data);
    const newUser = { ...req.body, id: Date.now() };
    users.push(newUser);
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Delete user
app.delete('/api/users/:id', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const users = JSON.parse(data);
    const filteredUsers = users.filter(user => user.id != req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(filteredUsers, null, 2));
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user
app.put('/api/users/:id', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const users = JSON.parse(data);
    const userIndex = users.findIndex(user => user.id == req.params.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...req.body };
      fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
      res.json(users[userIndex]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});