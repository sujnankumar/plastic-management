import React from 'react';

const rewards = [
  {
    title: '10% Off on Next Purchase',
    image: 'https://via.placeholder.com/150',
    rewardPoints: 100,
  },
  {
    title: 'Free Coffee',
    image: 'https://via.placeholder.com/150',
    rewardPoints: 200,
  },
  {
    title: 'Gift Card',
    image: 'https://via.placeholder.com/150',
    rewardPoints: 300,
  },
  {
    title: 'Free T-Shirt',
    image: 'https://via.placeholder.com/150',
    rewardPoints: 400,
  },
  {
    title: 'Best Reward',
    image: 'https://via.placeholder.com/150',
    rewardPoints: 500,
  },
  // Add more rewards as needed
];

const availablePoints = 350;

const RewardsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen px-8 py-10 w-full mt-10">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Rewards</h1>
          <div className="flex items-center">
            <span className="text-lg mr-2">Available Points:</span>
            <div className="flex items-center bg-yellow-300 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
              <span className="text-lg font-bold text-yellow-800 pl-2">{availablePoints}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => {
            const requiredPoints = reward.rewardPoints;
            const canRedeem = availablePoints >= requiredPoints;
            const progress = (availablePoints / requiredPoints) * 100;

            return (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                <img src={reward.image} alt={reward.title} className="w-full h-56 object-cover" />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">{reward.title}</h2>
                  {!canRedeem && (
                    <div className="mb-4">
                      <div className="relative h-2 bg-gray-200 rounded">
                        <div
                          style={{ width: `${progress}%` }}
                          className="absolute top-0 left-0 h-full bg-green-500 rounded"
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{availablePoints} / {requiredPoints} Points</p>
                    </div>
                  )}
                  <a href={canRedeem ? '#' : '/redeem'} className={`block text-center py-2 px-4 rounded-lg ${canRedeem ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>{canRedeem ? 'Redeem' : 'Insufficient Points'}</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
