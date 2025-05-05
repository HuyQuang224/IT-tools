import React, { useState, useEffect } from 'react';

interface IbanValidationResult {
  valid: boolean;
  country?: string;
  countryCode?: string;
  bankCode?: string;
  branchCode?: string;
  accountNumber?: string;
  checkDigits?: string;
  error?: string;
}

const IbanValidatorParser = () => {
  const [iban, setIban] = useState("");
  const [result, setResult] = useState<IbanValidationResult | null>(null);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  const ibanSpecs: Record<string, { length: number; format: string }> = {
    AD: { length: 24, format: "AD\\d{2}\\d{4}\\d{4}[A-Z0-9]{12}" },
    AE: { length: 23, format: "AE\\d{2}\\d{3}\\d{16}" },
    AL: { length: 28, format: "AL\\d{2}\\d{8}[A-Z0-9]{16}" },
    AT: { length: 20, format: "AT\\d{2}\\d{5}\\d{11}" },
    BA: { length: 20, format: "BA\\d{2}\\d{3}\\d{3}\\d{8}\\d{2}" },
    BE: { length: 16, format: "BE\\d{2}\\d{3}\\d{7}\\d{2}" },
    BG: { length: 22, format: "BG\\d{2}[A-Z]{4}\\d{4}\\d{2}[A-Z0-9]{8}" },
    CH: { length: 21, format: "CH\\d{2}\\d{5}[A-Z0-9]{12}" },
    CY: { length: 28, format: "CY\\d{2}\\d{3}\\d{5}[A-Z0-9]{16}" },
    CZ: { length: 24, format: "CZ\\d{2}\\d{4}\\d{6}\\d{10}" },
    DE: { length: 22, format: "DE\\d{2}\\d{8}\\d{10}" },
    DK: { length: 18, format: "DK\\d{2}\\d{4}\\d{9}\\d{1}" },
    EE: { length: 20, format: "EE\\d{2}\\d{2}\\d{2}\\d{11}\\d{1}" },
    ES: { length: 24, format: "ES\\d{2}\\d{4}\\d{4}\\d{1}\\d{1}\\d{10}" },
    FI: { length: 18, format: "FI\\d{2}\\d{6}\\d{7}\\d{1}" },
    FR: { length: 27, format: "FR\\d{2}\\d{5}\\d{5}[A-Z0-9]{11}\\d{2}" },
    GB: { length: 22, format: "GB\\d{2}[A-Z]{4}\\d{6}\\d{8}" },
    GR: { length: 27, format: "GR\\d{2}\\d{3}\\d{4}[A-Z0-9]{16}" },
    HR: { length: 21, format: "HR\\d{2}\\d{7}\\d{10}" },
    HU: { length: 28, format: "HU\\d{2}\\d{3}\\d{4}\\d{1}\\d{15}\\d{1}" },
    IE: { length: 22, format: "IE\\d{2}[A-Z]{4}\\d{6}\\d{8}" },
    IS: { length: 26, format: "IS\\d{2}\\d{4}\\d{2}\\d{6}\\d{10}" },
    IT: { length: 27, format: "IT\\d{2}[A-Z]\\d{5}\\d{5}[A-Z0-9]{12}" },
    LI: { length: 21, format: "LI\\d{2}\\d{5}[A-Z0-9]{12}" },
    LT: { length: 20, format: "LT\\d{2}\\d{5}\\d{11}" },
    LU: { length: 20, format: "LU\\d{2}\\d{3}[A-Z0-9]{13}" },
    LV: { length: 21, format: "LV\\d{2}[A-Z]{4}[A-Z0-9]{13}" },
    MC: { length: 27, format: "MC\\d{2}\\d{5}\\d{5}[A-Z0-9]{11}\\d{2}" },
    ME: { length: 22, format: "ME\\d{2}\\d{3}\\d{13}\\d{2}" },
    MK: { length: 19, format: "MK\\d{2}\\d{3}[A-Z0-9]{10}\\d{2}" },
    MT: { length: 31, format: "MT\\d{2}[A-Z]{4}\\d{5}[A-Z0-9]{18}" },
    NL: { length: 18, format: "NL\\d{2}[A-Z]{4}\\d{10}" },
    NO: { length: 15, format: "NO\\d{2}\\d{4}\\d{6}\\d{1}" },
    PL: { length: 28, format: "PL\\d{2}\\d{8}\\d{16}" },
    PT: { length: 25, format: "PT\\d{2}\\d{4}\\d{4}\\d{11}\\d{2}" },
    RO: { length: 24, format: "RO\\d{2}[A-Z]{4}[A-Z0-9]{16}" },
    RS: { length: 22, format: "RS\\d{2}\\d{3}\\d{13}\\d{2}" },
    SE: { length: 24, format: "SE\\d{2}\\d{3}\\d{16}\\d{1}" },
    SI: { length: 19, format: "SI\\d{2}\\d{5}\\d{8}\\d{2}" },
    SK: { length: 24, format: "SK\\d{2}\\d{4}\\d{6}\\d{10}" },
    SM: { length: 27, format: "SM\\d{2}[A-Z]\\d{5}\\d{5}[A-Z0-9]{12}" },
  };

  const countryNames: Record<string, string> = {
    AD: "Andorra", AE: "United Arab Emirates", AL: "Albania", AT: "Austria",
    BA: "Bosnia and Herzegovina", BE: "Belgium", BG: "Bulgaria", CH: "Switzerland",
    CY: "Cyprus", CZ: "Czech Republic", DE: "Germany", DK: "Denmark",
    EE: "Estonia", ES: "Spain", FI: "Finland", FR: "France", GB: "United Kingdom",
    GR: "Greece", HR: "Croatia", HU: "Hungary", IE: "Ireland", IS: "Iceland",
    IT: "Italy", LI: "Liechtenstein", LT: "Lithuania", LU: "Luxembourg",
    LV: "Latvia", MC: "Monaco", ME: "Montenegro", MK: "Macedonia", MT: "Malta",
    NL: "Netherlands", NO: "Norway", PL: "Poland", PT: "Portugal", RO: "Romania",
    RS: "Serbia", SE: "Sweden", SI: "Slovenia", SK: "Slovakia", SM: "San Marino",
  };

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Iban Validator and Parser');
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

  const validateIban = () => {
    const cleanedIban = iban.replace(/\s/g, "").toUpperCase();

    if (cleanedIban.length < 2) {
      setResult({
        valid: false,
        error: "IBAN is too short",
      });
      return;
    }

    const countryCode = cleanedIban.substring(0, 2);
    if (!ibanSpecs[countryCode]) {
      setResult({
        valid: false,
        error: `Country code ${countryCode} is not supported or invalid`,
      });
      return;
    }

    if (cleanedIban.length !== ibanSpecs[countryCode].length) {
      setResult({
        valid: false,
        error: `Invalid length for ${countryCode}. Expected ${ibanSpecs[countryCode].length} characters, got ${cleanedIban.length}`,
      });
      return;
    }

    const formatRegex = new RegExp(`^${ibanSpecs[countryCode].format}$`);
    if (!formatRegex.test(cleanedIban)) {
      setResult({
        valid: false,
        error: `Invalid format for ${countryCode}`,
      });
      return;
    }

    const rearranged = cleanedIban.substring(4) + cleanedIban.substring(0, 4);
    let converted = "";
    for (let i = 0; i < rearranged.length; i++) {
      const char = rearranged.charAt(i);
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        converted += (code - 55).toString();
      } else {
        converted += char;
      }
    }

    let remainder = 0;
    for (let i = 0; i < converted.length; i += 7) {
      const chunk = remainder + converted.substring(i, i + 7);
      remainder = Number.parseInt(chunk, 10) % 97;
    }

    if (remainder !== 1) {
      setResult({
        valid: false,
        error: "Invalid IBAN checksum",
      });
      return;
    }

    setResult({
      valid: true,
      country: countryNames[countryCode],
      countryCode,
      checkDigits: cleanedIban.substring(2, 4),
      bankCode: cleanedIban.substring(4, 8),
      branchCode: cleanedIban.substring(8, 12),
      accountNumber: cleanedIban.substring(12),
    });
  };

  const formatIban = (input: string) => {
    const value = input.replace(/\s/g, "");
    return value.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIban(formatIban(e.target.value));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        {/* Input Section */}
        <div className="mb-4">
          <label className="block mb-2">IBAN (International Bank Account Number)</label>
          <input
            type="text"
            value={iban}
            onChange={handleIbanChange}
            placeholder="e.g. DE89 3704 0044 0532 0130 00"
            className="w-full p-2 border border-gray-300 rounded font-mono"
          />
        </div>

        <div className="flex justify-between mb-4">
          <button
            onClick={validateIban}
            disabled={!iban.trim()}
            className={`px-4 py-2 text-white rounded ${!iban.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            Validate IBAN
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-4">
            <div className={`p-3 rounded ${result.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="font-bold">{result.valid ? "✓ Valid IBAN" : "✗ Invalid IBAN"}</div>
              <div>{result.valid ? "The IBAN is valid and follows the correct format." : result.error || "The IBAN is not valid."}</div>
            </div>

            {result.valid && (
              <div className="bg-white p-4 rounded shadow">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Country</span>
                    <p className="font-medium">{result.country}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Country Code</span>
                    <p className="font-medium">{result.countryCode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Check Digits</span>
                    <p className="font-medium">{result.checkDigits}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Bank Code</span>
                    <p className="font-medium">{result.bankCode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Branch Code</span>
                    <p className="font-medium">{result.branchCode}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Account Number</span>
                    <p className="font-medium font-mono">{result.accountNumber}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-100 text-blue-800 rounded">
              <div className="font-bold">Note</div>
              <div className="text-sm">
                This is a basic validation that checks format and checksum. For production use, consider additional
                validation specific to each country's banking system.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IbanValidatorParser;