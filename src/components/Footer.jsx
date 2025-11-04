import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden pt-16 pb-8 bg-[#edf4f5] text-gray-800">
      {/* 🎨 Background blobs — sida FAQ & Hero */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200/40 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/40 blur-3xl rounded-full"></div>

      {/* ✅ Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-4 z-10">
        {/* 1️⃣ Brand & About */}
        <div>
          <Link to="/" className="text-2xl font-extrabold text-gray-900">
            Xirfadbare<span className="text-[#00cc8f]">.</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">
            Xirfadbare waa madal waxbarasho casri ah oo kaa caawisa inaad barato
            xirfadaha Technology-ga sida Web Development, Design, iyo AI — si aad
            u noqoto xirfadle diyaar u ah suuqa shaqada maanta.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-5">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 grid place-content-center rounded-full bg-white shadow hover:bg-[#00cc8f] hover:text-white transition"
              >
                <Icon className="text-gray-700 text-sm" />
              </a>
            ))}
          </div>
        </div>

        {/* 2️⃣ Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><Link to="/" className="hover:text-[#00cc8f] transition">Home</Link></li>
            <li><Link to="/courses" className="hover:text-[#00cc8f] transition">Courses</Link></li>
            <li><Link to="/add-course" className="hover:text-[#00cc8f] transition">Add Course</Link></li>
            <li><a href="#how-it-works" className="hover:text-[#00cc8f] transition">How It Works</a></li>
          </ul>
        </div>

        {/* 3️⃣ Support */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><a href="#" className="hover:text-[#00cc8f] transition">Help Center</a></li>
            <li><a href="#" className="hover:text-[#00cc8f] transition">FAQ</a></li>
            <li><a href="#" className="hover:text-[#00cc8f] transition">Contact Us</a></li>
            <li><a href="#" className="hover:text-[#00cc8f] transition">Privacy Policy</a></li>
          </ul>
        </div>

        {/* 4️⃣ Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Info</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><span className="text-gray-600">Email:</span> info@xirfadbare.com</li>
            <li><span className="text-gray-600">Phone:</span> +252 61 234 5678</li>
            <li><span className="text-gray-600">Location:</span> Mogadishu, Somalia</li>
          </ul>
        </div>
      </div>

      {/* ✅ Divider */}
      <div className="relative border-t border-gray-300 mt-12 pt-6 text-center text-sm text-gray-600 z-10">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#00cc8f] font-semibold">Xirfadbare</span>. All rights reserved.
      </div>
    </footer>
  );
}
