import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaUserGraduate,
} from "react-icons/fa";
import {
  getFullCourseDetails,
  getFullCourseDetailsBySlug,
} from "../../../api/courseService";
import { API_BASE_URL } from "../../../config";

function PaymentPage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState("");
  const [discount, setDiscount] = useState("");
  const [selectedTab, setSelectedTab] = useState("local");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const websiteDiscount = 0.25;
  const totalDiscount = websiteDiscount + appliedDiscount;
  const totalPrice = Number(
    selectedPlan?.price || course?.price?.amount || course?.price || 0
  );
  const finalPrice = (totalPrice * (1 - totalDiscount)).toFixed(2);

  // ✅ Fetch course (auto detect slug or id)
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const isObjectId = id.length === 24;

        let courseData;
        if (isObjectId) {
          courseData = await getFullCourseDetails(id);
        } else {
          courseData = await getFullCourseDetailsBySlug(id);
        }

        if (courseData) {
          setCourse(courseData);
        } else {
          console.error("❌ Course not found:", id);
        }
      } catch (error) {
        console.error("❌ Error fetching course:", error);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  // Helper: initials fallback
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase();
  };

  // Coupon
  const handleApplyDiscount = () => {
    const coupon = discount.trim().toLowerCase();

    if (coupon === "samafale") {
      setAppliedDiscount(0.15);
      setErrorMsg("");
    } else if (coupon === "") {
      setErrorMsg("Please enter a coupon code.");
      setAppliedDiscount(0);
    } else {
      setErrorMsg("Invalid coupon code.");
      setAppliedDiscount(0);
    }
  };

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      toast.error("Please login to continue.");
      navigate("/auth/login");
    }
  }, []);

  // helper function
  const getLoggedInUser = () => {
    try {
      const userData = localStorage.getItem("loggedInUser");
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (err) {
      console.error("Error parsing logged-in user:", err);
      return null;
    }
  };

  // save payment details
  const handlePayment = async () => {
    const user = getLoggedInUser();
    if (!user) {
      toast.error("Please login first to complete your order.");
      return;
    }

    if (!selectedMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!/^[0-9]{8,15}$/.test(phone)) {
      toast.error("Invalid phone number format. Use 8–15 digits.");
      return;
    }

    // Check for duplicate order
    try {
      const existingOrderRes = await fetch(
        `${API_BASE_URL}/orders/myorders`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const myOrders = await existingOrderRes.json();
      const duplicate = myOrders.find(o => o.course === course._id);

      if (duplicate) {
        toast.error("You already ordered this course.");
        return;
      }

      const orderData = {
        courseId: course._id,
        courseTitle: course.title,
        paymentType: selectedTab === "local" ? "Local Payment" : "Online Payment",
        paymentMethod: selectedMethod,
        phoneNumber: phone,
        totalToPay: totalPrice,
        discountApplied: (totalPrice * (websiteDiscount + appliedDiscount)).toFixed(2),
        finalPrice: Number(finalPrice),
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        toast.success("✅ Order placed successfully!");
        setTimeout(() => navigate("/dashboard/orders"), 1500);
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "❌ Failed to save order!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while saving order!");
    }
  };


  // Calculate duration per section
  const calculateSectionDuration = (lessons) => {
    if (!lessons) return "0m";

    let totalMinutes = 0;
    lessons.forEach((lesson) => {
      if (!lesson.duration) return;
      const [min, sec] = lesson.duration.split(":").map(Number);
      totalMinutes += min + sec / 60;
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (!course)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading course details...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ===== LEFT SIDE ===== */}
      <div className="lg:col-span-1  shadow-md rounded-2xl border border-gray-100 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-64 object-cover rounded-t-xl"
        />

        <div className="p-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            {course.title}
          </h2>

          <div className="flex flex-wrap text-sm text-emerald-500 mt-3 gap-x-2 gap-y-2">
            {/* Duration */}
            <p className="flex items-center">
              <FaClock className="mr-1 text-emerald-500" />
              {course.totalDuration || "N/A"}
            </p>

            {/* Sections */}
            <p className="flex items-center">
              <FaGraduationCap className="mr-1 text-emerald-500" />
              {course.curriculum?.length || 0} sections
            </p>

            {/* Type */}
            <p className="flex items-center">
              <FaCheckCircle className="mr-1 text-emerald-500" />
              {course.type || "Course"}
            </p>

            {/* ✅ Students Enrolled */}
            <p className="flex items-center">
              <FaUserGraduate className="mr-1 text-emerald-500" />
              {course.enrolledCount || 0} enrolled
            </p>
          </div>

          {/* Instructor */}
          <div className="mt-4 px-2 flex items-center gap-3">
            {course?.instructor?.image ? (
              <img
                src={course.instructor.image}
                alt={course.instructor.name}
                className="h-9 w-9 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                {getInitials(course?.instructor?.name)}
              </div>
            )}

            <div className="leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-800">
                  {course?.instructor?.name}
                </span>
                <FaCheckCircle size={14} className="text-emerald-500" />
              </div>
              <p className="text-xs text-gray-500">
                {course?.instructor?.instructorTitle || "Instructor"}
              </p>
            </div>
          </div>

          {/* Curriculum */}
          <div className="bg-white rounded-2xl mt-6 border border-gray-100 p-5">
            <h3 className="text-emerald-600 font-semibold text-sm mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" /> What You'll Get
              Access To
            </h3>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
              {course.curriculum.map((section, index) => {
                const totalDuration = calculateSectionDuration(section.lessons);
                return (
                  <div
                    key={index}
                    className="border border-emerald-100 rounded-xl p-3 hover:border-emerald-300 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {section.title}
                        </h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <p>▶ {section.lessons.length} lessons</p>
                          <p>⏱ {totalDuration} content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RIGHT SIDE ===== */}
      <div className="lg:col-span-2 shadow-sm rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-800">
          Complete Your Enrollment
        </h2>

        {/* Payment Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setSelectedTab("local")}
            className={`flex-1 text-center py-3 cursor-pointer font-medium text-sm border-b-2 transition ${
              selectedTab === "local"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <p>Local Payment</p>
            <p className="text-xs text-gray-400">Mobile Money & Cash</p>
          </button>
          <button
            onClick={() => setSelectedTab("online")}
            className={`flex-1 text-center py-3 cursor-pointer font-medium text-sm border-b-2 transition ${
              selectedTab === "online"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <p>Online Payment</p>
            <p className="text-xs text-gray-400">Credit/Debit Card</p>
          </button>
        </div>

        {/* Local Payment */}
        {selectedTab === "local" && (
          <>
            <h3 className="text-sm font-semibold mb-2 text-gray-700">
              Payment Method
            </h3>
            <div className="space-y-2 mb-6 relative">
              {[
                "EVC Plus",
                "ZAAD Service",
                "Sahal",
                "EBIR",
                "Cash on Delivery",
              ].map((method, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full relative border rounded-lg cursor-pointer p-3 pl-4 text-left text-sm transition flex flex-col ${
                    selectedMethod === method
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <span
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                      selectedMethod === method
                        ? "border-emerald-500"
                        : "border-gray-300"
                    } flex items-center justify-center`}
                  >
                    {selectedMethod === method && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    )}
                  </span>
                  <div className="font-medium text-gray-800 flex items-center gap-2">
                    {method}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {method === "Cash on Delivery"
                      ? "Pay when you receive"
                      : `Pay with ${method} mobile money`}
                  </div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              {selectedTab === "local" && (
                <div className="mb-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // tirada kaliya
                      if (value.length <= 15) setPhone(value);
                    }}
                    placeholder="E.g. 612345678"
                    required={selectedTab === "local"} // ✅ required oo kaliya marka local
                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400 ${
                      selectedTab === "local" &&
                      phone.length > 0 &&
                      (phone.length < 8 || phone.length > 15)
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-emerald-400"
                    }`}
                  />
                  {selectedTab === "local" &&
                    phone.length > 0 &&
                    (phone.length < 8 || phone.length > 15) && (
                      <p className="text-red-500 text-xs mt-1">
                        Phone number must be 8–15 digits.
                      </p>
                    )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Online Payment */}
        {selectedTab === "online" && (
          <div className="border rounded-lg p-3 mb-6 border-emerald-500 bg-emerald-50">
            <div className="font-medium text-gray-800">Credit/Debit Card</div>
            <p className="text-gray-500 text-xs">
              Pay securely using your credit or debit card
            </p>
          </div>
        )}

        {/* Discount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Code (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="Enter discount code"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleApplyDiscount}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
            >
              Apply
            </button>
          </div>
          {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
          {appliedDiscount > 0 && (
            <p className="text-emerald-600 text-xs mt-1">
              🎉 Coupon “samafale” applied! (Extra 15% off)
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <div className="flex justify-between font-semibold text-gray-700 mb-2">
            <span>Original Price</span>
            <span className="text-gray-500 line-through">${totalPrice}.00</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-700 mb-2">
            <span>Discount (25%)</span>
            <span className="text-emerald-500">
              -${(totalPrice * 0.25).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-gray-800 text-lg">
            <span>Total to Pay</span>
            <span className="text-emerald-600">${finalPrice}</span>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={
            selectedTab === "local" &&
            (!selectedMethod || phone.length < 8 || phone.length > 15)
          }
          className={`mt-2 w-full font-medium py-3 rounded-lg transition ${
            selectedTab === "local" &&
            (!selectedMethod || phone.length < 8 || phone.length > 15)
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          Pay ${finalPrice} Now
        </button>
      </div>
    </div>
  );
}

export default PaymentPage;
