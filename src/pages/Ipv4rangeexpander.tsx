import React, { useState } from 'react';

const Ipv4RangeExpander = () => {
  const [ipRange, setIpRange] = useState("");
  const [activeTab, setActiveTab] = useState("cidr");
  const [expandedIps, setExpandedIps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIps, setTotalIps] = useState(0);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");
  const ipsPerPage = 100;

  const expandRange = () => {
    setError(null);

    try {
      let startIp: number;
      let endIp: number;

      if (activeTab === "cidr") {
        const cidrMatch = ipRange.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
        if (!cidrMatch) {
          throw new Error("Invalid CIDR format. Use format: 192.168.1.0/24");
        }

        const ipOctets = [
          Number.parseInt(cidrMatch[1], 10),
          Number.parseInt(cidrMatch[2], 10),
          Number.parseInt(cidrMatch[3], 10),
          Number.parseInt(cidrMatch[4], 10),
        ];

        const cidr = Number.parseInt(cidrMatch[5], 10);
        if (cidr < 0 || cidr > 32) {
          throw new Error("CIDR prefix must be between 0 and 32");
        }

        if (ipOctets.some((octet) => octet < 0 || octet > 255)) {
          throw new Error("IP address octets must be between 0 and 255");
        }

        const ipNumeric = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];
        const mask = ~((1 << (32 - cidr)) - 1) & 0xffffffff;

        startIp = ipNumeric & mask;
        endIp = startIp | (~mask & 0xffffffff);
      } else {
        const rangeMatch = ipRange.match(
          /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})-(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
        );
        if (!rangeMatch) {
          throw new Error("Invalid range format. Use format: 192.168.1.1-192.168.1.10");
        }

        const startOctets = [
          Number.parseInt(rangeMatch[1], 10),
          Number.parseInt(rangeMatch[2], 10),
          Number.parseInt(rangeMatch[3], 10),
          Number.parseInt(rangeMatch[4], 10),
        ];

        const endOctets = [
          Number.parseInt(rangeMatch[5], 10),
          Number.parseInt(rangeMatch[6], 10),
          Number.parseInt(rangeMatch[7], 10),
          Number.parseInt(rangeMatch[8], 10),
        ];

        if ([...startOctets, ...endOctets].some((octet) => octet < 0 || octet > 255)) {
          throw new Error("IP address octets must be between 0 and 255");
        }

        startIp = (startOctets[0] << 24) | (startOctets[1] << 16) | (startOctets[2] << 8) | startOctets[3];
        endIp = (endOctets[0] << 24) | (endOctets[1] << 16) | (endOctets[2] << 8) | endOctets[3];

        if (startIp > endIp) {
          throw new Error("Start IP must be less than or equal to end IP");
        }
      }

      const total = endIp - startIp + 1;
      setTotalIps(total);

      if (total > 10000) {
        throw new Error(`Range too large (${total.toLocaleString()} IPs). Maximum allowed is 10,000 IPs.`);
      }

      setCurrentPage(1);
      const ips = generateIpsForPage(startIp, endIp, 1, ipsPerPage);
      setExpandedIps(ips);
    } catch (err) {
      setError((err as Error).message);
      setExpandedIps([]);
      setTotalIps(0);
    }
  };

  const generateIpsForPage = (startIp: number, endIp: number, page: number, perPage: number): string[] => {
    const start = startIp + (page - 1) * perPage;
    const end = Math.min(startIp + page * perPage - 1, endIp);

    const ips: string[] = [];
    for (let i = start; i <= end; i++) {
      ips.push(formatIpAddress(i));
    }

    return ips;
  };

  const formatIpAddress = (numeric: number): string => {
    return [(numeric >>> 24) & 0xff, (numeric >>> 16) & 0xff, (numeric >>> 8) & 0xff, numeric & 0xff].join(".");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > Math.ceil(totalIps / ipsPerPage)) return;

    setCurrentPage(newPage);

    try {
      let startIp: number;
      let endIp: number;

      if (activeTab === "cidr") {
        const cidrMatch = ipRange.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
        if (!cidrMatch) return;

        const ipOctets = [
          Number.parseInt(cidrMatch[1], 10),
          Number.parseInt(cidrMatch[2], 10),
          Number.parseInt(cidrMatch[3], 10),
          Number.parseInt(cidrMatch[4], 10),
        ];

        const cidr = Number.parseInt(cidrMatch[5], 10);
        const ipNumeric = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];
        const mask = ~((1 << (32 - cidr)) - 1) & 0xffffffff;

        startIp = ipNumeric & mask;
        endIp = startIp | (~mask & 0xffffffff);
      } else {
        const rangeMatch = ipRange.match(
          /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})-(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
        );
        if (!rangeMatch) return;

        const startOctets = [
          Number.parseInt(rangeMatch[1], 10),
          Number.parseInt(rangeMatch[2], 10),
          Number.parseInt(rangeMatch[3], 10),
          Number.parseInt(rangeMatch[4], 10),
        ];

        const endOctets = [
          Number.parseInt(rangeMatch[5], 10),
          Number.parseInt(rangeMatch[6], 10),
          Number.parseInt(rangeMatch[7], 10),
          Number.parseInt(rangeMatch[8], 10),
        ];

        startIp = (startOctets[0] << 24) | (startOctets[1] << 16) | (startOctets[2] << 8) | startOctets[3];
        endIp = (endOctets[0] << 24) | (endOctets[1] << 16) | (endOctets[2] << 8) | endOctets[3];
      }

      const ips = generateIpsForPage(startIp, endIp, newPage, ipsPerPage);
      setExpandedIps(ips);
    } catch (err) {
      // Silently fail
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllIps = () => {
    navigator.clipboard.writeText(expandedIps.join("\n"));
  };

  const downloadIps = () => {
    const blob = new Blob([expandedIps.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ip-range.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  React.useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=IPv4 Range Expander');
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

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex mb-4">
          <button
            className={`px-4 py-2 ${activeTab === "cidr" ? "bg-blue-500 text-white" : "bg-white"}`}
            onClick={() => setActiveTab("cidr")}
          >
            CIDR Notation
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "range" ? "bg-blue-500 text-white" : "bg-white"}`}
            onClick={() => setActiveTab("range")}
          >
            IP Range
          </button>
        </div>

        {activeTab === "cidr" ? (
          <div className="mb-4">
            <label className="block mb-2">CIDR Range</label>
            <input
              type="text"
              value={ipRange}
              onChange={(e) => setIpRange(e.target.value)}
              placeholder="e.g. 192.168.1.0/24"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">Format: 192.168.1.0/24</p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block mb-2">IP Range</label>
            <input
              type="text"
              value={ipRange}
              onChange={(e) => setIpRange(e.target.value)}
              placeholder="e.g. 192.168.1.1-192.168.1.10"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">Format: 192.168.1.1-192.168.1.10</p>
          </div>
        )}

        <button
          onClick={expandRange}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
        >
          Expand IP Range
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {expandedIps.length > 0 && (
          <div className="border rounded-md p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">Expanded IPs</h3>
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * ipsPerPage + 1}-{Math.min(currentPage * ipsPerPage, totalIps)} of{" "}
                  {totalIps.toLocaleString()} IPs
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={copyAllIps}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Copy All
                </button>
                <button
                  onClick={downloadIps}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="h-[300px] overflow-y-auto border rounded-md mb-4">
              <div className="p-2">
                {expandedIps.map((ip, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border-b last:border-0">
                    <code className="font-mono">{ip}</code>
                    <button
                      onClick={() => copyToClipboard(ip)}
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {totalIps > ipsPerPage && (
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${currentPage === 1 ? "bg-gray-200" : "bg-blue-500 text-white"}`}
                >
                  Previous
                </button>

                <span className="text-sm">
                  Page {currentPage} of {Math.ceil(totalIps / ipsPerPage)}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(totalIps / ipsPerPage)}
                  className={`px-3 py-1 rounded ${currentPage === Math.ceil(totalIps / ipsPerPage) ? "bg-gray-200" : "bg-blue-500 text-white"}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Ipv4RangeExpander;