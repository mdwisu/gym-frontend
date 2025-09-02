import React, { useState } from 'react';
import QRCode from 'react-qr-code';

const MemberQRCode = ({ member, isOpen, onClose }) => {
  const [showPrint, setShowPrint] = useState(false);

  if (!isOpen || !member) return null;

  // QR Code data - JSON string with member info
  const qrData = JSON.stringify({
    id: member.id,
    name: member.name,
    membershipType: member.membershipType,
    endDate: member.endDate,
    phone: member.phone || '',
    timestamp: Date.now()
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const qrElement = document.getElementById('qr-code-print');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${member.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 0;
              background: white;
            }
            
            /* Portrait QR Print Size */
            @page {
              size: 80mm 120mm;
              margin: 5mm;
            }
            
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              text-align: center;
              padding: 10mm;
            }
            
            .qr-code {
              margin: 10mm 0;
              width: 60mm;
              height: 60mm;
            }
            
            .member-info {
              margin-bottom: 5mm;
            }
            
            .member-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 2mm;
            }
            
            .member-id {
              font-size: 12px;
              color: #666;
            }
            
            .instruction {
              font-size: 10px;
              color: #888;
              margin-top: 5mm;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <div class="member-info">
              <div class="member-name">${member.name}</div>
              <div class="member-id">Member ID: #${member.id}</div>
            </div>
            
            <div class="qr-code">
              ${qrElement.innerHTML}
            </div>
            
            <div class="instruction">
              Scan for gym check-in
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Member QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="text-center">
          {/* Member Info - Minimal */}
          <div className="mb-4">
            <div className="font-medium text-lg text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500">Member ID: #{member.id}</div>
          </div>

          {/* QR Code Only */}
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4" id="qr-code-print">
            <QRCode
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrData}
              viewBox={`0 0 200 200`}
            />
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Scan for gym check-in
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              🖨️ Print QR Card
            </button>
            <button
              onClick={() => {
                // Copy QR data to clipboard
                navigator.clipboard.writeText(qrData).then(() => {
                  alert('QR data copied to clipboard!');
                });
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              📋 Copy Data
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-400">
            💡 Tip: Print this card for the member to carry, or save the QR code image to their phone
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberQRCode;