import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, RefreshCw, X, Award, Brain, Clock } from 'lucide-react';

const LessonQuizModal = ({ isOpen, onClose, lesson, onComplete, closable = false }) => {
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [userAnswers, setUserAnswers] = useState([]);
    const [timeLeft, setTimeLeft] = useState((lesson.quizDuration || 10) * 60);
    const [isTimeUp, setIsTimeUp] = useState(false);

    React.useEffect(() => {
        if (!isOpen || showResults || isTimeUp) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    playEffect('timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, showResults, isTimeUp]);

    if (!isOpen || !lesson || !lesson.quizQuestions || lesson.quizQuestions.length === 0) return null;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleContinue = () => {
        onClose();
        if (onComplete) onComplete({
            score: score,
            totalQuestions: questions.length
        });
    };
    const questions = lesson.quizQuestions;
    const currentQuestion = questions[currentQuestionIdx];

    const handleAnswerSelect = (idx) => {
        if (isSubmitted) return;
        setSelectedAnswer(idx);
    };

    const playEffect = (type) => {
        const sounds = {
            correct: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
            wrong: "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3",
            timeout: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        };
        const audio = new Audio(sounds[type]);
        audio.volume = 0.5;
        audio.play().catch(err => console.log(`Audio ${type} play blocked:`, err));
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null || selectedAnswer === '') return;

        let isCorrect = false;
        if (currentQuestion.type === 'short-answer') {
            isCorrect = selectedAnswer.toString().toLowerCase().trim() === currentQuestion.correctAnswer.toString().toLowerCase().trim();
        } else {
            isCorrect = selectedAnswer == currentQuestion.correctAnswer;
        }

        if (isCorrect) setScore(score + 1);

        playEffect(isCorrect ? 'correct' : 'wrong');

        setUserAnswers([...userAnswers, { questionIdx: currentQuestionIdx, selected: selectedAnswer, correct: isCorrect }]);
        setIsSubmitted(true);
    };

    const handleNext = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
            setSelectedAnswer(null);
            setIsSubmitted(false);
        } else {
            setShowResults(true);
        }
    };

    const handleReset = () => {
        setCurrentQuestionIdx(0);
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setScore(0);
        setShowResults(false);
        setUserAnswers([]);
        setTimeLeft((lesson.quizDuration || 10) * 60);
        setIsTimeUp(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
            {/* Backdrop - Click to close disabled */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300 custom-scrollbar">

                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none" />

                <div className="p-6 sm:p-8">
                    {/* Top Bar - Close button removed */}
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">
                                    Lesson Quiz
                                </h3>
                                <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[150px]">
                                    {lesson.title}
                                </p>
                            </div>
                        </div>

                        {/* Timer & Close */}
                        <div className="flex items-center gap-3">
                            {!showResults && !isTimeUp && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${timeLeft < 30 ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-600 animate-pulse' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600'}`}>
                                    <Clock size={14} className={timeLeft < 30 ? 'animate-spin-slow' : ''} />
                                    <span className="text-[11px] font-black tabular-nums">{formatTime(timeLeft)}</span>
                                </div>
                            )}

                            {closable && (
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer border border-gray-100 dark:border-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {!showResults && !isTimeUp ? (
                        <div className="relative z-10">
                            {/* Progress bar */}
                            <div className="mb-6 mt-10">
                                <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5">
                                    <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
                                    <span>{Math.round(((currentQuestionIdx + 1) / questions.length) * 100)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Question */}
                            <div className="mb-8 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight break-all whitespace-pre-wrap overflow-hidden">
                                    {currentQuestion.question}
                                </h2>
                            </div>

                            {/* Options or Input: Grid layout for options, Input for short-answer */}
                            <div className="mb-6">
                                {currentQuestion.type === 'short-answer' ? (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={selectedAnswer === null ? '' : selectedAnswer}
                                            onChange={(e) => setSelectedAnswer(e.target.value)}
                                            disabled={isSubmitted}
                                            className={`w-full p-4 rounded-xl border-2 transition-all outline-none font-bold text-sm ${isSubmitted
                                                ? (selectedAnswer?.toString().toLowerCase().trim() === currentQuestion.correctAnswer?.toString().toLowerCase().trim()
                                                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                                    : 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400')
                                                : 'border-gray-100 dark:border-slate-800 focus:border-emerald-500 bg-gray-50/50 dark:bg-slate-800/30'
                                                }`}
                                            placeholder="Enter your answer here..."
                                        />
                                        {isSubmitted && selectedAnswer?.toString().toLowerCase().trim() !== currentQuestion.correctAnswer?.toString().toLowerCase().trim() && (
                                            <div className="p-3 bg-emerald-50/30 dark:bg-emerald-500/5 rounded-xl border border-emerald-100/50 dark:border-emerald-500/20">
                                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Correct Answer</p>
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{currentQuestion.correctAnswer}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {(currentQuestion.options || []).map((option, idx) => {
                                            const isCorrect = idx == currentQuestion.correctAnswer;
                                            const isSelected = selectedAnswer == idx;

                                            let variantClasses = "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 hover:border-emerald-500/50 cursor-pointer";
                                            if (isSubmitted) {
                                                if (isCorrect) variantClasses = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                                else if (isSelected) variantClasses = "bg-red-50 dark:bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
                                                else variantClasses = "bg-gray-50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-800 opacity-50";
                                            } else if (isSelected) {
                                                variantClasses = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleAnswerSelect(idx)}
                                                    disabled={isSubmitted}
                                                    className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left font-bold text-sm ${variantClasses}`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors text-[10px]
                                                        ${isSelected ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200 dark:border-slate-700'}
                                                    `}>
                                                        {isSubmitted && isCorrect ? <CheckCircle2 size={14} /> : isSubmitted && isSelected && !isCorrect ? <XCircle size={14} /> : <span>{String.fromCharCode(65 + idx)}</span>}
                                                    </div>
                                                    <span className="flex-1 leading-normal break-words">{option}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Feedback & Actions */}
                            <div className="mt-6">
                                {isSubmitted ? (
                                    <div className="flex flex-col gap-3">
                                        {currentQuestion.explanation && (
                                            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl border border-emerald-100/50 dark:border-emerald-500/10">
                                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Explanation</p>
                                                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{currentQuestion.explanation}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-100 dark:shadow-none active:scale-95 group"
                                        >
                                            {currentQuestionIdx === questions.length - 1 ? 'See Results' : 'Next Question'}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSubmitAnswer}
                                        disabled={selectedAnswer === null}
                                        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg active:scale-95 cursor-pointer"
                                    >
                                        Check Answer
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : isTimeUp ? (
                        <div className="flex flex-col items-center text-center relative z-10 py-6">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <Clock className="w-10 h-10 text-white animate-bounce" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Time's Up! ⏰
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8 max-w-[250px]">
                                You didn't complete the quiz in time. Please try again.
                            </p>

                            <button
                                onClick={handleReset}
                                className="w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-lg active:scale-95 cursor-pointer"
                            >
                                <RefreshCw size={14} />
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center relative z-10 py-2">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
                                    <Award className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                                Quiz Completed! 🎉
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-6">
                                You scored {score} out of {questions.length}
                            </p>

                            <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 w-full mb-6">
                                <div className="flex items-center justify-around">
                                    <div className="text-center">
                                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{Math.round((score / questions.length) * 100)}%</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Accuracy</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
                                    <div className="text-center">
                                        <p className="text-xl font-black text-gray-900 dark:text-white">{score}</p>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Correct</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-300 font-black text-[11px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                >
                                    <RefreshCw size={14} />
                                    Retake
                                </button>
                                <button
                                    onClick={handleContinue}
                                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-95 cursor-pointer"
                                >
                                    Continue
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonQuizModal;
