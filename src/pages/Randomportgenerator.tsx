"use client"

import { useState, useEffect } from 'react';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';

const RandomPortGenerator = () => {
  const [count, setCount] = useState(1);
  const [minPort, setMinPort] = useState(1024);
  const [maxPort, setMaxPort] = useState(65535);
  const [excludeCommon, setExcludeCommon] = useState(true);
  const [ports, setPorts] = useState<number[]>([]);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  // Common ports to exclude if option is selected
  const commonPorts = [
    20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 
    1433, 1521, 3306, 3389, 5432, 5900, 5901, 6379, 8080, 8443, 
    27017, 27018, 27019
  ];

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Random Port Generator');
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

  const generatePorts = () => {
    const newPorts: number[] = [];
    const usedPorts = new Set<number>();

    // Validate min and max ports
    const min = Math.max(0, Math.min(65535, minPort));
    const max = Math.max(min, Math.min(65535, maxPort));

    // Add common ports to used set if exclude option is selected
    if (excludeCommon) {
      commonPorts.forEach((port) => {
        if (port >= min && port <= max) {
          usedPorts.add(port);
        }
      });
    }

    // Generate unique random ports
    let attempts = 0;
    const maxAttempts = count * 10; // Prevent infinite loop

    while (newPorts.length < count && attempts < maxAttempts) {
      attempts++;
      const port = Math.floor(Math.random() * (max - min + 1)) + min;

      if (!usedPorts.has(port)) {
        newPorts.push(port);
        usedPorts.add(port);
      }
    }

    // Sort ports numerically
    newPorts.sort((a, b) => a - b);
    setPorts(newPorts);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllPorts = () => {
    navigator.clipboard.writeText(ports.join("\n"));
  };

  useEffect(() => {
    generatePorts();
  }, [count, minPort, maxPort, excludeCommon]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Number of Ports: {count}</label>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Minimum Port</label>
              <input
                type="number"
                min="0"
                max="65535"
                value={minPort}
                onChange={(e) => setMinPort(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Maximum Port</label>
              <input
                type="number"
                min="0"
                max="65535"
                value={maxPort}
                onChange={(e) => setMaxPort(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="exclude-common"
              checked={excludeCommon}
              onChange={(e) => setExcludeCommon(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="exclude-common">Exclude common ports (20, 21, 22, 80, 443, etc.)</label>
          </div>

          <button
            onClick={generatePorts}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Random Ports
          </button>
        </div>

        {ports.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block">Generated Ports</label>
              <button
                onClick={copyAllPorts}
                className="flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy All
              </button>
            </div>
            <div className="bg-white p-4 rounded shadow max-h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {ports.map((port, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 border rounded-md bg-gray-50"
                  >
                    <code className="font-mono">{port}</code>
                    <button
                      onClick={() => copyToClipboard(port.toString())}
                      className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Port ranges:</p>
              <ul className="text-sm text-yellow-700 list-disc pl-5 mt-1">
                <li>0-1023: Well-known ports (require admin privileges)</li>
                <li>1024-49151: Registered ports</li>
                <li>49152-65535: Dynamic/private ports</li>
              </ul>
              <p className="text-sm text-yellow-700 mt-2">
                For development servers, it's common to use ports in the range 3000-9000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RandomPortGenerator;