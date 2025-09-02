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
          <title>Member QR Code - ${member.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
              margin: 0;
            }
            .qr-card {
              border: 2px solid #333;
              border-radius: 10px;
              padding: 20px;
              margin: 20px auto;
              max-width: 300px;
              background: white;
            }
            .member-info { 
              margin: 15px 0; 
              line-height: 1.4;
            }
            .member-name { 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 5px;
            }
            .member-id { 
              color: #666; 
              font-size: 14px;
            }
            .qr-code { 
              margin: 15px 0;
            }
            @media print {
              body { margin: 0; }
              .qr-card { margin: 0; border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="member-info">
              <div class="member-name">${member.name}</div>
              <div class="member-id">ID: #${member.id} | ${member.membershipType}</div>
              <div class="member-id">Valid until: ${new Date(member.endDate).toLocaleDateString('id-ID')}</div>
            </div>
            <div class="qr-code">
              ${qrElement.innerHTML}
            </div>
            <div style="font-size: 12px; color: #888; margin-top: 10px;">
              Scan this QR code for gym check-in
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
          {/* Member Info */}
          <div className="mb-4">
            <div className="font-medium text-lg text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-500">
              ID: #{member.id} | {member.membershipType}
            </div>
            <div className="text-sm text-gray-500">
              Valid until: {new Date(member.endDate).toLocaleDateString('id-ID')}
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4" id="qr-code-print">
            <QRCode
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={qrData}
              viewBox={`0 0 200 200`}
            />
          </div>

          <div className="text-xs text-gray-500 mb-4">
            Scan this QR code for gym check-in
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