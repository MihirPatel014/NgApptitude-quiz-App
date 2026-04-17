import React from 'react';
import jsPDF from 'jspdf';
 import html2canvas from "html2canvas";

// const PdfDownloader = ({ reportRef, fileName = 'document' }) => {
//   // const handleGeneratePdf = () => {
//   //   const doc = new jsPDF({
//   //     format: 'a4',
//   //     unit: 'px',
//   //   });

//   //   doc.setFont('Inter-Regular', 'normal');

//   //   // Delay the PDF generation slightly to ensure content is fully rendered
//   //   setTimeout(() => {
//   //     doc.html(reportRef.current, {
//   //       async callback(doc) {
//   //         await doc.save(fileName);
//   //       },
//   //       margin: [5, 5, 5, 5], // Reduced margins
//   //       width: 420, // Adjusted width to fit content
//   //       windowWidth: 1200 // Specify a window width (adjust as needed)
//   //     });
//   //   }, 500); // Adjust the delay as needed
//   // };
//   const handleGeneratePdf = async () => {
//     if (reportRef.current) {
//       const canvas = await html2canvas(reportRef.current, { scale: 2 }); // Higher scale for better quality
//       const imgData = canvas.toDataURL("image/png");

//       const pdf = new jsPDF("p", "mm", "a4");
//       const imgWidth = 190; // Width of the image in the PDF
//       const pageHeight = 297; // A4 page height in mm
//       const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

//       let yPosition = 10; // Reduced extra space at the top
//     let heightLeft = imgHeight;
//     let pageOffset = 0;

//     while (heightLeft > 0) {
//       pdf.addImage(imgData, "PNG", 10, yPosition - pageOffset, imgWidth, imgHeight);
//       heightLeft -= pageHeight - 20; // Adjust for margins
//       pageOffset += pageHeight - 20;

//       if (heightLeft > 0) {
//         pdf.addPage();
//         yPosition = 0; // Set new page to start from the top
//       }
//     }

//     pdf.save("chart.pdf");
//     }
//   };
//   return (
//     <button className='p-2 mt-12 text-white rounded border hover:bg-slate-500 bg-slate-400' onClick={handleGeneratePdf}>Download PDF</button>
//   );
// };

// export default PdfDownloader;

const PdfDownloader = ({ reportRef }) => {
  const handleGeneratePdf = async () => {
    if (!reportRef.current) return;

    const popup = window.open("", "_blank", "width=1400,height=900,scrollbars=yes");
    const doc = popup.document;

    // 1️⃣ Inject full HTML + CSS + Chart.js
    doc.open();
    doc.write(`
      <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

       <style>
  body {
    width: 1200px !important;
    margin: 0 auto;
    background: white !important;
  }

  /* Center hidden PDF charts */
  .pdf-only {
    width: 100% !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0 auto !important;
  }

  /* Center the chart canvas */
  .chart-canvas {
    display: block !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: 350px !important;
    height: 350px !important;
  }

  /* Hide React charts */
  .react-chart {
    display: none !important;
  }
</style>

      </head>
      <body>
        ${reportRef.current.innerHTML}
      </body>
      </html>
    `);
    doc.close();

    // Wait for popup load
    await new Promise((resolve) => setTimeout(resolve, 1200));

    //  Re-render CHARTS inside popup
    popup.eval(`
  document.querySelectorAll("canvas").forEach((canvas) => {
    const type = canvas.dataset.type;
    const chartData = canvas.dataset.chart;
    const chartOptions = canvas.dataset.options;

    // Skip canvases that are NOT charts
    if (!type || !chartData || !chartOptions) return;

    const ctx = canvas.getContext("2d");

    const data = JSON.parse(chartData);
    const options = JSON.parse(chartOptions);

    new Chart(ctx, { type, data, options });
  });
`);


    // Wait for charts to render
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Multi-page PDF generation
    const pdf = new jsPDF("p", "mm", "a4");
    const sections = popup.document.querySelectorAll(".pdf-section");

    let isFirstPage = true;

    for (let section of sections) {
  const canvas = await html2canvas(section, { scale: 1.2, useCORS: true });
  
  const imgData = canvas.toDataURL("image/jpeg", 0.85);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let yPosition = 0;

  while (heightLeft > 0) {
    if (!isFirstPage) pdf.addPage();
    isFirstPage = false;

    pdf.addImage(imgData, "JPEG", 0, yPosition, imgWidth, imgHeight);

    heightLeft -= pdfHeight;
    yPosition -= pdfHeight; // shift image upward for next page
  }
}


    pdf.save("report.pdf");
    popup.close();
  };

  return (
    <button
      className="p-2 mt-12 text-white rounded border hover:bg-slate-500 bg-slate-400"
      onClick={handleGeneratePdf}
    >
      Download PDF
    </button>
  );
};



export default PdfDownloader;




