import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function EditCoursePage() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [technology, setTecnology] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const navigate = useNavigate();

  // ✅ Fetch existing course
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:3000/course/${id}`);
        const course = await res.json();

        setTitle(course.title);
        setType(course.type);
        setDescription(course.description);
        setDuration(course.duration);
        setTecnology(course.technology);
        setPrice(course.price);
        setName(course.instructor.name || "");
        setBio(course.instructor.description || "");
        setContactEmail(course.instructor.contactEmail || "");
        setContactPhone(course.instructor.contactPhone || "");
        setPreview(course.thumbnail || null);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCourse();
  }, [id]);

  // ✅ Handle thumbnail change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();

    let base64Image = preview; // default to existing preview if no new upload

    if (thumbnail) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        base64Image = reader.result;
        await updateCourse(base64Image);
      };
      reader.readAsDataURL(thumbnail);
    } else {
      await updateCourse(base64Image);
    }
  };

  const updateCourse = async (base64Image) => {
    const updatedCourse = {
      title,
      type,
      description,
      duration,
      technology,
      price,
      thumbnail: base64Image,
      instructor: {
        name,
        description: bio,
        contactEmail,
        contactPhone,
      },
    };

    try {
      const res = await fetch(`http://localhost:3000/course/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCourse),
      });

      if (!res.ok) throw new Error("Failed to update course");

      toast.success("✅ Course updated successfully!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => navigate("/courses"), 2000);
    } catch (err) {
      toast.error("❌ Something went wrong while updating the course!");
      console.error(err);
    }
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50 to-indigo-100 py-20">
      <div className="w-full mx-auto rounded-2xl p-8 md:p-10 border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center text-[#00cc8f] mb-10">
           Edit Course
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ✅ Course Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="type" className="block text-gray-700 font-semibold mb-2">
                Course Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              >
                <option value="">Select type...</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Front End">Front End</option>
                <option value="Back End">Back End</option>
                <option value="Database">Database</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-gray-700 font-semibold mb-2">
                Duration
              </label>
              <input
                type="text"
                id="duration"
                placeholder="e.g. 3 months"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-gray-700 font-semibold mb-2">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                placeholder="e.g. 49"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ✅ Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="title" className="block text-gray-700 font-semibold mb-2">
                Course Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="e.g. Mastering React.js"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="technology" className="block text-gray-700 font-semibold mb-2">
                Technologies
              </label>
              <input
                type="text"
                id="technology"
                placeholder="e.g. React, Node.js, MongoDB"
                value={technology}
                onChange={(e) => setTecnology(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Contact Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="e.g. example@gmail.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ✅ Instructor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                Instructor Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="e.g. Abdillahi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="+252 63 00000000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-gray-700 font-semibold mb-2">
                Instructor Bio
              </label>
              <textarea
                id="bio"
                rows="3"
                placeholder="Short instructor bio..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* ✅ Thumbnail Section */}
          <div>
            <label htmlFor="thumbnail" className="block text-gray-700 font-semibold mb-3">
              Course Thumbnail
            </label>
            <div className="border-2 border-dashed border-indigo-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-indigo-50 transition">
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="thumbnail" className="cursor-pointer flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 text-indigo-500 mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 15a4 4 0 001 7h16a4 4 0 001-7M12 4v16m0 0l-3-3m3 3l3-3"
                  />
                </svg>
                <span className="text-sm text-indigo-600 font-semibold">
                  Click to upload new image
                </span>
                <span className="text-xs text-gray-400">PNG, JPG up to 2MB</span>
              </label>
            </div>

            {preview && (
              <div className="mt-4">
                <img
                  src={preview}
                  alt="Course Preview"
                  className="rounded-lg shadow-md w-full h-56 object-cover"
                />
              </div>
            )}
          </div>

          {/* ✅ Submit */}
          <button
            type="submit"
            className="w-full mt-6 bg-emerald-500 text-white font-semibold py-3 rounded-full shadow-md hover:bg-emerald-600 hover:shadow-lg transition duration-300"
          >
            💾 Update Course
          </button>
        </form>
      </div>
    </section>
  );
}

export default EditCoursePage;
