import React, { useState, useEffect } from 'react';

const PercentageCalculator = () => {
  // State for tool info
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  // State for calculator tabs
  const [activeTab, setActiveTab] = useState('percent-of');

  // Percentage of a number
  const [percentValue, setPercentValue] = useState('');
  const [ofValue, setOfValue] = useState('');
  const [percentResult, setPercentResult] = useState<string | null>(null);

  // Percentage change
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [changeResult, setChangeResult] = useState<string | null>(null);
  const [changeAbsolute, setChangeAbsolute] = useState<string | null>(null);

  // Percentage increase/decrease
  const [baseValue, setBaseValue] = useState('');
  const [percentageChange, setPercentageChange] = useState('');
  const [increaseResult, setIncreaseResult] = useState<string | null>(null);

  // Reverse percentage
  const [finalValue, setFinalValue] = useState('');
  const [percentageApplied, setPercentageApplied] = useState('');
  const [reverseResult, setReverseResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Percentage Calculator');
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

  const calculatePercentOf = () => {
    if (!percentValue || !ofValue) return;

    const percent = Number.parseFloat(percentValue);
    const value = Number.parseFloat(ofValue);
    const result = (percent / 100) * value;

    setPercentResult(result.toFixed(2));
  };

  const calculatePercentageChange = () => {
    if (!fromValue || !toValue) return;

    const from = Number.parseFloat(fromValue);
    const to = Number.parseFloat(toValue);

    if (from === 0) {
      setChangeResult("∞");
      setChangeAbsolute((to - from).toFixed(2));
      return;
    }

    const change = ((to - from) / Math.abs(from)) * 100;
    setChangeResult(change.toFixed(2));
    setChangeAbsolute((to - from).toFixed(2));
  };

  const calculatePercentageIncrease = () => {
    if (!baseValue || !percentageChange) return;

    const base = Number.parseFloat(baseValue);
    const percent = Number.parseFloat(percentageChange);
    const result = base * (1 + percent / 100);

    setIncreaseResult(result.toFixed(2));
  };

  const calculateReversePercentage = () => {
    if (!finalValue || !percentageApplied) return;

    const final = Number.parseFloat(finalValue);
    const percent = Number.parseFloat(percentageApplied);

    const original = final / (1 + percent / 100);
    setReverseResult(original.toFixed(2));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'percent-of' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('percent-of')}
          >
            % of Number
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'percent-change' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('percent-change')}
          >
            % Change
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'increase-decrease' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('increase-decrease')}
          >
            Increase/Decrease
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'reverse' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('reverse')}
          >
            Reverse %
          </button>
        </div>

        {activeTab === 'percent-of' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Percentage</label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentValue}
                    onChange={(e) => setPercentValue(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <span className="absolute right-3 top-2">%</span>
                </div>
              </div>
              <div>
                <label className="block mb-2">of</label>
                <input
                  type="number"
                  value={ofValue}
                  onChange={(e) => setOfValue(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <button
                  onClick={calculatePercentOf}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Calculate
                </button>
              </div>
            </div>

            {percentResult !== null && (
              <div className="bg-white p-4 rounded border">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Result</p>
                  <p className="text-2xl font-bold">{percentResult}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {percentValue}% of {ofValue} = {percentResult}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'percent-change' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">From</label>
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">To</label>
                <input
                  type="number"
                  value={toValue}
                  onChange={(e) => setToValue(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <button
                  onClick={calculatePercentageChange}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Calculate
                </button>
              </div>
            </div>

            {changeResult !== null && (
              <div className="bg-white p-4 rounded border">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Percentage Change</p>
                  <p className="text-2xl font-bold">
                    {changeResult}%
                    {Number.parseFloat(changeResult) > 0
                      ? " increase"
                      : Number.parseFloat(changeResult) < 0
                        ? " decrease"
                        : ""}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Absolute change: {changeAbsolute}</p>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <div className="px-3 py-1 bg-gray-100 rounded">{fromValue}</div>
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
                      className="h-4 w-4"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <div className="px-3 py-1 bg-gray-100 rounded">{toValue}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'increase-decrease' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Base Value</label>
                <input
                  type="number"
                  value={baseValue}
                  onChange={(e) => setBaseValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Percentage Change</label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentageChange}
                    onChange={(e) => setPercentageChange(e.target.value)}
                    placeholder="e.g. 15 or -15"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <span className="absolute right-3 top-2">%</span>
                </div>
              </div>
              <div>
                <button
                  onClick={calculatePercentageIncrease}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Calculate
                </button>
              </div>
            </div>

            {increaseResult !== null && (
              <div className="bg-white p-4 rounded border">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Result after {percentageChange}% change</p>
                  <p className="text-2xl font-bold">{increaseResult}</p>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <div className="px-3 py-1 bg-gray-100 rounded">{baseValue}</div>
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
                      className="h-4 w-4"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <div className="px-3 py-1 bg-gray-100 rounded">{increaseResult}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reverse' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2">Final Value</label>
                <input
                  type="number"
                  value={finalValue}
                  onChange={(e) => setFinalValue(e.target.value)}
                  placeholder="e.g. 115"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Percentage Applied</label>
                <div className="relative">
                  <input
                    type="number"
                    value={percentageApplied}
                    onChange={(e) => setPercentageApplied(e.target.value)}
                    placeholder="e.g. 15 or -15"
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <span className="absolute right-3 top-2">%</span>
                </div>
              </div>
              <div>
                <button
                  onClick={calculateReversePercentage}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Calculate
                </button>
              </div>
            </div>

            {reverseResult !== null && (
              <div className="bg-white p-4 rounded border">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Original Value before {percentageApplied}% was applied</p>
                  <p className="text-2xl font-bold">{reverseResult}</p>
                  <div className="flex items-center justify-center mt-4 space-x-2">
                    <div className="px-3 py-1 bg-gray-100 rounded">{reverseResult}</div>
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
                      className="h-4 w-4"
                    >
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <div className="px-3 py-1 bg-gray-100 rounded">{finalValue}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PercentageCalculator;