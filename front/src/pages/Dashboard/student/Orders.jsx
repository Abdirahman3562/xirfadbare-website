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
import { getImageUrl } from "../../../utils/format";
import { FaShoppingCart } from "react-icons/fa";
import { API_BASE_URL } from "../../../config";
import PremiumLoader from "../../../components/ui/PremiumLoader";

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
          `${API_BASE_URL}/orders/myorders`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const ordersData = await resOrders.json();

        const resCourses = await fetch(`${API_BASE_URL}/courses`);
        const coursesData = await resCourses.json();

        setOrders(ordersData);
        setCourses(coursesData);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders or courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // ✅ Hel slug course-ka iyadoo lagu saleynayo courseId (ObjectId)
  const getCourseSlug = (courseId) => {
    const course = courses.find((c) => String(c._id) === String(courseId));
    if (!course) return "";

    return course.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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
    const course = courses.find((c) => String(c._id) === String(courseId));
    return getImageUrl(
      course?.thumbnail
    ) || "https://via.placeholder.com/400x200?text=No+Image";
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex gap-1 items-center">
        <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Student</span>
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Orders</span>
      </div>

      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Purchase History</h1>
      <p className="text-gray-500 dark:text-gray-400 text-[14px] mb-6">
        View and manage your course purchases and payment history.
      </p>

      <section>
        <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          View and manage your course orders
        </p>

        {loading && (
          <div className="flex justify-center py-12">
            <PremiumLoader text={null} fullScreen={false} />
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id || order.id}
                className="border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm bg-white/10 dark:bg-slate-800/50 hover:shadow-md dark:hover:bg-slate-800 transition p-4 flex flex-col"
              >
                {/* ✅ Click image -> go to details page */}
                <div
                  className="w-full h-40 rounded-lg overflow-hidden mb-4 cursor-pointer"
                  onClick={() => handleViewCourse(order.course)}
                >
                  <img
                    src={getCourseImage(order.course)}
                    alt={order.courseTitle || order.courseDetails?.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h2
                    onClick={() => handleViewCourse(order.course)}
                    className="text-lg font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {order.courseTitle || order.courseDetails?.title}
                  </h2>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === "completed"
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
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <div className="text-sm text-emerald-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {order.finalPrice ? (
                    <>
                      <span>Final Price: </span>
                      <span className="font-semibold text-emerald-600">
                        ${order.finalPrice}
                      </span>
                      {order.discountApplied > 0 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          (Saved ${order.discountApplied})
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <span>Total Paid: </span>
                      <span className="font-semibold text-emerald-600">
                        ${order.totalToPay}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="border border-gray-200 dark:border-slate-800 rounded-md bg-white/10 dark:bg-slate-800/50 py-10 flex flex-col items-center justify-center text-center">
            <h2 className="text-[16px] font-semibold text-gray-800 dark:text-white">
              No orders found
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
