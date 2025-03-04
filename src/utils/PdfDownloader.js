import React from 'react';
import jsPDF from 'jspdf';

import html2canvas from "html2canvas";
const PdfDownloader = ({ reportRef, fileName = 'document' }) => {
  // const handleGeneratePdf = () => {
  //   const doc = new jsPDF({
  //     format: 'a4',
  //     unit: 'px',
  //   });

  //   doc.setFont('Inter-Regular', 'normal');

  //   // Delay the PDF generation slightly to ensure content is fully rendered
  //   setTimeout(() => {
  //     doc.html(reportRef.current, {
  //       async callback(doc) {
  //         await doc.save(fileName);
  //       },
  //       margin: [5, 5, 5, 5], // Reduced margins
  //       width: 420, // Adjusted width to fit content
  //       windowWidth: 1200 // Specify a window width (adjust as needed)
  //     });
  //   }, 500); // Adjust the delay as needed
  // };
  const handleGeneratePdf = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, { scale: 2 }); // Higher scale for better quality
      const imgData = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190; // Width of the image in the PDF
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  
      let yPosition = 10; // Reduced extra space at the top
    let heightLeft = imgHeight;
    let pageOffset = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 10, yPosition - pageOffset, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20; // Adjust for margins
      pageOffset += pageHeight - 20;
      
      if (heightLeft > 0) {
        pdf.addPage();
        yPosition = 0; // Set new page to start from the top
      }
    }

    pdf.save("chart.pdf");
    }
  };
  return (
    <button className='p-2 mt-12 text-white border rounded hover:bg-slate-500 bg-slate-400' onClick={handleGeneratePdf}>Download PDF</button>
  );
};

export default PdfDownloader;
