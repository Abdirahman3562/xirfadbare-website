import React, { useState } from "react";
import { Mail, MessageSquare, Monitor, ArrowRight, Send } from "lucide-react";
import { useData } from "../../../contexts/DataContext";

export default function ContactPage() {
  const { settings } = useData();
  const contact = settings?.contact || {};

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    about: "",
    message: "",
  });
  const [status, setStatus] = useState(null); // "ok" | "err" | null

  const contacts = [
    {
      icon: Mail,
      title: "Email Support",
      text: "Get a response within 24 hours",
      value: contact.email || "info@xirfadbare.com",
      href: `mailto:${contact.email || "info@xirfadbare.com"}`,
    },
    {
      icon: MessageSquare,
      title: "WhatsApp Chat",
      text: "Quick response on WhatsApp",
      value: contact.phone || "+252 619537487",
      href: `https://wa.me/${(contact.phone || "252619537487").replace(/\s+/g, '')}`,
      active: false,
    },
    {
      icon: Monitor,
      title: "Office Address",
      text: contact.workingHours || "Sat - Thu: 8:00 AM - 5:00 PM",
      value: contact.address || "Mogadishu, Somalia",
      href: "#",
    },
  ];

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setStatus("ok");
        setForm({ name: "", phone: "", email: "", about: "", message: "" });
        setTimeout(() => setStatus(null), 3500);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (e) {
      console.error('Error submitting contact form:', e);
      setStatus("err");
      setTimeout(() => setStatus(null), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf7] py-12">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-block mb-5 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold text-sm border border-emerald-100">
          ✨ Let’s Create Something Amazing
        </div>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-slate-900">
          Get in Touch
        </h1>
        <p className="mt-4 text-slate-600">
          Have questions about our services? Want to collaborate? Or just want
          to say hello? <span className="text-emerald-600 font-semibold">We’re here to help you succeed!</span>
        </p>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 pb-24 grid gap-10 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="bg-[#f4faf7] backdrop-blur rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition p-6 md:p-8">
          <h3 className="text-lg font-semibold text-slate-900">
            Send Us a Message
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Fill out the form below and we’ll get back to you as soon as possible.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {/* name + phone */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-emerald-100 bg-white/70 px-4 py-2.5 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="+252 XXX XXX XXX"
                  className="w-full rounded-xl border border-emerald-100 bg-white/70 px-4 py-2.5 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
                />
              </div>
            </div>

            {/* email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-emerald-100 bg-white/70 px-4 py-2.5 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
                required
              />
            </div>

            {/* about */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                About
              </label>
              <input
                name="about"
                value={form.about}
                onChange={onChange}
                placeholder="What’s this regarding?"
                className="w-full rounded-xl border border-emerald-100 bg-white/70 px-4 py-2.5 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>

            {/* message */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={6}
                placeholder="Tell us more about your inquiry…"
                className="w-full  rounded-xl border border-emerald-100 bg-white/70 px-4 py-3 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full cursor-pointer md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold px-5 py-3 shadow-sm hover:shadow-md transition"
            >
              Send Message <Send className="w-4 h-4" />
            </button>

            {/* status toast */}
            {status === "ok" && (
              <p className="text-emerald-600 text-sm mt-2">
                ✅ Message sent! We’ll get back to you soon.
              </p>
            )}
            {status === "err" && (
              <p className="text-red-600 text-sm mt-2">
                ❌ Something went wrong. Please try again.
              </p>
            )}
          </form>
        </div>

        {/* Right: Other Ways to Connect */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">
            Other Ways to Connect
          </h3>
          <p className="text-sm text-slate-500 mb-6">
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
                      ? "bg-emerald-100/70 border-emerald-200 ring-2 ring-emerald-100"
                      : "bg-emerald-50/40 border-emerald-100 hover:bg-emerald-100/70",
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
                          <h4 className="font-semibold text-slate-900">{c.title}</h4>
                          <p className="text-xs text-slate-500">{c.text}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-500 opacity-60 group-hover:opacity-100 transition" />
                      </div>

                      <div className="mt-3 text-emerald-700 font-medium">
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
