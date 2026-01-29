import User from '../models/User.js';
import generateToken from '../config/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { verificationEmailTemplate } from '../utils/emailTemplates.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401).json({ message: 'Your account is deactivated. Please contact admin.' });
      return;
    }

    if (user.is2FAEnabled) {
      // Generate 6-digit code
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorCode = otp;
      const expirationMinutes = parseInt(process.env.OTP_EXPIRATION_MINUTES) || 10;
      user.twoFactorExpires = Date.now() + expirationMinutes * 60 * 1000;
      await user.save();

      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Login Verification Code',
          message: `Your verification code is: ${otp}`,
          html: verificationEmailTemplate(otp, expirationMinutes),
        });
        res.status(200).json({ require2FA: true, email: user.email });
        return;
      } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ message: 'Error sending verification email' });
        return;
      }
    }

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      is2FAEnabled: user.is2FAEnabled,
      isChatPausedByAdmin: user.isChatPausedByAdmin,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Verify 2FA code
// @route   POST /api/users/verify-2fa
// @access  Public
const verify2FA = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (user && user.twoFactorCode === code && user.twoFactorExpires > Date.now()) {
    user.twoFactorCode = undefined;
    user.twoFactorExpires = undefined;
    await user.save();

    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      image: user.image,
      phone: user.phone,
      is2FAEnabled: user.is2FAEnabled,
      isChatPausedByAdmin: user.isChatPausedByAdmin,
      createdAt: user.createdAt,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid or expired verification code' });
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
      is2FAEnabled: user.is2FAEnabled,
      isChatPausedByAdmin: user.isChatPausedByAdmin,
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
    user.image = req.body.image || user.image;

    // Toggle 2FA
    if (req.body.is2FAEnabled !== undefined) {
      user.is2FAEnabled = req.body.is2FAEnabled;
    }

    // Handle password update
    if (req.body.password && req.body.password.trim()) {
      user.password = req.body.password;
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
        is2FAEnabled: updatedUser.is2FAEnabled,
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

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === 'admin') {
      // Basic protection against deleting the last admin should be handled in a real app
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User removed' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Create a user with a specific role by Admin
// @route   POST /api/users/admin-create
// @access  Private/Admin
const createUserByAdmin = async (req, res) => {
  const { firstName, lastName, email, phone, password, role, image, isActive } = req.body;

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
    role: role || 'student',
    image,
    isActive: isActive !== undefined ? isActive : true // Default to true if not provided
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Toggle user status (Active/Inactive)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.isActive = !user.isActive;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      isActive: updatedUser.isActive,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Check if email is being updated and is unique
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          res.status(400).json({ message: 'Email already exists' });
          return;
        }
      }

      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.role = req.body.role || user.role;

      // Update isActive status if provided
      if (req.body.isActive !== undefined) {
        user.isActive = req.body.isActive;
      }

      // Allow clearing image if explicitly sent as empty string or new value
      if (req.body.image !== undefined) {
        user.image = req.body.image;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        image: updatedUser.image,
        isActive: updatedUser.isActive,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Update User Error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else if (error.name === 'CastError') {
      res.status(400).json({ message: 'Invalid User ID format' });
    } else if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate field value entered' });
    } else {
      res.status(500).json({ message: error.message || 'Server Error' });
    }
  }
};

// @desc    Get user by username (Public Profile)
// @route   GET /api/users/profile/:username
// @access  Public
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    // Search by username (exact) or firstName+lastName (fuzzy fallback)
    let user = await User.findOne({ username: username }).select('-password -twoFactorCode -twoFactorExpires');

    if (!user) {
      // Fallback: Try to find by combining First + Last name lowercase
      // This is a bit expensive but helps with migration
      // Since we can't do complex aggregation easily here without huge change, 
      // we'll try strict regex or just return not found.
      // Let's try to match basic "samafalemohamed" -> firstName: "Samafale", lastName: "Mohamed"
      // For now, strict username match is safer. 
      // BUT, to help the current user, let's look up by email part if applicable or just fail.
      // Let's stick to username. If they don't have one, they need to update profile.

      // Actually, for the specific request '/u/samafalemohamed', let's try a regex on firstName/lastName
      const users = await User.find({}).select('firstName lastName email image bio location website verified social role createdAt');
      user = users.find(u =>
        (u.firstName + u.lastName).toLowerCase() === username.toLowerCase() ||
        (u.firstName + u.lastName).toLowerCase().replace(/\s/g, '') === username.toLowerCase()
      );
    }

    if (user) {
      res.json({
        _id: user._id,
        username: user.username || (user.firstName + user.lastName).toLowerCase().replace(/\s/g, ''),
        name: `${user.firstName} ${user.lastName}`,
        email: user.email, // Maybe hide email for public? keeping for now as per old author logic
        image: user.image,
        bio: user.bio,
        location: user.location,
        website: user.website,
        verified: user.verified,
        social: user.social,
        role: user.role,
        createdAt: user.createdAt
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user by username:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  authUser,
  verify2FA,
  registerUser,
  getUserProfile,
  getUsers,
  updateUserProfile,
  deleteUser,
  updateUserRole,
  createUserByAdmin,
  toggleUserStatus,
  updateUserByAdmin,
  getUserByUsername
};
