import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, MapPinOff } from 'lucide-react';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 font-[Outfit] relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>

            <div className="max-w-3xl w-full text-center space-y-8 relative z-10">

                {/* Main 404 Area */}
                <div className="relative">
                    <h1 className="text-[180px] sm:text-[250px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gray-200 to-white dark:from-slate-800 dark:to-slate-900 select-none drop-shadow-sm">
                        404
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-in zoom-in duration-700">
                            <MapPinOff size={48} className="text-white" />
                        </div>
                        <div className="bg-white/10 border border-gray-300 dark:bg-slate-800/50 backdrop-blur-md px-8 py-3 rounded-2xl shadow-xl animate-in slide-in-from-bottom-5 duration-700 delay-150">
                            <span className="text-xl sm:text-2xl font-black uppercase tracking-widest text-gray-900 dark:text-white">
                                Boggan Lama Helin!
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-6 max-w-lg mx-auto px-4">
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium leading-relaxed">
                        Waan ka xunnahay, laakiin bogga aad isku dayayso inaad gasho ma jiro ama waa la tirtiray. Fadlan isku day inaad dib u noqoto.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 border border-gray-300 dark:bg-slate-800/50 backdrop-blur-md text-gray-700 dark:text-gray-300 font-bold text-sm uppercase tracking-wider hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                        >
                            <ArrowLeft size={18} />
                            Dib u noqo
                        </button>

                        <Link
                            to="/"
                            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Home size={18} />
                            Bogga Hore
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
