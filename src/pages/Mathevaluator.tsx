import React, { useState, useCallback, useEffect } from 'react';

const MathEvaluator = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Math Evaluator');
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

  const evaluateExpression = () => {
    if (!expression.trim()) return;

    setError(null);
    try {
      const sanitizedExpression = expression
        .replace(/\^/g, "**")
        .replace(/sin\(/g, "Math.sin(")
        .replace(/cos\(/g, "Math.cos(")
        .replace(/tan\(/g, "Math.tan(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/π/g, "Math.PI")
        .replace(/pi/g, "Math.PI")
        .replace(/e/g, "Math.E");

      if (!/^[0-9+\-*/().%,\s\w]*$/.test(sanitizedExpression)) {
        throw new Error("Invalid characters in expression");
      }

      // eslint-disable-next-line no-eval
      const evalResult = eval(sanitizedExpression);

      let formattedResult: string;
      if (typeof evalResult === "number") {
        if (Math.abs(evalResult) < 0.000001 && evalResult !== 0) {
          formattedResult = evalResult.toExponential(6);
        } else if (Math.abs(evalResult) > 1000000) {
          formattedResult = evalResult.toExponential(6);
        } else {
          formattedResult = Number.isInteger(evalResult)
            ? evalResult.toString()
            : evalResult.toFixed(6).replace(/\.?0+$/, "");
        }
      } else {
        formattedResult = String(evalResult);
      }

      setResult(formattedResult);
      setHistory((prev) => [
        { expression, result: formattedResult },
        ...prev.slice(0, 9),
      ]);
    } catch (err) {
      setError("Invalid expression. Please check your syntax.");
      setResult(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      evaluateExpression();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const useHistoryItem = useCallback((item: { expression: string; result: string }) => {
    setExpression(item.expression);
    setResult(item.result);
  }, []);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Mathematical Expression</label>
          <input
            type="text"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 2 * (3 + 4) or sin(0.5)"
            className="w-full p-2 border border-gray-300 rounded font-mono"
          />
          <p className="text-sm text-gray-500 mt-1">
            Supports: +, -, *, /, %, ^, sin(), cos(), tan(), sqrt(), log(), ln(), abs(), π, e
          </p>
        </div>

        <button
          onClick={evaluateExpression}
          disabled={!expression.trim()}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
        >
          Calculate
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result !== null && (
          <div className="bg-white p-4 rounded border mb-4">
            <label className="block mb-2">Result</label>
            <div className="flex items-center">
              <input
                type="text"
                value={result}
                readOnly
                className="w-full p-2 border border-gray-300 rounded font-mono text-lg"
              />
              <button
                onClick={() => copyToClipboard(result)}
                className="ml-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="bg-white p-4 rounded border">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">Calculation History</h3>
              <button
                onClick={clearHistory}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Clear History
              </button>
            </div>
            <div className="h-[200px] overflow-y-auto border rounded-md">
              <div className="p-2 space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => useHistoryItem(item)}
                  >
                    <div className="font-mono text-sm">{item.expression}</div>
                    <div className="font-mono text-sm font-bold">{`= ${item.result}`}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathEvaluator;