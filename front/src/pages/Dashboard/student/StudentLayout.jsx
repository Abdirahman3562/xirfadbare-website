import { Outlet } from "react-router-dom";
import Sidebar from "../../../layouts/Sidebar";  // Sidebar-ka

const StudentLayout = () => {
  return (
    <div className="flex gap-10 ">
      {/* Sidebar */}
      <Sidebar /> {/* Sidebar-ka ku dar */}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 md:ml-64 ml-0 h-screen overflow-y-auto">
        <Outlet />  {/* Content-ka isbedelaya waxay ku soo baxayaan */}
      </main>
    </div>
  );
};

export default StudentLayout;
