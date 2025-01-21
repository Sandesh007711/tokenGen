import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const Content = () => {
  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Define isOpen state

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/todos')
      .then(response => response.json())
      .then(json => {
        console.log(json); // Log the fetched data
        const formattedData = json.reduce((acc, todo) => {
          const userId = todo.userId;
          if (!acc[userId]) {
            acc[userId] = {
              userId: userId,
              data: [],
            };
          }
          acc[userId].data.push({
            id: todo.id,
            title: todo.title,
            completed: todo.completed ? 'Yes' : 'No',
          });
          return acc;
        }, {});
        setData(Object.values(formattedData));
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className={`p-4 transition-all duration-300 ${isOpen ? 'bg-slate-600' : 'mr-0'}`}>
      {data.length > 0 && data.map((item) => (
        <div key={item.userId} className="mb-4">
          <h2 className="text-xl font-bold mb-2">User ID: {item.userId}</h2>
          <Card data={item.data} />
        </div>
      ))}
    </div>
  );
};

export default Content;