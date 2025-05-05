import React, { useState, useEffect } from 'react';

const TemperatureConverter = () => {
  const [celsius, setCelsius] = useState("");
  const [fahrenheit, setFahrenheit] = useState("");
  const [kelvin, setKelvin] = useState("");
  const [activeTab, setActiveTab] = useState("celsius");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Temperature Converter');
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

  const convertFromCelsius = (value: string) => {
    const c = Number.parseFloat(value);
    if (isNaN(c)) {
      setFahrenheit("");
      setKelvin("");
      return;
    }

    const f = (c * 9) / 5 + 32;
    const k = c + 273.15;

    setFahrenheit(f.toFixed(2));
    setKelvin(k.toFixed(2));
  };

  const convertFromFahrenheit = (value: string) => {
    const f = Number.parseFloat(value);
    if (isNaN(f)) {
      setCelsius("");
      setKelvin("");
      return;
    }

    const c = ((f - 32) * 5) / 9;
    const k = c + 273.15;

    setCelsius(c.toFixed(2));
    setKelvin(k.toFixed(2));
  };

  const convertFromKelvin = (value: string) => {
    const k = Number.parseFloat(value);
    if (isNaN(k)) {
      setCelsius("");
      setFahrenheit("");
      return;
    }

    const c = k - 273.15;
    const f = (c * 9) / 5 + 32;

    setCelsius(c.toFixed(2));
    setFahrenheit(f.toFixed(2));
  };

  const handleCelsiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCelsius(value);
    convertFromCelsius(value);
  };

  const handleFahrenheitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFahrenheit(value);
    convertFromFahrenheit(value);
  };

  const handleKelvinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKelvin(value);
    convertFromKelvin(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const swapUnits = () => {
    if (activeTab === "celsius") {
      setActiveTab("fahrenheit");
    } else if (activeTab === "fahrenheit") {
      setActiveTab("kelvin");
    } else {
      setActiveTab("celsius");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'celsius' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('celsius')}
          >
            Celsius
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'fahrenheit' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('fahrenheit')}
          >
            Fahrenheit
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'kelvin' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('kelvin')}
          >
            Kelvin
          </button>
        </div>

        {activeTab === 'celsius' && (
          <div className="mb-4">
            <label className="block mb-2">Celsius (°C)</label>
            <input
              type="number"
              value={celsius}
              onChange={handleCelsiusChange}
              placeholder="Enter temperature in Celsius"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {activeTab === 'fahrenheit' && (
          <div className="mb-4">
            <label className="block mb-2">Fahrenheit (°F)</label>
            <input
              type="number"
              value={fahrenheit}
              onChange={handleFahrenheitChange}
              placeholder="Enter temperature in Fahrenheit"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        {activeTab === 'kelvin' && (
          <div className="mb-4">
            <label className="block mb-2">Kelvin (K)</label>
            <input
              type="number"
              value={kelvin}
              onChange={handleKelvinChange}
              placeholder="Enter temperature in Kelvin"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        )}

        <button
          onClick={swapUnits}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-6 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="M17 3l5 5-5 5"></path>
            <path d="M12 22v-8a4 4 0 00-4-4H3"></path>
            <path d="M7 21l-5-5 5-5"></path>
            <path d="M12 2v8a4 4 0 004 4h5"></path>
          </svg>
          Cycle Units
        </button>

        <div className="space-y-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <label className="block mb-2">Celsius (°C)</label>
            <div className="flex">
              <input
                type="text"
                value={celsius}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <button
                onClick={() => copyToClipboard(celsius)}
                className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <label className="block mb-2">Fahrenheit (°F)</label>
            <div className="flex">
              <input
                type="text"
                value={fahrenheit}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <button
                onClick={() => copyToClipboard(fahrenheit)}
                className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <label className="block mb-2">Kelvin (K)</label>
            <div className="flex">
              <input
                type="text"
                value={kelvin}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <button
                onClick={() => copyToClipboard(kelvin)}
                className="px-3 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <h3 className="text-lg font-medium mb-3">Temperature Conversion Formulas</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Celsius to Fahrenheit: °F = (°C × 9/5) + 32</li>
            <li>Fahrenheit to Celsius: °C = (°F - 32) × 5/9</li>
            <li>Celsius to Kelvin: K = °C + 273.15</li>
            <li>Kelvin to Celsius: °C = K - 273.15</li>
            <li>Fahrenheit to Kelvin: K = (°F - 32) × 5/9 + 273.15</li>
            <li>Kelvin to Fahrenheit: °F = (K - 273.15) × 9/5 + 32</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TemperatureConverter;