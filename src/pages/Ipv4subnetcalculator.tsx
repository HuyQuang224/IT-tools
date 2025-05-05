"use client"

import { useState, useEffect } from 'react';
import { Copy, Calculator, Network } from 'lucide-react';

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
  subnetMask: string;
  wildcardMask: string;
  binarySubnetMask: string;
  cidr: number;
}

const Ipv4SubnetCalculatorTool = () => {
  const [ipAddress, setIpAddress] = useState("");
  const [subnetMask, setSubnetMask] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [subnetInfo, setSubnetInfo] = useState<SubnetInfo | null>(null);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=IPv4 Subnet Calculator');
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

  const isValidSubnetMask = (octets: number[]): boolean => {
    // Combine octets into a 32-bit number
    const mask = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
    
    // Check if mask is contiguous 1s followed by contiguous 0s
    // First, invert the mask
    const inverted = ~mask >>> 0;  // Use >>> 0 to convert to unsigned
    
    // Then check if inverted + 1 is a power of two
    return (inverted & (inverted + 1)) === 0;
  };

  const calculateSubnet = () => {
    setError(null);

    // Validate IP address
    const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = ipAddress.match(ipRegex);

    if (!ipMatch) {
      setError("Invalid IP address format. Please use format: 192.168.1.1");
      return;
    }

    // Check if IP octets are valid (0-255)
    const ipOctets = ipMatch.slice(1).map(Number);
    if (ipOctets.some((octet) => octet < 0 || octet > 255)) {
      setError("IP address octets must be between 0 and 255");
      return;
    }

    // Parse subnet mask (handle both CIDR and dotted decimal)
    let cidr: number;
    let maskOctets: number[];

    if (subnetMask.includes(".")) {
      // Dotted decimal format
      const maskMatch = subnetMask.match(ipRegex);
      if (!maskMatch) {
        setError("Invalid subnet mask format. Use either CIDR (e.g., 24) or dotted decimal (e.g., 255.255.255.0)");
        return;
      }

      maskOctets = maskMatch.slice(1).map(Number);

      // Validate subnet mask octets (0-255)
      if (maskOctets.some((octet) => octet < 0 || octet > 255)) {
        setError("Subnet mask octets must be between 0 and 255");
        return;
      }

      // Validate subnet mask pattern
      if (!isValidSubnetMask(maskOctets)) {
        setError("Invalid subnet mask. Must be a valid subnet mask (e.g., 255.255.255.0)");
        return;
      }

      // Convert to CIDR
      cidr = maskOctets.reduce((acc, octet) => {
        return acc + (octet >>> 0).toString(2).split("1").length - 1;
      }, 0);
    } else {
      // CIDR format
      cidr = Number.parseInt(subnetMask, 10);
      if (isNaN(cidr) || cidr < 0 || cidr > 32) {
        setError("CIDR must be between 0 and 32");
        return;
      }

      // Convert CIDR to dotted decimal
      const fullMask = cidr === 0 ? 0 : 0xffffffff << (32 - cidr);
      maskOctets = [
        (fullMask >>> 24) & 0xff,
        (fullMask >>> 16) & 0xff,
        (fullMask >>> 8) & 0xff,
        fullMask & 0xff
      ];
    }

    // Calculate subnet information
    const ipNumeric = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];
    const maskNumeric = (maskOctets[0] << 24) | (maskOctets[1] << 16) | (maskOctets[2] << 8) | maskOctets[3];
    const networkNumeric = ipNumeric & maskNumeric;
    const broadcastNumeric = networkNumeric | (~maskNumeric >>> 0);

    // Convert back to dotted decimal
    const formatIpAddress = (numeric: number): string => {
      return [
        (numeric >>> 24) & 0xff,
        (numeric >>> 16) & 0xff,
        (numeric >>> 8) & 0xff,
        numeric & 0xff
      ].join(".");
    };

    const networkAddress = formatIpAddress(networkNumeric);
    const broadcastAddress = formatIpAddress(broadcastNumeric);

    // Calculate first and last usable IPs
    const firstUsableIp = cidr >= 31 ? networkAddress : formatIpAddress(networkNumeric + 1);
    const lastUsableIp = cidr >= 31 ? broadcastAddress : formatIpAddress(broadcastNumeric - 1);

    // Calculate total and usable hosts
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : Math.max(0, totalHosts - 2);

    // Format subnet mask and wildcard mask
    const subnetMaskStr = maskOctets.join(".");
    const wildcardMask = maskOctets.map((octet) => 255 - octet).join(".");

    // Binary subnet mask
    const binarySubnetMask = maskOctets
      .map((octet) => (octet >>> 0).toString(2).padStart(8, "0"))
      .join(".");

    setSubnetInfo({
      networkAddress,
      broadcastAddress,
      firstUsableIp,
      lastUsableIp,
      totalHosts,
      usableHosts,
      subnetMask: subnetMaskStr,
      wildcardMask,
      binarySubnetMask,
      cidr,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="space-y-4">
          <div>
            <label className="block mb-2">IP Address</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Subnet Mask or CIDR</label>
            <input
              type="text"
              value={subnetMask}
              onChange={(e) => setSubnetMask(e.target.value)}
              placeholder="e.g. 255.255.255.0 or 24"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter either CIDR notation (e.g., 24) or subnet mask (e.g., 255.255.255.0)
            </p>
          </div>

          <button
            onClick={calculateSubnet}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
          >
            <Calculator className="mr-2 h-4 w-4" />
            Calculate Subnet
          </button>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        {subnetInfo && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">IP Address</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {ipAddress}/{subnetInfo.cidr}
                    </code>
                    <button
                      onClick={() => copyToClipboard(`${ipAddress}/${subnetInfo.cidr}`)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Subnet Mask</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {subnetInfo.subnetMask}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.subnetMask)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Network Address</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {subnetInfo.networkAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.networkAddress)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Broadcast Address</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {subnetInfo.broadcastAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.broadcastAddress)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">First Usable IP</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {subnetInfo.firstUsableIp}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.firstUsableIp)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Last Usable IP</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {subnetInfo.lastUsableIp}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.lastUsableIp)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Total Hosts</label>
                  <p className="font-mono text-sm">{subnetInfo.totalHosts.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Usable Hosts</label>
                  <p className="font-mono text-sm">{subnetInfo.usableHosts.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Wildcard Mask</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1">
                      {subnetInfo.wildcardMask}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.wildcardMask)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">Binary Subnet Mask</label>
                  <div className="flex items-center">
                    <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm flex-1 overflow-x-auto">
                      {subnetInfo.binarySubnetMask}
                    </code>
                    <button
                      onClick={() => copyToClipboard(subnetInfo.binarySubnetMask)}
                      className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
              <div className="flex items-start">
                <Network className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    CIDR /{subnetInfo.cidr} gives you {subnetInfo.usableHosts.toLocaleString()} usable IP addresses.
                    {subnetInfo.cidr >= 31 ? " (Point-to-point link)" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ipv4SubnetCalculatorTool;