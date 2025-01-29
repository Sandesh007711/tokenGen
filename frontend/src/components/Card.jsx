import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import QRCode from 'qrcode';

// Card component for displaying detailed operator data in a table format
const Card = ({ operator }) => {
  // State management for table data and pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data with pagination support
  const fetchData = async (page, pageSize) => {
    setLoading(true);
    try {
      console.log(`Fetching data for page ${page} with pageSize ${pageSize}`);
      const response = await fetch(
        `https://dummyjson.com/c/f07c-4e33-4a58-aa02?page=${page}&limit=${pageSize}&operator=${operator}`
      );
      const json = await response.json();
      console.log('Raw API response:', json);
      
      // Calculate start and end indices for pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      // Filter and slice data for current page
      const filteredData = json
        .filter(item => item.Operator === operator);
      console.log('Filtered data:', filteredData);
      
      const paginatedData = filteredData.slice(start, end);
      console.log('Paginated data:', paginatedData);
      
      const formattedData = paginatedData.map(item => ({
        id: item['S.N.'],
        date: new Date(item.Date).toLocaleString(),
        tokenNo: item['Token No'],
        driver: item.Driver,
        vehicalNo: item['Vehical No'],
        vehicalType: item['Vehical Type'],
        rate: item.Rate,
        quantity: item.Quantity,
        place: item.Place,
        route: item.Route,
        operator: item.Operator,
        chalan: item.Chalan
      }));
      console.log('Formatted data:', formattedData);

      // Set the total count of filtered records
      const totalFilteredRecords = json.filter(item => item.Operator === operator).length;
      console.log('Total filtered records:', totalFilteredRecords);
      
      setData(formattedData);
      setTotalRows(totalFilteredRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = page => {
    setCurrentPage(page);
    fetchData(page, perPage);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
    fetchData(page, newPerPage);
  };

  // Load initial data when operator changes
  useEffect(() => {
    fetchData(currentPage, perPage);
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

  // Table column definitions
  const columns = [
    {
      name: 'S.N.',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Date',
      selector: row => row.date,
      sortable: true,
    },
    {
      name: 'Token No',
      selector: row => row.tokenNo,
      sortable: true,
    },
    {
      name: 'Driver',
      selector: row => row.driver,
      sortable: true,
    },
    {
      name: 'Vehicle No',
      selector: row => row.vehicalNo,
      sortable: true,
    },
    {
      name: 'Vehicle Type',
      selector: row => row.vehicalType,
      sortable: true,
    },
    {
      name: 'Rate',
      selector: row => row.rate,
      sortable: true,
    },
    {
      name: 'Quantity',
      selector: row => row.quantity,
      sortable: true,
    },
    {
      name: 'Place',
      selector: row => row.place,
      sortable: true,
    },
    {
      name: 'Route',
      selector: row => row.route,
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
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        progressComponent={
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        }
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        paginationPerPage={perPage}
        highlightOnHover
        striped
        customStyles={customStyles}
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default Card;