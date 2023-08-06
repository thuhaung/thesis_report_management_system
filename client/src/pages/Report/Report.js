import "./Report.scss";
import axios from "axios";
import React from "react";

import Pass from "../../asset/pass.png";
import Fail from "../../asset/fail.png";
import Error from "../../asset/error.png";

import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";
import formatDate from "../../helper/formatDate";
import NavBar from "../../components/NavBar/NavBar";
import getServices from "../../helper/getServices";
import AuthContext from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import PageCount from "./PageCount/PageCount";
import WordFrequency from "./WordFrequency/WordFrequency";
import ChapterSummarization from "./ChapterSummarization/ChapterSummarization";

const Report = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const services = getServices();
    const [feedback, setFeedback] = useState([]);
    const [previousReports, setPreviousReports] = useState([]);
    const [reportContent, setReportContent] = useState("Loading...");
    const [reportReady, setReportReady] = useState(false);
    const [serviceResults, setServiceResults] = useState([]);
    const [feedbackContent, setFeedbackContent] = useState();
    const [warning, setWarning] = useState("");
    const [thesis, setThesis] = useState({
        thesis_name: "",
        full_name: "",
        student_id: "",
        submitted_time: ""
    });
    const { user, deadline } = useContext(AuthContext);

    const getServiceStatus = (serviceId) => {
        const service = serviceResults.filter(service => service.service_type === serviceId)[0];
        const serviceStatus = service?.service_status;
        const result = service?.result ?? "";

        if (serviceStatus === "Processing") {
            return <Spinner />
        }
        else {
            if (result === "Pass") {
                return <img src={Pass} alt="Service passed" />
            }
            else if (result === "Fail") {
                return <img src={Fail} style={{"width": "20px", "height": "20px"}} alt="Service failed" />
            }
            else if (result === "Service error") {
                return <img src={Error} style={{"width": "30px", "height": "30px"}} alt="Service error" />
            }
            else if (result === "None") {
                return ""
            }
        }

        return "";
    }

    const selectService = (serviceId) => {
        const service = serviceResults.filter(service => service.service_type === id)[0];
        
        if (service?.service_status !== "Processing") {
            const data = {
                thesis_id: id,
                report_type: serviceId
            }

            axios.post(process.env.REACT_APP_BACKEND_HOST + "get-report", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                if (typeof(response.data.text) !== "string") {
                    switch(serviceId) {
                        case "page_count":
                            setReportContent(<PageCount content={response.data.text} />);
                            break;
                        case "word_frequency":
                            setReportContent(<WordFrequency content={response.data.text} />);
                            break;
                        case "chapter_summarization":
                            setReportContent(<ChapterSummarization content={response.data.text} />);
                            break;
                        default:
                            break;
                    }
                }
                else {
                    setReportContent(response.data.text);
                }
            }).catch(error => {
                console.log(error);
            });
        }
    }

    const reSubmit = () => {
        navigate("/", {state: {resubmit: true}});
    }

    const downloadFile = () => {
        const data = {
            thesis_id: id
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "download-file", data, {
            headers: {
                "Content-Type": "application/json",
            },
            responseType: "blob"
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');

            link.href = url;
            link.setAttribute("download", id + ".pdf");
            document.body.appendChild(link);

            link.click();
        }).catch(error => {
            console.log(error);
        });
    }

    const downloadReport = () => {
        const data = {
            thesis_id: id,
            report_type: "full"
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "get-report", data, {
            headers: {
                "Content-Type": "application/json",
            },
            responseType: "blob"
        }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');

            link.href = url;
            link.setAttribute("download", "report.pdf");
            document.body.appendChild(link);

            link.click();
        }).catch(error => {
            console.log(error);
        });
    }

    const submitFeedback = () => {
        if (!feedbackContent) {
            setWarning("Please enter your feedback.");
        }
        else {
            setWarning("");

            const data = {
                thesis_id: id,
                content: feedbackContent
            }

            axios.post(process.env.REACT_APP_BACKEND_HOST + "give-feedback", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                setFeedbackContent("");
            }).catch(error => {
                console.log(error);
            });
        }
    }

    useEffect(() => {
        const data = {
            thesis_id: id
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "get-feedback", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            setFeedback(response.data.reverse());
        }).catch(error => {
            console.log(error);
        });
    }, [feedback]);

    useEffect(() => {
        const data = {
            thesis_id: id
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "get-thesis-info", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            setThesis(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    useEffect(() => {
        if (thesis.student_id) {
            const data = {
                student_id: thesis.student_id
            }
    
            axios.post(process.env.REACT_APP_BACKEND_HOST + "get-all-submissions", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                let submissions = response.data.reverse();
                submissions = submissions.filter(submission => submission.id !== id);
    
                setPreviousReports(submissions);
            }).catch(error => {
                console.log(error);
            });
        }
    }, [thesis]);

    useEffect(() => {
        const data = {
            thesis_id: id
        }

        let interval;

        interval = setInterval(() => {
            axios.post(process.env.REACT_APP_BACKEND_HOST + "poll-report", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                setServiceResults(response.data.services);
                
                if (response.data.finished) {
                    setReportReady(true);
                    if (reportContent === "Loading...") {
                        setReportContent("Report finished");
                    }
                    clearInterval(interval);
                }
            }).catch(error => {
                console.log(error);
            });
        }, 1000);
    }, []);

    return (
        <div className="report">
            <div className="header">
                <div className="title">
                    {thesis.thesis_name}
                </div>
                <div className="author">
                    {thesis.full_name} - {thesis.student_id}
                </div>
                <div className="submitted-time">
                    Submitted at: {formatDate(thesis.submitted_time)}
                </div>
            </div>
            <div className="buttons">
                <div className="button" onClick={downloadFile}>
                    Download file
                </div>
                {
                    reportReady && 
                    <div className="button" onClick={downloadReport}>
                        Download report
                    </div>
                }
                <a className="button" href="/guidelines">
                    Guidelines
                </a>
                {
                    user.user_type === "Student" && (new Date(deadline) > new Date()) &&
                    <div className="button" onClick={reSubmit}>
                        Resubmit
                    </div>
                }
            </div>
            <div className="main-section">
                <div className="service-sections">
                    <div className="service-section">
                        <div className="title">
                            Template-based
                        </div>
                        <div className="services">
                            {
                                services.filter(service => service.type === "template-based")
                                        .map(service => (
                                        <div 
                                            className="service"
                                            key={service.id}
                                            onClick={() => selectService(service.id)}>
                                            <div className="name">
                                                {service.name}
                                            </div>
                                            <div className="status">
                                                {getServiceStatus(service.id)}
                                            </div>
                                        </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="service-section">
                        <div className="title">
                            Analytical
                        </div>
                        <div className="services">
                            {
                                services.filter(service => service.type === "analytical")
                                        .map(service => (
                                        <div 
                                            className="service"
                                            key={service.id}
                                            onClick={() => selectService(service.id)}>
                                            <div className="name">
                                                {service.name}
                                            </div>
                                            <div className="status">
                                                {getServiceStatus(service.id)}
                                            </div>
                                        </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className="content">
                    {reportContent}
                </div>
            </div>
            {
                (feedback.length > 0 || user.user_type === "Instructor") &&
                <div className="feedback">
                    <div className="title">
                        Advisor feedback
                    </div>
                    {
                        user.user_type === "Instructor" &&
                        <div className="feedback-form">
                            <textarea 
                                className="form-input" 
                                value={feedbackContent}
                                onChange={(e) => setFeedbackContent(e.target.value)}
                                placeholder="Enter your feedback">
                            </textarea>
                            <div className="warning">
                                {warning}
                            </div>
                            <div className="submit" onClick={submitFeedback}>
                                Submit
                            </div>
                        </div>
                    }
                    <div className="comments">
                        {
                            feedback.map(comment => (
                                <div className="comment" key={comment.id}>
                                    <div className="content">
                                        {comment.content}
                                    </div>    
                                    <div className="submitted-time">
                                        {formatDate(comment.submitted_time)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            }
            {
                previousReports.length > 0 &&
                <div className="previous-reports">
                    <div className="title">
                        Previous submissions
                    </div>
                    <div className="reports">
                        {previousReports.map(report => (
                            <a className="report" key={report.id} href={`/report/${report.id}`}>
                                <div className="name">
                                    {report.thesis_name}
                                </div>
                                <div className="submitted-time">
                                    {formatDate(report.submitted_time)}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            }
        </div>
    );
}

export default Report;