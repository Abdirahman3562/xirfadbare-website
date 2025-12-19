import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from "./layouts/Nav";
import CourseDetails from "./pages/webpages/course/CourseDetails";
import CoursesPage from "./pages/webpages/course/CoursesPage";
import HomePage from "./pages/webpages/Home/HomePage";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import NotFoundPage from "./pages/webpages/NotFound/NotFoundPage";
import ScrollToTop from "./pages/ScrollToTop";
import Footer from "./layouts/Footer";
import AboutusPage from "./pages/webpages/About/AboutusPage";
import ContactPage from "./pages/webpages/contact/ContactPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Student from "./pages/Dashboard/student/StudentContent";
import ProtectedRoute from "./routes/ProtectedRoute";
import WhatsAppBubble from "./components/WhatsAppBubble";
import StudentLayout from "./pages/Dashboard/student/StudentLayout"; // Student layout
import Courses from "./pages/Dashboard/student/Courses";
import Orders from "./pages/Dashboard/student/Orders";
import Profile from "./pages/Dashboard/student/Profile";
import PaymentPage from "./pages/webpages/course/PaymentPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import BlogPage from "./pages/webpages/Blog/BlogPage";
import SinglePostPage from "./pages/webpages/Blog/SinglePostPage";
import AuthorPage from "./pages/webpages/Author/AuthorPage";
import InstructorDetails from "./pages/webpages/instructor/InstructorDetails";
import Reviews from "./components/instructor/Reviews";
import CourseDashboard from "./pages/Dashboard/student/CourseDashboard";

function App() {
  const location = useLocation();

  // ✅ haddii uu path-ku ka bilaabmo /dashboard — footer ha muuqan

  const hideFooter =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/auth/signup"|| location.pathname === "/auth/login"|| location.pathname.startsWith("/watch");

  const hideNav = location.pathname.startsWith("/auth");

  return (
    <>
      {!hideNav && <Nav />}
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/about" element={<AboutusPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:title" element={<SinglePostPage />} />
        <Route path="/u/:username" element={<AuthorPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/instructor/:slug" element={<InstructorDetails />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/payment/:id" element={<PaymentPage />} />

        {/* Protected routes for dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentLayout />}>
            <Route path="student" element={<Student />} />
            <Route path="courses" element={<Courses />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Course Dashboard page OUTSIDE the layout */}
        <Route
          path="/watch/courses/:courseSlug/lessons/:lessonSlug?"
          element={<CourseDashboard />}
        />
      </Routes>
      <ToastContainer position="top-center" autoClose={3000} />
      {/* WhatsApp bubble: visible on all pages */}
      <WhatsAppBubble
        phone="+252619537487"
        greeting="Assalamu Alaikum! 👋 Waxaan xiiseynayaa barnaamijka."
        title="Xirfadbare Support"
        subtitle="Typically replies instantly"
      />
      {/* Footer only visible if it's not a dashboard route */}
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
