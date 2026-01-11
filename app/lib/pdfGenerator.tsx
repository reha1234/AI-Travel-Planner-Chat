import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function generatePDFFromHTML(
  elementId: string,
  filename: string = "travel-itinerary.pdf"
) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Element not found");
    }

    // Create a clone to avoid affecting the original
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = "800px";
    clone.style.maxWidth = "800px";
    clone.style.padding = "20px";
    document.body.appendChild(clone);

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    document.body.removeChild(clone);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate aspect ratio
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const width = pdfWidth - 20; // Margin
    const height = width / ratio;

    // Add multiple pages if needed
    let position = 0;
    let pageHeight = pdfHeight - 20;

    while (position < height) {
      if (position > 0) {
        pdf.addPage();
      }

      const cropHeight = Math.min(pageHeight, height - position);
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = canvas.width;
      cropCanvas.height = (cropHeight / height) * canvas.height;

      const ctx = cropCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          (position / height) * canvas.height,
          canvas.width,
          (cropHeight / height) * canvas.height,
          0,
          0,
          cropCanvas.width,
          cropCanvas.height
        );
      }

      const cropImg = cropCanvas.toDataURL("image/png");
      pdf.addImage(cropImg, "PNG", 10, 10, width, cropHeight);
      position += pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
}

export function createPrintableHTML(itinerary: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 30px;
      background: #ffffff;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .title {
      font-size: 32px;
      font-weight: 800;
      color: #1e40af;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 16px;
      color: #6b7280;
      font-weight: 500;
    }
    
    .itinerary-content {
      font-size: 15px;
      line-height: 1.8;
    }
    
    .day-section {
      margin-bottom: 30px;
      padding: 25px;
      background: #f8fafc;
      border-radius: 12px;
      border-left: 5px solid #3b82f6;
      page-break-inside: avoid;
    }
    
    .day-title {
      font-size: 22px;
      color: #1e40af;
      margin-bottom: 15px;
      font-weight: 700;
    }
    
    .activity {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px dashed #e5e7eb;
    }
    
    .time {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .activity-title {
      font-size: 17px;
      color: #111827;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .activity-desc {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 8px;
    }
    
    .budget {
      font-size: 14px;
      color: #059669;
      font-weight: 600;
      background: #d1fae5;
      padding: 4px 10px;
      border-radius: 6px;
      display: inline-block;
    }
    
    .budget-section {
      margin-top: 40px;
      padding: 25px;
      background: #f0fdf4;
      border-radius: 12px;
      border-left: 5px solid #10b981;
    }
    
    .budget-title {
      font-size: 22px;
      color: #065f46;
      margin-bottom: 20px;
      font-weight: 700;
    }
    
    .budget-category {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #d1fae5;
    }
    
    .budget-total {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      font-weight: 700;
      font-size: 18px;
      color: #065f46;
      border-top: 2px solid #10b981;
      margin-top: 10px;
    }
    
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    
    .emoji {
      font-size: 18px;
      margin-right: 8px;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .day-section, .budget-section {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div id="print-content">
    <div class="header">
      <h1 class="title">${title}</h1>
      <div class="subtitle">
        ✨ Generated by Travel AI Planner • ${new Date().toLocaleDateString(
          "id-ID",
          {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}
      </div>
    </div>
    
    <div class="itinerary-content">
      ${formatItineraryForPrint(itinerary)}
    </div>
    
    <div class="footer">
      <p>Planned with AI • Travel AI Planner • https://travel-ai-planner.vercel.app</p>
    </div>
  </div>
</body>
</html>
  `;
}

function formatItineraryForPrint(itinerary: string): string {
  // Simple formatting for now
  let html = itinerary;

  // Convert markdown-like syntax
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/^# (.*$)/gm, '<h1 class="day-title">$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2 class="day-title">$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3 class="activity-title">$1</h3>');
  html = html.replace(/\n\n/g, '</div><div class="activity">');
  html = html.replace(/\n/g, "<br>");
  html = html.replace(/💰/g, '<span class="emoji">💰</span>');
  html = html.replace(/📍/g, '<span class="emoji">📍</span>');
  html = html.replace(/🍽️/g, '<span class="emoji">🍽️</span>');
  html = html.replace(/🏨/g, '<span class="emoji">🏨</span>');

  // Wrap in day sections
  html = html.replace(
    /Day \d+/gi,
    (match) => `<div class="day-section"><h2 class="day-title">${match}</h2>`
  );

  return `<div class="activity">${html}</div>`;
}
