import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Course from './models/Course.js';

dotenv.config();
connectDB();

const checkLessons = async () => {
    try {
        const courses = await Course.find();
        console.log('\n=== COURSES AND LESSONS ===');
        console.log(`Total courses: ${courses.length}\n`);

        let totalLessons = 0;
        let totalHours = 0;

        courses.forEach((course, index) => {
            console.log(`${index + 1}. ${course.title}`);
            console.log(`   Curriculum sections: ${course.curriculum?.length || 0}`);

            if (course.curriculum && course.curriculum.length > 0) {
                course.curriculum.forEach((section, sIndex) => {
                    console.log(`   Section ${sIndex + 1}: ${section.title}`);
                    console.log(`   Lessons: ${section.lessons?.length || 0}`);

                    if (section.lessons && section.lessons.length > 0) {
                        totalLessons += section.lessons.length;
                        section.lessons.forEach((lesson, lIndex) => {
                            console.log(`     ${lIndex + 1}. ${lesson.title} - Duration: ${lesson.duration || 'NOT SET'}`);

                            if (lesson.duration) {
                                const duration = lesson.duration.toLowerCase();
                                if (duration.includes('hour')) {
                                    const hours = parseFloat(duration);
                                    totalHours += isNaN(hours) ? 0 : hours;
                                } else if (duration.includes('min')) {
                                    const minutes = parseFloat(duration);
                                    totalHours += isNaN(minutes) ? 0 : minutes / 60;
                                }
                            }
                        });
                    }
                });
            }
            console.log('');
        });

        console.log(`\n=== SUMMARY ===`);
        console.log(`Total Lessons: ${totalLessons}`);
        console.log(`Total Hours: ${Math.round(totalHours)}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkLessons();
