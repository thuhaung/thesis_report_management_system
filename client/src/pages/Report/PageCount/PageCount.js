import React from "react";
import "./PageCount.scss";
import { useEffect } from "react";
import * as d3 from "d3";

const PageCount = ({ content }) => {
    const pageCount = Object.keys(content.page_count).map(key => ({"category": key, "count": content.page_count[key]}))
    const enoughCount = Object.keys(content.enough_count).map(key => ({"category": key, "result": content.enough_count[key]}))

	const getColor = (category) => {
        if (enoughCount.filter(item => item["category"] === category)[0].result) {
            return "#0cc706";
        }
        
        return "#d10202";
    }

	useEffect(() => {
		const plotWidth = 400;
        const plotHeight = 350;
        const margin = {top: 15, bottom: 45, left: 110, right: 50};
        const width = plotWidth + margin.left + margin.right;
        const height = plotHeight + margin.top + margin.bottom;

        const barChart = d3.select("#chart")
                            .attr("width", width)
                            .attr("height", height)
                            .append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        const maxCount = Math.max(...pageCount.map(item => item["count"]));

        const x = d3.scaleLinear()
                    .domain([0, maxCount])
                    .range([0, plotWidth]);
        
        const y = d3.scaleBand()
                    .range([0, plotHeight])
                    .domain(pageCount.map(item => item["category"]))
                    .padding(.1);

        barChart.append("g")
                .attr("transform", `translate(0, ${plotHeight})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("font-size", "14px");
            
        barChart.append("g")
                .call(d3.axisLeft(y).tickSize(0))
                .selectAll("text")
                .attr("font-size", "14px");

        const bar = barChart.selectAll(".bar")
                            .data(pageCount)
                            .enter()
                            .append("g");
        
        bar.append("rect")
                .attr("class", "bar")
                .attr("x", 0)
                .attr("y", item => y(item["category"]))
                .attr("width", item => x(item["count"]))
                .attr("height", y.bandwidth())
                .attr("fill", item => getColor(item["category"]))
                .attr("stroke", "black");

        bar.append("text")
            .text(item => item["count"])
            .attr("x", item => x(item["count"]) + 5)
            .attr("y", item => y(item["category"]) + y.bandwidth() / 2 + 4)
            .attr("font-size", "13px")
            .attr("font-family", "sans-serif");
	}, []);

	return (
		<div className="page-count">
			<div className="text">{content.analysis}</div>
            <div className="chart">
                <div className="legend">
                    <div className="section">
                        <div className="color green"></div>
                        <div className="label">
                            Page count exceeds
                        </div>
                    </div>
                    <div className="section">
                        <div className="color red"></div>
                        <div className="label">
                            Page count not enough
                        </div>
                    </div>
                </div>
                <svg id="chart"></svg>
            </div>
		</div>
	);
};

export default PageCount;
