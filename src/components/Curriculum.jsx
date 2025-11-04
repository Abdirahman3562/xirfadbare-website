// src/components/Curriculum.jsx
import React, { useMemo, useState } from "react";
import {
  Clock3,
  PlaySquare,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

function formatTotalDuration(lessons) {
  // expects lessons with duration in "mm:ss" or "hh:mm:ss"
  let totalSeconds = 0;
  for (const l of lessons) {
    if (!l.duration) continue;
    const parts = l.duration.split(":").map(Number);
    let sec = 0;
    if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) sec = parts[0] * 60 + parts[1];
    totalSeconds += sec;
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Curriculum({ curriculum = [], level = "Beginner" }) {
  const [open, setOpen] = useState(() => new Set([0])); // first open by default

  const { totalLessons, totalDuration } = useMemo(() => {
    const lessons = curriculum.flatMap((s) => s.lessons || []);
    return {
      totalLessons: lessons.length,
      totalDuration: formatTotalDuration(lessons),
    };
  }, [curriculum]);

  const expandAll = () => setOpen(new Set(curriculum.map((_, i) => i)));
  const collapseAll = () => setOpen(new Set());

  const toggle = (i) => {
    const next = new Set(open);
    next.has(i) ? next.delete(i) : next.add(i);
    setOpen(next);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Top stats */}
      <div className="grid sm:grid-cols-3 gap-4 p-4 sm:p-6 border-b">
        <Stat icon={<Clock3 />} label="Total Duration" value={totalDuration} />
        <Stat icon={<PlaySquare />} label="Video Lessons" value={totalLessons} />
        <Stat icon={<TrendingUp />} label="Skill Level" value={level} />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        <h3 className="text-lg sm:text-xl font-bold">
          Course Curriculum ({curriculum.length} {curriculum.length === 1 ? "Section" : "Sections"})
        </h3>
        <div className="hidden sm:flex gap-3 text-sm">
          <button onClick={expandAll} className="px-3 py-1.5 rounded-full border hover:bg-gray-50">
            Expand All
          </button>
          <button onClick={collapseAll} className="px-3 py-1.5 rounded-full border hover:bg-gray-50">
            Collapse All
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="divide-y">
        {curriculum.map((section, i) => {
          const isOpen = open.has(i);
          const sectionDuration = formatTotalDuration(section.lessons || []);
          const lessonsCount = section.lessons?.length || 0;

          return (
            <div key={i} className="px-4 sm:px-6">
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-4 py-4 text-left"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 grid place-content-center font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{section.title}</p>
                  <p className="text-sm text-gray-500">
                    {lessonsCount} {lessonsCount === 1 ? "lesson" : "lessons"} • {sectionDuration}
                  </p>
                </div>
                {isOpen ? <ChevronUp className="text-emerald-600" /> : <ChevronDown className="text-emerald-600" />}
              </button>

              {isOpen && (
                <ul className="pb-4">
                  {(section.lessons || []).map((l, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between gap-4 rounded-xl border p-3 mb-2 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 text-gray-400">
                          <Lock size={16} />
                        </span>
                        <p className="truncate">{l.title}</p>
                      </div>
                      <span className="text-sm text-gray-500 shrink-0">{l.duration}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border p-4">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 grid place-content-center">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-xl font-extrabold">{value}</p>
      </div>
    </div>
  );
}
