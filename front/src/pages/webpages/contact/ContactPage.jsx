import React, { useState, useEffect } from "react";
import { Mail, MessageSquare, Monitor, ArrowRight, Send, Phone, MapPin, Loader2 } from "lucide-react";
import { toast } from "react-toastify";


export default function ContactPage() {
  const [settings, setSettings] = useState({
    contactEmail: "info@xirfadbare.com",
    phoneNumber: "+252 61 234 5678",
    location: "Mogadishu, Somalia",
    whatsappLink: ""
  });

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("https://xirfadbare-backend.onrender.com/api/settings");
        const data = await response.json();
        setSettings({
          contactEmail: data.contactEmail || "info@xirfadbare.com",
          phoneNumber: data.phoneNumber || "+252 61 234 5678",
          location: data.location || "Mogadishu, Somalia",
          whatsappLink: data.whatsappLink || ""
        });
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    about: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const contacts = [
    {
      icon: Mail,
      title: "Email Support",
      text: "Get a response within 24 hours",
      value: settings.contactEmail,
      href: `mailto:${settings.contactEmail}`,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Chat",
      text: "Quick response on WhatsApp",
      value: settings.phoneNumber,
      href: settings.whatsappLink || `https://wa.me/${settings.phoneNumber.replace(/\s+/g, '')}`,
      active: false,
    },
    {
      icon: MapPin,
      title: "Office Address",
      text: "Visit us during working hours",
      value: settings.location,
      href: "#",
    },
  ];

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('https://xirfadbare-backend.onrender.com/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setForm({ name: "", phone: "", email: "", about: "", message: "" });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (e) {
      console.error('Error submitting contact form:', e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf7] dark:bg-slate-900 py-12 transition-colors duration-500">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-sm border border-emerald-100 dark:border-emerald-500/20">
          ✨ Let’s Create Something Amazing
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">
          Get in Touch
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Have questions about our services? Want to collaborate? Or just want
          to say hello? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">We’re here to help you succeed!</span>
        </p>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid gap-10 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="bg-[#f4faf7] dark:bg-slate-900 backdrop-blur rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-sm hover:shadow-md transition p-6 md:p-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Send Us a Message
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Fill out the form below and we’ll get back to you as soon as possible.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* name + phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-emerald-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 px-4 py-2.5 outline-none focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+252 XXX XXX XXX"
                  className="w-full rounded-xl border border-emerald-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 px-4 py-2.5 outline-none focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-emerald-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 px-4 py-2.5 outline-none focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* about */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                About
              </label>
              <input
                name="about"
                value={form.about}
                onChange={onChange}
                placeholder="What’s this regarding?"
                className="w-full rounded-xl border border-emerald-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 px-4 py-2.5 outline-none focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition text-slate-900 dark:text-white"
              />
            </div>

            {/* message */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={6}
                placeholder="Tell us more about your inquiry…"
                className="w-full  rounded-xl border border-emerald-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900 px-4 py-3 outline-none focus:border-emerald-300 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition resize-none text-slate-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-5 py-3 shadow-sm hover:shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>Sending... <Loader2 className="w-4 h-4 animate-spin" /></>
              ) : (
                <>Send Message <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        {/* Right: Other Ways to Connect */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Other Ways to Connect
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Choose the method that works best for you. We’re here to help!
          </p>

          <div className="space-y-5">
            {contacts.map((c, i) => {
              const Icon = c.icon;
              const active = c.active;

              return (
                <a
                  key={i}
                  href={c.href}
                  target={c.href?.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={[
                    "block rounded-2xl border p-5 transition-all duration-300 shadow-sm",
                    "hover:shadow-md hover:-translate-y-[2px]",
                    active
                      ? "bg-emerald-100/70 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900/30"
                      : "bg-emerald-50/40 dark:bg-slate-800/50 border-emerald-100 dark:border-slate-800 hover:bg-emerald-100/70 dark:hover:bg-slate-800",
                    "group",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-4">
                    {/* ICON */}
                    <div
                      className={[
                        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                        active
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
                      ].join(" ")}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* TEXT CONTENT */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{c.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{c.text}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-500 opacity-60 group-hover:opacity-100 transition" />
                      </div>

                      <div className="mt-3 text-emerald-700 dark:text-emerald-400 font-medium">
                        {c.value}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

      </section>
    </div>
  );
}
