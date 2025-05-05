import React, { useState, useEffect } from 'react';

const RomanNumeralConverter = () => {
  const [arabicNumber, setArabicNumber] = useState('');
  const [romanNumeral, setRomanNumeral] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'toRoman' | 'toArabic'>('toRoman');
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Roman Numeral Converter');
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

  const convertToRoman = () => {
    setError('');
    const num = parseInt(arabicNumber, 10);
    if (isNaN(num) || num < 1 || num > 3999) {
      setError('Please enter a number between 1 and 3999');
      setResult('');
      return;
    }

    const romanNumerals = [
      { value: 1000, symbol: 'M' },
      { value: 900, symbol: 'CM' },
      { value: 500, symbol: 'D' },
      { value: 400, symbol: 'CD' },
      { value: 100, symbol: 'C' },
      { value: 90, symbol: 'XC' },
      { value: 50, symbol: 'L' },
      { value: 40, symbol: 'XL' },
      { value: 10, symbol: 'X' },
      { value: 9, symbol: 'IX' },
      { value: 5, symbol: 'V' },
      { value: 4, symbol: 'IV' },
      { value: 1, symbol: 'I' },
    ];

    let remaining = num;
    let roman = '';

    for (const { value, symbol } of romanNumerals) {
      while (remaining >= value) {
        roman += symbol;
        remaining -= value;
      }
    }

    setResult(roman);
  };

  const convertToArabic = () => {
    setError('');
    const roman = romanNumeral.toUpperCase();
    const romanMap: Record<string, number> = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };

    let i = 0;
    let total = 0;

    while (i < roman.length) {
      const current = romanMap[roman[i]];
      const next = romanMap[roman[i + 1]];

      if (current === undefined) {
        setError('Invalid Roman numeral');
        setResult('');
        return;
      }

      if (next && current < next) {
        total += next - current;
        i += 2;
      } else {
        total += current;
        i += 1;
      }
    }

    if (total > 0 && total <= 3999) {
      setResult(total.toString());
    } else {
      setError('Invalid Roman numeral');
      setResult('');
    }
  };

  const handleConvert = () => {
    if (activeTab === 'toRoman') {
      convertToRoman();
    } else {
      convertToArabic();
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
        <div className="flex gap-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === 'toRoman' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            onClick={() => setActiveTab('toRoman')}
          >
            Number to Roman
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === 'toArabic' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
            onClick={() => setActiveTab('toArabic')}
          >
            Roman to Number
          </button>
        </div>

        {activeTab === 'toRoman' ? (
          <div>
            <label className="block mb-2 font-semibold">Number (1 - 3999)</label>
            <input
              type="number"
              value={arabicNumber}
              onChange={(e) => setArabicNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter a number"
              min="1"
              max="3999"
            />
          </div>
        ) : (
          <div>
            <label className="block mb-2 font-semibold">Roman Numeral</label>
            <input
              type="text"
              value={romanNumeral}
              onChange={(e) => setRomanNumeral(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter a Roman numeral"
            />
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleConvert}
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
            <label className="block mb-2 font-semibold">Result</label>
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

export default RomanNumeralConverter;
