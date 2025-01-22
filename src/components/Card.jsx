import React from 'react';
import DataTable from 'react-data-table-component';
import QRCode from 'qrcode';

const Card = ({ data }) => {
  const generateQR = async (data) => {
    try {
      const qrData = JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        comment: data.comment
      });
      return await QRCode.toDataURL(qrData);
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  };

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

  const handlePrint = async (row) => {
    const printWindow = window.open('', '_blank');
    const content = await formatPrintContent(row);
    printWindow.document.write(content);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
      sortable: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Comment',
      selector: row => row.comment,
      sortable: true,
      wrap: true,
    },
    {
      name: 'Action',
      cell: row => (
        <button
          onClick={() => handlePrint(row)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded transition duration-300 ease-in-out transform hover:scale-105 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

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