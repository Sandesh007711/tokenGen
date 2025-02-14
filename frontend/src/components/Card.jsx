import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import ReactDOMServer from 'react-dom/server';
import DataTable from 'react-data-table-component';
import QRCode from 'qrcode';

// Card component for displaying detailed operator data in a table format
const Card = ({ operator }) => {
  // State management for table data and pagination
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(20); // Changed from 10 to 20
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);

  // Update the fetchData function to use the correct user ID
  const fetchData = async (page, newPerPage = perPage) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching data for operator:', operator); // Log operator info

      // Use the correct _id from operator object
      const queryParams = new URLSearchParams({
        user: operator._id,
        page: page,
        limit: newPerPage
      });

      const response = await fetch(`http://localhost:8000/api/v1/tokens?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const json = await response.json();
      
      if (!json.data || !Array.isArray(json.data)) {
        console.error('Invalid response format:', json);
        throw new Error('Invalid data format received from server');
      }

      const formattedData = json.data.map(item => ({
        tokenNo: item.tokenNo,
        date: new Date(item.createdAt).toLocaleString(),
        driver: item.driverName,
        mobileNo: item.driverMobileNo,
        vehicleNo: item.vehicleNo,
        vehicleType: item.vehicleType || item.vehicleId?.vehicleType || 'N/A',
        vehicleRate: item.vehicleRate || 'N/A',
        quantity: item.quantity,
        route: item.route || '-',
        place: item.place || '-',
        challanPin: item.challanPin || '-',
        isLoaded: item.isLoaded ? 'Yes' : 'No',
        updatedBy: item.updatedBy || '-',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'
      }));

      setData(formattedData);
      setTotalRows(json.totalCount || formattedData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = async (page) => {
    setIsPaginationLoading(true);
    try {
      console.log('Changing to page:', page);
      const success = await fetchData(page);
      if (!success) {
        console.error('Failed to load page data');
      }
      setCurrentPage(page);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setIsPaginationLoading(true);
    try {
      console.log('Changing rows per page:', { newPerPage, page });
      setPerPage(newPerPage);
      const success = await fetchData(page, newPerPage);
      if (!success) {
        console.error('Failed to update rows per page');
      }
    } finally {
      setIsPaginationLoading(false);
    }
  };

  // Load initial data when operator changes
  useEffect(() => {
    if (operator?._id) {
      const initializePage = async () => {
        await fetchData(currentPage);
      };
      initializePage();
    }
  }, [operator?._id, perPage]); // Add perPage dependency

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
  const handlePrint = (entry) => {
    const createQRData = (entry) => {
      return JSON.stringify({
        date: entry.date,
        token: entry.tokenNo,
        query: entry.route,
        cluster: '6',
        driver: entry.driver,
        vehicle: entry.vehicleType,
        quantity: entry.quantity,
        mobile: entry.mobileNo,
        operator: operator.username,
        destination: entry.place,
        challan: entry.challanPin
      });
    };

    const QRCodeComponent = ({ data }) => (
      <QRCodeSVG 
        value={data}
        size={50}
        level="M"
        includeMargin={true}
      />
    );

    const createCopy = (title) => {
      const qrData = createQRData(entry);
      const qrCodeSvg = ReactDOMServer.renderToString(
        <QRCodeComponent data={qrData} />
      );

      return `
        <div class="token-section">
          <div class="header">
            <div class="company-name">RAMJEE SINGH & COMPANY</div>
            <div class="copy-type">${title}</div>
          </div>
          <div class="content">
            <table class="info-table">
              <tr><td>Date/Time:</td><td>${entry.date}</td></tr>
              <tr><td>Token No.:</td><td>${entry.tokenNo || 'N/A'}</td></tr>
              <tr><td>Query Name:</td><td>${entry.route || 'N/A'}</td></tr>
              <tr><td>Cluster:</td><td>6</td></tr>
              <tr><td>Driver Name:</td><td>${entry.driver}</td></tr>
              <tr><td>Vehicle Type:</td><td>${entry.vehicleType}</td></tr>
              <tr><td>Quantity:</td><td>${entry.quantity}</td></tr>
              <tr><td>Driver Mobile:</td><td>${entry.mobileNo}</td></tr>
              <tr><td>Operator:</td><td>${operator.username}</td></tr>
              <tr><td>Destination:</td><td>${entry.place}</td></tr>
              <tr><td>Challan Pin:</td><td>${entry.challanPin}</td></tr>
            </table>
            <div class="qr-code">
              ${qrCodeSvg}
            </div>
          </div>
        </div>
      `;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Details</title>
          <style>
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 8pt;
              line-height: 1.1;
            }
            .token-section {
              padding: 3mm;
              height: 85mm;
              position: relative;
            }
            .header {
              text-align: left;
              margin-bottom: 2mm;
            }
            .company-name {
              font-size: 10pt;
              font-weight: bold;
            }
            .copy-type {
              font-size: 8pt;
              font-weight: bold;
            }
            .content {
              position: relative;
            }
            .info-table {
              width: 100%;
              margin-bottom: 4mm;
            }
            .info-table td {
              padding: 0.5mm 2mm 0.5mm 0;
              vertical-align: top;
            }
            .info-table td:first-child {
              white-space: nowrap;
              font-weight: bold;
              width: 25%;
            }
            .qr-code {
              position: relative;
              left: 1;
              width: 90px;
              height: 90px;
              margin-top: auto;
            }
            .qr-code svg {
              width: 100%;
              height: 100%;
            }
          </style>
        </head>
        <body>
          ${createCopy("OFFICE COPY")}
          ${createCopy("OPERATOR COPY")}
          ${createCopy("DRIVER COPY")}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleReceiptPrint = (entry) => {
    const createQRData = (entry) => {
      return JSON.stringify({
        date: entry.date,
        token: entry.tokenNo,
        query: entry.route,
        cluster: '6',
        driver: entry.driver,
        vehicle: entry.vehicleType,
        quantity: entry.quantity,
        mobile: entry.mobileNo,
        operator: operator.username,
        destination: entry.place,
        challan: entry.challanPin
      });
    };

    const QRCodeComponent = ({ data }) => (
      <QRCodeSVG 
        value={data}
        size={100}
        level="M"
        includeMargin={true}
      />
    );

    const createCopy = (title) => {
      const qrData = createQRData(entry);
      const qrCodeSvg = ReactDOMServer.renderToString(
        <QRCodeComponent data={qrData} />
      );

      return `
        <div class="receipt">
          <div class="header">
            <div class="company-name">RAMJEE SINGH & COMPANY</div>
            <div class="divider">================================</div>
            <div class="copy-label">${title}</div>
            <div class="token-number">Token No: ${entry.tokenNo || 'N/A'}</div>
            <div class="divider">================================</div>
          </div>
          <div class="content">
            <div>Date/Time: ${entry.date}</div>
            <div>Query Name: ${entry.route || 'N/A'}</div>
            <div>Cluster: 6</div>
            <div>Driver Name: ${entry.driver}</div>
            <div>Vehicle Type: ${entry.vehicleType}</div>
            <div>Quantity: ${entry.quantity}</div>
            <div>Driver Mobile: ${entry.mobileNo}</div>
            <div>Operator: ${operator.username}</div>
            <div>Destination: ${entry.place || 'N/A'}</div>
            <div>Challan Pin: ${entry.challanPin || 'N/A'}</div>
            <div class="divider">================================</div>
          </div>
          <div class="qr-section">
            ${qrCodeSvg}
          </div>
        </div>
      `;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Token Receipt</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 80mm;
              margin: 0;
              padding: 8px;
              font-size: 12pt;
              line-height: 1.2;
              text-transform: uppercase;
            }
            .receipt {
              width: 100%;
              text-align: center;
              margin-bottom: 20px;
              page-break-after: always;
            }
            .receipt:last-child {
              page-break-after: avoid;
            }
            .header {
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 14pt;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .copy-label {
              font-size: 14pt;
              font-weight: bold;
              margin: 5px 0;
              text-decoration: underline;
            }
            .token-number {
              font-size: 24pt;
              font-weight: bold;
              margin: 10px 0;
              letter-spacing: 2px;
            }
            .divider {
              margin: 5px 0;
            }
            .content {
              text-align: left;
              margin-bottom: 10px;
              font-size: 12pt;
            }
            .content div {
              margin: 3px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .qr-section {
              text-align: center;
              margin: 10px 0;
            }
            .qr-section svg {
              width: 100px;
              height: 100px;
            }
            @media print {
              body {
                width: 80mm;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${createCopy("OFFICE COPY")}
          ${createCopy("OPERATOR COPY")}
          ${createCopy("DRIVER COPY")}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
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
      name: 'Vehicle Rate',
      selector: row => row.vehicleRate,
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
      name: 'Loaded',
      selector: row => row.isLoaded,
      sortable: true,
    },
    {
      name: 'Updated By',
      selector: row => row.updatedBy,
      sortable: true,
    },
    {
      name: 'Last Updated',
      selector: row => row.updatedAt,
      sortable: true,
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="flex flex-col gap-2 py-2">
          <button
            onClick={() => handlePrint(row)}
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-600 hover:to-green-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            A4 Print
          </button>
          <button
            onClick={() => handleReceiptPrint(row)}
            className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-600 hover:to-blue-400 text-white px-3 py-1 rounded-full flex items-center justify-center transition duration-300 transform hover:scale-105"
          >
            Receipt
          </button>
        </div>
      ),
      ignoreRowClick: true,
      width: '120px',
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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden p-4 mt-4 md:mt-6 lg:mt-8 xl:mt-6 sm:p-6 max-w-full">
      <h2 className="text-2xl font-bold mb-4">Tokens for {operator.username} ({totalRows} total)</h2>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading || isPaginationLoading}
        progressComponent={
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
        }
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={perPage}
        paginationDefaultPage={currentPage}
        paginationRowsPerPageOptions={[10, 20, 25, 50, 100]}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        highlightOnHover
        striped
        customStyles={customStyles}
        className="rounded-lg overflow-hidden"
        noDataComponent={
          <div className="p-4 text-center text-gray-500">
            No tokens found for {operator.username}
          </div>
        }
      />
    </div>
  );
};

export default Card;