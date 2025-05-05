import React, { useState, useEffect } from 'react';

const TextStatisticsTool = () => {
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');

  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    speakingTime: 0,
    longestWord: '',
    averageWordLength: 0,
    uniqueWords: 0,
  });

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Text Statistics');
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

  useEffect(() => {
    analyzeText(text);
  }, [text]);

  const analyzeText = (input: string) => {
    const characters = input.length;
    const charactersNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const sentences = input.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = input.split(/\n\s*\n/).filter(Boolean).length || 1;

    const readingTime = words / 225;
    const speakingTime = words / 150;

    const wordArray = input.trim() ? input.trim().split(/\s+/) : [];
    let longestWord = '';
    let totalWordLength = 0;
    const uniqueWordsSet = new Set<string>();

    wordArray.forEach((word) => {
      const cleanWord = word.replace(/[^\w\s]/gi, '');
      if (cleanWord.length > longestWord.length) longestWord = cleanWord;
      totalWordLength += cleanWord.length;
      uniqueWordsSet.add(cleanWord.toLowerCase());
    });

    const averageWordLength = words > 0 ? totalWordLength / words : 0;
    const uniqueWords = uniqueWordsSet.size;

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      longestWord,
      averageWordLength,
      uniqueWords,
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>

      <div className="bg-gray-100 p-4 rounded shadow space-y-4">
        <div>
          <label className="block mb-2">Text to Analyze</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here..."
            className="w-full p-2 border border-gray-300 rounded min-h-[150px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Basic Statistics</h3>
            <p>Characters: <span className="font-mono">{stats.characters}</span></p>
            <p>Characters (no spaces): <span className="font-mono">{stats.charactersNoSpaces}</span></p>
            <p>Words: <span className="font-mono">{stats.words}</span></p>
            <p>Sentences: <span className="font-mono">{stats.sentences}</span></p>
            <p>Paragraphs: <span className="font-mono">{stats.paragraphs}</span></p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-2">Advanced Analysis</h3>
            <p>Unique Words: <span className="font-mono">{stats.uniqueWords}</span></p>
            <p>Average Word Length: <span className="font-mono">{stats.averageWordLength.toFixed(1)} chars</span></p>
            <p>Longest Word: <span className="font-mono">{stats.longestWord || 'N/A'}</span></p>
            <p>Estimated Reading Time: <span className="font-mono">{Math.ceil(stats.readingTime * 60)} sec</span></p>
            <p>Estimated Speaking Time: <span className="font-mono">{Math.ceil(stats.speakingTime * 60)} sec</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextStatisticsTool;
