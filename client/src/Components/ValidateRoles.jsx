import React, { useState, useEffect } from 'react';
import axios from '../axios';


const ValidateRoles = () => {
    const [submissions, setSubmissions] = useState([]);
  
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
        } else {
          console.error("Error assigning role:", response.data.message);
        }
      } catch (error) {
        console.error("Error assigning role:", error);
      }
    };
  
    return (
      <div className="flex justify-center items-start min-h-screen bg-gray-100 p-8 w-full">
        <div className="w-full max-w-3xl p-8 border-4 border-gray-800 bg-white rounded-lg shadow-lg">
          {submissions.length === 0 ? (
            <div className="text-center text-gray-600">No submissions at the moment.</div>
          ) : (
            submissions.map((submission, index) => (
              <div
                key={index}
                className="mb-4 p-4 flex justify-between items-center text-black text-lg font-bold rounded-lg border-4 border-gray-800 shadow-md bg-white"
              >
                <span>{submission.business_name}</span>
                <div className="flex space-x-4">
                  <div
                    className="bg-green-500 p-2 rounded-full hover:bg-green-700 transition duration-300 cursor-pointer"
                    onClick={() => assignRole(submission.id, submission.user_id, submission.role)}
                  >
                    ✓
                  </div>
                  <div className="bg-red-500 p-2 rounded-full hover:bg-red-700 transition duration-300">
                    ✗
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  export default ValidateRoles;
  