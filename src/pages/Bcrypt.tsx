import React, { useState, useEffect } from 'react';

const Bcrypt = () => {
  const [password, setPassword] = useState('');
  const [hash, setHash] = useState('');
  const [rounds, setRounds] = useState(10);
  const [comparePassword, setComparePassword] = useState('');
  const [compareResult, setCompareResult] = useState<boolean | null>(null);
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Bcrypt');
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

  const hashPassword = () => {
    if (!password) return;

    const mockHash = `$2a$${rounds.toString().padStart(2, '0')}$mockBcryptHash${password.substring(0, 3)}...`;
    setHash(mockHash);
  };

  const comparePasswords = () => {
    if (!hash || !comparePassword) return;

    const mockResult = comparePassword === password;
    setCompareResult(mockResult);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password to hash"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Cost Factor (Rounds): {rounds}</label>
          <input
            type="range"
            min="4"
            max="16"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <button
          onClick={hashPassword}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full mb-4"
          disabled={!password}
        >
          Generate Bcrypt Hash
        </button>
        {hash && (
          <div className="mb-4">
            <label className="block mb-2">Hash Result</label>
            <textarea
              readOnly
              value={hash}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            ></textarea>
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        )}
        <div className="mb-4">
          <label className="block mb-2">Password to Compare</label>
          <input
            type="text"
            value={comparePassword}
            onChange={(e) => setComparePassword(e.target.value)}
            placeholder="Enter password to compare"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          onClick={comparePasswords}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 w-full"
          disabled={!hash || !comparePassword}
        >
          Compare Password
        </button>
        {compareResult !== null && (
          <div
            className={`mt-4 p-4 rounded ${
              compareResult ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {compareResult ? 'Password matches the hash!' : 'Password does not match the hash.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bcrypt;