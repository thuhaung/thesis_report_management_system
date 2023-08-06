import "./WordFrequency.scss";
import React from "react";
import * as d3 from "d3";
import { useEffect } from "react";

const WordFrequency = ({ content }) => {
    const wordFrequency = Object.keys(content.word_frequency).map(key => ({"word": key, "count": content.word_frequency[key]}));
    const overlap = content.overlap;

    const getColor = (word) => {
        if (overlap.includes(word)) {
            return "#0cc706";
        }
        
        return "steelblue";
    }

    useEffect(() => {
        const plotWidth = 500;
        const plotHeight = 600;
        const margin = {top: 15, bottom: 45, left: 110, right: 50};
        const width = plotWidth + margin.left + margin.right;
        const height = plotHeight + margin.top + margin.bottom;

        const barChart = d3.select("#chart")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const maxCount = Math.max(...wordFrequency.map(item => item["count"]));

        const x = d3.scaleLinear()
                    .domain([0, maxCount])
                    .range([0, plotWidth]);
        
        const y = d3.scaleBand()
                    .range([0, plotHeight])
                    .domain(wordFrequency.map(item => item["word"]))
                    .padding(.1);

        barChart.append("g")
                .attr("transform", `translate(0, ${plotHeight})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("font-size", "14px");
            
        barChart.append("g")
                .call(d3.axisLeft(y).tickSize(0))
                .selectAll("text")
                .attr("font-size", "16px");

        const bar = barChart.selectAll(".bar")
                            .data(wordFrequency)
                            .enter()
                            .append("g");
        
        bar.append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", item => y(item["word"]))
                .attr("width", item => x(item["count"]))
                .attr("height", y.bandwidth())
                .attr("fill", item => getColor(item["word"]))
                .attr("stroke", "black");

        bar.append("text")
            .text(item => item["count"])
            .attr("x", item => x(item["count"]) + 5)
            .attr("y", item => y(item["word"]) + y.bandwidth() / 2 + 4)
            .attr("font-size", "13px")
            .attr("font-family", "sans-serif");
    }, []);
    
    return (
        <div className="word-frequency">
            <div className="text">
                {content.analysis}
            </div>
            <div className="chart">
                <div className="legend">
                    <div className="section">
                        <div className="color green"></div>
                        <div className="label">
                            Overlapping keyword
                        </div>
                    </div>
                </div>
                <svg id="chart" />
            </div>
        </div>
    );
}

export default WordFrequency;