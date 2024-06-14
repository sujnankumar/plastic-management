import React, { useState, useEffect } from 'react';

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
  
    useEffect(() => {
      const fetchPlastics = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/get_user_plastics');  // Replace with your API endpoint
          console.log('Plastics:', response.data);
          setPlastics(response.data);  // Update state with fetched data
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

  return (
    <div className="min-h-screen bg-gray-100 p-8 pt-10"> {/* Added pt-20 for top margin */}
        <h1 className="text-3xl font-bold text-center mb-4">Dashboard</h1>

    <h2 className="text-3xl font-bold text-center mb-4">Your Plastics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plastics.map((plastic, index) => (
          <div
            key={index}
            className={`p-6 rounded-lg shadow-lg bg-blue-300 ${getSizeClass('medium')}`} >
            <h2 className="text-xl font-bold mb-2">{plastic.name}</h2>
            <p className="text-gray-700">Plastic ID: {plastic.id}</p>
            <p className="text-gray-700">Description: {plastic.description}</p>
            {/* Add more details as needed */}
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
