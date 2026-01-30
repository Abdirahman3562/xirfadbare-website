import React, { useState, useEffect } from "react";
import { Award, Download, Loader2, Search, Medal, Star, CheckCircle, ArrowRight } from "lucide-react";
import { getAllUserProgress } from "../../../api/userProgressService";
import { getAllCourses } from "../../../api/courseService";
import { getTemplateById } from "../../../api/certificateService";
import { generateCertificate } from "../../../utils/pdfGenerator";
import { toast } from "react-toastify";

export default function Certificates() {
    const [completedCourses, setCompletedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [generating, setGenerating] = useState(false);
    const [userData, setUserData] = useState(null);
    const [systemSettings, setSystemSettings] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("loggedInUser")) ||
            JSON.parse(localStorage.getItem("user"));
        setUserData(user);
        fetchData();
        fetchSystemSettings();
    }, []);

    const fetchSystemSettings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/settings');
            const data = await res.json();
            setSystemSettings(data);
        } catch (error) {
            console.error('Error fetching system settings:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [progressData, allCourses] = await Promise.all([
                getAllUserProgress(),
                getAllCourses()
            ]);

            // Filter courses that are 100% complete
            const completed = progressData
                .filter(p => p.progress === 100)
                .map(p => {
                    // In UserProgress model, the field is 'course', not 'courseId'
                    const courseId = p.course?._id || p.course;
                    const courseInfo = allCourses.find(c => c._id === courseId);
                    return courseInfo ? {
                        ...courseInfo,
                        completedAt: p.completedAt || p.updatedAt,
                        certId: p.certificateId // Use the ID from the database
                    } : null;
                })
                .filter(c => c !== null);

            setCompletedCourses(completed);
        } catch (error) {
            console.error("Error fetching certificates data:", error);
            toast.error("Waan ka xunnahay, khalad ayaa dhacay markii la soo rarayay xogta.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedCourse) {
            toast.warning("Fadlan dooro course-ka aad rabto inaad shahaadadiisa soo degsato.");
            return;
        }

        const course = completedCourses.find(c => c._id === selectedCourse);
        if (!course || !course.hasCertificate || !course.certificateTemplate) {
            toast.error("Course-kan ma laha shahaado diyaar ah.");
            return;
        }

        try {
            setGenerating(true);
            const template = await getTemplateById(course.certificateTemplate);

            if (!template) {
                throw new Error("Template not found");
            }

            if (!template.isActive) {
                toast.info("Shahaadada hadda diyaar ma ahan. Fadlan la xiriir maamulka.");
                return;
            }

            // Get full name from firstName and lastName and format it nicely
            const rawName = (userData?.firstName && userData?.lastName)
                ? `${userData.firstName} ${userData.lastName}`
                : (userData?.name || "Student Name");

            const fullName = rawName
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            // Use the ID from progress record
            const certId = course.certId || `CERT-2026-001`;

            const data = {
                studentName: fullName,
                courseName: course.title,
                completionDate: new Date(course.completedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }),
                instructorName: course.instructor?.name || "Xirfadbare Academy",
                certificateId: certId,
                systemLogo: systemSettings?.logo ? (systemSettings.logo.startsWith('http') ? systemSettings.logo : `http://localhost:5000${systemSettings.logo}`) : null
            };

            await generateCertificate(template, data, `${course.title}_Certificate.pdf`);
            toast.success("Shahaadadaada si guul leh ayaa loo soo saaray!");
        } catch (error) {
            console.error("Error generating certificate:", error);
            toast.error("Khaald ayaa dhacay markii la soo saarayay shahaadada.");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold animate-pulse">Soo raraya shahaadooyinkaaga...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-10 text-center sm:text-left relative overflow-hidden bg-white/10 border border-gray-300 dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 border border-gray-100 dark:border-slate-800 shadow-xl shadow-emerald-500/5 transition-colors">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl mb-6 shadow-lg shadow-emerald-100 dark:shadow-none transition-transform hover:rotate-6">
                        <Medal className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-tight">
                        Shahaadooyinkaaga <br className="hidden sm:block" />
                        <span className="text-emerald-600 dark:text-emerald-400">Guusha & Kobaca</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                        Hambalyo! Halkan waa meesha aad ka helayso shahaadooyinka course-yadii aad si guusha leh u dhammaysay.
                        Xirfaddaadu waa mustaqbalkaaga.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Selector Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white/10 border border-gray-300 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-lg shadow-gray-200/50 dark:shadow-none transition-colors lg:sticky lg:top-24">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-gray-900 dark:text-white text-lg">Dooro Course</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-1">
                                    Course-ka aad dhammaysay
                                </label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="w-full bg-white/10 border border-gray-300 dark:bg-slate-800 border-2 border-gray-300 focus:border-emerald-500/20 rounded-2xl px-5 py-4 text-gray-700 dark:text-gray-300 font-bold focus:outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">-- Dooro Course --</option>
                                    {completedCourses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || !selectedCourse}
                                className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 dark:disabled:bg-slate-800 disabled:text-gray-400 text-white font-black text-sm uppercase tracking-widest px-8 py-5 rounded-2xl transition-all shadow-xl shadow-emerald-100 dark:shadow-none hover:-translate-y-1 active:scale-95 group"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                        Get Certificate
                                    </>
                                )}
                            </button>

                            {!completedCourses.length && (
                                <p className="text-center text-red-500 dark:text-red-400 text-sm font-bold mt-4 animate-bounce">
                                    Weli ma jiro course aad dhamaystirtay.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Display/Placeholder Section */}
                <div className="lg:col-span-2">
                    {selectedCourse ? (
                        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-lg shadow-gray-200/50 dark:shadow-none flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
                            <div className="relative mb-10 group">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
                                <div className="relative w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-200 dark:shadow-none rotate-3">
                                    <Award className="w-16 h-16 text-white" />
                                </div>
                                <Star className="absolute -top-4 -right-4 w-10 h-10 text-yellow-400 fill-yellow-400 animate-pulse" />
                                <CheckCircle className="absolute -bottom-2 -left-2 w-10 h-10 text-emerald-500 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-xl" />
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight leading-snug max-w-md">
                                {completedCourses.find(c => c._id === selectedCourse)?.title}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-10 text-base sm:text-lg">
                                Shahaadadaadu waa mid caalami ah, waxaadna u isticmaali kartaa markhaati ahaan aqoontaada iyo xirfadaada.
                            </p>

                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 transition-colors">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Student</p>
                                    <p className="text-gray-900 dark:text-white font-bold">
                                        {(() => {
                                            const rawName = (userData?.firstName && userData?.lastName)
                                                ? `${userData.firstName} ${userData.lastName}`
                                                : (userData?.name || "Student Name");
                                            return rawName.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                        })()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-gray-100 dark:border-slate-800 transition-colors">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Cert ID</p>
                                    <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                                        {completedCourses.find(c => c._id === selectedCourse)?.certId || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/10 dark:bg-slate-800/30 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center transition-colors">
                            <div className="w-24 h-24 bg-white/10 dark:bg-slate-900 rounded-3xl flex items-center justify-center shadow-sm mb-8 text-gray-300 dark:text-slate-700">
                                <Medal className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-400 dark:text-slate-700 mb-2">Ma jiro Course la doortay</h3>
                            <p className="text-gray-400 dark:text-slate-700 max-w-xs font-medium italic">
                                Fadlan ka dooro course-yada aad dhammaysay dhinaca bidix si aad u aragto ama u soo degsato shahaadadaada.
                            </p>
                        </div>
                    )}

                    {/* Fun Achievement/Motivation Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-8 rounded-[2rem] text-white shadow-xl shadow-emerald-500/10 hover:-translate-y-1 transition-all group">
                            <Medal className="w-10 h-10 mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="font-black text-xl mb-2">Baro & Guulayso</h4>
                            <p className="text-emerald-50 text-sm font-medium leading-relaxed opacity-90">Kobar aqoontaada si aad u noqoto qof ku tartama suuqa xirfadaha casriga ah.</p>
                        </div>
                        <div className="bg-white/10 border border-gray-300 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-8 rounded-[2rem] shadow-lg shadow-gray-200/50 dark:shadow-none hover:-translate-y-1 transition-all group transition-colors">
                            <Medal className="w-10 h-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="font-black text-xl text-gray-900 dark:text-white mb-2">Mustaqbal Iftaya</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed opacity-90">Xirfad walba oo aad barato waxay kuu furaysaa albaab cusub oo guul ah.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

