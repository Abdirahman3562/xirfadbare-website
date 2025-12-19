import { API_BASE_URL } from '../config';

// ✅ Get course by ID
export async function getFullCourseDetails(courseId) {
  try {
    const courseRes = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    if (!courseRes.ok) throw new Error(`❌ Course not found (ID: ${courseId})`);

    const course = await courseRes.json();
    if (!course) throw new Error(`❌ Course data empty (ID: ${courseId})`);

    // Flatten all lessons
    const curriculumWithLessons = course.curriculum || [];
    const allLessons = curriculumWithLessons.flatMap((c) => c.lessons || []);

    // Calculate total duration
    let totalSeconds = 0;
    allLessons.forEach((l) => {
      if (l.duration) {
        const [m, s] = l.duration.split(":").map(Number);
        totalSeconds += (m || 0) * 60 + (s || 0);
      }
    });
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalDuration =
      totalSeconds > 0
        ? hours > 0
          ? `${hours}h ${minutes}m`
          : `${minutes}m`
        : "N/A";

    return {
      ...course,
      lessons: allLessons,
      totalDuration,
      slug: course.title.toLowerCase().replace(/\s+/g, "-"),
    };
  } catch (error) {
    console.error("❌ Error in getFullCourseDetails:", error);
    return null;
  }
}

// ✅ Get all courses
export async function getAllCourses() {
  try {
    const res = await fetch(`${API_BASE_URL}/courses`);
    if (!res.ok) throw new Error("Failed to fetch courses");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("❌ Error in getAllCourses:", error);
    return [];
  }
}

// ✅ Get course by slug (title-based URL)
export async function getFullCourseDetailsBySlug(slug) {
  try {
    const courses = await getAllCourses();

    const course = courses.find(
      (c) => c.title.toLowerCase().replace(/\s+/g, "-") === slug
    );
    if (!course) throw new Error(`❌ Course not found for slug: ${slug}`);

    return await getFullCourseDetails(course._id);
  } catch (error) {
    console.error("❌ Error in getFullCourseDetailsBySlug:", error);
    return null;
  }
}
