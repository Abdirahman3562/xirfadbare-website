import React from 'react';
import { Trophy, CheckCircle, ArrowRight, X, Star, Award } from 'lucide-react';

const CompletionModal = ({ isOpen, onClose, courseTitle, onClaimCertificate, hasCertificate }) => {
    React.useEffect(() => {
        if (isOpen) {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(err => console.log("Congratulation sound blocked:", err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-emerald-500/10 overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">

                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors z-10 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                    {/* Trophy Icon with Animation */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-none transform rotate-3">
                            <Trophy className="w-12 h-12 text-white" />
                        </div>
                        {/* Small floating stars */}
                        <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 fill-yellow-400 animate-bounce" />
                        <CheckCircle className="absolute -bottom-2 -left-2 w-8 h-8 text-emerald-500 bg-white rounded-full p-1 shadow-lg" />
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                        Congratulations! 🎉
                    </h2>

                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                        You have successfully completed the course <br />
                        <span className="font-black text-emerald-600 dark:text-emerald-400 break-all">"{courseTitle}"</span>
                    </p>

                    <div className="space-y-4 w-full">
                        <button
                            onClick={onClaimCertificate}
                            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-widest px-8 py-5 rounded-2xl transition-all shadow-xl shadow-emerald-100 dark:shadow-none hover:-translate-y-1 active:scale-95 group cursor-pointer"
                        >
                            <Award className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            Get certificate
                            <ArrowRight className="w-4 h-4" />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompletionModal;
