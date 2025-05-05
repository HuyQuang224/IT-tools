"use client"

import { useState, useEffect } from 'react';
import { Copy } from 'lucide-react';

const UrlParserTool = () => {
    const [url, setUrl] = useState("");
    const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
    const [error, setError] = useState("");
    const [toolName, setToolName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        const fetchToolDetails = async () => {
            try {
                const response = await fetch('/api/tool-details?name=Url Parser');
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

    const parseUrl = () => {
        setError("");
        try {
            if (!url.trim()) {
                setParsedUrl(null);
                return;
            }

            const urlObj = new URL(url);
            setParsedUrl(urlObj);
        } catch (err) {
            setError("Invalid URL. Please enter a valid URL including the protocol (e.g., https://)");
            setParsedUrl(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    useEffect(() => {
        if (url.trim()) {
            parseUrl();
        } else {
            setParsedUrl(null);
            setError("");
        }
    }, [url]);

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
            <p className="text-gray-700 mb-6">{description}</p>

            <div className="bg-gray-100 p-4 rounded shadow">
                <div className="mb-4">
                    <label className="block mb-2">URL to Parse</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/path?query=value"
                            className="flex-1 p-2 border border-gray-300 rounded"
                        />
                        <button
                            onClick={parseUrl}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Parse
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                {parsedUrl && (
                    <div className="space-y-4">
                        <div className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center mb-2">
                                <label>Protocol</label>
                                <button
                                    onClick={() => copyToClipboard(parsedUrl.protocol)}
                                    className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <input
                                type="text"
                                value={parsedUrl.protocol}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center mb-2">
                                <label>Hostname</label>
                                <button
                                    onClick={() => copyToClipboard(parsedUrl.hostname)}
                                    className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <input
                                type="text"
                                value={parsedUrl.hostname}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center mb-2">
                                <label>Port</label>
                                <button
                                    onClick={() => copyToClipboard(parsedUrl.port || "")}
                                    className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <input
                                type="text"
                                value={parsedUrl.port || "(default)"}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center mb-2">
                                <label>Pathname</label>
                                <button
                                    onClick={() => copyToClipboard(parsedUrl.pathname)}
                                    className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <input
                                type="text"
                                value={parsedUrl.pathname}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center mb-2">
                                <label>Search (Query String)</label>
                                <button
                                    onClick={() => copyToClipboard(parsedUrl.search)}
                                    className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <input
                                type="text"
                                value={parsedUrl.search || "(none)"}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>

                        <div className="p-4 bg-white rounded shadow">
                            <div className="flex justify-between items-center mb-2">
                                <label>Hash (Fragment)</label>
                                <button
                                    onClick={() => copyToClipboard(parsedUrl.hash)}
                                    className="flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Copy
                                </button>
                            </div>
                            <input
                                type="text"
                                value={parsedUrl.hash || "(none)"}
                                readOnly
                                className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UrlParserTool;