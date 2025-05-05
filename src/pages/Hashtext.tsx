import React, { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import crypto from "crypto-js"; // Importing crypto-js for additional hash functions

const HashText = () => {
  const [text, setText] = useState("");
  const [algorithm, setAlgorithm] = useState("sha256");
  const [hash, setHash] = useState("");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch("/api/tool-details?name=Hash Text");
        if (!response.ok) {
          throw new Error("Failed to fetch tool details");
        }
        const data = await response.json();
        setToolName(data.name);
        setDescription(data.description);
      } catch (err) {
        console.error("Error fetching tool details:", err);
      }
    };

    fetchToolDetails();
  }, []);

  const generateHash = () => {
    if (!text) return;

    try {
      let hashResult;
      switch (algorithm) {
        case "md5":
          hashResult = crypto.MD5(text).toString();
          break;
        case "sha1":
          hashResult = crypto.SHA1(text).toString();
          break;
        case "sha256":
          hashResult = crypto.SHA256(text).toString();
          break;
        case "sha224":
          hashResult = crypto.SHA224(text).toString();
          break;
        case "sha512":
          hashResult = crypto.SHA512(text).toString();
          break;
        case "sha384":
          hashResult = crypto.SHA384(text).toString();
          break;
        case "sha3":
          hashResult = crypto.SHA3(text).toString();
          break;
        case "ripemd160":
          hashResult = crypto.RIPEMD160(text).toString();
          break;
        default:
          hashResult = crypto.SHA256(text).toString();
      }
      setHash(hashResult);
    } catch (error) {
      setHash(`Error: ${error}`);
    }
  };

  useEffect(() => {
    generateHash(); // Automatically generate hash whenever text or algorithm changes
  }, [text, algorithm]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Hash Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
            <option value="sha224">SHA-224</option>
            <option value="sha512">SHA-512</option>
            <option value="sha384">SHA-384</option>
            <option value="sha3">SHA-3</option>
            <option value="ripemd160">RIPEMD-160</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Text to Hash</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to hash..."
            className="w-full p-2 border border-gray-300 rounded"
          ></textarea>
        </div>
        <textarea
          readOnly
          value={hash}
          className="w-full p-2 border border-gray-300 rounded mb-4 font-mono text-sm"
        ></textarea>
        <div className="flex justify-between">
          <button
            onClick={() => navigator.clipboard.writeText(hash)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default HashText;