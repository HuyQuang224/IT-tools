import React, { useState, useEffect } from "react";
import { Copy, RefreshCw } from "lucide-react";

const DateTimeConverter = () => {
  const [date, setDate] = useState(new Date());
  const [unixTimestamp, setUnixTimestamp] = useState(Math.floor(Date.now() / 1000));
  const [isoString, setIsoString] = useState("");
  const [utcString, setUtcString] = useState("");
  const [localString, setLocalString] = useState("");
  const [customFormat, setCustomFormat] = useState("");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch("/api/tool-details?name=Date-time converter");
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

  useEffect(() => {
    updateFormats(date);
  }, [date]);

interface UpdateFormatsProps {
    (date: Date): void;
}

const updateFormats: UpdateFormatsProps = (date) => {
    setUnixTimestamp(Math.floor(date.getTime() / 1000));
    setIsoString(date.toISOString());
    setUtcString(date.toUTCString());
    setLocalString(date.toString());
    formatCustomDate(date);
};

interface HandleDateChangeEvent {
    target: {
        value: string;
    };
}

const handleDateChange = (e: HandleDateChangeEvent): void => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
        setDate(newDate);
        updateFormats(newDate);
    }
};

interface HandleUnixChangeEvent {
    target: {
        value: string;
    };
}

const handleUnixChange = (e: HandleUnixChangeEvent): void => {
    const timestamp = Number.parseInt(e.target.value);
    if (!isNaN(timestamp)) {
        const newDate = new Date(timestamp * 1000);
        setDate(newDate);
        updateFormats(newDate);
    }
};

interface FormatCustomDateProps {
    (date: Date): void;
}

const formatCustomDate: FormatCustomDateProps = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    setCustomFormat(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
};

  const setNow = () => {
    const now = new Date();
    setDate(now);
    updateFormats(now);
  };

interface CopyToClipboardProps {
    (text: string): void;
}

const copyToClipboard: CopyToClipboardProps = (text) => {
    navigator.clipboard.writeText(text);
};

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Date and Time</label>
          <input
            type="datetime-local"
            value={date.toISOString().slice(0, 16)}
            onChange={handleDateChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Unix Timestamp (seconds)</label>
          <input
            type="number"
            value={unixTimestamp}
            onChange={handleUnixChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">ISO 8601</label>
          <textarea
            readOnly
            value={isoString}
            className="w-full p-2 border border-gray-300 rounded mb-4 font-mono text-sm"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">UTC String</label>
          <textarea
            readOnly
            value={utcString}
            className="w-full p-2 border border-gray-300 rounded mb-4 font-mono text-sm"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Local String</label>
          <textarea
            readOnly
            value={localString}
            className="w-full p-2 border border-gray-300 rounded mb-4 font-mono text-sm"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block mb-2">Custom Format (YYYY-MM-DD HH:MM:SS)</label>
          <textarea
            readOnly
            value={customFormat}
            className="w-full p-2 border border-gray-300 rounded mb-4 font-mono text-sm"
          ></textarea>
        </div>
        <div className="flex justify-between">
          <button
            onClick={setNow}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Set to Current Time
          </button>
          <button
            onClick={() => copyToClipboard(customFormat)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Custom Format
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeConverter;