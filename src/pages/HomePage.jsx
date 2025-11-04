import { FaQ } from "react-icons/fa6";
import Categories from "../components/Categories";
import Courses from "../components/Courses";
import CTABanner from "../components/CTABanner";
import Herro from "../components/Herro";
import HowItWorks from "../components/HowItWorks";
import Outcomes from "../components/Outcomes";
import Testimonials from "../components/Testimonials";
import TopInstructors from "../components/TopInstructors";
import TrustBar from "../components/TrustBar";
import ViewAllCourses from "../components/ViewAllCourses";
import FAQ from "../components/FAQ";

function HomePage() {
  return (
    <div className="bg-[#edf4f5] relative">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200/40 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/40 blur-3xl rounded-full" />
      

      {/* 1️⃣ Hero Section */}
      <Herro
        title={
          <>
            Become a <span className="text-[#00cc8f]">Full-Stack</span> Engineer
            <br className="hidden md:block" /> the{" "}
            <span className="text-indigo-600">smart way</span>
          </>
        }
        subtitle="Hands-on projects, mentor feedback, and job-ready skills."
        primaryCta={{ label: "Explore Courses", to: "/courses" }}
        secondaryCta={{ label: "How it works", to: "#how-it-works" }}
        showBlobs={true}
      />

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
