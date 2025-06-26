const { sequelize } = require('../db/db');
const EndUser = require('../models/endUserModal')(sequelize);
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { generateEndUserId } = require('../utils/helperFunctions');
const PUBLIC_ROOT = path.join(__dirname, '..', 'public');
const normalizeRelPath = (rel) =>
  rel
    ? rel.replace(/^[/\\]+/, '')
    : null;
// Create a new user
const createUser = async (req, res) => {
  const { firstName, email, lastName, password } = req.body;
  const id = await generateEndUserId()
  try {
   
    const existingUser = await EndUser.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await EndUser.create({
      userId: id, firstName, email, lastName, password
    });
    res.status(201).json({ message: 'User created successfully', user: { ...user.toJSON(), password: undefined } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};

// Get user by ID
const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await EndUser.findByPk(userId, {
      attributes: { exclude: ['password'] }, // Exclude password from response
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
};

// Update user


const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { firstName, lastName, email, password , address , city , state , country , phoneNumber } = req.body;
  const uploadedFile = req.file?.filename;

  try {
    const user = await EndUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile picture only if a new one is uploaded
    if (uploadedFile && user.profilePicture) {
      const oldPath = path.join(__dirname, '..', 'public', user.profilePicture.replace('/uploads/', '')); // trim leading path
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save path like: /upload/userProfile/filename.png
    const profilePicturePath = uploadedFile ? path.join('/uploads/userProfile', uploadedFile).replace(/\\/g, '/') : undefined;

    // Update user
    await user.update({
      firstName,
      lastName,
      email,
      password,address , city , state , country , phoneNumber , 
      ...(profilePicturePath && { profilePicture: profilePicturePath }),
    });

    res.json({
      message: 'User updated successfully',
      user: { ...user.toJSON(), password: undefined },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await EndUser.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};

// Validate user login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await EndUser.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ message: 'Login successful', user: { userId: user.userId, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
};
// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await EndUser.findAll({
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });
    res.json({ message: 'All users fetched successfully', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

const updateProfilePicture = async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. guards
    const user = await EndUser.findByPk(userId);
    if (!user) {
      if (req.file) await fs.unlink(req.file.path).catch(() => { });
      return res.status(404).json({ error: 'User not found' });
    }
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 2. new relative path (already relative to /public)
    const newRelPath = path
      .relative(PUBLIC_ROOT, req.file.path)
      .replace(/\\/g, '/'); // windows → slashes
    console.log('newRelPath', newRelPath)
    // 3. old picture absolute path (if any)
    const oldRelPath = normalizeRelPath(user.profilePicture);
    const oldAbsPath = oldRelPath ? path.join(PUBLIC_ROOT, oldRelPath) : null;
    console.log('newRelPath', oldRelPath, oldAbsPath)
    // 4. update DB
    await user.update({ profilePicture: newRelPath });

    // 5. delete old pic (ignore "ENOENT")
    if (oldAbsPath) {
      await fs.unlink(oldAbsPath).catch((err) => {
        if (err.code !== 'ENOENT') {
          console.error('Could not delete old profile picture:', err);
        }
      });
    }

    return res.json({
      message: 'Profile picture updated successfully',
      profilePicture: newRelPath, // e.g. "uploads/userProfile/abc.jpg"
    });
  } catch (error) {
    // cleanup new upload on any failure
    if (req.file) await fs.unlink(req.file.path).catch(() => { });
    console.error('Error updating profile picture:', error);
    return res.status(500).json({
      error: 'Failed to update profile picture',
      details: error.message,
    });
  }
};



module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUsers,
  updateProfilePicture
};