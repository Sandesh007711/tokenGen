import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import QRCode from 'qrcode';

// Card component for displaying detailed operator data in a table format
const Card = ({ operator }) => {
  // State management for table data and pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Simplified fetchData function without pagination parameters
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching data for operator:', operator); // Log operator info

      const response = await fetch(`http://localhost:8000/api/v1/tokens?userId=${operator.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const json = await response.json();
      console.log('Raw API response:', json); // Log raw API response
      
      if (!json.printTokens || !Array.isArray(json.printTokens)) {
        console.error('Invalid response format:', json);
        throw new Error('Invalid data format received from server');
      }

      console.log('Print Tokens array:', json.printTokens); // Log tokens array

      const formattedData = json.printTokens.map(item => ({
        tokenNo: item.tokenNo,
        date: new Date(item.createdAt).toLocaleString(),
        driver: item.driverName,
        mobileNo: item.driverMobileNo, // Already a number
        vehicleNo: item.vehicleNo,
        vehicleType: item.vehicleId.vehicleType,
        quantity: item.quantity, // Already a number
        route: item.route,
        place: item.place || '-',
        challanPin: item.challanPin || '-'
      }));

      console.log('Formatted data:', formattedData); // Log formatted data

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data when operator changes
  useEffect(() => {
    fetchData();
  }, [operator]);

  // Generate QR code for row data
  const generateQR = async (data) => {
    try {
      const qrData = JSON.stringify({
        id: data.id,
        date: data.date,
        tokenNo: data.tokenNo,
        driver: data.driver,
        vehicalNo: data.vehicalNo,
        vehicalType: data.vehicalType
      });
      return await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  };

  // Format content for printing
  const formatPrintContent = async (row) => {
    const printDate = new Date().toLocaleString();
    const qrCodeDataUrl = await generateQR(row);
    
    const content = `
      <div class="content-wrapper">
        <div class="data-section">
          <div class="data-row">
            <span class="label">ID:</span>
            <span class="value">${row.id}</span>
          </div>
          <div class="data-row">
            <span class="label">Name:</span>
            <span class="value">${row.name}</span>
          </div>
          <div class="data-row">
            <span class="label">Email:</span>
            <span class="value">${row.email}</span>
          </div>
          <div class="data-row">
            <span class="label">Comment:</span>
            <span class="value">${row.comment}</span>
          </div>
        </div>
        <div class="qr-section">
          <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code"/>
          <div class="qr-caption">Scan for digital version</div>
        </div>
      </div>
    `;

    return `
      <html>
        <head>
          <title>Comment Details</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 10px;
              border-bottom: 2px solid #333;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .timestamp {
              color: #666;
              font-size: 14px;
            }
            .data-container {
              margin: 20px 0;
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 5px;
            }
            .data-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: bold;
              width: 150px;
              text-transform: capitalize;
            }
            .value {
              flex: 1;
              word-wrap: break-word;
              white-space: pre-wrap;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .header {
                position: fixed;
                top: 0;
                width: 100%;
                background: white;
              }
              .data-container {
                margin-top: 100px;
              }
            }
            .content-wrapper {
              display: flex;
              justify-content: space-between;
              gap: 20px;
            }
            .data-section {
              flex: 1;
            }
            .qr-section {
              text-align: center;
              padding: 20px;
            }
            .qr-code {
              width: 150px;
              height: 150px;
              margin-bottom: 10px;
            }
            .qr-caption {
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Ramjee Singh And Co.</div>
            <div class="title">Comment Details</div>
            <div class="timestamp">Generated on: ${printDate}</div>
          </div>
          <div class="data-container">
            ${content}
          </div>
        </body>
      </html>
    `;
  };

  // Handle print action
  const handlePrint = async (row) => {
    const printWindow = window.open('', '_blank');
    const content = await formatPrintContent(row);
    printWindow.document.write(content);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Modified table column definitions
  const columns = [
    {
      name: 'Token No',
      selector: row => row.tokenNo,
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
    },
    {
      name: 'Driver',
      selector: row => row.driver,
      sortable: true,
    },
    {
      name: 'Mobile',
      selector: row => row.mobileNo,
      sortable: true,
      format: row => row.mobileNo.toString(), // Convert number to string for display
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicleNo,
      sortable: true,
    },
    {
      name: 'Vehicle Type',
      selector: row => row.vehicleType,
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
      format: row => row.quantity.toString(), // Convert number to string for display
    },
    {
      name: 'Route',
      selector: row => row.route,
      sortable: true,
    },
    {
      name: 'Place',
      selector: row => row.place,
      sortable: true,
    },
    {
      name: 'Challan Pin',
      selector: row => row.challanPin,
      sortable: true,
    },
    {
      name: 'Action',
      cell: row => (
        <div className="print-button-wrapper">
          <button
            onClick={() => handlePrint(row)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];

  // Custom styles for the DataTable component
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
        '&:hover': {
          backgroundColor: '#f3f4f6',
        },
      },
    },
    table: {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      },
    },
    progressWrapper: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100px',
      },
    },
  };

  // Render DataTable with all configurations
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4 mt-16 md:mt-20 lg:mt-24 xl:mt-20 sm:p-6 max-w-full">
      <h2 className="text-2xl font-bold mb-4">Tokens for {operator.username}</h2>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        progressComponent={
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        }
        pagination
        highlightOnHover
        striped
        customStyles={customStyles}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default Card;