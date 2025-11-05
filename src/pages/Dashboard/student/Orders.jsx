import { ChevronRight, Home } from "lucide-react";

export default function Orders() {

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 mt-20">
       <div className="flex gap-1 items-center ">
        <Home className="w-5 h-5 text-emerald-600" />
        <ChevronRight
          className="w-5 h-5 font-bold text-emerald-600"
          style={{ fontSize: "16px" }}
        />
        <span className="text-lg font-semibold mb-1 text-gray-700">
          Student
        </span>

        <ChevronRight
          className="w-5 h-5 font-bold text-emerald-600"
          style={{ fontSize: "16px" }}
        />
        <span className="text-lg font-semibold mb-1 text-gray-700">
          Orders
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Purchase History
</h1>
      <p className="text-gray-500 text-[14px] mb-6">
       View and manage your course purchases and payment history.
      </p>
      {/* Student Dashboard */}
      <section>
        <h1 className="text-2xl font-semibold mb-2">My Orders
</h1>
        <p className="text-gray-500 text-sm mb-6">
          View and manage your course orders

        </p>



      <div className="text-center items-center bg-white border border-gray-200 p-6 rounded-lg   w-full">
        <h1 className="text-2xl font-semibold text-gray-700">No orders found</h1>
        <p className="text-gray-500 mt-2">You haven't placed any orders yet.</p>
        <button className="mt-6 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300">
          Browse Courses
        </button>
      </div>
       
      </section>

     
    </div>
  );
}
