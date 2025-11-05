import { useState } from "react";

export default function WhatsAppBubbleFixedRight() {
  const [open, setOpen] = useState(false);
  const phone = "+252612345678";
  const greeting = "Assalamu Alaikum! 👋 Waxaan xiiseynayaa barnaamijka.";
  const waLink = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(greeting)}`;

  return (
    <div className="fixed right-5 bottom-5 z-[9999] flex flex-col items-end">
      {/* ✅ Chat Box */}
      {open && (
        <div className="mb-3 w-[320px] rounded-2xl shadow-xl bg-white border border-gray-200 animate-in fade-in zoom-in duration-200">
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">Xirfadbare Support</p>
                <p className="text-xs text-gray-500">Typically replies instantly</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 text-sm text-gray-700 whitespace-pre-line">
              {greeting}
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-white font-medium hover:bg-emerald-600 transition"
            >
              Start Chat
            </a>
          </div>
        </div>
      )}

      {/* ✅ WhatsApp Floating Button with Pulse */}
      <div className="relative">
        {/* Pulse effect */}
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-50 animate-ping"></span>

        {/* Main button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative h-20 w-20 cursor-pointer rounded-full shadow-2xl grid place-items-center bg-emerald-500 hover:bg-emerald-600 transition"
          aria-label="WhatsApp chat"
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 32 32"
            fill="white"
            aria-hidden="true"
          >
            <path d="M19.1 17.3c-.3-.2-.7-.3-1 .2-.3.4-1 .9-1.2 1-.2.1-.4.1-.7 0-1.3-.6-2.2-1.2-3.1-2.4-.2-.3-.3-.6 0-.9.2-.2.4-.6.6-.9.2-.3.1-.6 0-.8l-1.2-2c-.3-.6-.6-.5-.9-.5h-.7c-.2 0-.6.1-.9.5-.9 1-1.3 2.2-1.3 3.6 0 1.4.6 2.7 1.6 3.9 1.7 1.9 4 3.1 6.4 3.4 1.4.2 2.7 0 3.9-.6.5-.3 1.1-.6 1.3-1.2.2-.6.2-1.1.1-1.3-.1-.2-.5-.3-1-.5z" />
            <path d="M27.1 4.9C24.5 2.3 21 1 17.5 1 9.8 1 3.5 7.3 3.5 15c0 2.4.6 4.7 1.9 6.8L3 30.9l9.3-2.3c2 .9 4.1 1.4 6.2 1.4C26.2 30 32 24.2 32 17.1c0-3.5-1.3-6.9-4.9-9.5zM18.5 28c-1.9 0-3.8-.5-5.6-1.3l-.4-.2-5.6 1.4 1.5-5.4-.2-.4C7.4 20.2 6.9 18 6.9 16 6.9 9.9 11.9 5 18 5c3 0 5.8 1.1 7.9 3.2C28 10.3 29 13.2 29 16.1 29 22.2 24 28 18.5 28z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
