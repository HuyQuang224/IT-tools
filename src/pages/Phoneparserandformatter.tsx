import React, { useState, useEffect } from 'react';

interface PhoneParseResult {
  original: string;
  countryCode: string;
  nationalNumber: string;
  formattedNational: string;
  formattedInternational: string;
  formattedE164: string;
  isValid: boolean;
  countryName?: string;
}

const PhoneParserFormatter = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [defaultCountry, setDefaultCountry] = useState("US");
  const [result, setResult] = useState<PhoneParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  const countries = [
    { code: "US", name: "United States", dialCode: "+1" },
    { code: "GB", name: "United Kingdom", dialCode: "+44" },
    { code: "CA", name: "Canada", dialCode: "+1" },
    { code: "AU", name: "Australia", dialCode: "+61" },
    { code: "DE", name: "Germany", dialCode: "+49" },
    { code: "FR", name: "France", dialCode: "+33" },
    { code: "JP", name: "Japan", dialCode: "+81" },
    { code: "CN", name: "China", dialCode: "+86" },
    { code: "IN", name: "India", dialCode: "+91" },
    { code: "BR", name: "Brazil", dialCode: "+55" },
    { code: "RU", name: "Russia", dialCode: "+7" },
    { code: "MX", name: "Mexico", dialCode: "+52" },
    { code: "ES", name: "Spain", dialCode: "+34" },
    { code: "IT", name: "Italy", dialCode: "+39" },
    { code: "KR", name: "South Korea", dialCode: "+82" },
  ];

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Phone Parser and Formatter');
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

  const parsePhoneNumber = () => {
    setError(null);

    try {
      if (!phoneNumber.trim()) {
        throw new Error("Please enter a phone number");
      }

      let parsedNumber = phoneNumber.trim();
      let countryCode = "";
      let nationalNumber = "";
      let isValid = false;

      if (parsedNumber.startsWith("+")) {
        for (const country of countries) {
          if (parsedNumber.startsWith(country.dialCode)) {
            countryCode = country.code;
            nationalNumber = parsedNumber.substring(country.dialCode.length).trim();
            break;
          }
        }
      } else {
        countryCode = defaultCountry;
        nationalNumber = parsedNumber;

        const country = countries.find((c) => c.code === defaultCountry);
        if (country) {
          parsedNumber = `${country.dialCode}${parsedNumber}`;
        }
      }

      nationalNumber = nationalNumber.replace(/\D/g, "");
      isValid = nationalNumber.length >= 7 && nationalNumber.length <= 15;

      let formattedNational = nationalNumber;
      let formattedInternational = parsedNumber;
      let formattedE164 = parsedNumber.replace(/\D/g, "");

      if (countryCode === "US" && nationalNumber.length === 10) {
        formattedNational = `(${nationalNumber.substring(0, 3)}) ${nationalNumber.substring(3, 6)}-${nationalNumber.substring(6)}`;
        formattedInternational = `+1 ${formattedNational}`;
        formattedE164 = `+1${nationalNumber}`;
      }

      const countryName = countries.find((c) => c.code === countryCode)?.name;

      setResult({
        original: phoneNumber,
        countryCode,
        nationalNumber,
        formattedNational,
        formattedInternational,
        formattedE164,
        isValid,
        countryName,
      });
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        {/* Input Section */}
        <div className="mb-4">
          <label className="block mb-2">Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. +1 (555) 123-4567 or 555-123-4567"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <p className="text-sm text-gray-500">
            Enter a phone number in any format. Include the country code or select a default country below.
          </p>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Default Country</label>
          <select
            value={defaultCountry}
            onChange={(e) => setDefaultCountry(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.dialCode})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between mb-4">
          <button
            onClick={parsePhoneNumber}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Parse Phone Number
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Validation Result</span>
                <p className={`font-medium ${result.isValid ? "text-green-600" : "text-red-600"}`}>
                  {result.isValid ? "Valid phone number" : "Invalid phone number"}
                </p>
              </div>
              {result.countryName && (
                <div>
                  <span className="text-sm text-gray-500">Country</span>
                  <p className="font-medium">
                    {result.countryName} ({result.countryCode})
                  </p>
                </div>
              )}
            </div>

            <div>
              <span className="text-sm text-gray-500">E.164 Format (for APIs)</span>
              <div className="flex items-center mt-1">
                <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                  {result.formattedE164}
                </code>
                <button
                  onClick={() => copyToClipboard(result.formattedE164)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">International Format</span>
              <div className="flex items-center mt-1">
                <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                  {result.formattedInternational}
                </code>
                <button
                  onClick={() => copyToClipboard(result.formattedInternational)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-500">National Format</span>
              <div className="flex items-center mt-1">
                <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                  {result.formattedNational}
                </code>
                <button
                  onClick={() => copyToClipboard(result.formattedNational)}
                  className="ml-2 p-1 text-gray-500 hover:text-gray-700"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mt-4 p-2 bg-blue-100 text-blue-700 rounded flex items-start">
              <span className="mr-2">ℹ️</span>
              <p className="text-sm">
                Note: This is a simplified phone parser. For production use, consider using a library like
                libphonenumber-js for more accurate parsing and validation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneParserFormatter;