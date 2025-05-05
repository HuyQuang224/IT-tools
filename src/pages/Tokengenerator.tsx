import React, { useState, useEffect } from 'react';

const TokenGenerator = () => {
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [length, setLength] = useState(64);
  const [token, setToken] = useState('');
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Token Generator');
        if (!response.ok) {
          throw new Error('Failed to fetch tool details');
        }
        const data = await response.json();
        setToolName(data.name);
        setDescription(data.description);
      } catch (err) {
        console.error('Error fetching tool details:', err);
      }
    };

    fetchToolDetails();
  }, []);

  const generateToken = () => {
    const upper = uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '';
    const lower = lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '';
    const nums = numbers ? '0123456789' : '';
    const sym = symbols ? '!@#$%^&*()_+[]{}|;:,.<>?~' : '';
    const allChars = upper + lower + nums + sym;

    let newToken = '';
    for (let i = 0; i < length; i++) {
      newToken += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    setToken(newToken);
  };

  useEffect(() => {
    generateToken(); // Automatically generate token whenever conditions change
  }, [uppercase, lowercase, numbers, symbols, length]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex items-center mb-4">
          <label className="mr-2">Uppercase (ABC...)</label>
          <input
            type="checkbox"
            checked={uppercase}
            onChange={() => setUppercase(!uppercase)}
          />
        </div>
        <div className="flex items-center mb-4">
          <label className="mr-2">Lowercase (abc...)</label>
          <input
            type="checkbox"
            checked={lowercase}
            onChange={() => setLowercase(!lowercase)}
          />
        </div>
        <div className="flex items-center mb-4">
          <label className="mr-2">Numbers (123...)</label>
          <input
            type="checkbox"
            checked={numbers}
            onChange={() => setNumbers(!numbers)}
          />
        </div>
        <div className="flex items-center mb-4">
          <label className="mr-2">Symbols (!@#...)</label>
          <input
            type="checkbox"
            checked={symbols}
            onChange={() => setSymbols(!symbols)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Length ({length})</label>
          <input
            type="range"
            min="1"
            max="128"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <textarea
          readOnly
          value={token}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        ></textarea>
        <div className="flex justify-between">
          <button
            onClick={() => navigator.clipboard.writeText(token)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy
          </button>
          <button
            onClick={generateToken}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenGenerator;