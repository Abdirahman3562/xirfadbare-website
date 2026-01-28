import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("Verifying your email address...");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link. Please check your email and try again.");
            return;
        }

        // Simulate API call to verify email
        const verifyToken = async () => {
            try {
                // await api.verifyEmail(token);
                setTimeout(() => {
                    setStatus("success");
                    setMessage("Your email has been successfully verified!");
                }, 1500);
            } catch (error) {
                setStatus("error");
                setMessage("Verification failed. The link may have expired.");
            }
        };

        verifyToken();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                {status === "verifying" && (
                    <div className="flex flex-col items-center">
                        <FiLoader className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying...</h1>
                        <p className="text-gray-600">{message}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <FiCheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/auth/login"
                            className="px-6 py-2.5 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition w-full"
                        >
                            Continue to Login
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            to="/auth/login"
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
