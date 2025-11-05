import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from "./components/Nav";
import CourseDetails from "./pages/CourseDetails";
import CoursesPage from "./pages/CoursesPage";
import HomePage from "./pages/HomePage";
import { Route, Routes, useLocation } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./pages/ScrollToTop";
import Footer from "./components/Footer";
import AboutusPage from "./pages/AboutusPage";
import ContactPage from "./pages/ContactPage";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Student from "./pages/Dashboard/student/StudentContent";
import ProtectedRoute from "./routes/ProtectedRoute";
import WhatsAppBubble from "./components/WhatsAppBubble";
import StudentLayout from "./pages/Dashboard/student/StudentLayout"; // Student layout
import Courses from "./pages/Dashboard/student/Courses";
import Orders from "./pages/Dashboard/student/Orders";
import Profile from "./pages/Dashboard/student/Profile";

function App() {
  const location = useLocation();

  // ✅ haddii uu path-ku ka bilaabmo /dashboard — footer ha muuqan
  const hideFooter = location.pathname.startsWith("/dashboard");

  return (
    <>
      <Nav />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/about" element={<AboutusPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes for dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentLayout />}>
            <Route path="student" element={<Student />} />  {/* Student content */}
            <Route path="courses" element={<Courses />} />  {/* My courses page */}
            <Route path="orders" element={<Orders />} />  {/* My courses page */}
            <Route path="profile" element={<Profile />} />  {/* My courses page */}
          </Route>
        </Route>
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />

      {/* WhatsApp bubble: visible on all pages */}
      <WhatsAppBubble
        phone="+252612345678"
        greeting="Assalamu Alaikum! 👋 Waxaan xiiseynayaa barnaamijka."
        title="Dugsiye Support"
        subtitle="Typically replies instantly"
      />

      {/* Footer only visible if it's not a dashboard route */}
      {!hideFooter && <Footer />}
    </>
  );
}

export default App;
