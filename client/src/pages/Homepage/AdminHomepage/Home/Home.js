import "./Home.scss";
import axios from "axios";
import React from "react";
import { useContext, useState, useEffect } from "react";
import formatDate from "../../../../helper/formatDate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import AuthContext from "../../../../context/AuthContext";

const Home = () => {
    const { user, deadline } = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [warning, setWarning] = useState("");
    const [newDeadline, setNewDeadline] = useState();
    const [togglePicker, setTogglePicker] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const sendNotification = () => {
        if (!title) {
            setWarning("Please enter the title.");
        }
        else if (!content) {
            setWarning("Please enter the content.");
        }
        else {
            setWarning("");

            const data = {
                notification: {
                    title: title,
                    content: content
                }
            }

            axios.post(process.env.REACT_APP_BACKEND_HOST + "send-notification", data, {
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(response => {
                setTitle("");
                setContent("");
            }).catch(error => {
                console.log(error);
            });
        }
    }

    const closeSubmission = () => {
        const data = {
            new_deadline: new Date()
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "edit-deadline", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).catch(error => {
            console.log(error);
        });
    }

    const extendDeadline = () => {
        const data = {
            new_deadline: new Date(newDeadline)
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "edit-deadline", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            setNewDeadline();
            setTogglePicker(false);
        }).catch(error => {
            console.log(error);
        });
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_BACKEND_HOST + "get-all-notifications").then(response => {
            setNotifications(response.data.reverse());
        }).catch(error => {
            console.log(error);
        });
    }, [notifications]);

    return (
        <div className="home">
            <div className="notification-section sub-section">
                <div className="title">
                    Notification
                </div>
                <div className="form">
                    <div className="form-section">
                        <div className="form-label">
                            Title
                        </div>
                        <input 
                            className="form-input" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title of notification..." />
                    </div>
                    <div className="form-section">
                        <div className="form-label">
                            Content
                        </div>
                        <textarea 
                            className="form-input"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Content of notification..."></textarea>
                    </div>
                    <div className="warning">
                        {warning}
                    </div>
                    <div className="submit" onClick={sendNotification}>
                        Submit
                    </div>
                    <div className="notifications">
                        {
                            notifications.map(notification => (
                                <div className="item" key={notification.id}>
                                    <div className="title">
                                        {notification.title}
                                    </div>
                                    <div className="content">
                                        {notification.content}
                                    </div>
                                    <div className="submitted-time">
                                        {formatDate(notification.submitted_time)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="deadline-section sub-section">
                <div className="title">
                    Deadline
                </div>
                <div className="info">
                    <div className="info-section status">
                        Status: {new Date(deadline) > new Date() ? "Ongoing" : "Closed"}
                    </div>
                    <div className="info-section deadline">
                        Deadline: {formatDate(deadline)}
                    </div>
                </div>
                <div className={"picker " + (togglePicker ? "active" : "")}>
                    <DatePicker 
                        showTimeSelect 
                        showYearDropdown
                        scrollableYearDropdown
                        timeFormat="HH:mm"
                        timeIntervals={1}
                        dateFormat="hh:mmaa dd/MM/yyyy"
                        minDate={new Date()}
                        selected={newDeadline} 
                        onChange={date => setNewDeadline(date)} />
                    <div className="submit" onClick={extendDeadline}>
                        Submit
                    </div>
                    <div className="close" onClick={() => setTogglePicker(false)}>x</div>
                </div>
                <div className="buttons">
                    <div className="button extend-deadline" onClick={() => setTogglePicker(true)}>
                        Extend deadline
                    </div>
                    {
                        (new Date(deadline) > new Date()) &&
                        <div className="button close-submission" onClick={closeSubmission}>
                            Close submission
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default Home;