import React from 'react';

const Card = ({ data }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 max-h-60 overflow-y-auto block">
          {data.map((row, index) => (
            <tr key={index} className="table w-full table-fixed">
              {Object.values(row).map((value, i) => (
                <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Card;