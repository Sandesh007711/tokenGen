import React from 'react';
import 'tailwindcss/tailwind.css';

const Content = ({ isOpen }) => {
  return (
    <div className={` p-4 transition-all duration-300 ${isOpen ? 'bg-slate-600' : 'mr-0'}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="w-full bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Header 1</th>
              <th className="py-3 px-6 text-left">Header 2</th>
              <th className="py-3 px-6 text-left">Header 3</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            <tr className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left">Data 1</td>
              <td className="py-3 px-6 text-left">Data 2</td>
              <td className="py-3 px-6 text-left">Data 3</td>
            </tr>
            <tr className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-6 text-left">Data 4</td>
              <td className="py-3 px-6 text-left">Data 5</td>
              <td className="py-3 px-6 text-left">Data 6</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Content;