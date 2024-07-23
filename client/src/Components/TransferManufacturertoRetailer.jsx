import React, { useState, useEffect, useRef } from 'react';
import axios from '../axios';
import { Html5Qrcode } from 'html5-qrcode';

const TransferManufacturertoRetailer = () => {
  const [manufacturerId, setManufacturerId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [type1Quantity, setType1Quantity] = useState(0);
  const [type2Quantity, setType2Quantity] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(''); // State for errors
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    const fetchManufacturerId = async () => {
      try {
        const response = await axios.get('/api/get_manufacturer_id');
        setManufacturerId(response.data.manufacturer_id);
      } catch (error) {
        console.error('Error fetching manufacturer ID:', error);
        setError('Error fetching manufacturer ID.');
      }
    };

    fetchManufacturerId();
  }, []);

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
          stopScanning();  // Ensure scanning is stopped on error
        }
      };

      startScanning();

      return () => {
        stopScanning();  // Cleanup on component unmount or scanner state change
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

      // Show a loading message while transferring
      setMessage('Transferring plastics...');
      setError('');

      const response = await axios.post('/api/transfer_plastic/to_retailer', {
        type1_quantity: type1Quantity,
        type2_quantity: type2Quantity,
        retailer_id: retailerId,
      });

      // Show success message
      setMessage(response.data.message);
      setError('');  // Clear error if transfer is successful
    } catch (error) {
      setMessage('');
      setError('Error transferring plastics. Please try again.');
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null; // Clear reference to avoid issues
      }
    } catch (error) {
      console.error('Error stopping QR code scanner:', error);
    } finally {
      setIsScanning(false); // Update state to indicate scanning has stopped
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
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Scan Retailer QR Code
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
