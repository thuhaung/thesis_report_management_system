import React from "react";
import axios from "axios";
import "./StudentHomepage.scss";
import formatDate from "../../../helper/formatDate.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import AuthContext from "../../../context/AuthContext.js";

const StudentHomepage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { resubmit } = location?.state ?? false;
    const { user, deadline } = useContext(AuthContext);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [advisor, setAdvisor] = useState("");
    const [thesisTitle, setThesisTitle] = useState("");
    const [file, setFile] = useState();
    const [warning, setWarning] = useState("");
    const [newestSubmission, setNewestSubmission] = useState();
    const passDeadline = new Date(deadline) < new Date();

    const selectFile = (e) => {
        setFile(e.target.files[0]);
    }

    const submit = () => {
        if (!thesisTitle) { 
            setWarning("Please enter the title of your thesis");
        }
        else if (!file) {
            setWarning("No thesis document selected.");
        }
        else {
            setWarning("");
            
            const data = {
                student_id: user.user_id,
                thesis_name: thesisTitle,
                file: file
            }
            axios.post(process.env.REACT_APP_BACKEND_HOST + "upload-thesis", data, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }).then(response => {
                navigate(`/report/${response.data}`);
            }).catch(error => {
                console.log(error);
            });
        }
    }

    const submitAgain = () => {
        setHasSubmitted(false);
    }

    useEffect(() => {
        if (!resubmit) {
            const data = {
                student_id: user.user_id
            }
    
            axios.post(process.env.REACT_APP_BACKEND_HOST + "get-student-info", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                setHasSubmitted(response.data.has_submitted);
            }).catch(error => {
                console.log(error);
            });
        }
    }, []);

    useEffect(() => {
        if (hasSubmitted) {
            const data = {
                student_id: user.user_id
            }
            axios.post(process.env.REACT_APP_BACKEND_HOST + "get-all-submissions", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                setNewestSubmission(response.data[response.data.length - 1].id);
            }).catch(error => {
                console.log(error);
            });
        }
    }, [hasSubmitted]);

    useEffect(() => {
        const data = {
            student_id: user.user_id
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "get-instructor", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            setAdvisor(response.data.instructor_name);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return (
        <div className="student-homepage">
            <div className="header">
                <div className="title">
                    Thesis Submission
                </div>
                {
                    passDeadline ?
                    <div className="text">
                        Submission is closed
                    </div>
                    :
                    <div>
                        <div className="deadline">
                            Deadline: {formatDate(deadline)}
                        </div>
                        <div className="guide">
                            Submit your thesis document before the deadline. 
                            Receive reports on various aspects and improve
                            your work.
                        </div>
                    </div>
                }
                
            </div>
            {
                hasSubmitted ?
                <div className="submitted">
                    <a className="button view-report" href={`/report/${newestSubmission}`}>
                        View report
                    </a>
                    {
                        !passDeadline &&
                        <div className="button submit" onClick={submitAgain}>
                            Submit again
                        </div>
                    }
                </div>
                :
                passDeadline ?
                <div className="not-submitted">
                    You have no submissions
                </div>
                :
                <div className="form">
                    <div className="form-section">
                        <div className="form-label">
                            Thesis title
                        </div>
                        <input 
                            className="form-input"
                            onChange={(e) => setThesisTitle(e.target.value)} 
                            placeholder="Enter the title of your thesis" />
                    </div>
                    <div className="form-section">
                        <div className="form-label">
                            Advisor
                        </div>
                        <div className="form-input">
                            {advisor}
                        </div>
                    </div>
                    <div className="form-section">
                        <div className="form-label">
                            File
                        </div>
                        <input 
                            className="form-input" 
                            onChange={(e) => selectFile(e)}
                            type="file" 
                            accept="application/pdf" />
                    </div>
                    <div className="warning">
                        {warning}
                    </div>
                    <div className="submit" onClick={submit}>
                        Submit
                    </div>
                </div>
            }
        </div>
    );
}

export default StudentHomepage;