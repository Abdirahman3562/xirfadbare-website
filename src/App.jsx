import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Nav from "./components/nav";
import AddCoursePage from "./pages/AddCoursePage";
import CourseDetails from "./pages/CourseDetails";
import CoursesPage from "./pages/CoursesPage";
import EditCoursePage from "./pages/EditCoursePage";
import HomePage from "./pages/HomePage";
import { Route, Routes } from "react-router-dom";
import NotFoundPage from "./pages/NotFoundPage";
import ScrollToTop from "./pages/ScrollToTop"; 
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Nav />

      <ScrollToTop />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/add-course" element={<AddCoursePage />} />
        <Route path="/edit-course/:id" element={<EditCoursePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <ToastContainer position="top-center" autoClose={3000} />



      <Footer/>
    </>
  );
}

export default App;
