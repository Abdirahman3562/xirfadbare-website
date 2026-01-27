import UserProgress from '../models/UserProgress.js';

// @desc    Get user progress for a specific course
// @route   GET /api/progress/:courseId
// @access  Private
const getUserProgress = async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      user: req.user._id,
      course: req.params.courseId
    }).populate('course', 'title');

    if (progress) {
      res.json(progress);
    } else {
      // Return empty progress if none exists
      res.json({
        user: req.user._id,
        course: req.params.courseId,
        completedLessons: [],
        currentLesson: null,
        progress: 0,
        lastAccess: null,
        timeSpent: 0
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update or create user progress
// @route   PUT /api/progress/:courseId
// @access  Private
const updateUserProgress = async (req, res) => {
  try {
    const { completedLessons, currentLesson, progress, timeSpent } = req.body;

    const progressData = {
      user: req.user._id,
      course: req.params.courseId,
      completedLessons: completedLessons || [],
      currentLesson,
      progress: progress || 0,
      timeSpent: timeSpent || 0,
      lastAccess: new Date()
    };

    // If progress is 100%, set completedAt
    if (progress === 100) {
      progressData.completedAt = new Date();
    }

    const progressRecord = await UserProgress.findOneAndUpdate(
      { user: req.user._id, course: req.params.courseId },
      progressData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(progressRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all user progress records for logged in user
// @route   GET /api/progress
// @access  Private
const getUserAllProgress = async (req, res) => {
  try {
    const progressRecords = await UserProgress.find({ user: req.user._id })
      .populate('course', 'title thumbnail description')
      .sort({ lastAccess: -1 });

    res.json(progressRecords);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user progress (for reset functionality)
// @route   DELETE /api/progress/:courseId
// @access  Private
const deleteUserProgress = async (req, res) => {
  try {
    await UserProgress.findOneAndDelete({
      user: req.user._id,
      course: req.params.courseId
    });

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
  deleteUserProgress,
};



