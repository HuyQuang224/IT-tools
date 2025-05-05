import React, { useState, useEffect } from 'react';

const StringObfuscator = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [encodeMethod, setEncodeMethod] = useState("base64");
  const [reverseText, setReverseText] = useState(false);
  const [hexFormat, setHexFormat] = useState("escaped");
  const [activeTab, setActiveTab] = useState("encode");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=String Obfuscator');
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

  // Helper functions remain the same as original
  const stringToHex = (str: string, escaped: boolean): string => {
    let result = "";
    for (let i = 0; i < str.length; i++) {
      const hex = str.charCodeAt(i).toString(16);
      result += escaped ? "\\x" + hex.padStart(2, "0") : hex.padStart(2, "0");
    }
    return result;
  };

  const hexToString = (hex: string): string => {
    hex = hex.replace(/\\x/g, "").replace(/\s/g, "");
    let result = "";
    for (let i = 0; i < hex.length; i += 2) {
      result += String.fromCharCode(Number.parseInt(hex.substr(i, 2), 16));
    }
    return result;
  };

  const stringToBinary = (str: string): string => {
    return str
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(" ");
  };

  const binaryToString = (binary: string): string => {
    return binary
      .split(" ")
      .map((bin) => String.fromCharCode(Number.parseInt(bin, 2)))
      .join("");
  };

  const stringToAscii = (str: string): string => {
    return str
      .split("")
      .map((char) => char.charCodeAt(0))
      .join(" ");
  };

  const asciiToString = (ascii: string): string => {
    return ascii
      .split(" ")
      .map((code) => String.fromCharCode(Number.parseInt(code, 10)))
      .join("");
  };

  const rot13 = (str: string): string => {
    return str.replace(/[a-zA-Z]/g, (char) => {
      const code = char.charCodeAt(0);
      const base = code < 91 ? 65 : 97;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  };

  const encodeString = () => {
    if (!input) return;

    let processed = input;
    if (reverseText) processed = processed.split("").reverse().join("");

    try {
      switch (encodeMethod) {
        case "base64": processed = btoa(processed); break;
        case "uri": processed = encodeURIComponent(processed); break;
        case "hex": processed = stringToHex(processed, hexFormat === "escaped"); break;
        case "binary": processed = stringToBinary(processed); break;
        case "ascii": processed = stringToAscii(processed); break;
        case "rot13": processed = rot13(processed); break;
        default: processed = btoa(processed);
      }
      setOutput(processed);
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  const decodeString = () => {
    if (!input) return;

    let processed = input;
    try {
      switch (encodeMethod) {
        case "base64": processed = atob(processed); break;
        case "uri": processed = decodeURIComponent(processed); break;
        case "hex": processed = hexToString(processed); break;
        case "binary": processed = binaryToString(processed); break;
        case "ascii": processed = asciiToString(processed); break;
        case "rot13": processed = rot13(processed); break;
        default: processed = atob(processed);
      }
      if (reverseText) processed = processed.split("").reverse().join("");
      setOutput(processed);
    } catch (error) {
      setOutput(`Error: ${error}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 ${activeTab === 'encode' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('encode')}
          >
            Encode/Obfuscate
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'decode' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveTab('decode')}
          >
            Decode
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">
              {activeTab === 'encode' ? 'Encoding Method' : 'Decoding Method'}
            </label>
            <select
              value={encodeMethod}
              onChange={(e) => setEncodeMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="base64">Base64</option>
              <option value="uri">URL Encoding</option>
              <option value="hex">Hexadecimal</option>
              <option value="binary">Binary</option>
              <option value="ascii">ASCII Values</option>
              <option value="rot13">ROT13</option>
            </select>
          </div>

          {encodeMethod === "hex" && (
            <div>
              <label className="block mb-2">Hex Format</label>
              <select
                value={hexFormat}
                onChange={(e) => setHexFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="escaped">Escaped (\x41\x42\x43)</option>
                <option value="plain">Plain (414243)</option>
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reverse-text"
              checked={reverseText}
              onChange={(e) => setReverseText(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reverse-text">
              {activeTab === 'encode' 
                ? 'Reverse text before encoding' 
                : 'Reverse text after decoding'}
            </label>
          </div>

          <div>
            <label className="block mb-2">
              {activeTab === 'encode' ? 'Text to Encode' : 'Text to Decode'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === 'encode' 
                ? 'Enter text to encode...' 
                : 'Enter encoded text to decode...'}
              className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
            />
          </div>

          <button
            onClick={activeTab === 'encode' ? encodeString : decodeString}
            disabled={!input}
            className={`w-full px-4 py-2 rounded ${!input ? 'bg-gray-400' : 'bg-green-500'} text-white`}
          >
            {activeTab === 'encode' ? 'Encode' : 'Decode'}
          </button>
        </div>

        {output && (
          <div className="mt-6 space-y-2">
            <div className="flex justify-between items-center">
              <label className="block">Result</label>
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Copy
              </button>
            </div>
            <textarea
              value={output}
              readOnly
              className="w-full p-2 border border-gray-300 rounded min-h-[100px] font-mono"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StringObfuscator;