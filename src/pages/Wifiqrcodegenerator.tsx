import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const WifiQrCodeGenerator = () => {
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [encryption, setEncryption] = useState('WPA');
    const [hidden, setHidden] = useState(false);
    const [size, setSize] = useState(200);
    const [toolName, setToolName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchToolDetails();
    }, []);

    const fetchToolDetails = async () => {
        try {
            const res = await fetch('/api/tool-details?name=Wifi Qr Code Generator');
            if (!res.ok) throw new Error('Failed to fetch tool details');
            const data = await res.json();
            setToolName(data.name);
            setDescription(data.description);
        } catch (err) {
            console.error('Error fetching tool details:', err);
        }
    };

    const getWifiString = () => {
        return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? 'true' : 'false'};;`;
    };

    const downloadQrCode = () => {
        const canvas = document.getElementById('qrCodeCanvas') as HTMLCanvasElement;
        if (!canvas) return;
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `wifi-${ssid}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
            <p className="text-gray-700 mb-6">{description}</p>

            <div className="bg-gray-100 p-6 rounded shadow space-y-6">
                <div>
                    <label className="block mb-2 font-semibold">WiFi Network Name (SSID)</label>
                    <input
                        type="text"
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter WiFi name"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="Enter WiFi password"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Encryption Type</label>
                    <select
                        value={encryption}
                        onChange={(e) => setEncryption(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="WPA">WPA/WPA2/WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No Password</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        id="hidden"
                        type="checkbox"
                        checked={hidden}
                        onChange={(e) => setHidden(e.target.checked)}
                    />
                    <label htmlFor="hidden" className="font-semibold">Hidden Network</label>
                </div>

                <div>
                    <label className="block mb-2 font-semibold">QR Code Size: {size}px</label>
                    <input
                        type="range"
                        min="100"
                        max="500"
                        step="10"
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="flex justify-between">
                    {ssid && (
                        <button
                            onClick={downloadQrCode}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Download
                        </button>
                    )}
                </div>

                {ssid && (
                    <div className="text-center mt-6">
                        <QRCodeCanvas
                            id="qrCodeCanvas"
                            value={getWifiString()}
                            size={size}
                            level="M"
                            includeMargin={true}
                        />
                        <p className="text-sm mt-2 text-gray-600">Scan to connect to "{ssid}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WifiQrCodeGenerator;
