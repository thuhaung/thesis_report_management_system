import React from "react";
import axios from "axios";
import "./InstructorHomepage.scss";
import formatDate from "../../../helper/formatDate";
import { useEffect, useContext, useState } from "react";
import AuthContext from "../../../context/AuthContext";

const InstructorHomepage = () => {
    const [count, setCount] = useState(0);
    const [submissions, setSubmissions] = useState([]);
    const { user, deadline } = useContext(AuthContext);

    useEffect(() => {
        const data = {
            instructor_id: user.user_id
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "get-submissions", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            setCount(response.data.count);
            setSubmissions(response.data.submissions.reverse());
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return (
        <div className="instructor-homepage">
            <div className="header">
                <div className="title">
                    Student submissions
                </div>
                <div className="deadline">
                    Deadline: {formatDate(deadline)}
                </div>
            </div>
            <div className="main-section">
                <div className="info">
                    {count} {(count > 1 || count === 0) ? " submissions" : "submission"}
                </div>
                <div className="submissions">
                    {
                        submissions.map(submission => (
                            <a className="submission" key={submission.id} href={`/report/${submission.id}`}>
                                <div className="title">
                                    {submission.thesis_name}
                                </div>
                                <div className="author">
                                    {submission.full_name} - {submission.student_id}
                                </div>
                                <div className="submitted-time">
                                    {formatDate(submission.submitted_time)}
                                </div>
                            </a>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default InstructorHomepage;