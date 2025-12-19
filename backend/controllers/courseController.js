import Course from '../models/Course.js';

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  const courses = await Course.find({}).populate('instructor');
  res.json(courses);
};

// @desc    Fetch single course by ID or Slug
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor');

  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  const { title, price, description, technology, instructor } = req.body;

  const course = new Course({
    title,
    price,
    description,
    technology,
    instructor,
    user: req.user._id,
  });

  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
};

export { getCourses, getCourseById, createCourse };




