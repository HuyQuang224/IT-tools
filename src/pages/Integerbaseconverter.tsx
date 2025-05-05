import React, { useState, useEffect } from 'react';

const IntegerBaseConverter = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputBase, setInputBase] = useState('10');
  const [outputBase, setOutputBase] = useState('16');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  const bases = [
    { value: '2', label: 'Binary (Base 2)' },
    { value: '8', label: 'Octal (Base 8)' },
    { value: '10', label: 'Decimal (Base 10)' },
    { value: '16', label: 'Hexadecimal (Base 16)' },
    { value: '36', label: 'Base 36' },
    { value: '64', label: 'Base 64' },
  ];

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const res = await fetch('/api/tool-details?name=Integer Base Converter');
        if (!res.ok) throw new Error('Failed to fetch tool details');
        const data = await res.json();
        setToolName(data.name);
        setDescription(data.description);
      } catch (err) {
        console.error('Error fetching tool details:', err);
      }
    };

    fetchToolDetails();
  }, []);

  const convertBase = () => {
    setError('');
    if (!inputValue.trim()) {
      setResult('');
      return;
    }

    try {
      const decimalValue = parseInt(inputValue, parseInt(inputBase));
      if (isNaN(decimalValue)) {
        setError(`Invalid number for base ${inputBase}`);
        setResult('');
        return;
      }
      const outputValue = decimalValue.toString(parseInt(outputBase));
      setResult(outputValue.toUpperCase());
    } catch (err) {
      setError('Conversion error. Please check your input.');
      setResult('');
    }
  };

  const copyToClipboard = () => {
    if (result) navigator.clipboard.writeText(result);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>

      <div className="bg-gray-100 p-6 rounded shadow space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Input Value</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter a number"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold">Input Base</label>
            <select
              value={inputBase}
              onChange={(e) => setInputBase(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {bases.map((base) => (
                <option key={base.value} value={base.value}>
                  {base.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-semibold">Output Base</label>
            <select
              value={outputBase}
              onChange={(e) => setOutputBase(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {bases.map((base) => (
                <option key={base.value} value={base.value}>
                  {base.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={convertBase}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Convert
          </button>
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {result && (
          <div>
            <label className="block mb-2 font-semibold">
              Result (Base {outputBase})
            </label>
            <textarea
              readOnly
              value={result}
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegerBaseConverter;
