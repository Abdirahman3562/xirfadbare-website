import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaStar,
  FaUserCircle,
  FaLock,
  FaCommentDots,
  FaSignInAlt,
} from "react-icons/fa";

export default function Reviews() {
  const { instructorSlug } = useParams(); // URL e.g. /instructor/khadra-ahmed
  const [instructor, setInstructor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch instructor sax ah (by slug or id)
 useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const instructorRes = await fetch("http://localhost:4002/instructors");
        const instructorData = await instructorRes.json();

        const foundInstructor = instructorData.find(
          (i) => i.name.toLowerCase().replace(/\s+/g, "-") === instructorSlug
        );

        if (!foundInstructor) {
          setInstructor(null);
          setLoading(false);
          return;
        }

        setInstructor(foundInstructor);

        const courseRes = await fetch("http://localhost:3000/courses");
        const courseData = await courseRes.json();

        const instructorCourses = courseData.filter(
          (c) => String(c.instructorId) === String(foundInstructor.id)
        );

        // ✅ Fetch curriculum and lessons durations
        const detailedCourses = await Promise.all(
          instructorCourses.map(async (course) => {
            const curriculumRes = await fetch(
              `http://localhost:4003/curriculum?courseId=${course.id}`
            );
            const curriculum = await curriculumRes.json();

            const lessonData = await Promise.all(
              curriculum.map(async (c) => {
                const lessonsRes = await fetch(
                  `http://localhost:4004/lessons?curriculumId=${c.id}`
                );
                const lessons = await lessonsRes.json();

                const totalDuration = lessons.reduce(
                  (sum, l) => sum + parseDurationToSeconds(l.duration),
                  0
                );

                return { lessonCount: lessons.length, totalDuration };
              })
            );

            const totalLessons = lessonData.reduce(
              (a, b) => a + b.lessonCount,
              0
            );
            const totalDuration = lessonData.reduce(
              (a, b) => a + b.totalDuration,
              0
            );

            return { ...course, totalLessons, totalDuration };
          })
        );

        setCourses(detailedCourses);
      } catch (err) {
        console.error("❌ Error fetching instructor courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [instructorSlug]);


  // ✅ Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  // ✅ Add review handler
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to write a review!");

    const form = e.target;
    const newReview = {
      student:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        user.name ||
        user.username ||
        "Anonymous",
      image:
        user.image ||
        user.photo ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      rating: parseInt(form.rating.value),
      comment: form.comment.value,
      createdAt: new Date().toISOString(),
    };

    // ✅ Ku dar review-ga instructor-ka hadda
    setReviews((prev) => [...prev, newReview]);
    form.reset();
  };

  // ✅ Xisaabi average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (loading)
    return (
      <p className="text-center py-8 text-green-600 font-medium">
        Loading instructor info...
      </p>
    );

  if (!instructor)
    return (
      <p className="text-center text-red-500 py-10">
        Instructor not found for: {instructorSlug}
      </p>
    );

  // ✅ UI
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition hover:shadow-xl">
      {/* Instructor Info Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Reviews for {instructor.name}
        </h2>
        <p className="text-gray-500">{instructor.title || "Instructor"}</p>
        <p className="text-green-600 mt-2">
          <FaStar className="inline text-yellow-400" /> Average:{" "}
          {averageRating} / 5
        </p>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-2">
                {rev.image ? (
                  <img
                    src={rev.image}
                    alt={rev.student}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <FaUserCircle className="text-gray-500 text-3xl" />
                )}
                <div>
                  <p className="font-semibold text-gray-700">{rev.student}</p>
                  <p className="text-yellow-500 flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, j) => (
                      <FaStar key={j} />
                    ))}
                  </p>
                  <p className="text-xs text-gray-400">
                    {rev.createdAt && !isNaN(new Date(rev.createdAt))
                      ? new Date(rev.createdAt).toLocaleDateString()
                      : "Recently"}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mt-2">{rev.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic mb-6 text-center">
          No reviews yet. Be the first to review!
        </p>
      )}

      {/* Add Review Form */}
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          ✍️ Share Your Experience with {instructor.name}
        </h3>

        {!user ? (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 bg-red-50 border border-red-200 p-4 rounded-2xl text-red-500 text-center font-medium shadow-sm">
            <FaLock className="text-lg" />
            <span>Please sign in to leave a review.</span>
          </div>
        ) : (
          <form
            onSubmit={handleReviewSubmit}
            className="max-w-xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-md p-6 space-y-5 transition hover:shadow-lg"
          >
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Your Name
              </label>
              <input
                type="text"
                value={
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  user.name ||
                  user.username ||
                  "Unknown User"
                }
                disabled
                className="border border-gray-300 w-full rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Rating
              </label>
              <select
                name="rating"
                className="border border-gray-300 w-full rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select rating</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 && "s"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Comment
              </label>
              <textarea
                name="comment"
                placeholder={`Write your review about ${instructor.name}...`}
                className="border border-gray-300 w-full rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500"
                rows="4"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-full font-medium transition transform hover:-translate-y-0.5 shadow-md"
            >
              <FaCommentDots className="inline mr-2" />
              Submit Review
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
