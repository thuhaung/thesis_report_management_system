import "./Guidelines.scss";
import React from "react";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import { getName } from "../../helper/getServices";
import { useState, useEffect } from "react";

const Guidelines = () => {
    const categories = ["chapter_title", "page_count", "format_check"];
    const [activeCategory, setActiveCategory] = useState();
    const [guidelines, setGuidelines] = useState([]);
    const [content, setContent] = useState("Select a category to view the guideline.");

    useEffect(() => {
        axios.get(process.env.REACT_APP_BACKEND_HOST + "get-guidelines").then(response => {
            setGuidelines(response.data);
        }).catch(error => {
            console.log(error);
        });
    }, []);

    return (
        <div className="guidelines">
            <div className="header">
                <div className="title">
                    Guidelines
                </div>
                <div className="description">
                    Thesis writing template provided by International University
                </div>
            </div>
            <div className="main-section">
                <div className="categories">
                    {
                        categories.map(category => (
                            <div 
                                className={"category " + (activeCategory === category ? "active" : "")}
                                key={category}
                                onClick={() => {setContent(guidelines[category]); setActiveCategory(category)}}>
                                {getName(category)}
                            </div>
                        ))
                    }
                </div>
                <div className="content">
                    {content}
                </div>
            </div>
        </div>
    );
}

export default Guidelines;