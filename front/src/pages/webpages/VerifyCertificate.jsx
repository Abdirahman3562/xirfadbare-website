import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, Award, Calendar, User, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const VerifyCertificate = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [certData, setCertData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const verify = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_BASE_URL}/progress/verify/${id}`);
                const data = await res.json();

                if (res.ok) {
                    setCertData(data);
                } else {
                    setError(data.message || 'Certificate not found');
                }
            } catch (err) {
                setError('Service unavailable. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        if (id) verify();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Verifying Certificate...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh]   flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-white/10 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-12 h-12 text-rose-500" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Invalid Certificate</h1>
                <p className="text-slate-500 dark:text-slate-400 max-w-md font-medium text-lg italic mb-10">
                    shahaadadan lama helin ama waa mid aan jirin.
                    Fadlan hubi ID-ga aad isticmaalayso.
                </p>
                <Link to="/" className="px-10 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-xl">
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white/10 dark:bg-slate-900 py-12 px-4 flex items-center justify-center font-[Inter]">
            <div className="max-w-4xl w-full">
                {/* Header Decoration */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-emerald-100 dark:border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" />
                        Official Verification
                    </div>
                    <h1 className="text-4xl font-black text-emerald-500  tracking-tight uppercase">Certificate Valid</h1>
                </div>

                {/* Main Card */}
                <div className="bg-white/10 border border-gray-900 dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />

                    <div className="p-8 sm:p-12 relative z-10">
                        {/* Status Icon */}
                        <div className="flex justify-center mb-10">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-6 transition-transform">
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                                <CheckCircle2 className="absolute -bottom-2 -right-2 w-8 h-8 text-emerald-500 bg-white dark:bg-slate-900 rounded-full p-1 shadow-lg" />
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-500/30 transition-colors">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <User className="w-3 h-3 text-emerald-500" />
                                    Student Name
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white capitalize leading-tight">
                                    {certData.studentName}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-500/30 transition-colors">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <BookOpen className="w-3 h-3 text-emerald-500" />
                                    Completed Course
                                </p>
                                <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                                    {certData.courseName}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-500/30 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-emerald-500" />
                                        Issue Date
                                    </p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                        {new Date(certData.completedAt).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-500/30 transition-colors">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        Certificate ID
                                    </p>
                                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                        {certData.certificateId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Message */}
                        <div className="mt-12 text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic mb-8">
                                This certificate was officially issued by **Xirfadbare Academy**.
                                It is confirmed that the student has successfully completed all required lessons and examinations.
                            </p>

                            <Link to="/courses" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all group">
                                Explore More Courses
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyCertificate;
