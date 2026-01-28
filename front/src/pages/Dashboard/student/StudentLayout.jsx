import { Outlet } from "react-router-dom";
import Sidebar from "../../../layouts/Sidebar";  // Sidebar-ka
import Nav from "../../../layouts/Nav";

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#edf4f5]">
      <Nav />
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 md:ml-64 ml-0 min-h-screen p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
