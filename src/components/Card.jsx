import React from 'react';
import DataTable from 'react-data-table-component';

const Card = ({ data }) => {
  const columns = Object.keys(data[0]).map((key) => ({
    name: key,
    selector: row => row[key],
    sortable: true,
  }));

  const customStyles = {
    header: {
      style: {
        backgroundColor: '#f8f9fa', // Tailwind: bg-gray-100
        color: '#343a40', // Tailwind: text-gray-800
      },
    },
    headRow: {
      style: {
        backgroundColor: '#343a40', // Tailwind: bg-gray-800
        color: '#ffffff', // Tailwind: text-white
      },
    },
    headCells: {
      style: {
        color: '#ffffff', // Tailwind: text-white
      },
    },
    rows: {
      style: {
        backgroundColor: '#ffffff', // Tailwind: bg-white
        color: '#343a40', // Tailwind: text-gray-800
        '&:nth-of-type(odd)': {
          backgroundColor: '#f8f9fa', // Tailwind: bg-gray-100
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: '#f8f9fa', // Tailwind: bg-gray-100
        color: '#343a40', // Tailwind: text-gray-800
      },
    },
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 m-4">
      <DataTable
        columns={columns}
        data={data}
        pagination
        highlightOnHover
        striped
        customStyles={customStyles}
      />
    </div>
  );
};

export default Card;