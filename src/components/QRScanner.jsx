import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { memberService } from '../services/memberService';
import { useNotification } from '../contexts/NotificationContext';

const QRScanner = ({ isOpen, onClose, onScanSuccess }) => {
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedData, setLastScannedData] = useState('');
  const [scanCooldown, setScanCooldown] = useState(false);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen && hasCamera) {
      startScanner();
    }

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, [isOpen, hasCamera]);

  const startScanner = async () => {
    try {
      if (!videoRef.current) return;

      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        setHasCamera(false);
        showError('No camera found. Please use a device with a camera.');
        return;
      }

      setIsScanning(true);
      
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        handleScanResult,
        {
          onDecodeError: (err) => {
            // Only log meaningful decode errors
            if (err !== 'No QR code found') {
              console.log('Decode error:', err.message || err);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
          maxScansPerSecond: 5, // Increase scan rate
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      console.error('Camera error:', error);
      setHasCamera(false);
      showError('Unable to access camera. Please check camera permissions.');
    }
  };

  const handleScanResult = async (result) => {
    console.log('QR Code detected:', result.data); // Debug log
    
    if (scanCooldown) {
      console.log('Scan cooldown active, ignoring scan');
      return;
    }
    
    if (result.data === lastScannedData) {
      console.log('Duplicate scan detected, ignoring');
      return;
    }

    try {
      setLastScannedData(result.data);
      setScanCooldown(true);
      
      console.log('Processing QR data:', result.data); // Debug log

      // Parse QR code data
      let memberData;
      try {
        memberData = JSON.parse(result.data);
        console.log('Parsed member data:', memberData); // Debug log
      } catch (parseError) {
        console.error('Parse error:', parseError);
        showError('Invalid QR code format - not valid JSON');
        setTimeout(() => setScanCooldown(false), 2000);
        return;
      }

      // Validate required fields
      if (!memberData.id || !memberData.name) {
        console.error('Missing required fields:', { id: memberData.id, name: memberData.name });
        showError('Invalid member QR code - missing ID or name');
        setTimeout(() => setScanCooldown(false), 2000);
        return;
      }

      // Process check-in
      console.log('Calling processCheckIn with:', memberData);
      await processCheckIn(memberData);

    } catch (error) {
      console.error('Scan processing error:', error);
      showError('Check-in failed: ' + error.message);
      setTimeout(() => setScanCooldown(false), 2000);
    }
  };

  const processCheckIn = async (memberData) => {
    try {
      // Call check-in API - use member ID as primary identifier
      const response = await memberService.checkinMember(memberData.id, memberData.name, memberData.phone);
      
      // Use response data from backend (contains calculated fields like status, daysRemaining)
      const backendMemberData = response.member;
      
      // Create success message based on available data
      let successMessage = `Welcome ${backendMemberData.name}!`;
      
      // Add status information if available
      if (backendMemberData.status === 'expiring_soon') {
        successMessage += ` ⚠️ ${backendMemberData.daysRemaining} days remaining`;
      } else if (backendMemberData.status === 'active') {
        successMessage += ` 💚 Active membership`;
      }
      
      showSuccess(successMessage);
      
      // Notify parent component with backend response data
      if (onScanSuccess) {
        onScanSuccess({
          member: backendMemberData, // Use backend data with calculated fields
          checkInTime: new Date(),
          success: true,
          canEnter: response.canEnter,
          warning: response.warning
        });
      }

      // Add success sound (optional)
      playSuccessSound();

      // Close scanner after success
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      if (error.isDuplicate) {
        showError(`⚠️ ${memberData.name} already checked in today`);
      } else {
        throw error;
      }
    } finally {
      // Reset cooldown after processing
      setTimeout(() => {
        setScanCooldown(false);
        setLastScannedData('');
      }, 3000);
    }
  };

  const playSuccessSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // High frequency beep
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const handleManualInput = () => {
    const qrData = prompt('Enter QR code data manually (JSON format):');
    if (qrData) {
      console.log('Manual input received:', qrData);
      handleScanResult({ data: qrData });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">QR Code Scanner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {hasCamera ? (
          <div className="text-center">
            {/* Camera Video */}
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                playsInline
              />
              
              {scanCooldown && (
                <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <div className="font-medium">Processing check-in...</div>
                  </div>
                </div>
              )}
              
              {isScanning && !scanCooldown && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded">
                    📱 Point camera at QR code
                  </div>
                </div>
              )}
            </div>

            {/* Manual Input Button */}
            <button
              onClick={handleManualInput}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors mb-2"
            >
              ⌨️ Enter QR Code Manually
            </button>

            {/* Test QR Button */}
            <button
              onClick={() => {
                const testData = JSON.stringify({
                  id: 1,
                  name: "Test User",
                  membershipType: "Monthly",
                  endDate: "2024-12-31",
                  phone: "081234567890",
                  timestamp: Date.now()
                });
                console.log('Testing with data:', testData);
                handleScanResult({ data: testData });
              }}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors mb-2"
            >
              🧪 Test QR Scanner
            </button>

            <div className="text-xs text-gray-500">
              💡 Make sure the QR code is well-lit and clearly visible
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📷</div>
            <h4 className="font-medium text-gray-900 mb-2">Camera Requires HTTPS</h4>
            <p className="text-gray-500 mb-4">
              Camera access requires HTTPS connection. Use manual QR input or test button below.
            </p>
            
            <div className="space-y-2">
              <button
                onClick={handleManualInput}
                className="w-full px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                ⌨️ Enter QR Code Manually
              </button>
              
              <button
                onClick={() => {
                  const testData = JSON.stringify({
                    id: 1,
                    name: "Test User",
                    membershipType: "Monthly",
                    endDate: "2024-12-31",
                    phone: "081234567890",
                    timestamp: Date.now()
                  });
                  console.log('Testing with data:', testData);
                  handleScanResult({ data: testData });
                }}
                className="w-full px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                🧪 Test Check-in
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;