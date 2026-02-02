import React, { useState, useEffect } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { API_BASE_URL, SERVER_URL } from "../config";

export default function Footer() {
  const [settings, setSettings] = useState({
    websiteTitle: "Xirfadbare Academy",
    websiteDescription: "Xirfadbare waa madal waxbarasho casri ah oo kaa caawisa inaad barato xirfadaha Technology-ga sida Web Development, Design, iyo AI — si aad u noqoto xirfadle diyaar u ah suuqa shaqada maanta.",
    contactEmail: "info@xirfadbare.com",
    phoneNumber: "+252 61 234 5678",
    location: "Mogadishu, Somalia",
    logo: "",
    facebookLink: "",
    twitterLink: "",
    linkedinLink: "",
    instagramLink: "",
    tiktokLink: "",
    youtubeLink: ""
  });

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        const data = await response.json();
        setSettings({
          websiteTitle: data.websiteTitle || "Xirfadbare Academy",
          websiteDescription: data.websiteDescription || "Xirfadbare waa madal waxbarasho casri ah oo kaa caawisa inaad barato xirfadaha Technology-ga sida Web Development, Design, iyo AI — si aad u noqoto xirfadle diyaar u ah suuqa shaqada maanta.",
          contactEmail: data.contactEmail || "info@xirfadbare.com",
          phoneNumber: data.phoneNumber || "+252 61 234 5678",
          location: data.location || "Mogadishu, Somalia",
          logo: data.logo || "",
          facebookLink: data.facebookLink || "",
          twitterLink: data.twitterLink || "",
          linkedinLink: data.linkedinLink || "",
          instagramLink: data.instagramLink || "",
          tiktokLink: data.tiktokLink || "",
          youtubeLink: data.youtubeLink || ""
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return "";
    return path.startsWith("/") ? `${SERVER_URL}${path}` : path;
  };

  return (
    <footer className="relative overflow-hidden pt-16 pb-8 bg-[#edf4f5] dark:bg-slate-900 text-gray-800 dark:text-gray-300 transition-colors duration-500">
      {/* 🎨 Background blobs — sida FAQ & Hero */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-200/40 dark:bg-indigo-500/10 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/40 dark:bg-emerald-500/10 blur-3xl rounded-full"></div>

      {/* ✅ Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 grid gap-10 md:grid-cols-4 z-10">
        {/* 1️⃣ Brand & About */}
        <div>
          {/* Logo or Brand Name */}
          {settings.logo ? (
            <Link to="/" className="block">
              <img src={getImageUrl(settings.logo)} alt="Logo" className="h-20 mt-[-20px] mb-[-10px] object-contain" />
            </Link>
          ) : (
            <Link to="/" className="text-2xl font-extrabold text-emerald-600">
              Xirfadbare<span className="text-emerald-600">.</span>
            </Link>
          )}

          {/* Description */}
          <p className="mt-4 text-sm leading-relaxed text-gray-700 dark:text-gray-400">
            {settings.websiteDescription}
          </p>

          {/* Social Icons */}
          <div className="flex gap-3 mt-5">
            {settings.facebookLink && (
              <a
                href={settings.facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 grid place-content-center rounded-full bg-white dark:bg-slate-800 shadow hover:bg-[#00cc8f] dark:hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                <FaFacebookF className="text-gray-700 dark:text-gray-300 text-sm hover:text-white" />
              </a>
            )}
            {settings.twitterLink && (
              <a
                href={settings.twitterLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 grid place-content-center rounded-full bg-white dark:bg-slate-800 shadow hover:bg-[#00cc8f] dark:hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                <FaTwitter className="text-gray-700 dark:text-gray-300 text-sm hover:text-white" />
              </a>
            )}
            {settings.linkedinLink && (
              <a
                href={settings.linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 grid place-content-center rounded-full bg-white dark:bg-slate-800 shadow hover:bg-[#00cc8f] dark:hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                <FaLinkedinIn className="text-gray-700 dark:text-gray-300 text-sm hover:text-white" />
              </a>
            )}
            {settings.instagramLink && (
              <a
                href={settings.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 grid place-content-center rounded-full bg-white dark:bg-slate-800 shadow hover:bg-[#00cc8f] dark:hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                <FaInstagram className="text-gray-700 dark:text-gray-300 text-sm hover:text-white" />
              </a>
            )}
            {settings.tiktokLink && (
              <a
                href={settings.tiktokLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 grid place-content-center rounded-full bg-white dark:bg-slate-800 shadow hover:bg-[#00cc8f] dark:hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                <FaTiktok className="text-gray-700 dark:text-gray-300 text-sm hover:text-white" />
              </a>
            )}
            {settings.youtubeLink && (
              <a
                href={settings.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 grid place-content-center rounded-full bg-white dark:bg-slate-800 shadow hover:bg-[#00cc8f] dark:hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                <FaYoutube className="text-gray-700 dark:text-gray-300 text-sm hover:text-white" />
              </a>
            )}
          </div>
        </div>

        {/* 2️⃣ Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
            <li><Link to="/" className="hover:text-[#00cc8f] transition">Home</Link></li>
            <li><Link to="/about" className="hover:text-[#00cc8f] transition">About Us</Link></li>
            <li><Link to="/courses" className="hover:text-[#00cc8f] transition">Courses</Link></li>
            <li><Link to="/instructors" className="hover:text-[#00cc8f] transition">Instructors</Link></li>
            <li><Link to="/blog" className="hover:text-[#00cc8f] transition">Blog</Link></li>
          </ul>
        </div>

        {/* 3️⃣ Support */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
            <li><Link to="/contact" className="hover:text-[#00cc8f] transition">Contact Us</Link></li>
            <li><Link to="/about" className="hover:text-[#00cc8f] transition">About</Link></li>
            <li><a href="#faq" className="hover:text-[#00cc8f] transition">FAQ</a></li>
            <li><a href="#" className="hover:text-[#00cc8f] transition">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-[#00cc8f] transition">Terms of Service</a></li>
          </ul>
        </div>

        {/* 4️⃣ Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Info</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-400">
            <li><span className="text-gray-600">Email:</span> {settings.contactEmail}</li>
            <li><span className="text-gray-600">Phone:</span> {settings.phoneNumber}</li>
            <li><span className="text-gray-600">Location:</span> {settings.location}</li>
          </ul>
        </div>
      </div>

      {/* ✅ Divider */}
      <div className="relative border-t border-gray-300 dark:border-gray-800 mt-12 pt-6 text-center text-sm text-gray-600 dark:text-gray-400 z-10">
        © {new Date().getFullYear()}{" "}
        <span className="text-[#00cc8f] font-semibold">Xirfadbare</span>. All rights reserved.
      </div>
    </footer>
  );
}
