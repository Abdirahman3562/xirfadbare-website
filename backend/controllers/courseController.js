import Course from '../models/Course.js';
import Order from '../models/Order.js';

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  const courses = await Course.find({}).populate('instructor').lean();

  // Dynamically calculate enrolledCount for each course
  const coursesWithEnrolledCount = await Promise.all(
    courses.map(async (course) => {
      const status = 'active';
      // Calculate enrollment count
      const enrolledCount = await Order.countDocuments({
        course: course._id,
        status,
      });

      // Check for discount expiry
      if (course.discountExpiry && new Date(course.discountExpiry) < new Date()) {
        course.discountPercentage = 0;
        course.discountCode = '';
      }

      return { ...course, enrolledCount };
    })
  );

  res.json(coursesWithEnrolledCount);
};

// @desc    Fetch single course by ID or Slug
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor').lean();

  if (course) {
    const enrolledCount = await Order.countDocuments({
      course: course._id,
      status: 'active',
    });
    // Check for discount expiry
    if (course.discountExpiry && new Date(course.discountExpiry) < new Date()) {
      course.discountPercentage = 0;
      course.discountCode = '';
    }

    res.json({ ...course, enrolledCount });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  const {
    title,
    price,
    description,
    technology,
    instructor,
    level,
    accessType,
    thumbnail,
    curriculum,
    communityLink,
    learningOutcomes,
    type,
    discountCode,
    discountPercentage,
    discountExpiry,
  } = req.body;

  const course = new Course({
    title,
    type,
    discountCode,
    discountPercentage,
    discountExpiry: discountExpiry || null,
    price,
    description,
    technology,
    instructor: instructor || null,
    level,
    accessType,
    thumbnail,
    curriculum,
    communityLink,
    learningOutcomes,
    user: req.user._id,
  });

  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  const {
    title,
    price,
    description,
    technology,
    instructor,
    level,
    accessType,
    thumbnail,
    curriculum,
    communityLink,
    learningOutcomes,
    type,
    discountCode,
    discountPercentage,
  } = req.body;

  const course = await Course.findById(req.params.id);

  if (course) {
    if (title !== undefined) course.title = title;
    if (type !== undefined) course.type = type;
    if (price !== undefined) course.price = price;
    if (description !== undefined) course.description = description;
    if (technology !== undefined) course.technology = technology;
    if (instructor !== undefined) course.instructor = instructor;
    if (level !== undefined) course.level = level;
    if (accessType !== undefined) course.accessType = accessType;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (curriculum !== undefined) course.curriculum = curriculum;
    if (communityLink !== undefined) course.communityLink = communityLink;
    if (learningOutcomes !== undefined) course.learningOutcomes = learningOutcomes;
    if (discountCode !== undefined) course.discountCode = discountCode;
    if (discountPercentage !== undefined) course.discountPercentage = discountPercentage;
    if (req.body.discountExpiry !== undefined) course.discountExpiry = req.body.discountExpiry;

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (course) {
    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
};

export { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };





