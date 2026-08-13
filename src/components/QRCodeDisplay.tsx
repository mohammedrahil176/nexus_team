import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  url: string;
  name: string;
}

export default function QRCodeDisplay({ url, name }: QRCodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const downloadQR = () => {
    if (!svgRef.current) return;
    
    // Convert SVG to Canvas to download as PNG
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      // Create white background
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${name.replace(/\s+/g, '_')}_QR.png`;
        downloadLink.href = `${pngFile}`;
        downloadLink.click();
      }
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-2 bg-white rounded-lg">
        <QRCodeSVG 
          id="qr-code-svg"
          value={url} 
          size={200} 
          level="H"
          includeMargin={false}
          ref={svgRef}
        />
      </div>
      <button 
        onClick={downloadQR}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Download QR
      </button>
    </div>
  );
}
