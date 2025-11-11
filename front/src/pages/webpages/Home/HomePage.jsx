import { FaQ } from "react-icons/fa6";
import Categories from "../../../components/Home/Categories";
import Courses from "../../../components/course/Courses";
import CTABanner from "../../../components/Home/CTABanner";
import Herro from "../../../components/Home/Herro";
import HowItWorks from "../../../components/Home/HowItWorks";
import Outcomes from "../../../components/Home/Outcomes";
import Testimonials from "../../../components/Home/Testimonials";
import TopInstructors from "../../../components/Home/TopInstructors";
import TrustBar from "../../../components/Home/TrustBar";
import ViewAllCourses from "../../../components/Home/ViewAllCourses";
import FAQ from "../../../components/Home/FAQ";

function HomePage() {
  return (
    <div className="bg-[#edf4f5] relative">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200/40 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/40 blur-3xl rounded-full" />
      

      {/* 1️⃣ Hero Section */}
            <Herro /> {/* or <Hero slides={mySlides} intervalMs={7000} /> */}


      {/* 2️⃣ Trust Bar (Statistics) */}
      <TrustBar />

      {/* 3️⃣ Browse by Category Section */}
      <Categories />

      {/* 4️⃣ How It Works Section */}
      <HowItWorks />

      {/* 5️⃣ Outcomes / Student Success Stats */}
      <Outcomes />

      {/* 6️⃣ Testimonials Section */}
      <Testimonials />

      {/* 7️⃣ Featured / Recent Courses Section */}
      <Courses IsHome={true} />

      {/* 8️⃣ View All Courses Button Section */}
      <ViewAllCourses />

      {/* 9️⃣ Call To Action Banner */}
      <CTABanner />

      {/* 🔟 Top Instructors Section */}
      <TopInstructors />
      <FAQ/>
    </div>
  );
}

export default HomePage;
