import { useNavigate, useParams } from "react-router-dom";
import { CreditCard, Camera, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getImageUrl } from "../../../utils/format";
import toast, { Toaster } from "react-hot-toast";
import {
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaUserGraduate,
  FaAward,
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
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [paymentProof, setPaymentProof] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const navigate = useNavigate();

  // Calculate prices dynamically
  const baseDiscount = (course?.discountCode ? 0 : (course?.discountPercentage || 0)) / 100;
  const totalDiscount = baseDiscount + appliedDiscount;

  const totalPrice = Number(
    selectedPlan?.price || course?.price?.amount || course?.price || 0
  );
  const discountAmount = (totalPrice * totalDiscount).toFixed(2);
  const finalPrice = (totalPrice - discountAmount).toFixed(2);

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

  // ✅ Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/payment-methods`);
        const data = await res.json();
        if (res.ok) {
          setPaymentMethods(data);
        }
      } catch (error) {
        console.error("❌ Error fetching payment methods:", error);
      } finally {
        setLoadingMethods(false);
      }
    };
    fetchPaymentMethods();
  }, []);

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadingProof(true);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setPaymentProof(data.url);
      toast.success("Cadeentii waa la soo galiyay!");
    } catch (error) {
      toast.error("Wuu fashilmay upload-ka.");
    } finally {
      setUploadingProof(false);
    }
  };

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
    const courseCode = course?.discountCode?.trim().toLowerCase();

    if (courseCode && coupon === courseCode) {
      setAppliedDiscount((course.discountPercentage || 0) / 100);
      setErrorMsg("");
      toast.success(`Code applied! You got ${course.discountPercentage}% off.`);
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
        discountApplied: Number(discountAmount),
        finalPrice: Number(finalPrice),
        paymentProof: paymentProof,
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
        toast.success("Order placed successfully!");
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

  const calculateTotalDuration = (curriculum) => {
    if (!curriculum) return "0m";
    let totalSec = 0;
    curriculum.forEach(sec => {
      sec.lessons?.forEach(lesson => {
        if (!lesson.duration) return;
        const [m, s] = lesson.duration.split(':').map(Number);
        totalSec += (m || 0) * 60 + (s || 0);
      });
    });
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!course)
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Loading course details...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#edf4f5] dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-7xl  mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Toaster position="top-right" reverseOrder={false} />

        {/* ===== LEFT SIDE ===== */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 shadow-md rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
          <div className="relative">
            {course.thumbnail && (
              <img
                src={getImageUrl(course.thumbnail)}
                alt={course.title}
                className="w-full h-64 object-cover rounded-t-xl"
              />
            )}
            {(course.discountPercentage > 0 || totalDiscount > 0) && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                {Math.round((course.discountPercentage || totalDiscount * 100))}% Discount
              </div>
            )}

            {course.hasCertificate && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-black px-3.5 py-1.5 rounded-lg shadow-lg border border-amber-300/30 transition-all hover:scale-105 duration-300">
                <FaAward className="text-white text-sm animate-pulse" />
                <span className="text-[9px] uppercase tracking-[0.1em] font-black">Certificate Included</span>
                <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          <div className="p-5">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              {course.title}
            </h2>

            <div className="grid grid-cols-2 gap-3 text-[13px] mt-4 mb-6">
              {/* Duration */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30">
                <FaClock className="text-emerald-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">
                  {course.totalDuration || "N/A"}
                </span>
              </div>

              {/* Sections */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30">
                <FaGraduationCap className="text-emerald-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">
                  {course.curriculum?.length || 0} Sections
                </span>
              </div>

              {/* Type */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30">
                <FaCheckCircle className="text-emerald-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">
                  {course.type || "Course"}
                </span>
              </div>

              {/* ✅ Students Enrolled */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-500/30">
                <FaUserGraduate className="text-emerald-500 shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 font-semibold truncate">
                  {course.enrolledCount || 0} Enrolled
                </span>
              </div>
            </div>

            {/* Instructor */}
            <div className="mt-6 px-2 flex items-center gap-3 ">
              {course?.instructor?.image ? (
                <img
                  src={getImageUrl(course.instructor.image)}
                  alt={course.instructor.name}
                  className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-slate-800"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-sm font-semibold">
                  {getInitials(course?.instructor?.name)}
                </div>
              )}

              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {course?.instructor?.name}
                  </span>
                  <FaCheckCircle size={14} className="text-emerald-500" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {course?.instructor?.instructorTitle || "Instructor"}
                </p>
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl mt-6 border border-gray-100 dark:border-slate-800 p-5">
              <h3 className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-500" /> What You'll Get
                Access To
              </h3>

              <div className="max-h-96 overflow-y-auto pr-2 space-y-3">
                {course.curriculum.map((section, index) => {
                  const totalDuration = calculateSectionDuration(section.lessons);
                  return (
                    <div
                      key={index}
                      className="border border-emerald-100 dark:border-slate-800 rounded-xl p-3 hover:border-emerald-300 dark:hover:border-emerald-500 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                            {section.title}
                          </h4>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-100 dark:border-slate-800 p-6 transition-all duration-300">
          <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Complete Your Enrollment
          </h2>

          {/* Payment Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 mb-6 font-bold">
            <button
              onClick={() => setSelectedTab("local")}
              className={`flex-1 text-center py-3 cursor-pointer font-bold text-sm border-b-2 transition ${selectedTab === "local"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
            >
              <p>Local Payment</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Mobile Money & Cash</p>
            </button>
            <button
              onClick={() => setSelectedTab("online")}
              className={`flex-1 text-center py-3 cursor-pointer font-bold text-sm border-b-2 transition ${selectedTab === "online"
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
            >
              <p>Online Payment</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Credit/Debit Card</p>
            </button>
          </div>

          {/* Dynamic Payment Methods (Shared for Local & Online) */}
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Payment Method
          </h3>
          <div className="space-y-3 mb-6 relative">
            {loadingMethods ? (
              <div className="py-4 text-center text-gray-500 text-sm animate-pulse">
                Soo aqrinaya qababka lacag bixinta...
              </div>
            ) : (
              paymentMethods
                .filter(m => (m.type || 'local') === selectedTab)
                .map((method, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMethod(method.name)}
                    className={`w-full relative border rounded-xl cursor-pointer p-4 text-left text-sm transition-all duration-300 flex flex-col ${selectedMethod === method.name
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-sm"
                      : "border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-gray-50 dark:hover:bg-slate-800"
                      }`}
                  >
                    <span
                      className={`absolute right-4 top-6 w-5 h-5 rounded-full border-2 ${selectedMethod === method.name
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-200"
                        } flex items-center justify-center transition-all`}
                    >
                      {selectedMethod === method.name && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod === method.name ? 'bg-white dark:bg-slate-900 shadow-sm text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500'
                        }`}>
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{method.name}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-[11px] font-medium mt-0.5">
                          {selectedTab === 'local' ? `Pay with ${method.name} wallet` : `Pay securely with ${method.name}`}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Instruction */}
                    {selectedMethod === method.name && (
                      <div className="mt-4 pt-4 border-t border-emerald-100/50 dark:border-emerald-500/20 animate-in slide-in-from-top-2 duration-300">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1.5 underline decoration-emerald-200 dark:decoration-emerald-500 underline-offset-4">How to pay:</span>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 leading-relaxed bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-emerald-100/50 dark:border-emerald-500/20">
                          {method.instruction}
                        </p>
                      </div>
                    )}
                  </button>
                ))
            )}

            {paymentMethods.filter(m => (m.type || 'local') === selectedTab).length === 0 && !loadingMethods && (
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium text-center">
                Hadda ma jiraan qab lacag bixin oo {selectedTab === 'local' ? 'Local' : 'Online'} ah oo diyaar ah.
              </div>
            )}
          </div>

          {/* Local Payment Specific Inputs (Phone Number) */}
          {selectedTab === "local" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="mb-4">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ""); // tirada kaliya
                    if (value.length <= 15) setPhone(value);
                  }}
                  placeholder="E.g. 612345678"
                  className={`w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400 ${phone.length > 0 &&
                    (phone.length < 8 || phone.length > 15)
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-slate-800 focus:border-emerald-400"
                    }`}
                />
                {phone.length > 0 &&
                  (phone.length < 8 || phone.length > 15) && (
                    <p className="text-red-500 text-xs mt-1">
                      Phone number must be 8–15 digits.
                    </p>
                  )}
              </div>
            </div>
          )}

          {/* Proof of Payment Upload */}
          <div className="mb-6 bg-gray-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100/50 dark:border-slate-800/50">
            <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
              Proof of Payment (Screenshot)
            </label>

            {!paymentProof ? (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="hidden"
                  id="proof-upload"
                />
                <label
                  htmlFor="proof-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${uploadingProof
                    ? "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-gray-700"
                    : "bg-white dark:bg-slate-900 border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
                    }`}
                >
                  {uploadingProof ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-gray-500">Soo galinaya...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-emerald-600">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                        <Camera size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload Screenshot</span>
                      <span className="text-[9px] text-gray-400 font-medium">PNG, JPG qura</span>
                    </div>
                  )}
                </label>
              </div>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
                <img
                  src={getImageUrl(paymentProof)}
                  alt="Payment Proof"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => setPaymentProof("")}
                    className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                  Cadeyn la helay
                </div>
              </div>
            )}
          </div>


          {/* Discount Section (Only if course has a code) */}
          {course.discountCode && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Discount Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="Enter discount code"
                  className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-400"
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
                  🎉 Code "{course.discountCode}" applied! ({course.discountPercentage}% off)
                </p>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="border-t border-gray-200 dark:border-slate-800 pt-4 mb-6">
            <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <span>Original Price</span>
              <span className={`${totalDiscount > 0 ? "text-gray-500 line-through" : ""}`}>${totalPrice}.00</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <span>Discount ({Math.round(totalDiscount * 100)}%)</span>
                <span className="text-emerald-500 dark:text-emerald-400">
                  -${discountAmount}
                </span>
              </div>
            )}

            <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200 text-lg">
              <span>Total to Pay</span>
              <span className="text-emerald-600 dark:text-emerald-400">${finalPrice}</span>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={
              !selectedMethod ||
              (selectedTab === "local" && (phone.length < 8 || phone.length > 15)) ||
              !paymentProof || uploadingProof
            }
            className={`mt-2 w-full font-bold py-3 rounded-lg transition ${!selectedMethod ||
              (selectedTab === "local" && (phone.length < 8 || phone.length > 15)) ||
              !paymentProof || uploadingProof
              ? "bg-gray-300 dark:bg-slate-800 text-gray-500 dark:text-gray-600 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 dark:shadow-none"
              }`}
          >
            Pay ${finalPrice} Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
