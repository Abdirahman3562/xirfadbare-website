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
    <div className="bg-[#edf4f5] relative dark:bg-slate-900">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />


      {/* 1️⃣ Hero Section */}
      <Herro /> {/* or <Hero slides={mySlides} intervalMs={7000} /> */}


      {/* 2️⃣ Trust Bar (Statistics) */}
      <TrustBar />

      {/* 4️⃣ How It Works Section */}
      <HowItWorks />

      {/* 3️⃣ Browse by Category Section */}
      <Categories />



      {/* 5️⃣ Outcomes / Student Success Stats */}
      {/* <Outcomes /> */}

      {/* 7️⃣ Featured / Recent Courses Section */}
      <Courses IsHome={true} />

      {/* 6️⃣ Testimonials Section */}
      <Testimonials />



      {/* 8️⃣ View All Courses Button Section */}
      <ViewAllCourses />

      {/* 9️⃣ Call To Action Banner */}
      <CTABanner />

      {/* 🔟 Top Instructors Section */}
      <TopInstructors />
      <FAQ />
    </div>
  );
}

export default HomePage;
