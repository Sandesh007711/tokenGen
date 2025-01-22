import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const Content = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch unique users initially
    fetch('https://jsonplaceholder.typicode.com/comments')
      .then(response => response.json())
      .then(json => {
        const uniqueUsers = [...new Set(json.map(item => item.postId))].map(id => ({
          userId: id,
          totalComments: json.filter(comment => comment.postId === id).length,
          latestComment: json.find(comment => comment.postId === id)?.name
        }));
        setUsers(uniqueUsers);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (userId) => {
    setSelectedUser(userId === selectedUser ? null : userId);
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : !selectedUser ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {users.map((user) => (
            <div
              key={user.userId}
              onClick={() => handleCardClick(user.userId)}
              className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl">
                <div className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">User {user.userId}</div>
                <div className="text-sm sm:text-base text-gray-600">
                  <p className="mb-2">Total Comments: {user.totalComments}</p>
                  <p className="line-clamp-2">Latest Comment: {user.latestComment}</p>
                </div>
                <div className="mt-3 sm:mt-4 text-blue-500 text-xs sm:text-sm">Click to view details →</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedUser(null)}
            className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          >
            ← Back to Users
          </button>
          <Card userId={selectedUser} />
        </div>
      )}
    </div>
  );
};

export default Content;