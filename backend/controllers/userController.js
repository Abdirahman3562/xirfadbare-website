import User from '../models/User.js';
import generateToken from '../config/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    console.log('🔄 Update profile request for user ID:', req.user._id);
    console.log('📋 Request body:', req.body);
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📋 Request body values:', Object.values(req.body));

    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('❌ User not found with ID:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('✅ User found:', user.email);

    // Store original values for rollback if needed
    const originalUser = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      image: user.image,
    };

    // Update fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;

    // Handle password update
    if (req.body.password && req.body.password.trim()) {
      user.password = req.body.password;
    }

    // Handle image update
    if (req.body.image) {
      user.image = req.body.image;
    }

    try {
      console.log('💾 Attempting to save user with data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        hasPassword: !!user.password,
        hasImage: !!user.image,
      });

      const updatedUser = await user.save();

      console.log('✅ User saved successfully:', updatedUser.email);

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        image: updatedUser.image,
        createdAt: updatedUser.createdAt,
        token: generateToken(updatedUser._id),
      });
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      console.error('❌ Save error details:', {
        code: saveError.code,
        keyPattern: saveError.keyPattern,
        keyValue: saveError.keyValue,
        message: saveError.message,
        name: saveError.name,
      });

      // Check for duplicate email error
      if (saveError.code === 11000 && saveError.keyPattern?.email) {
        console.log('❌ Email already exists error');
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Check for validation errors
      if (saveError.name === 'ValidationError') {
        console.log('❌ Validation error:', saveError.errors);
        const validationErrors = Object.values(saveError.errors).map(err => err.message);
        return res.status(400).json({ message: `Validation error: ${validationErrors.join(', ')}` });
      }

      // For other save errors, return a generic message
      console.log('❌ Unknown save error');
      return res.status(400).json({ message: 'Failed to update profile. Please try again.' });
    }

  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

export { authUser, registerUser, getUserProfile, getUsers, updateUserProfile };


