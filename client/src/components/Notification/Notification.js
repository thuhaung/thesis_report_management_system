import "./Notification.scss";
import React from "react";
import axios from "axios";
import notification from "../../asset/notification.png";
import AuthContext from "../../context/AuthContext";
import { useContext, useState, useEffect } from "react";

const Notification = () => {
    const { user } = useContext(AuthContext);
    const [toggleNotification, setToggleNotification] = useState(false);
    const [newNotification, setNewNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const viewNotifications = () => {
        if (toggleNotification && notifications.length > 0) {
            for (let i = 0; i < notifications.length; i++) {
                const data = {
                    notification_change: {
                        user_id: user.user_id,
                        notification_id: notifications[i].id
                    }
                }

                axios.post(process.env.REACT_APP_BACKEND_HOST + "view-notification", data, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(response => {
                    setNewNotification(false);
                    setNotifications([]);
                    setToggleNotification(prev => !prev)
                }).catch(error => {
                    console.log(error);
                });
            }
        }
        else {
            setToggleNotification(prev => !prev)
        }
    }

    useEffect(() => {
        const data = {
            user_id: user.user_id
        }

        axios.post(process.env.REACT_APP_BACKEND_HOST + "get-new-notifications", data, {
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (response.data.new_notifications.length > 0) {
                setNewNotification(true);
                setNotifications(response.data.new_notifications);
            }
        }).catch(error => {
            console.log(error);
        });
    }, [user]);

    return (
        <div className="notification">
            <div className={"notification-list " + (toggleNotification && newNotification ? "active" : "")}>
                <div className="close">x</div>
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
                                {notification.submitted_time}
                            </div>
                        </div>
                    ))
                }
            </div>
            <div 
                className={"notification-icon " + (newNotification ? "active" : "")}
                onClick={viewNotifications}>
                <img
                    className="icon"
                    src={notification}
                    alt="Notification" />
            </div>
        </div>
    );
}

export default Notification;