import React, { useState, useEffect } from 'react';
import Card from '../components/Card';

const Content = () => {
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://dummyjson.com/c/f07c-4e33-4a58-aa02')
      .then(response => response.json())
      .then(json => {
        console.log('Raw fetched data:', json);
        const uniqueOperators = [...new Set(json.map(item => item.Operator))].map(op => ({
          operator: op,
          totalEntries: json.filter(item => item.Operator === op).length,
          latestEntry: json.find(item => item.Operator === op)?.['Token No']
        }));
        console.log('Processed operators data:', uniqueOperators);
        setOperators(uniqueOperators);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching operators:', error);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (operator) => {
    setSelectedOperator(operator === selectedOperator ? null : operator);
  };

  return (
    <div className="p-7 max-w-7xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : !selectedOperator ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {operators.map((op) => (
            <div
              key={op.operator}
              onClick={() => handleCardClick(op.operator)}
              className="cursor-pointer transform transition-transform duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl hover:bg-slate-200">
                <div className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800">Operator {op.operator}</div>
                <div className="text-sm sm:text-base text-gray-600">
                  <p className="mb-2">Total Entries: {op.totalEntries}</p>
                  <p className="line-clamp-2">Latest Token: {op.latestEntry}</p>
                </div>
                <div className="mt-3 sm:mt-4 text-blue-500 text-xs sm:text-sm">Click to view details →</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedOperator(null)}
            className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1.5 sm:py-2 px-3 sm:px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-sm sm:text-base"
          >
            ← Back to Operators
          </button>
          <Card operator={selectedOperator} />
        </div>
      )}
    </div>
  );
};

export default Content;