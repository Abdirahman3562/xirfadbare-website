import React from "react";
import { BrowserRouter, Route, Routes, useLocation, Link, Navigate } from "react-router-dom";
import { useLayoutEffect, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "./contexts/ThemeContext";
// ---------------------------
// Existing Imports (Assuming these valid)
// ---------------------------
import HomePage from "./pages/webpages/Home/HomePage";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import CourseDetails from "./pages/webpages/course/CourseDetails";
import StudentDashboard from "./pages/Dashboard/student/StudentDashboard";
import AdminDashboard from "./pages/Dashboard/admin/AdminDashboard";
import InstructorDashboard from "./pages/Dashboard/instructor/InstructorDashboard";
import CreateCourse from "./pages/Dashboard/instructor/CreateCourse";
import ManageCourses from "./pages/Dashboard/instructor/ManageCourses";
import ManageUsers from "./pages/Dashboard/admin/ManageUsers";
import ManageRoles from "./pages/Dashboard/admin/ManageRoles";
import RolePermissionEditor from "./pages/Dashboard/admin/RolePermissionEditor";
import ManageCoursesAdmin from "./pages/Dashboard/admin/ManageCourses";
import CourseContent from "./pages/webpages/course/CourseContent";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/Dashboard/admin/AdminLayout";
import InstructorLayout from "./pages/Dashboard/instructor/InstructorLayout";
import StudentLayout from "./pages/Dashboard/student/StudentLayout";
import AboutusPage from "./pages/webpages/About/AboutusPage";
import ContactPage from "./pages/webpages/contact/ContactPage";
import BlogPage from "./pages/webpages/Blog/BlogPage";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Profile from "./pages/Dashboard/common/Profile";
import EditCourse from "./pages/Dashboard/instructor/EditCourse";
import EditCourseAdmin from "./pages/Dashboard/admin/EditCourse";
import InstructorDetails from "./pages/webpages/instructor/InstructorDetails";
import InstructorList from "./pages/webpages/instructor/InstructorList";
import CourseList from "./pages/webpages/course/CourseList";
import PaymentPage from "./pages/webpages/course/PaymentPage";
import VerifyEmail from "./pages/Auth/VerifyEmail";
// New Import
import ManageTestimonials from "./pages/Dashboard/admin/ManageTestimonials";
import ManageFAQs from "./pages/Dashboard/admin/ManageFAQs";
import ManageInstructors from "./pages/Dashboard/admin/ManageInstructors";
import ManageOrders from "./pages/Dashboard/admin/ManageOrders";
import ManageAuthors from "./pages/Dashboard/admin/ManageAuthors";
import ManageCategories from "./pages/Dashboard/admin/ManageCategories";
import SystemSettings from "./pages/Dashboard/admin/SystemSettings";
import ManageBlogs from "./pages/Dashboard/admin/ManageBlogs";
import CreateBlog from "./pages/Dashboard/admin/CreateBlog";
import ManageContacts from "./pages/Dashboard/admin/ManageContacts";
import ManageBotResponses from "./pages/Dashboard/admin/ManageBotResponses";
import LiveChat from "./pages/Dashboard/admin/LiveChat";
import ManagePayments from "./pages/Dashboard/admin/ManagePayments";
// ManageSettings removed
import PublicLayout from "./layouts/PublicLayout";
import Orders from "./pages/Dashboard/student/Orders";
import CourseDashboard from "./pages/Dashboard/student/CourseDashboard";
import SinglePostPage from "./pages/webpages/Blog/SinglePostPage";
import AuthorPage from "./pages/webpages/Author/AuthorPage";
import TopBanner from "./components/ui/TopBanner";


// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Main App Component
function App() {
  const { theme } = useTheme();

  // 🌍 Fetch & Apply System Settings (Title & Favicon)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/settings");
        const data = await response.json();

        // Update Title
        if (data.websiteTitle) {
          document.title = data.websiteTitle;
        }

        // Update Favicon
        if (data.logo) {
          const faviconUrl = data.logo.startsWith("/")
            ? `http://localhost:5000${data.logo}`
            : data.logo;

          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.getElementsByTagName("head")[0].appendChild(link);
          }
          link.href = faviconUrl;
        }
      } catch (error) {
        console.error("Error fetching system settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <BrowserRouter>
      {/* Top Banner (Fixed) */}
      <TopBanner />

      {/* Scroll Logic */}
      <ScrollToTop />

      {/* Global Toast */}
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutusPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:title" element={<SinglePostPage />} />
          <Route path="/u/:username" element={<AuthorPage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/auth/signup" element={<Signup />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/courses/:slug" element={<CourseDetails />} />
          <Route path="/course-content/:id" element={<CourseContent />} />
          <Route path="/instructor/:slug" element={<InstructorDetails />} />
          <Route path="/instructors" element={<InstructorList />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
        </Route>


        {/* Dashboard Routes (Protected Student) */}
        <Route path="/dashboard" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
          <Route path="student" element={<StudentDashboard />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="courses" element={<StudentDashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Course Playback (Protected) */}
        <Route path="/watch/courses/:courseSlug/lessons/:lessonSlug" element={<ProtectedRoute role="student"><CourseDashboard /></ProtectedRoute>} />

        {/* Instructor Routes (Protected) */}
        <Route path="/instructor" element={<ProtectedRoute role="instructor"><InstructorLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<InstructorDashboard />} />
          <Route path="create-course" element={<CreateCourse />} />
          <Route path="manage-courses" element={<ManageCourses />} />
          <Route path="edit-course/:id" element={<EditCourse />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes (Protected) */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="roles" element={<ManageRoles />} />
          <Route path="roles/create" element={<RolePermissionEditor />} />
          <Route path="roles/edit/:id" element={<RolePermissionEditor />} />
          <Route path="courses" element={<ManageCoursesAdmin />} />
          <Route path="courses/create/:id" element={<EditCourseAdmin />} />
          <Route path="courses/edit/:id" element={<EditCourseAdmin />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          <Route path="faqs" element={<ManageFAQs />} />
          <Route path="instructors" element={<ManageInstructors />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="authors" element={<ManageAuthors />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="blogs" element={<ManageBlogs />} />
          <Route path="blogs/create" element={<CreateBlog />} />
          <Route path="blogs/edit/:id" element={<CreateBlog />} />
          <Route path="contacts" element={<ManageContacts />} />
          <Route path="payments" element={<ManagePayments />} />
          <Route path="system-settings" element={<SystemSettings />} />
          {/* Settings route removed */}
          <Route path="profile" element={<Profile />} />
          <Route path="bot-responses" element={<ManageBotResponses />} />
          <Route path="live-chat" element={<LiveChat />} />
        </Route>

        {/* 404 Route Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
              <h1 className="text-8xl font-black text-emerald-600 mb-4 tracking-tighter animate-bounce">404</h1>
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight uppercase">Boggan lama helin!</h2>
              <p className="text-gray-500 mb-10 max-w-md italic font-semibold text-lg leading-relaxed">
                Waan ka xunnahay, boggan aad raadinayso ma jiro ama waa laga guuray.
                Fadlan dib ugu laabo bogga hore.
              </p>
              <Link to="/" className="bg-emerald-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-2xl shadow-emerald-200 active:scale-95">
                Ku laabo Bogga Hore
              </Link>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
