import { API_BASE_URL } from '../config';
import { slugify } from '../utils/slugify';

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
      slug: slugify(course.title),
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
      (c) =>
        c.slug === slug ||
        c.title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") === slug ||
        c.title.toLowerCase().replace(/\s+/g, "-") === slug
    );
    if (!course) throw new Error(`❌ Course not found for slug: ${slug}`);

    return await getFullCourseDetails(course._id);
  } catch (error) {
    console.error("❌ Error in getFullCourseDetailsBySlug:", error);
    return null;
  }
}
// ✅ Update a course
export async function updateCourse(courseId, courseData) {
  try {
    const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
    const isNew = courseId === 'new';
    const res = await fetch(`${API_BASE_URL}/courses${isNew ? '' : `/${courseId}`}`, {
      method: isNew ? "POST" : "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo?.token}`,
      },
      body: JSON.stringify(courseData),
    });
    if (!res.ok) throw new Error(`Failed to ${isNew ? 'create' : 'update'} course`);
    return await res.json();
  } catch (error) {
    console.error(`❌ Error in ${courseId === 'new' ? 'createCourse' : 'updateCourse'}:`, error);
    throw error;
  }
}

// ✅ Delete a course
export async function deleteCourse(courseId) {
  try {
    const userInfo = JSON.parse(localStorage.getItem('loggedInUser'));
    const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${userInfo?.token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to delete course");
    return await res.json();
  } catch (error) {
    console.error("❌ Error in deleteCourse:", error);
    throw error;
  }
}
