import React, { useState, useEffect, useRef } from 'react';
import axios from '../axios';
import { Html5Qrcode } from 'html5-qrcode';

const TransferManufacturertoRetailer = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false); // New state for transfer in progress
  const [type1Quantity, setType1Quantity] = useState(0);
  const [type2Quantity, setType2Quantity] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const html5QrCodeRef = useRef(null);
  const scanInProgressRef = useRef(false); // Ref to track if a scan is already in progress

  useEffect(() => {
    if (isScanning) {
      const startScanning = async () => {
        try {
          if (html5QrCodeRef.current) {
            await html5QrCodeRef.current.stop();
          }
          const html5QrCode = new Html5Qrcode("qr-code-scanner");
          html5QrCodeRef.current = html5QrCode;

          const config = { fps: 10, qrbox: 250 };

          const onScanSuccess = async (decodedText) => {
            // Prevent multiple requests for the same scan
            if (scanInProgressRef.current) {
              return;
            }
            scanInProgressRef.current = true;

            try {
              const retailerId = parseRetailerIdFromQR(decodedText);
              if (retailerId) {
                await handleTransferPlastic(retailerId);
              } else {
                setError('Invalid QR code data.');
              }
            } catch (error) {
              console.error('Error processing QR data:', error);
              setError('Error processing QR data.');
            } finally {
              stopScanning();
              scanInProgressRef.current = false; // Reset after processing
            }
          };

          const onScanError = (error) => {
            console.error('QR scan error:', error);
            setError('QR scan error.');
          };

          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanError
          );

        } catch (error) {
          console.error('Error starting QR code scanner:', error);
          setError('Error starting QR code scanner.');
          stopScanning();
        }
      };

      startScanning();

      return () => {
        stopScanning();
      };
    }
  }, [isScanning]);

  const parseRetailerIdFromQR = (data) => {
    console.log('Raw QR data:', data);
    try {
      if (typeof data === 'string') {
        const parts = data.split(':');
        if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
          return parseInt(parts[1], 10);
        }
      }
    } catch (error) {
      console.error('Error parsing data:', error);
      setError('Error parsing QR code data.');
    }
    return null;
  };

  const handleTransferPlastic = async (retailerId) => {
    try {
      if (type1Quantity === 0 && type2Quantity === 0) {
        setMessage('');
        setError('Please specify the quantity of plastics to transfer.');
        return;
      }

      // Check if a transfer is already in progress
      if (isTransferring) {
        return;
      }

      setIsTransferring(true); // Set transfer in progress
      setMessage('Transferring plastics...');
      setError('');

      const response = await axios.post('/api/transfer_plastic/to_recycler', {
        type1_quantity: type1Quantity,
        type2_quantity: type2Quantity,
        retailer_id: retailerId,
      });

      setMessage(response.data.message);
      setError('');

      setType1Quantity(0);
      setType2Quantity(0);
    } catch (error) {
      console.log(error);
      setMessage('');
      setError('Error transferring plastics. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping QR code scanner:', error);
    } finally {
      setIsScanning(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer Plastics to Retailer</h1>

      {isScanning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative p-4 bg-white rounded-lg shadow-lg">
            <button
              onClick={stopScanning}
              className="absolute top-2 right-2 text-black"
              aria-label="Close QR Scanner"
            >
              X
            </button>
            <h2 className="text-xl font-bold mb-4">Scan Retailer QR Code</h2>
            <div id="qr-code-scanner" style={{ width: '300px', height: '300px' }}></div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Specify Quantities</h2>
        <div className="mb-4">
          <label htmlFor="type1-quantity" className="block text-sm font-medium text-gray-700">
            Type 1 Plastic Quantity:
          </label>
          <input
            type="number"
            id="type1-quantity"
            value={type1Quantity}
            onChange={(e) => setType1Quantity(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="type2-quantity" className="block text-sm font-medium text-gray-700">
            Type 2 Plastic Quantity:
          </label>
          <input
            type="number"
            id="type2-quantity"
            value={type2Quantity}
            onChange={(e) => setType2Quantity(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {(type1Quantity > 0 || type2Quantity > 0) && (
          <button
            onClick={() => setIsScanning(true)}
            disabled={isTransferring || isScanning} // Disable button while transferring or scanning
            className={`w-full ${isTransferring || isScanning ? 'bg-gray-400' : 'bg-blue-500'} text-white py-2 px-4 rounded-lg transition duration-300`}
          >
            {isTransferring ? 'Transferring...' : 'Scan Retailer QR Code'}
          </button>
        )}

        {message && (
          <div className="mt-4 text-center text-green-600">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 text-center text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferManufacturertoRetailer;
