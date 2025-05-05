import React, { useState, useEffect } from 'react';

const LoremIpsumTool = () => {
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [format, setFormat] = useState('plain');
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [result, setResult] = useState('');

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna",
    "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco",
    "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
    "dolor", "reprehenderit", "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa",
    "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
  ];

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Lorem Ipsum Generator');
        if (!response.ok) throw new Error('Failed to fetch tool details');
        const data = await response.json();
        setToolName(data.name);
        setDescription(data.description);
      } catch (err) {
        console.error('Error fetching tool details:', err);
      }
    };

    fetchToolDetails();
  }, []);

  const generateText = () => {
    let text = '';

    for (let p = 0; p < paragraphs; p++) {
      let paragraph = '';

      for (let w = 0; w < wordsPerParagraph; w++) {
        if (p === 0 && w === 0 && startWithLorem) {
          paragraph += 'Lorem ipsum dolor sit amet, ';
          w += 4;
        } else {
          const word = loremWords[Math.floor(Math.random() * loremWords.length)];
          paragraph += w === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;

          if (w < wordsPerParagraph - 1 && Math.random() < 0.1) {
            paragraph += ',';
          }

          paragraph += w < wordsPerParagraph - 1 ? ' ' : '.';
        }
      }

      if (format === 'html') text += `<p>${paragraph}</p>${p < paragraphs - 1 ? '\n\n' : ''}`;
      else if (format === 'markdown') text += `${paragraph}\n\n`;
      else text += `${paragraph}${p < paragraphs - 1 ? '\n\n' : ''}`;
    }

    setResult(text);
  };

  useEffect(() => {
    generateText();
  }, [paragraphs, wordsPerParagraph, format, startWithLorem]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Number of Paragraphs ({paragraphs})</label>
          <input
            type="range"
            min="1"
            max="10"
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Words per Paragraph ({wordsPerParagraph})</label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={wordsPerParagraph}
            onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Output Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="plain">Plain Text</option>
            <option value="html">HTML</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
        <div className="flex items-center mb-4">
          <label className="mr-2">Start with "Lorem ipsum..."</label>
          <input
            type="checkbox"
            checked={startWithLorem}
            onChange={() => setStartWithLorem(!startWithLorem)}
          />
        </div>
        <textarea
          readOnly
          value={result}
          className="w-full p-2 border border-gray-300 rounded mb-4 min-h-[200px]"
        ></textarea>
        <div className="flex justify-between">
          <button
            onClick={() => navigator.clipboard.writeText(result)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy
          </button>
          <button
            onClick={generateText}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoremIpsumTool;
