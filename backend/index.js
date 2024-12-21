require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('./config/passport');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const User = require('./models/User');
const Repository = require('./models/Repository');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(passport.initialize());

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// OAuth Routes
app.get('/api/auth/github/url', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=http://localhost:3000/api/auth/github/callback&` +
    `scope=user,repo`;
  res.json({ url: githubAuthUrl });
});

app.get('/api/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: 'http://localhost:3000/api/auth/github/callback'
    }, {
      headers: {
        Accept: 'application/json'
      }
    });

    const accessToken = tokenResponse.data.access_token;

    // Get user data from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const githubUser = userResponse.data;

    // Find or create user in MongoDB
    let user = await User.findOne({ providerId: githubUser.id.toString(), provider: 'github' });

    if (!user) {
      user = await User.create({
        username: githubUser.login,
        email: githubUser.email || `${githubUser.login}@github.com`,
        provider: 'github',
        providerId: githubUser.id.toString(),
        avatarUrl: githubUser.avatar_url,
        accessToken
      });
    } else {
      user.accessToken = accessToken;
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication failed`);
  }
});

// User Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-accessToken -refreshToken');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Repository Routes
app.get('/api/repositories', authenticateToken, async (req, res) => {
  try {
    const repositories = await Repository.find({ owner: req.user.id })
      .populate('owner', 'username avatarUrl')
      .populate('contributors', 'username avatarUrl')
      .sort({ updatedAt: -1 });
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

app.post('/api/repositories', authenticateToken, async (req, res) => {
  try {
    const { name, language, visibility } = req.body;
    
    if (!name || !language || !visibility) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['name', 'language', 'visibility']
      });
    }

    // Check if repository name already exists for this user
    const existingRepo = await Repository.findOne({ 
      owner: req.user.id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingRepo) {
      return res.status(400).json({ error: 'Repository name already exists' });
    }

    const repository = await Repository.create({
      name,
      language,
      visibility,
      owner: req.user.id,
      contributors: [req.user.id]
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { repositories: repository._id }
    });

    const populatedRepo = await Repository.findById(repository._id)
      .populate('owner', 'username avatarUrl')
      .populate('contributors', 'username avatarUrl');

    res.status(201).json(populatedRepo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create repository' });
  }
});

app.delete('/api/repositories/:id', authenticateToken, async (req, res) => {
  try {
    const repository = await Repository.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!repository) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    await Repository.deleteOne({ _id: repository._id });
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { repositories: repository._id }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete repository' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
