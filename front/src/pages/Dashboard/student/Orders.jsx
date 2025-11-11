import { useEffect, useState } from "react";
import {
  ChevronRight,
  Home,
  Clock,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch user logged in
  const getLoggedInUser = () => {
    try {
      const userData = localStorage.getItem("loggedInUser");
      if (!userData) return null;
      return JSON.parse(userData);
    } catch {
      return null;
    }
  };

  // ✅ Fetch orders & courses data
  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      toast.error("Please login to view your orders.");
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        const resOrders = await fetch(
          `http://localhost:4010/orders?userId=${user.id}`
        );
        const ordersData = await resOrders.json();

        const resCourses = await fetch("http://localhost:3000/courses");
        const coursesData = await resCourses.json();

        setOrders(ordersData);
        setCourses(coursesData.courses || coursesData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders or courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ✅ Hel slug course-ka iyadoo lagu saleynayo courseId
  // ✅ Samee slug toos ah adigoo ka dhisaya title-ka course-ka
  const getCourseSlug = (courseId) => {
    const course = courses.find((c) => String(c.id) === String(courseId));
    if (!course) return "";

    // magaca kursiga → lowercase + spaces to hyphens
    const slug = course.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // bedel meel kasta oo aan letter/number ahayn
      .replace(/(^-|-$)/g, ""); // ka saar hyphen hore iyo danbe

    return slug;
  };

  // ✅ Navigate to course details
  const handleViewCourse = (courseId) => {
    const slug = getCourseSlug(courseId);
    if (slug) {
      navigate(`/courses/${slug}`);
    } else {
      toast.error("Course details not found!");
    }
  };

  // ✅ Hel image course-ka
  const getCourseImage = (courseId) => {
    const course = courses.find((c) => String(c.id) === String(courseId));
    return (
      course?.thumbnail || "https://via.placeholder.com/400x200?text=No+Image"
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 mt-20">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex gap-1 items-center">
        <Home className="w-5 h-5 text-emerald-600" />
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold text-gray-700">Student</span>
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold text-gray-700">Orders</span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Purchase History</h1>
      <p className="text-gray-500 text-[14px] mb-6">
        View and manage your course purchases and payment history.
      </p>

      <section>
        <h1 className="text-2xl font-semibold mb-2">My Orders</h1>
        <p className="text-gray-500 text-sm mb-6">
          View and manage your course orders
        </p>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-500 text-lg">Loading orders...</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-xl shadow-sm bg-white hover:shadow-md transition p-4 flex flex-col"
              >
                {/* ✅ Click image -> go to details page */}
                <div
                  className="w-full h-40 rounded-lg overflow-hidden mb-4 cursor-pointer"
                  onClick={() => handleViewCourse(order.courseId)}
                >
                  <img
                    src={getCourseImage(order.courseId)}
                    alt={order.courseTitle}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h2
                    onClick={() => handleViewCourse(order.courseId)}
                    className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-emerald-600"
                  >
                    {order.courseTitle}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status || "pending"}
                  </span>
                </div>

                <p className="text-sm text-emerald-600 flex items-center gap-2 mb-1">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Payment Method: {order.paymentMethod}
                </p>
                <p className="text-sm text-emerald-600 flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  Date: {order.createdAt}
                </p>
                <p className="text-sm text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Total Paid:{" "}
                  <span className="font-semibold text-emerald-600">
                    ${order.totalToPay}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="border border-gray-200 rounded-md bg-white py-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-[16px] font-semibold text-gray-800">
              No orders found
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              You haven't placed any orders yet.
            </p>

            <button
              onClick={() => (window.location.href = "/courses")}
              className="mt-4 px-4 py-2 text-sm font-semibold rounded-md text-white
                   bg-emerald-500 cursor-pointer hover:bg-emerald-600 transition-colors duration-300"
            >
              Browse Courses
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
