import React, { useState, useEffect } from 'react';
import axios from '../axios';

const ValidateRoles = () => {
    const [submissions, setSubmissions] = useState([]);
    const [viewDetails, setViewDetails] = useState(null); // State to track which submission's details are being viewed

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/get_business_submissions");
                if (response.status === 200) {
                    setSubmissions(response.data);
                    console.log(response.data);
                } else {
                    console.error("Error fetching submissions:", response.data.message);
                }
            } catch (error) {
                console.error("Error fetching submissions:", error);
            }
        };

        fetchSubmissions();
    }, []);

    const assignRole = async (submissionId, submissionUserId, role) => {
        try {
            const response = await axios.post("http://localhost:5000/api/assign_role", {
                submission_id: submissionId,
                user_id: submissionUserId,
                role: role
            });
            if (response.status === 200) {
                console.log("Role assigned successfully");
                setSubmissions(submissions.filter(submission => submission.id !== submissionId));
                if (viewDetails === submissionId) {
                    setViewDetails(null); // Close details view if the submission was removed
                }
            } else {
                console.error("Error assigning role:", response.data.message);
            }
        } catch (error) {
            console.error("Error assigning role:", error);
        }
    };

    const toggleDetails = (submissionId) => {
        setViewDetails(viewDetails === submissionId ? null : submissionId);
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-100 py-8 w-full">
            <div className="w-full max-w-3xl p-6 border border-gray-300 bg-white rounded-lg shadow-lg">
                {submissions.length === 0 ? (
                    <div className="text-center text-gray-600 text-lg">No submissions at the moment.</div>
                ) : (
                    submissions.map((submission, index) => (
                        <div
                            key={index}
                            className="mb-4 p-4 flex flex-col justify-between items-start text-black text-lg font-bold rounded-lg border border-gray-300 shadow-sm bg-gray-50 hover:bg-gray-100 transition duration-300"
                        >
                            <div className="w-full flex justify-between items-center">
                                <span>{submission.business_name}</span>
                                <div className="flex space-x-4">
                                    <button
                                        className="bg-green-500 p-2 rounded-full hover:bg-green-600 transition duration-300 text-white"
                                        onClick={() => assignRole(submission.id, submission.user_id, submission.role)}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition duration-300 text-white"
                                    >
                                        ✗
                                    </button>
                                </div>
                            </div>
                            <button
                                className="mt-2 text-sm text-blue-500 hover:underline"
                                onClick={() => toggleDetails(submission.id)}
                            >
                                {viewDetails === submission.id ? 'Hide Details' : 'View More Details'}
                            </button>
                            {viewDetails === submission.id && (
                                <div className="mt-2 p-4 bg-gray-200 rounded-lg">
                                    <p><strong>Name:</strong> {submission.user_name}</p>                                  
                                    <p><strong>Contact:</strong> {submission.business_contact}</p>
                                    <p><strong>Address:</strong> {submission.business_address}</p>
                                    <p><strong>Role:</strong> {submission.role}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ValidateRoles;
