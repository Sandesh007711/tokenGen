import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const Content = () => {
  const [data, setData] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(''); // State to track selected userId
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State to track sidebar visibility

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/comments')
      .then(response => response.json())
      .then(json => {
        const formattedData = json.reduce((acc, post) => {
          const postId = post.postId;
          if (!acc[postId]) {
            acc[postId] = {
              userId: postId, // Using postId as userId for consistency
              data: [],
            };
          }
          acc[postId].data.push({
            id: post.id,
            name: post.name,
            email: post.email,
            comment: post.body.substring(0, 50) + '...', // Truncate long comments
          });
          return acc;
        }, {});
        setData(Object.values(formattedData));
        setSelectedUserId(Object.values(formattedData)[0]?.userId || '');
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handlePreviousClick = () => {
    setSelectedUserId(prevUserId => {
      const currentIndex = data.findIndex(item => item.userId === prevUserId);
      const newIndex = (currentIndex - 1 + data.length) % data.length;
      return data[newIndex].userId;
    });
  };

  const handleNextClick = () => {
    setSelectedUserId(prevUserId => {
      const currentIndex = data.findIndex(item => item.userId === prevUserId);
      const newIndex = (currentIndex + 1) % data.length;
      return data[newIndex].userId;
    });
  };

  const handleDropdownChange = (event) => {
    setSelectedUserId(Number(event.target.value));
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-center items-center space-x-4 mb-4 bg-gradient-to-b from-slate-400 via-slate-300 to-slate-100 p-4 rounded-lg mx-5">
        {!isSidebarOpen && (
          <>
            <button
              onClick={handlePreviousClick}
              className="bg-gradient-to-r from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 sm:py-1 sm:px-2 sm:text-sm"
            >
              &larr; Previous
            </button>
            <span className="text-2xl font-bold text-gray dark:text-black transition duration-300 ease-in-out transform sm:text-lg">
              User {selectedUserId}
            </span>
            <button
              onClick={handleNextClick}
              className="bg-gradient-to-r  from-slate-400 via-gray-500 to-black hover:from-black hover:via-gray-500 hover:to-slate-400 text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 sm:py-1 sm:px-2 sm:text-sm"
            >
              Next &rarr;
            </button>
            <select
              onChange={handleDropdownChange}
              value={selectedUserId}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-300 sm:py-1 sm:px-2 sm:text-sm"
            >
              {data.map((item) => (
                <option key={item.userId} value={item.userId}>
                  User {item.userId}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="transition duration-300 ease-in-out transform">
        {data.length > 0 && data.map((item) => (
          selectedUserId === item.userId && (
            <div key={item.userId} className="mb-4">
              <Card data={item.data} />
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default Content;