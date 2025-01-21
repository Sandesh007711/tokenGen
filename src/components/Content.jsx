import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import Card from './Card';

const Content = ({ isOpen }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate fetching data from the database
    const fetchData = async () => {
      const testData = [
        {
          id: 1,
          data: [
            { name: 'John Doe', email: 'john@example.com', age: 28 },
            { name: 'Alice Johnson', email: 'alice@example.com', age: 25 },
            { name: 'Bob Brown', email: 'bob@example.com', age: 30 },
            { name: 'Chris Green', email: 'chris@example.com', age: 27 },
            { name: 'David Black', email: 'david@example.com', age: 35 },
            { name: 'Eve White', email: 'eve@example.com', age: 40 },
          ],
        },
        {
          id: 2,
          data: [
            { name: 'Jane Smith', email: 'jane@example.com', age: 34 },
            { name: 'Charlie Davis', email: 'charlie@example.com', age: 29 },
            { name: 'Diana Evans', email: 'diana@example.com', age: 32 },
            { name: 'Frank Green', email: 'frank@example.com', age: 42 },
            { name: 'Grace Black', email: 'grace@example.com', age: 27 },
            { name: 'Hank Blue', email: 'hank@example.com', age: 26 },
          ],
        },
        {
          id: 3,
          data: [
            { name: 'Sam Johnson', email: 'sam@example.com', age: 45 },
            { name: 'Eve White', email: 'eve@example.com', age: 40 },
            { name: 'Frank Green', email: 'frank@example.com', age: 42 },
            { name: 'Grace Black', email: 'grace@example.com', age: 27 },
            { name: 'Hank Blue', email: 'hank@example.com', age: 26 },
            { name: 'Ivy Red', email: 'ivy@example.com', age: 31 },
          ],
        },
        {
          id: 4,
          data: [
            { name: 'Alex Brown', email: 'alex@example.com', age: 23 },
            { name: 'Grace Black', email: 'grace@example.com', age: 27 },
            { name: 'Hank Blue', email: 'hank@example.com', age: 26 },
            { name: 'Ivy Red', email: 'ivy@example.com', age: 31 },
            { name: 'Jack White', email: 'jack@example.com', age: 29 },
            { name: 'Karen Yellow', email: 'karen@example.com', age: 33 },
          ],
        },
      ];
      setData(testData);
    };

    fetchData();
  }, []);

  return (
    <div className={`p-4 transition-all duration-300 ${isOpen ? 'bg-slate-600' : 'mr-0'}`}>
      {data.length > 0 && data.map((item) => <Card key={item.id} data={item.data} />)}
    </div>
  );
};

export default Content;