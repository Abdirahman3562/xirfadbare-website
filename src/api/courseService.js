// ✅ Get course by ID
export async function getFullCourseDetails(courseId) {
  try {
    // 1️⃣ Fetch course (using ?id=)
    const courseRes = await fetch(`http://localhost:3000/courses?id=${courseId}`);
    if (!courseRes.ok) throw new Error(`❌ Course not found (ID: ${courseId})`);

    const courseData = await courseRes.json();
    const course = courseData[0];
    if (!course) throw new Error(`❌ Course data empty (ID: ${courseId})`);

    // 2️⃣ Fetch instructor
    let instructor = null;
    if (course.instructorId) {
      const instructorRes = await fetch(
        `http://localhost:4002/instructors?id=${course.instructorId}`
      );
      if (instructorRes.ok) {
        const data = await instructorRes.json();
        instructor = data[0] || null;
      }
    }

    // 3️⃣ Fetch curriculum
    const curriculumRes = await fetch(
      `http://localhost:4003/curriculum?courseId=${courseId}`
    );
    const curriculum = curriculumRes.ok ? await curriculumRes.json() : [];

    // 4️⃣ Fetch lessons per curriculum
    const curriculumWithLessons = await Promise.all(
      curriculum.map(async (c) => {
        const lessonsRes = await fetch(
          `http://localhost:4004/lessons?curriculumId=${c.id}`
        );
        const lessons = lessonsRes.ok ? await lessonsRes.json() : [];
        return { ...c, lessons };
      })
    );

    // 5️⃣ Flatten all lessons
    const allLessons = curriculumWithLessons.flatMap((c) => c.lessons || []);

    // 6️⃣ Calculate total duration
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

    // ✅ Return everything
    return {
      ...course,
      instructor,
      curriculum: curriculumWithLessons,
      lessons: allLessons,
      totalDuration,
      slug: course.title.toLowerCase().replace(/\s+/g, "-"), // 🔥 add slug here
    };
  } catch (error) {
    console.error("❌ Error in getFullCourseDetails:", error);
    return null;
  }
}

// ✅ Get course by slug (title-based URL)
export async function getFullCourseDetailsBySlug(slug) {
  try {
    const res = await fetch(`http://localhost:3000/courses`);
    if (!res.ok) throw new Error("Failed to fetch courses");
    const data = await res.json();

    // Find course matching slug
    const course = data.find(
      (c) => c.title.toLowerCase().replace(/\s+/g, "-") === slug
    );
    if (!course) throw new Error(`❌ Course not found for slug: ${slug}`);

    // Fetch full details using ID
    const fullCourse = await getFullCourseDetails(course.id);

    // 🧠 Add back the slug for navigation consistency
    return { ...fullCourse, slug };
  } catch (error) {
    console.error("❌ Error in getFullCourseDetailsBySlug:", error);
    return null;
  }
}
