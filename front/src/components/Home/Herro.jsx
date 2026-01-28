import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../../contexts/DataContext";

export default function Hero({
  title: propTitle,
  subtitle: propSubtitle,
  primaryCta = { label: "Explore Courses", to: "/courses" },
  secondaryCta = { label: "How it works", to: "#how-it-works" },
}) {
  const { settings } = useData();

  const title = propTitle || (
    settings?.hero?.title ? (
      <>{settings.hero.title}</>
    ) : (
      <>
        Become a <span className="text-[#00cc8f]">Full-Stack</span> Engineer
        <br className="hidden md:block" /> the <span className="text-[#00cc8f]">smart way</span>
      </>
    )
  );

  const subtitle = propSubtitle || settings?.hero?.subtitle || "Hands-on projects, mentor feedback, and job-ready skills.";
  return (
    <section className="relative  overflow-hidden pt-36  sm:pt-36">


      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-5 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {primaryCta && primaryCta.to && (
            <Link
              to={primaryCta.to}
              className="inline-block bg-[#00cc8f] text-white font-semibold px-8 py-3 rounded-full shadow-md hover:-translate-y-1 hover:shadow-xl transition"
            >
              {primaryCta.label}
            </Link>
          )}

          {secondaryCta && secondaryCta.to && (
            // for hash links inside page we can keep <a>, but Link works too
            secondaryCta.to.startsWith("#") ? (
              <a
                href={secondaryCta.to}
                className="inline-block border border-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition"
              >
                {secondaryCta.label}
              </a>
            ) : (
              <Link
                to={secondaryCta.to}
                className="inline-block border border-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition"
              >
                {secondaryCta.label}
              </Link>
            )
          )}
        </div>
      </div>
    </section>
  );
}
