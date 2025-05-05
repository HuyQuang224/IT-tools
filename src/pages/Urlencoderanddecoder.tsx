"use client"

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';

const UrlEncoderandDecoder = () => {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [activeTab, setActiveTab] = useState<"encode" | "decode">("encode");
    const [toolName, setToolName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const fetchToolDetails = async () => {
            try {
                const response = await fetch('/api/tool-details?name=Url Encoder and Decoder');
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

    const encodeUrl = () => {
        try {
            setOutput(encodeURIComponent(input));
        } catch (error) {
            setOutput(`Error: ${error}`);
        }
    };

    const decodeUrl = () => {
        try {
            setOutput(decodeURIComponent(input));
        } catch (error) {
            setOutput(`Error: ${error}`);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(output);
    };

    useEffect(() => {
        if (input) {
            if (activeTab === "encode") {
                encodeUrl();
            } else {
                decodeUrl();
            }
        } else {
            setOutput("");
        }
    }, [input, activeTab]);

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
            <p className="text-gray-700 mb-6">{description}</p>

            <div className="bg-gray-100 p-4 rounded shadow">
                <div className="flex space-x-4 mb-4">
                    <button
                        className={`px-4 py-2 rounded ${activeTab === "encode" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab("encode")}
                    >
                        Encode URL
                    </button>
                    <button
                        className={`px-4 py-2 rounded ${activeTab === "decode" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        onClick={() => setActiveTab("decode")}
                    >
                        Decode URL
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">
                        {activeTab === "encode" ? "Text to Encode" : "URL to Decode"}
                    </label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            activeTab === "encode"
                                ? "Enter text to encode..."
                                : "Enter URL-encoded text to decode..."
                        }
                        className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
                    />
                </div>

                {output && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block">Result</label>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                            </button>
                        </div>
                        <textarea
                            readOnly
                            value={output}
                            className="w-full p-2 border border-gray-300 rounded min-h-[100px]"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default UrlEncoderandDecoder;