import User from '../models/User.js';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import Instructor from '../models/Instructor.js';

// @desc    Get platform statistics
// @route   GET /api/stats
// @access  Public
export const getStats = async (req, res) => {
    try {
        // Count students (users with role 'student')
        const studentCount = await User.countDocuments({ role: 'student' });

        // Count instructors from Instructor collection
        const instructorCount = await Instructor.countDocuments();

        // Count total courses
        const courseCount = await Course.countDocuments();

        // Count total categories
        const categoryCount = await Category.countDocuments();

        // Calculate total lessons and hours from all courses
        const courses = await Course.find();
        let totalLessons = 0;
        let totalHours = 0;

        courses.forEach(course => {
            if (course.curriculum && Array.isArray(course.curriculum)) {
                course.curriculum.forEach(section => {
                    if (section.lessons && Array.isArray(section.lessons)) {
                        totalLessons += section.lessons.length;

                        // Calculate hours from lesson durations
                        section.lessons.forEach(lesson => {
                            if (lesson.duration) {
                                const duration = lesson.duration.toLowerCase().trim();

                                // Handle MM:SS format (e.g., "10:00", "120:00")
                                if (duration.includes(':')) {
                                    const parts = duration.split(':');
                                    const minutes = parseInt(parts[0]) || 0;
                                    const seconds = parseInt(parts[1]) || 0;
                                    totalHours += (minutes + seconds / 60) / 60;
                                }
                                // Handle text format with "hour" keyword
                                else if (duration.includes('hour')) {
                                    const hours = parseFloat(duration);
                                    totalHours += isNaN(hours) ? 0 : hours;
                                }
                                // Handle text format with "min" keyword
                                else if (duration.includes('min')) {
                                    const minutes = parseFloat(duration);
                                    totalHours += isNaN(minutes) ? 0 : minutes / 60;
                                }
                            }
                        });
                    }
                });
            }
        });

        res.json({
            students: studentCount,
            instructors: instructorCount,
            courses: courseCount,
            categories: categoryCount,
            lessons: totalLessons,
            hours: Math.round(totalHours)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
