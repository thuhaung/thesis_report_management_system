import React from "react";
import { useState } from "react";
import "./ChapterSummarization.scss";

const ChapterSummarization = ({ content }) => {
    const [activeChapters, setActiveChapters] = useState([]);

    const selectChapter = (chapter) => {
        if (activeChapters.includes(chapter)) {
            setActiveChapters(activeChapters.filter(item => item !== chapter));
        }
        else {
            setActiveChapters(prev => [...prev, chapter]);
        }
    }

    return (
        <div className="chapter-summarization">
            <div className="chapters">
                {
                    Object.keys(content).map(chapter => (
                        <div 
                            className={"chapter " + (activeChapters.includes(chapter) ? "active" : "")} 
                            key={chapter}>
                            <div 
                                className="title" 
                                onClick={() => selectChapter(chapter)}>
                                {chapter}
                            </div>
                            <div className="content">
                                {content[chapter]}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default ChapterSummarization;