import "./Login.scss";
import axios from "axios";
import React from "react";
import { useEffect, useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState();
    const [password, setPassword] = useState();
    const [warning, setWarning] = useState();
    const { user, login } = useContext(AuthContext);
    
    const submit = (e) => {
        if (!userId) {
            setWarning("Please enter your user ID");
        }
        else if (!password) {
            setWarning("Please enter your password");
        }
        else {
            setWarning("");
            const data = {
                user_id: userId.toUpperCase(),
                password: password
            }

            axios.post(process.env.REACT_APP_BACKEND_HOST + "login", data, {
                headers: {
                    "Content_Type": "application/json"
                }
            }).then(response => {
                if (response.status === 200) {
                    login(userId.toUpperCase(), response.data.user_type);
                    navigate("/");
                }
            }).catch(error => {
                setWarning("Incorrect user ID or password.");
            });
        }
    }

    useEffect(() => {
        if (user.user_id !== null) {
            navigate("/");
        }
    }, [user]);

    return (
        <div className="login">
            <div className="hero">
                <img
                    className="logo"
                    src="https://blackboard.hcmiu.edu.vn/themes/test/images/iu_logo.png"
                    alt="International University logo" />
                <div className="name">
                    International University
                </div>
            </div>
            <div className="title">
                Thesis Management Platform
            </div>
            <div className="login-form">
                <div className="form-section">
                    <div className="form-label">
                        User ID
                    </div>
                    <input 
                        className="form-input" 
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter your user ID" />
                </div>
                <div className="form-section">
                    <div className="form-label">
                        Password
                    </div>
                    <input 
                        className="form-input" 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password" />
                </div>
                <div className="warning">
                    {warning}
                </div>
                <div className="submit" onClick={(e) => submit(e)}>
                    Submit
                </div>
            </div>
        </div>
    );
}

export default Login;