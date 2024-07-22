import React from "react";
import { FaLeaf, FaCoins, FaGift } from "react-icons/fa";
const availablePoints = 250;

const rewards = [
    {
        title: "10% Off on Next Purchase",
        image: "https://www.shutterstock.com/image-vector/sale-special-offer-10-off-260nw-572209672.jpg",
        rewardPoints: 100,
    },
    {
        title: "Free T-Shirt",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkOkofo8lAPTqBA9ML6slnp1NqHVvJPD648Q&s",
        rewardPoints: 400,
    },
    {
        title: "Gift Card",
        image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvprsXR6nEohsAOCMAM2N9qMLbYy13z69ugQ&s",
        rewardPoints: 300,
    },
    {
        title: "Free Coffee",
        image: "https://images.pexels.com/photos/111159/pexels-photo-111159.jpeg?cs=srgb&dl=pexels-conojeghuo-111159.jpg&fm=jpg",
        rewardPoints: 200,
    },
    {
        title: "Best Reward",
        image: "https://news8northeast.com/wp-content/uploads/2024/03/amazon-seller-reward-india-seller-central-news8northeast-1024x830.jpg",
        rewardPoints: 500,
    },
];
import { FaTrophy, FaShoppingCart, FaQuestionCircle } from "react-icons/fa";

const rewards2 = [
    {
        id: 1,
        title: "Daily Set",
        description: "Complete daily tasks to earn points.",
        points: 10,
        icon: <FaTrophy className="text-yellow-500 text-3xl" />,
    },
    {
        id: 2,
        title: "Quiz",
        description: "Take a quiz and earn points.",
        points: 30,
        icon: <FaQuestionCircle className="text-blue-500 text-3xl" />,
    },
    {
        id: 3,
        title: "Shopping",
        description: "Shop at our partners and earn points.",
        points: 50,
        icon: <FaShoppingCart className="text-green-500 text-3xl" />,
    },
    {
        id: 4,
        title: "Survey",
        description: "Complete surveys to earn points.",
        points: 20,
        icon: <FaQuestionCircle className="text-purple-500 text-3xl" />,
    },
];
const Rewards = () => {
    return (
        <div className="w-full bg-gray-100 p-10">
            <div className="p-4">
                <header className="rounded-md">
                    <div className="p-4">
                        <header className="rounded-md mb-4 flex items-center">
                            <span className="text-3xl text-gray-800">
                                Good Morning
                            </span>
                            <h1 className="text-4xl font-bold ml-2 text-gray-800">
                                Manik,
                            </h1>
                        </header>
                        <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white shadow-md rounded-md p-6 flex items-center">
                                <FaCoins className="text-green-500 text-3xl mr-4" />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        Available Points
                                    </h2>
                                    <p className="text-3xl font-bold text-green-500">
                                        120
                                    </p>
                                    <button className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center">
                                        Redeem Points{" "}
                                        <FaLeaf className="ml-2" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white shadow-md rounded-md p-6 flex items-center">
                                <FaGift className="text-green-500 text-3xl mr-4" />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        Points Earned Today
                                    </h2>
                                    <p className="text-3xl font-bold text-green-500">
                                        120
                                    </p>
                                    <button className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded-md hover:bg-green-600 flex items-center justify-center">
                                        Bonuses
                                    </button>
                                </div>
                            </div>
                        </main>
                    </div>
                </header>
                <div className="min-h-screen w-full p-4">
                    <div className="">
                        <div className="flex justify-between items-center mb-8 mt-8">
                            <h3 className="text-2xl font-semibold">Rewards</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rewards.map((reward, index) => {
                                const requiredPoints = reward.rewardPoints;
                                const canRedeem =
                                    availablePoints >= requiredPoints;
                                const progress =
                                    (availablePoints / requiredPoints) * 100;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105"
                                    >
                                        <img
                                            src={reward.image}
                                            alt={reward.title}
                                            className="w-full h-56 object-cover"
                                        />
                                        <div className="p-6">
                                            <h2 className="text-xl font-semibold mb-4">
                                                {reward.title}
                                            </h2>
                                            {!canRedeem && (
                                                <div className="mb-4">
                                                    <div className="relative h-2 bg-gray-200 rounded">
                                                        <div
                                                            style={{
                                                                width: `${progress}%`,
                                                            }}
                                                            className="absolute top-0 left-0 h-full bg-green-500 rounded"
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-2">
                                                        {availablePoints} /{" "}
                                                        {requiredPoints} Points
                                                    </p>
                                                </div>
                                            )}
                                            <a
                                                href={
                                                    canRedeem ? "#" : "/redeem"
                                                }
                                                className={`block text-center py-2 px-4 rounded-lg ${
                                                    canRedeem
                                                        ? "bg-green-500 hover:bg-green-600 text-white"
                                                        : "bg-gray-300 text-gray-500"
                                                }`}
                                            >
                                                {canRedeem
                                                    ? "Redeem"
                                                    : "Insufficient Points"}
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <main className="mt-6 text-sm">
                    <div className="flex justify-between items-center mb-4 mt-8 ml-4">
                        <h3 className="text-2xl font-semibold">Bonuses</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20 p-4">
                        {rewards2.map((reward) => (
                            <div
                                key={reward.id}
                                className="bg-white shadow-md rounded-md p-6 flex items-center cursor-pointer transform transition-transform hover:scale-105 hover:shadow-lg"
                            >
                                <div className="mr-4">{reward.icon}</div>
                                <div>
                                    <h2 className="text-xl mb-1 font-semibold text-gray-800">
                                        {reward.title}
                                    </h2>
                                    <p className="text-gray-600 mb-2">
                                        {reward.description}
                                    </p>
                                    <span className="text-green-500 font-bold">
                                        {reward.points} points
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Rewards;

//     <div className="min-h-screen w-full p-14">
//       <div className="">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-4xl font-bold">Rewards</h1>
//           <div className="flex items-center">
//             <span className="text-lg mr-2">Available Points:</span>
//             <div className="flex items-center bg-yellow-300 p-2 rounded-full">
//             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
//                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
//             </svg>
//               <span className="text-lg font-bold text-yellow-800 pl-2">{availablePoints}</span>
//             </div>
//           </div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {rewards.map((reward, index) => {
//             const requiredPoints = reward.rewardPoints;
//             const canRedeem = availablePoints >= requiredPoints;
//             const progress = (availablePoints / requiredPoints) * 100;

//             return (
//               <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
//                 <img src={reward.image} alt={reward.title} className="w-full h-56 object-cover" />
//                 <div className="p-6">
//                   <h2 className="text-xl font-semibold mb-4">{reward.title}</h2>
//                     {!canRedeem && (
//                     <div className="mb-4">
//                       <div className="relative h-2 bg-gray-200 rounded">
//                         <div
//                           style={{ width: `${progress}%` }}
//                           className="absolute top-0 left-0 h-full bg-green-500 rounded"
//                         ></div>
//                       </div>
//                       <p className="text-xs text-gray-600 mt-2">{availablePoints} / {requiredPoints} Points</p>
//                     </div>
//                   )}
//                   <a href={canRedeem ? '#' : '/redeem'} className={`block text-center py-2 px-4 rounded-lg ${canRedeem ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>{canRedeem ? 'Redeem' : 'Insufficient Points'}</a>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };