"use client"

import { useState, useEffect } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

interface ConversionResult {
  decimal: string;
  binary: string;
  hexadecimal: string;
  octal: string;
  integer: number;
}

const Ipv4AddressConverterTool = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [activeTab, setActiveTab] = useState("decimal");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=IPv4 Address Converter');
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

  const convertIp = () => {
    setError(null);

    try {
      let ipOctets: number[] = [];

      // Parse IP address based on the active tab format
      switch (activeTab) {
        case "decimal":
          ipOctets = parseDecimalIp(ipAddress);
          break;
        case "binary":
          ipOctets = parseBinaryIp(ipAddress);
          break;
        case "hexadecimal":
          ipOctets = parseHexIp(ipAddress);
          break;
        case "octal":
          ipOctets = parseOctalIp(ipAddress);
          break;
        case "integer":
          ipOctets = parseIntegerIp(ipAddress);
          break;
      }

      // Validate octets
      if (ipOctets.some((octet) => octet < 0 || octet > 255)) {
        throw new Error("IP address octets must be between 0 and 255");
      }

      // Calculate integer representation
      const intValue = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];

      // Generate all formats
      setResult({
        decimal: ipOctets.join("."),
        binary: ipOctets.map((octet) => octet.toString(2).padStart(8, "0")).join("."),
        hexadecimal: ipOctets.map((octet) => octet.toString(16).padStart(2, "0")).join("."),
        octal: ipOctets.map((octet) => octet.toString(8).padStart(3, "0")).join("."),
        integer: intValue >>> 0, // Ensure unsigned 32-bit integer
      });
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    }
  };

  // Parse functions for different formats
  const parseDecimalIp = (ip: string): number[] => {
    const parts = ip.split(".");
    if (parts.length !== 4) {
      throw new Error("Invalid decimal IP format. Use format: 192.168.1.1");
    }

    return parts.map((part) => {
      const num = Number.parseInt(part, 10);
      if (isNaN(num)) {
        throw new Error("Invalid decimal IP format. All parts must be numbers.");
      }
      return num;
    });
  };

  const parseBinaryIp = (ip: string): number[] => {
    // Handle both with and without dots
    let parts: string[];

    if (ip.includes(".")) {
      parts = ip.split(".");
      if (parts.length !== 4) {
        throw new Error("Invalid binary IP format. Use format: 11000000.10101000.00000001.00000001");
      }

      return parts.map((part) => {
        if (!/^[01]{1,8}$/.test(part)) {
          throw new Error("Invalid binary IP format. Each part must contain only 0s and 1s.");
        }
        return Number.parseInt(part, 2);
      });
    } else {
      // No dots - expect 32 bits
      if (!/^[01]{32}$/.test(ip)) {
        throw new Error("Invalid binary IP format. Without dots, must be exactly 32 bits.");
      }

      return [
        Number.parseInt(ip.substring(0, 8), 2),
        Number.parseInt(ip.substring(8, 16), 2),
        Number.parseInt(ip.substring(16, 24), 2),
        Number.parseInt(ip.substring(24, 32), 2),
      ];
    }
  };

  const parseHexIp = (ip: string): number[] => {
    // Handle both with and without dots, and with/without 0x prefix
    let parts: string[];

    // Remove 0x prefixes if present
    const cleanIp = ip.replace(/0x/gi, "");

    if (cleanIp.includes(".")) {
      parts = cleanIp.split(".");
      if (parts.length !== 4) {
        throw new Error("Invalid hexadecimal IP format. Use format: c0.a8.01.01");
      }

      return parts.map((part) => {
        if (!/^[0-9A-Fa-f]{1,2}$/.test(part)) {
          throw new Error("Invalid hexadecimal IP format. Each part must be a valid hex value.");
        }
        return Number.parseInt(part, 16);
      });
    } else {
      // No dots - expect 8 hex characters
      if (!/^[0-9A-Fa-f]{8}$/.test(cleanIp)) {
        throw new Error("Invalid hexadecimal IP format. Without dots, must be exactly 8 hex characters.");
      }

      return [
        Number.parseInt(cleanIp.substring(0, 2), 16),
        Number.parseInt(cleanIp.substring(2, 4), 16),
        Number.parseInt(cleanIp.substring(4, 6), 16),
        Number.parseInt(cleanIp.substring(6, 8), 16),
      ];
    }
  };

  const parseOctalIp = (ip: string): number[] => {
    const parts = ip.split(".");
    if (parts.length !== 4) {
      throw new Error("Invalid octal IP format. Use format: 300.250.001.001");
    }

    return parts.map((part) => {
      if (!/^[0-7]{1,3}$/.test(part)) {
        throw new Error("Invalid octal IP format. Each part must be a valid octal value.");
      }
      return Number.parseInt(part, 8);
    });
  };

  const parseIntegerIp = (ip: string): number[] => {
    const num = Number.parseInt(ip, 10);
    if (isNaN(num) || num < 0 || num > 4294967295) {
      throw new Error("Invalid integer IP format. Must be a number between 0 and 4294967295.");
    }

    return [(num >>> 24) & 0xff, (num >>> 16) & 0xff, (num >>> 8) & 0xff, num & 0xff];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === "decimal" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("decimal")}
          >
            Decimal
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "binary" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("binary")}
          >
            Binary
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "hexadecimal" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("hexadecimal")}
          >
            Hex
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "octal" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("octal")}
          >
            Octal
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "integer" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("integer")}
          >
            Integer
          </button>
        </div>

        <div className="mb-4">
          {activeTab === "decimal" && (
            <div>
              <label className="block mb-2">Decimal IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 192.168.1.1"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <p className="text-sm text-gray-500 mt-1">Format: 192.168.1.1</p>
            </div>
          )}

          {activeTab === "binary" && (
            <div>
              <label className="block mb-2">Binary IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 11000000.10101000.00000001.00000001"
                className="w-full p-2 border border-gray-300 rounded font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                Format: 11000000.10101000.00000001.00000001 or 11000000101010000000000100000001
              </p>
            </div>
          )}

          {activeTab === "hexadecimal" && (
            <div>
              <label className="block mb-2">Hexadecimal IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. c0.a8.01.01 or c0a80101"
                className="w-full p-2 border border-gray-300 rounded font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">Format: c0.a8.01.01 or c0a80101 or 0xc0.0xa8.0x01.0x01</p>
            </div>
          )}

          {activeTab === "octal" && (
            <div>
              <label className="block mb-2">Octal IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 300.250.001.001"
                className="w-full p-2 border border-gray-300 rounded font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">Format: 300.250.001.001</p>
            </div>
          )}

          {activeTab === "integer" && (
            <div>
              <label className="block mb-2">Integer IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="e.g. 3232235777"
                className="w-full p-2 border border-gray-300 rounded font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">Format: 3232235777</p>
            </div>
          )}
        </div>

        <button
          onClick={convertIp}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Convert IP Address
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Decimal Notation</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {result.decimal}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.decimal)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Binary Notation</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1 overflow-x-auto">
                      {result.binary}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.binary)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Hexadecimal Notation</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {result.hexadecimal}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.hexadecimal)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Octal Notation</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {result.octal}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.octal)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Integer Notation</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {result.integer}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.integer.toString())}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ipv4AddressConverterTool;