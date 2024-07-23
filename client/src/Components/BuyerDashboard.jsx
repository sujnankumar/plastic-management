import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import axios from '../axios'; // Adjust the import path as needed

const articles = [
  {
    title: 'The Importance of Plastic Recycling',
    content: 'Plastic recycling helps to reduce the environmental impact and conserves resources.',
    bgColor: 'bg-blue-300',
    size: 'large',
  },
  {
    title: 'How to Sort Plastic Waste Effectively',
    content: 'Sorting plastic waste correctly can make the recycling process more efficient.',
    bgColor: 'bg-green-300',
    size: 'small',
  },
  {
    title: 'Innovations in Plastic Management',
    content: 'New technologies are emerging to manage and recycle plastic more effectively.',
    bgColor: 'bg-yellow-300',
    size: 'medium',
  },
  {
    title: 'Plastic Waste in the Oceans',
    content: 'Plastic waste in the oceans is a significant environmental issue that needs to be addressed.',
    bgColor: 'bg-red-300',
    size: 'medium',
  },
  {
    title: 'Community Initiatives for Plastic Reduction',
    content: 'Local communities are taking initiatives to reduce plastic usage and promote recycling.',
    bgColor: 'bg-purple-300',
    size: 'small',
  },
];


const getSizeClass = (size) => {
  switch (size) {
    case 'large':
      return 'col-span-2 row-span-2';
    case 'medium':
      return 'col-span-1 row-span-2';
    case 'small':
    default:
      return 'col-span-1 row-span-1';
  }
};

const BuyerDashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [plastics, setPlastics] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const qrCodeRef = useRef(null); // Ref for QR code scanning container

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlastics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_user_plastics'); // Replace with your API endpoint
        setPlastics(response.data);
      } catch (error) {
        console.error('Error fetching plastics:', error);
      }
    };

    fetchPlastics();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % articles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isScanning) {
      const html5Qr = new Html5Qrcode("qr-code-scanner");
      setHtml5QrCode(html5Qr);

      const config = { fps: 10, qrbox: 250 };
      html5Qr.start(
        { facingMode: "environment" }, // Use environment-facing camera
        config,
        (decodedText, decodedResult) => {
          console.log('QR Scan Data:', decodedText);
          try {
            const retailerId = parseRetailerIdFromQR(decodedText);
            if (retailerId) {
              navigate(`/retailer/${retailerId}/plastics`);
              stopScanning(); // Stop scanning after successful scan
            }
          } catch (error) {
            console.error('Error parsing QR data:', error);
          }
        },
        (error) => {
          console.error('QR scan error:', error);
        }
      ).catch((error) => {
        console.error('Error starting QR code scanner:', error);
      });

      return () => {
        if (html5Qr) {
          html5Qr.stop().catch((error) => {
            console.error('Error stopping QR code scanner:', error);
          });
        }
      };
    }
  }, [isScanning, navigate]);

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
    }
    return null;
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (html5QrCode) {
      html5QrCode.stop().catch((error) => {
        console.error('Error stopping QR code scanner:', error);
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 p-8 pt-10">
      <h1 className="text-3xl font-bold text-center mb-4">Dashboard</h1>

      <button
        onClick={() => setIsScanning(true)}
        className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 mb-8"
      >
        Scan QR Code
      </button>

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

      <h2 className="text-3xl font-bold text-center mb-4">Your Plastics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plastics.map((plastic, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-lg bg-blue-300 ${getSizeClass('medium')}`}
          >
            <h2 className="text-xl font-bold mb-2">{plastic.name}</h2>
            <p className="text-gray-700">Plastic ID: {plastic.id}</p>
            <p className="text-gray-700">Description: {plastic.description}</p>
          </div>
        ))}
      </div>

      <h2 className="text-3xl font-bold text-center mb-4">Recent Articles</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-3">
          <div className="relative w-full h-64 overflow-hidden rounded-lg shadow-lg">
            {articles.map((article, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className={`w-full h-full ${article.bgColor} flex flex-col items-center justify-center p-8 rounded-lg`}>
                  <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
                  <p className="text-gray-700 text-center">{article.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.slice(1).map((article, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-lg ${article.bgColor} ${getSizeClass(article.size)}`}
          >
            <h2 className="text-xl font-bold mb-2">{article.title}</h2>
            <p className="text-gray-700">{article.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerDashboard;
