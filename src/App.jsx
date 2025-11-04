import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from "./components/nav";
import CourseDetails from "./pages/CourseDetails";
import CoursesPage from "./pages/CoursesPage";
import HomePage from "./pages/HomePage";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./pages/ScrollToTop"; 
import Footer from "./components/Footer";
import AboutusPage from "./pages/AboutusPage";
import ContactPage from "./pages/ContactPage";

function App() {
  return (
    <>
      <Nav />

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="about" element={<AboutusPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />



      <Footer/>
    </>
  );
}

export default App;
