import React, { useState, useEffect } from 'react';

const SvgPlaceholderGenerator = () => {
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);
  const [text, setText] = useState('300×200');
  const [bgColor, setBgColor] = useState('#e2e8f0');
  const [textColor, setTextColor] = useState('#64748b');
  const [svgCode, setSvgCode] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'svg' | 'dataurl'>('svg');
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchToolDetails();
    generateSvg();
  }, []);

  const fetchToolDetails = async () => {
    try {
      const res = await fetch('/api/tool-details?name=SVG Placeholder Generator');
      if (!res.ok) throw new Error('Failed to fetch tool details');
      const data = await res.json();
      setToolName(data.name);
      setDescription(data.description);
    } catch (err) {
      console.error('Error fetching tool details:', err);
    }
  };

  const generateSvg = () => {
    const displayText = text || `${width}×${height}`;
    const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}" />
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="24" 
    text-anchor="middle" 
    dominant-baseline="middle" 
    fill="${textColor}">${displayText}</text>
</svg>`;
    setSvgCode(svg);

    const encoded = encodeURIComponent(svg);
    setDataUrl(`data:image/svg+xml;charset=UTF-8,${encoded}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadSvg = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `placeholder-${width}x${height}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>

      <div className="bg-gray-100 p-6 rounded shadow space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold">Width (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              min={1}
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Height (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              min={1}
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Display Text (optional)</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={`${width}×${height}`}
          />
          <p className="text-sm text-gray-500 mt-1">Leave blank to show dimensions</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-semibold">Background Color</label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Text Color</label>
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full h-10"
            />
          </div>
        </div>

        <button
          onClick={generateSvg}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Generate SVG Placeholder
        </button>
      </div>

      {dataUrl && (
        <div className="bg-gray-50 p-6 rounded shadow mt-6 space-y-6">
          <div className="text-center">
            <img src={dataUrl} alt="SVG Preview" className="mx-auto border rounded" />
          </div>

          <div className="flex gap-4 mb-4">
            <button
              className={`px-4 py-2 rounded ${activeTab === 'svg' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
              onClick={() => setActiveTab('svg')}
            >
              SVG Code
            </button>
            <button
              className={`px-4 py-2 rounded ${activeTab === 'dataurl' ? 'bg-blue-600 text-white' : 'bg-white border'}`}
              onClick={() => setActiveTab('dataurl')}
            >
              Data URL
            </button>
          </div>

          {activeTab === 'svg' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">SVG Code</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => copyToClipboard(svgCode)}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Copy
                  </button>
                  <button
                    onClick={downloadSvg}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={svgCode}
                className="w-full p-2 border border-gray-300 rounded font-mono min-h-[150px]"
              />
            </div>
          )}

          {activeTab === 'dataurl' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">Data URL</h2>
                <button
                  onClick={() => copyToClipboard(dataUrl)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Copy
                </button>
              </div>
              <textarea
                readOnly
                value={dataUrl}
                className="w-full p-2 border border-gray-300 rounded font-mono min-h-[150px]"
              />
              <p className="text-sm text-gray-500 mt-2">
                You can use this data URL in an &lt;img&gt; tag or CSS background-image.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SvgPlaceholderGenerator;
