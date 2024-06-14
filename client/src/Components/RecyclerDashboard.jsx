import { useState, useRef, useEffect } from 'react';
import { MdAddCircle, MdAttachMoney, MdReply } from 'react-icons/md';

const RecyclerDashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const symbolRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (symbolRef.current && !symbolRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 w-full">
      <h1 className="text-2xl font-bold mb-8">Recycler Dashboard</h1>
      <div className="relative">
        <div
          ref={symbolRef}
          className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer transition duration-300 transform hover:scale-110"
          onClick={toggleExpand}
        >
          <MdAddCircle size={28} />
        </div>
        {isExpanded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center space-x-4 p-4 rounded-lg shadow-lg">
            <button className="flex items-center justify-center w-40 h-20 bg-green-500 text-white rounded-lg hover:bg-green-700 transition duration-300">
              <MdAddCircle size={24} className="mr-2" />
              Add to Inventory
            </button>
            <button className="flex items-center justify-center w-40 h-20 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300">
              <MdAttachMoney size={24} className="mr-2" />
              Sell
            </button>
            <button className="flex items-center justify-center w-40 h-20 bg-red-500 text-white rounded-lg hover:bg-red-700 transition duration-300">
              <MdReply size={24} className="mr-2" />
              Take Back from User
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecyclerDashboard;
