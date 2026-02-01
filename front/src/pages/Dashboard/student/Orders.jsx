import { useEffect, useState } from "react";
import {
  ChevronRight,
  Home,
  Clock,
  CreditCard,
  CheckCircle,
  Layers,
  X
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/format";
import { FaShoppingCart } from "react-icons/fa";
import { API_BASE_URL } from "../../../config";
import PremiumLoader from "../../../components/ui/PremiumLoader";
import BundleCoursesModal from "../../../components/course/BundleCoursesModal";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
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
        const [resOrders, resCourses, resBundles] = await Promise.all([
          fetch(`${API_BASE_URL}/orders/myorders`, {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          fetch(`${API_BASE_URL}/courses`),
          fetch(`${API_BASE_URL}/bundles`)
        ]);

        const ordersData = await resOrders.json();
        const coursesData = await resCourses.json();
        const bundlesData = await resBundles.json();

        // 🛡️ Filter internal enrollments (Bundle Access) to avoid showing duplicates to students
        const filteredOrders = ordersData.filter(order => order.paymentType !== 'Bundle Access');
        setOrders(filteredOrders);

        // Merge courses and bundles for slug lookup if needed
        setCourses([...coursesData, ...bundlesData]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load orders data.");
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

  // ✅ Navigate to course/bundle details
  const handleViewCourse = (order) => {
    if (order.isBundle) {
      navigate(`/bundles/${order.bundle}`);
      return;
    }

    const slug = getCourseSlug(order.course);
    if (slug) {
      navigate(`/courses/${slug}`);
    } else {
      toast.error("Course details not found!");
    }
  };

  // ✅ Hel image course/bundle-ka
  const getDisplayImage = (order) => {
    // 1. Check cached details first (Fastest & Reliable)
    if (order.courseDetails?.thumbnail) {
      return getImageUrl(order.courseDetails.thumbnail);
    }

    // 2. Fallback to lookup in courses/bundles list
    const item = courses.find((c) => String(c._id) === String(order.course || order.bundle));
    return getImageUrl(item?.thumbnail) || "https://via.placeholder.com/400x200?text=No+Image";
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
                  className="w-full h-40 rounded-lg overflow-hidden mb-4 cursor-pointer relative group"
                  onClick={() => handleViewCourse(order)}
                >
                  <img
                    src={getDisplayImage(order)}
                    alt={order.courseTitle || order.courseDetails?.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {order.isBundle && (
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 border border-emerald-400/30">
                      <Layers size={12} />
                      Bundle
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h2
                    onClick={() => handleViewCourse(order)}
                    className="text-lg font-semibold text-gray-800 dark:text-white cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 truncate pr-2"
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

                {order.isBundle && (
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowModal(true);
                    }}
                    className="mt-3 w-full py-2 cursor-pointer bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    View Included Courses
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ✅ Bundle Courses Modal */}
        <BundleCoursesModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          bundleOrder={selectedOrder}
          allCourses={courses.filter(c => !c.courses)} // Filter out bundles if needed, or pass all
        />

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
