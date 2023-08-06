import "./AdminHomepage.scss";
import React from "react";
import { useState } from "react";
import Home from "./Home/Home";

const AdminHomepage = () => {
    const sections = [
        {
            id: "home",
            name: "Home",
            page: <Home />
        }
    ];
    const [activeSection, setActiveSection] = useState(sections[0].id);

    return (
        <div className="admin-homepage">
            <div className="dashboard">
                <div className="title">
                    Admin Dashboard
                </div>
                <div className="line"></div>
                <div className="sections">
                    {
                        sections.map(section => (
                            <div 
                                className={"section " + (activeSection === section.id ? "active" : "")} 
                                onClick={() => setActiveSection(section.id)}
                                key={section.id}>
                                {section.name}
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className="main-section">
                {sections.filter(section => section.id === activeSection)[0].page}
            </div>
        </div>
    );
}

export default AdminHomepage;