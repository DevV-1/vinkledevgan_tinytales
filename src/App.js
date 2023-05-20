import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { saveAs } from 'file-saver';

const App = () => {
  const [histogramData, setHistogramData] = useState([]);
  const histogramRef = useRef(null);

  useEffect(() => {
    if (histogramData.length > 0) {
      plotHistogram(histogramData);
    }
  }, [histogramData]);

  const fetchData = async () => {
    try {
      const response = await fetch('https://www.terriblytinytales.com/test.txt');
      const text = await response.text();
      const wordCounts = countWords(text);
      const sortedWords = sortWordsByCount(wordCounts);
      const top20Words = sortedWords.slice(0, 20);
      setHistogramData(top20Words);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const countWords = (text) => {
    const words = text.toLowerCase().match(/\b\w+\b/g);
    const wordCounts = {};

    if (words) {
      words.forEach((word) => {
        if (wordCounts[word]) {
          wordCounts[word]++;
        } else {
          wordCounts[word] = 1;
        }
      });
    }

    return wordCounts;
  };

  const sortWordsByCount = (wordCounts) => {
    const words = Object.keys(wordCounts);

    return words
      .sort((a, b) => wordCounts[b] - wordCounts[a])
      .map((word) => ({ word, count: wordCounts[word] }));
  };

  const handleExport = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + convertToCSV(histogramData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'word_histogram.csv');
  };

  const convertToCSV = (data) => {
    const header = ['Word', 'Count'];
    const rows = data.map(({ word, count }) => [word, count]);
    return [header, ...rows].map((row) => row.join(',')).join('\n');
  };

  const plotHistogram = (data) => {
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleBand().range([0, width]).padding(0.1).domain(data.map((d) => d.word));

    const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(data, (d) => d.count)]);

    const svg = d3
      .select(histogramRef.current)
      .html('')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.word))
      .attr('width' , x.bandwidth())
      .attr('y', (d) => y(d.count))
      .attr('height', (d) => height - y(d.count));

    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('transform', 'rotate(-45)')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');

    svg.append('g').call(d3.axisLeft(y));

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Count');

    svg
      .append('text')
      .attr('transform', 'translate(' + width / 2 + ' ,' + (height + margin.top + 30) + ')')
      .style('text-anchor', 'middle')
      .text('Word');
  };

  return (
    <div>
      <button onClick={fetchData}>Submit</button>
      {histogramData.length > 0 && (
        <div>
          <div ref={histogramRef}></div>
          <button onClick={handleExport}>Export</button>
        </div>
      )}
    </div>
  );
};

export default App;
