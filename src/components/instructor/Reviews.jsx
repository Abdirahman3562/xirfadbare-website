import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaStar,
  FaUserCircle,
  FaLock,
  FaCommentDots,
} from "react-icons/fa";

/* ----------------------------------------------------------------
   ✅ Helper Function
------------------------------------------------------------------ */
const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

/* ----------------------------------------------------------------
   ✅ REVIEWS PAGE COMPONENT
------------------------------------------------------------------ */
export default function Reviews() {
  const { instructorSlug } = useParams(); // e.g. /instructor/khadra-ahmed
  const [instructor, setInstructor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ✅ Load logged user from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem("loggedInUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  /* ✅ Fetch Instructor info and reviews */
  useEffect(() => {
    const fetchInstructorAndReviews = async () => {
      try {
        // 1️⃣ Get all instructors
        const instructorRes = await fetch("http://localhost:4002/instructors");
        const instructors = await instructorRes.json();

        // 2️⃣ Find instructor by slug
        const found = instructors.find(
          (i) => i.name.toLowerCase().replace(/\s+/g, "-") === instructorSlug
        );

        if (!found) {
          setInstructor(null);
          setLoading(false);
          return;
        }

        setInstructor(found);

        // 🟢 Show in console
        console.log("Instructor Slug:", generateSlug(found.name));

        // 3️⃣ Get reviews for this instructor
        const reviewsRes = await fetch(
          `http://localhost:4005/reviews?instructorId=${found.id}`
        );
        const reviewData = await reviewsRes.json();
        setReviews(reviewData);
      } catch (err) {
        console.error("❌ Error fetching instructor/reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorAndReviews();
  }, [instructorSlug]);

  /* ✅ Submit review handler */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please sign in to leave a review!");

    const form = e.target;

    const newReview = {
      instructorId: instructor.id,
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

    try {
      // 4️⃣ Save to backend (JSON-server)
      await fetch("http://localhost:4005/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      // 5️⃣ Update UI immediately
      setReviews((prev) => [...prev, newReview]);
      form.reset();
    } catch (err) {
      console.error("❌ Error posting review:", err);
    }
  };

  /* ✅ Calculate average rating */
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : 0;

  /* ✅ Loading state */
  if (loading)
    return (
      <p className="text-center py-10 text-green-600 font-semibold">
        Loading reviews...
      </p>
    );

  /* ✅ Instructor not found */
  if (!instructor)
    return (
      <p className="text-center text-red-500 py-10">
        Instructor not found for slug: {instructorSlug}
      </p>
    );

  /* ✅ MAIN RENDER */
  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition hover:shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          Reviews for {instructor.name}
        </h2>
        <p className="text-gray-500">{instructor.title || "Instructor"}</p>
        <p className="text-green-600 mt-2">
          <FaStar className="inline text-yellow-400" /> Average: {averageRating} / 5
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
            {/* Name */}
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

            {/* Rating */}
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

            {/* Comment */}
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

            {/* Button */}
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
