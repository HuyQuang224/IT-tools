import React, { useState } from 'react';

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
}

const BenchmarkBuilder = () => {
  const [code, setCode] = useState(
    "// Example: Array creation and manipulation\nconst arr = [];\nfor (let i = 0; i < 1000; i++) {\n  arr.push(i);\n}\narr.filter(x => x % 2 === 0).map(x => x * 2);"
  );
  const [iterations, setIterations] = useState(1000);
  const [benchmarkName, setBenchmarkName] = useState("My Benchmark");
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("code");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  React.useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Benchmark Builder');
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

  const runBenchmark = async () => {
    setError(null);
    setIsRunning(true);

    try {
      if (!code.trim()) {
        throw new Error("Code is required");
      }

      if (iterations <= 0) {
        throw new Error("Iterations must be a positive number");
      }

      let benchmarkFunction: Function;
      try {
        benchmarkFunction = new Function(code);
      } catch (err) {
        throw new Error(`Invalid JavaScript code: ${(err as Error).message}`);
      }

      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        try {
          benchmarkFunction();
        } catch (err) {
          throw new Error(`Error during execution (iteration ${i + 1}): ${(err as Error).message}`);
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / iterations;
      const operationsPerSecond = (1000 / averageTime) * (iterations >= 100 ? 1 : iterations);

      const result: BenchmarkResult = {
        name: benchmarkName || "Unnamed Benchmark",
        iterations,
        totalTime,
        averageTime,
        operationsPerSecond,
      };

      setResults((prev) => [result, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (ms: number): string => {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(2)} μs`;
    } else if (ms < 1000) {
      return `${ms.toFixed(2)} ms`;
    } else {
      return `${(ms / 1000).toFixed(2)} s`;
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'code' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('code')}
          >
            Code
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'results' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('results')}
          >
            Results
          </button>
        </div>

        {activeTab === 'code' && (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Benchmark Name</label>
              <input
                type="text"
                value={benchmarkName}
                onChange={(e) => setBenchmarkName(e.target.value)}
                placeholder="e.g. Array Sorting Benchmark"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block mb-2">JavaScript Code to Benchmark</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter JavaScript code to benchmark..."
                className="w-full p-2 border border-gray-300 rounded font-mono text-sm min-h-[200px]"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the JavaScript code you want to benchmark. This code will be executed multiple times.
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label>Iterations: {iterations.toLocaleString()}</label>
              </div>
              <input
                type="range"
                min="1"
                max="100000"
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                className="w-full my-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1</span>
                <span>10,000</span>
                <span>100,000</span>
              </div>
            </div>

            <button
              onClick={runBenchmark}
              disabled={isRunning}
              className={`w-full px-4 py-2 rounded ${isRunning ? 'bg-gray-400' : 'bg-green-500'} text-white`}
            >
              {isRunning ? (
                <span className="flex items-center justify-center">
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
                    className="animate-spin mr-2 h-4 w-4"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  Running Benchmark...
                </span>
              ) : (
                <span className="flex items-center justify-center">
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
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Run Benchmark
                </span>
              )}
            </button>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            {results.length === 0 ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded flex items-center">
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
                  <line x1="12" y1="20" x2="12" y2="10"></line>
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="16"></line>
                </svg>
                No benchmark results yet. Run a benchmark to see results here.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label>Benchmark Results</label>
                  <button
                    onClick={clearResults}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                  >
                    Clear Results
                  </button>
                </div>

                {results.map((result, index) => (
                  <div key={index} className="bg-white p-4 rounded border">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{result.name}</h3>
                          <p className="text-sm text-gray-500">
                            {result.iterations.toLocaleString()} iterations
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center"
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
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          Copy
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <label className="block text-sm text-gray-500">Total Time</label>
                          <p className="text-lg font-mono">{formatTime(result.totalTime)}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <label className="block text-sm text-gray-500">Average Time</label>
                          <p className="text-lg font-mono">{formatTime(result.averageTime)}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-md">
                          <label className="block text-sm text-gray-500">Operations/Second</label>
                          <p className="text-lg font-mono">{formatNumber(result.operationsPerSecond)}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>Benchmark run at {new Date().toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkBuilder;