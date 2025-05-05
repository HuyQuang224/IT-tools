import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrCodeGenerator = () => {
    const [content, setContent] = useState('https://example.com');
    const [size, setSize] = useState(200);
    const [color, setColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [errorCorrection, setErrorCorrection] = useState('M');
    const [toolName, setToolName] = useState('');
    const [description, setDescription] = useState('');
    const [qrCodeData, setQrCodeData] = useState('');

    useEffect(() => {
        fetchToolDetails();
        generateQrCode();
    }, []);

    const fetchToolDetails = async () => {
        try {
            const res = await fetch('/api/tool-details?name=Qr Code Generator');
            if (!res.ok) throw new Error('Failed to fetch tool details');
            const data = await res.json();
            setToolName(data.name);
            setDescription(data.description);
        } catch (err) {
            console.error('Error fetching tool details:', err);
        }
    };

    const generateQrCode = () => {
        setQrCodeData(content);
    };

    const downloadQrCode = () => {
        const canvas = document.getElementById('qrCodeCanvas') as HTMLCanvasElement;
        if (!canvas) return;
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'qrcode.png';
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
                    <label className="block mb-2 font-semibold">Text or URL</label>
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        placeholder="https://example.com"
                    />
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Size: {size}px</label>
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

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-semibold">QR Code Color</label>
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                    </div>
                    <div>
                        <label className="block mb-2 font-semibold">Background Color</label>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="block mb-2 font-semibold">Error Correction Level</label>
                    <select
                        value={errorCorrection}
                        onChange={(e) => setErrorCorrection(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                    >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                    </select>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={generateQrCode}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Generate QR Code
                    </button>
                    {qrCodeData && (
                        <button
                            onClick={downloadQrCode}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Download
                        </button>
                    )}
                </div>

                {qrCodeData && (
                    <div className="text-center mt-6">
                        <QRCodeCanvas
                            id="qrCodeCanvas"
                            value={qrCodeData}
                            size={size}
                            level={errorCorrection}
                            fgColor={color}
                            bgColor={bgColor}
                            includeMargin={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default QrCodeGenerator;
