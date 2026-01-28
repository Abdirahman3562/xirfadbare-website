import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllInstructors } from "../../../api/instructorService";
import { getImageUrl } from "../../../utils/format";
import { FaChalkboardTeacher, FaStar } from "react-icons/fa";

const InstructorList = () => {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const data = await getAllInstructors();
                setInstructors(data || []);
            } catch (error) {
                console.error("Failed to fetch instructors", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructors();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center text-emerald-600">
                Loading instructors...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Our Expert Instructors
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Learn from industry professionals with real-world experience. Our instructors are dedicated to helping you master new skills.
                </p>
            </div>

            {instructors.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FaChalkboardTeacher className="mx-auto text-4xl text-gray-300 mb-4" />
                    <p className="text-gray-500">No instructors found at the moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {instructors.map((instructor) => (
                        <div
                            key={instructor._id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 overflow-hidden"
                        >
                            <div className="relative h-48 bg-gray-100">
                                <img
                                    src={getImageUrl(instructor.image)}
                                    alt={instructor.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    {instructor.name}
                                </h3>
                                <p className="text-sm text-emerald-600 font-medium mb-3">
                                    {instructor.instructorTitle || "Instructor"}
                                </p>
                                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <FaStar className="text-yellow-400 mr-1" />
                                        <span>
                                            {instructor.averageRating ? instructor.averageRating.toFixed(1) : "N/A"}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/instructor/${instructor.slug}`}
                                        className="text-emerald-500 hover:text-emerald-700 font-medium"
                                    >
                                        View Profile →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InstructorList;
