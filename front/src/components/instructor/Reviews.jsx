import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FaStar,
  FaUserCircle,
  FaLock,
  FaCommentDots,
  FaCalendarAlt,
  FaPenFancy,
  FaBook,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { getInstructorBySlug, updateInstructor } from "../../api/instructorService";
import { getAllCourses } from "../../api/courseService";

/* ----------------------------------------------------------------
   ✅ Helper Function
------------------------------------------------------------------ */
const generateSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

/* ----------------------------------------------------------------
   ✅ Review Comment Component (Read More / Show Less)
------------------------------------------------------------------ */
/* ✅ Review Comment Component (Smart Read More / Show Less) */
function ReviewComment({ text }) {
  const [expanded, setExpanded] = useState(false);
  const limit = 150; // xarfo ugu badan

  if (!text) return null;

  const isLong = text.length > limit;
  const shortText = text.slice(0, limit).trim();

  const displayText = expanded ? text : shortText + (isLong ? "..." : "");

  return (
    <div className="relative mt-2">
      <p
        className={`text-gray-600 ml-13 leading-relaxed transition-all duration-300 ease-in-out ${
          expanded ? "max-h-full" : "max-h-[4.5rem] overflow-hidden"
        }`}
        style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
      >
        {displayText}
      </p>

      {/* Read More / Less Button */}
      {isLong && (
        <div className="mt-1 ml-13 ">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-emerald-600 text-sm  cursor-pointer font-medium"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
   ✅ REVIEWS PAGE COMPONENT
------------------------------------------------------------------ */
export default function Reviews() {
  const { slug } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [existingReview, setExistingReview] = useState(null);
  const formRef = useRef(null);

  /* ✅ Load logged user from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* ✅ Fetch Instructor + Courses + Reviews */
  useEffect(() => {
    const fetchInstructorAndReviews = async () => {
      try {
        const found = await getInstructorBySlug(slug);

        if (!found) {
          setInstructor(null);
          setLoading(false);
          return;
        }

        const allCourses = await getAllCourses();
        const instructorCourses = allCourses.filter(
          (c) => c.instructor && String(c.instructor) === String(found._id)
        );

        setInstructor({ ...found, id: found._id, courses: instructorCourses });
        setReviews(found.reviews || []);
      } catch (err) {
        console.error("❌ Error fetching instructor/reviews:", err);
        toast.error("Failed to fetch instructor details");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorAndReviews();
  }, [slug]);

  /* ✅ Check existing review */
  useEffect(() => {
    if (!selectedCourse || !user || !reviews.length) {
      setExistingReview(null);
      return;
    }

    const found = reviews.find(
      (r) =>
        r.courseId === selectedCourse &&
        r.student ===
          (`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.name ||
            user.username)
    );

    setExistingReview(found || null);
  }, [selectedCourse, user, reviews]);

  /* ✅ Submit or Update review handler */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to leave a review!");
    if (!selectedCourse)
      return toast.error("Please select a course before submitting.");

    const form = e.target;
    const studentName =
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.name ||
      user.username ||
      "Anonymous";

    const newReview = {
      courseId: selectedCourse,
      student: studentName,
      image:
        user.image ||
        user.photo ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      rating: parseInt(form.rating.value),
      comment: form.comment.value,
      createdAt: new Date().toISOString(),
    };

    try {
      let updatedReviews;
      if (existingReview) {
        updatedReviews = reviews.map((r) =>
          r.courseId === selectedCourse && r.student === studentName
            ? newReview
            : r
        );
      } else {
        updatedReviews = [...reviews, newReview];
      }

      const updatedInstructor = { ...instructor, reviews: updatedReviews };

      await updateInstructor(instructor.id, updatedInstructor);

      setReviews(updatedReviews);
      setExistingReview(newReview);

      // ✅ Clear form
      formRef.current.reset();
      setSelectedCourse("");

      existingReview
        ? toast.success("✅ Review updated successfully!")
        : toast.success("✅ Review added successfully!");
    } catch (err) {
      console.error("❌ Error posting review:", err);
      toast.error("Something went wrong while saving your review!");
    }
  };

  /* ✅ Helper to get course title */
  const getCourseTitle = (id) => {
    if (!Array.isArray(instructor?.courses)) return "";
    const found = instructor.courses.find((c) => String(c.id) === String(id));
    return found ? found.title : "";
  };

  /* ✅ Calculate average rating */
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : 0;

  if (loading)
    return (
      <p className="text-center py-10 text-emerald-600 font-semibold">
        Loading reviews...
      </p>
    );

  if (!instructor)
    return (
      <p className="text-center text-red-500 py-10">
        Instructor not found for slug: {slug}
      </p>
    );

  /* ✅ MAIN UI */
  return (
    <div className="max-w-3xl mx-auto bg-[#edf4f5] p-6 rounded-2xl shadow-lg border border-gray-100 transition hover:shadow-xl mt-10">
      {/* ✅ Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Reviews for {instructor.name}
        </h2>
      
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="border border-gray-100 hover:border-emerald-400 rounded-xl p-4 bg-[#edf4f5] shadow-sm hover:shadow-md transition"
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
                  <p className="font-semibold text-gray-700 mt-2">
                    {rev.student}
                  </p>
                  <p className="text-emerald-500 text-sm flex items-center gap-1">
                    {Array.from({ length: rev.rating }).map((_, j) => (
                      <FaStar key={j} />
                    ))}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <FaCalendarAlt className="text-emerald-500 text-[11px]" />
                    {rev.createdAt && !isNaN(new Date(rev.createdAt))
                      ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Recently"}
                  </p>
                </div>
              </div>

              {/* ✅ Comment with Read More / Less */}
              <ReviewComment text={rev.comment} />

              <p className="text-xs text-gray-500 italic mt-1 ml-12 flex items-center gap-1">
                <FaBook className="text-emerald-500 text-[11px]" />
                Course:{" "}
                <span className="text-emerald-600 font-medium">
                  {getCourseTitle(rev.courseId) || "Unknown Course"}
                </span>
              </p>
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
        <h3 className="text-xl font-semibold text-emerald-500 mb-4 text-center">
          <FaPenFancy className="inline text-emerald-500 mr-2" />
          Share Your Experience with Instructor
        </h3>

        {!user ? (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 bg-[#edf4f5] p-4 rounded-2xl text-red-500 text-center font-medium shadow-sm">
            <FaLock className="text-lg" />
            <span>Please sign in to leave a review.</span>
          </div>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleReviewSubmit}
            className="max-w-xl mx-auto bg-[#edf4f5] rounded-2xl shadow-md p-6 space-y-5 transition hover:shadow-lg"
          >
            {/* Select Course */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Select Course
              </label>
              <select
                name="courseId"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-5 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              >
                <option value="">Choose a course</option>
                {(Array.isArray(instructor.courses)
                  ? instructor.courses
                  : []
                ).map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Rating
              </label>
              <select
                name="rating"
                defaultValue={existingReview?.rating || ""}
                className="w-full border border-gray-300 rounded-lg pl-5 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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

            {/* Comment */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Comment
              </label>
              <textarea
                name="comment"
                defaultValue={existingReview?.comment || ""}
                placeholder={`Write your review about ${instructor.name}...`}
                className="w-full border border-gray-300 rounded-lg pl-5 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                rows="4"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full bg-emerald-600 cursor-pointer hover:bg-emerald-700 text-white py-2.5 rounded-full font-medium transition transform hover:-translate-y-0.5 shadow-md"
            >
              <FaCommentDots className="inline mr-2" />
              {existingReview ? "Update Review" : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
