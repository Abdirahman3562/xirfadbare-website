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

    // Clamp progress between 0 and 100
    const clampedProgress = Math.min(100, Math.max(0, progress || 0));

    const existingProgress = await UserProgress.findOne({ user: req.user._id, course: req.params.courseId });

    const progressData = {
      user: req.user._id,
      course: req.params.courseId,
      completedLessons: Array.isArray(completedLessons) ? completedLessons : [],
      currentLesson,
      progress: clampedProgress,
      timeSpent: timeSpent || 0,
      lastAccess: new Date()
    };

    // If progress is 100%, set completedAt and certificateId if not already set
    if (clampedProgress === 100) {
      if (!existingProgress || existingProgress.progress < 100) {
        // First time finishing - generate sequential ID
        const year = new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        // Count certificates already issued THIS YEAR
        const countThisYear = await UserProgress.countDocuments({
          progress: 100,
          completedAt: { $gte: startOfYear, $lte: endOfYear }
        });

        const sequence = String(countThisYear + 1).padStart(3, '0');
        progressData.certificateId = `CERT-${year}-${sequence}`;
        progressData.completedAt = new Date();
      } else {
        // Already finished once - keep existing data
        progressData.certificateId = existingProgress.certificateId;
        progressData.completedAt = existingProgress.completedAt;
      }
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

    // Check if any completed records are missing a certificateId and fix them
    let updated = false;
    for (const record of progressRecords) {
      if (record.progress === 100 && !record.certificateId) {
        const year = record.completedAt ? new Date(record.completedAt).getFullYear() : new Date().getFullYear();
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const countThisYear = await UserProgress.countDocuments({
          progress: 100,
          certificateId: { $exists: true }, // Count only items that ALREADY have an ID
          completedAt: { $gte: startOfYear, $lte: endOfYear }
        });

        const sequence = String(countThisYear + 1).padStart(3, '0');
        record.certificateId = `CERT-${year}-${sequence}`;
        if (!record.completedAt) record.completedAt = new Date();
        await record.save();
        updated = true;
      }
    }

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

// @desc    Save quiz result for a lesson
// @route   POST /api/progress/:courseId/quiz
// @access  Private
const saveQuizResult = async (req, res) => {
  try {
    const { lessonId, score, totalQuestions } = req.body;

    let progressData = await UserProgress.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!progressData) {
      progressData = new UserProgress({
        user: req.user._id,
        course: req.params.courseId,
        completedLessons: [],
        progress: 0,
        quizResults: []
      });
    }

    // Ensure quizResults exists
    if (!progressData.quizResults) {
      progressData.quizResults = [];
    }

    // Check if result for this lesson already exists
    const existingIndex = progressData.quizResults.findIndex(r => r.lessonId === String(lessonId));

    const newResult = {
      lessonId: String(lessonId),
      score: Number(score),
      totalQuestions: Number(totalQuestions),
      completedAt: new Date()
    };

    if (existingIndex !== -1) {
      // Update with latest result
      progressData.quizResults[existingIndex] = newResult;
    } else {
      progressData.quizResults.push(newResult);
    }

    await progressData.save();
    res.json(progressData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getUserProgress,
  updateUserProgress,
  getUserAllProgress,
  deleteUserProgress,
  saveQuizResult,
};



