/**
 * Plan-Craft v5.0 PDF Converter
 * 
 * Purpose: Convert HTML documents to PDF format for download
 * - Browser-based PDF generation using print API
 * - Optional: Server-side PDF generation using Cloudflare Workers + Puppeteer
 * - Preserve styling, diagrams, and images
 * - Optimize for professional document output
 */

export class PDFConverter {
  constructor() {
    this.conversionQueue = [];
    this.conversionHistory = [];
    this.config = {
      pageFormat: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '',
      footerTemplate: `
        <div style="width: 100%; text-align: center; font-size: 10px; color: #666; padding: 10px 0;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `
    };
  }

  /**
   * Convert HTML to PDF using browser print API
   * This is the simplest method that works in all modern browsers
   */
  async convertHTMLToPDF_Browser(htmlContent, filename) {
    console.log('[PDFConverter] Converting HTML to PDF (Browser method)...');

    try {
      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);

      // Write HTML content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Wait for content to load
      await new Promise(resolve => {
        if (iframe.contentWindow.document.readyState === 'complete') {
          resolve();
        } else {
          iframe.onload = resolve;
        }
      });

      // Trigger print dialog
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Clean up after a delay
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      this.addToHistory({
        filename,
        method: 'browser',
        status: 'success',
        timestamp: new Date()
      });

      console.log('[PDFConverter] PDF print dialog opened');
      return { success: true, method: 'browser' };

    } catch (error) {
      console.error('[PDFConverter] Error in browser PDF conversion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate downloadable PDF using jsPDF library
   * This creates an actual PDF file that can be downloaded
   */
  async convertHTMLToPDF_jsPDF(htmlContent, filename) {
    console.log('[PDFConverter] Converting HTML to PDF (jsPDF method)...');

    try {
      // Load jsPDF and html2canvas from CDN if not already loaded
      if (!window.jspdf) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      }
      if (!window.html2canvas) {
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      }

      const { jsPDF } = window.jspdf;

      // Create temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4 width
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save PDF
      pdf.save(filename);

      // Clean up
      document.body.removeChild(container);

      this.addToHistory({
        filename,
        method: 'jspdf',
        status: 'success',
        timestamp: new Date()
      });

      console.log('[PDFConverter] PDF generated and downloaded');
      return { success: true, method: 'jspdf', filename };

    } catch (error) {
      console.error('[PDFConverter] Error in jsPDF conversion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Server-side PDF conversion using Cloudflare Workers API
   * This is the most robust method but requires backend support
   */
  async convertHTMLToPDF_Server(htmlContent, filename) {
    console.log('[PDFConverter] Converting HTML to PDF (Server method)...');

    try {
      // Send request to backend PDF generation endpoint
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: htmlContent,
          filename,
          options: this.config
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      // Get PDF blob
      const blob = await response.blob();

      // Download file
      this.downloadBlob(blob, filename);

      this.addToHistory({
        filename,
        method: 'server',
        status: 'success',
        timestamp: new Date()
      });

      console.log('[PDFConverter] PDF generated and downloaded from server');
      return { success: true, method: 'server', filename };

    } catch (error) {
      console.error('[PDFConverter] Error in server PDF conversion:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Smart PDF conversion - tries multiple methods
   */
  async convertToPDF(htmlContent, filename, preferredMethod = 'auto') {
    console.log(`[PDFConverter] Converting to PDF (method: ${preferredMethod})...`);

    // Add to queue
    const queueItem = {
      id: Date.now(),
      filename,
      htmlContent,
      method: preferredMethod,
      status: 'pending',
      startedAt: new Date()
    };
    this.conversionQueue.push(queueItem);

    let result;

    try {
      if (preferredMethod === 'browser' || preferredMethod === 'auto') {
        // Try browser method first (simplest)
        result = await this.convertHTMLToPDF_Browser(htmlContent, filename);
        if (result.success) {
          queueItem.status = 'completed';
          queueItem.method = 'browser';
          return result;
        }
      }

      if (preferredMethod === 'jspdf' || preferredMethod === 'auto') {
        // Try jsPDF method
        result = await this.convertHTMLToPDF_jsPDF(htmlContent, filename);
        if (result.success) {
          queueItem.status = 'completed';
          queueItem.method = 'jspdf';
          return result;
        }
      }

      if (preferredMethod === 'server' || preferredMethod === 'auto') {
        // Try server method
        result = await this.convertHTMLToPDF_Server(htmlContent, filename);
        if (result.success) {
          queueItem.status = 'completed';
          queueItem.method = 'server';
          return result;
        }
      }

      // All methods failed
      queueItem.status = 'failed';
      throw new Error('All PDF conversion methods failed');

    } catch (error) {
      queueItem.status = 'failed';
      queueItem.error = error.message;
      console.error('[PDFConverter] PDF conversion failed:', error);
      return { success: false, error: error.message };
    } finally {
      queueItem.completedAt = new Date();
    }
  }

  /**
   * Download HTML as file (fallback if PDF fails)
   */
  downloadAsHTML(htmlContent, filename) {
    console.log('[PDFConverter] Downloading as HTML...');

    try {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      this.downloadBlob(blob, filename.replace('.pdf', '.html'));

      this.addToHistory({
        filename: filename.replace('.pdf', '.html'),
        method: 'html',
        status: 'success',
        timestamp: new Date()
      });

      return { success: true, method: 'html' };

    } catch (error) {
      console.error('[PDFConverter] Error downloading HTML:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper: Download blob as file
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Helper: Load external script
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Optimize HTML for PDF conversion
   */
  optimizeHTMLForPDF(htmlContent) {
    console.log('[PDFConverter] Optimizing HTML for PDF...');

    // Add PDF-specific styles
    const pdfStyles = `
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .page-break { page-break-after: always; }
          .no-print { display: none !important; }
          a { text-decoration: none; color: #000; }
          img { max-width: 100%; height: auto; }
        }
        @page {
          size: A4;
          margin: 20mm 15mm;
        }
      </style>
    `;

    // Insert styles before </head>
    const optimized = htmlContent.replace('</head>', `${pdfStyles}</head>`);

    return optimized;
  }

  /**
   * Add to conversion history
   */
  addToHistory(record) {
    this.conversionHistory.unshift(record);
    
    // Keep only last 50 records
    if (this.conversionHistory.length > 50) {
      this.conversionHistory = this.conversionHistory.slice(0, 50);
    }

    // Save to localStorage
    try {
      localStorage.setItem(
        'plancraft_pdf_history',
        JSON.stringify(this.conversionHistory)
      );
    } catch (error) {
      console.warn('[PDFConverter] Failed to save history to localStorage:', error);
    }
  }

  /**
   * Load conversion history from localStorage
   */
  loadHistory() {
    try {
      const saved = localStorage.getItem('plancraft_pdf_history');
      if (saved) {
        this.conversionHistory = JSON.parse(saved);
        console.log(`[PDFConverter] Loaded ${this.conversionHistory.length} history records`);
      }
    } catch (error) {
      console.warn('[PDFConverter] Failed to load history from localStorage:', error);
    }
  }

  /**
   * Get conversion history
   */
  getHistory(limit = 10) {
    return this.conversionHistory.slice(0, limit);
  }

  /**
   * Get conversion queue status
   */
  getQueueStatus() {
    return {
      total: this.conversionQueue.length,
      pending: this.conversionQueue.filter(q => q.status === 'pending').length,
      completed: this.conversionQueue.filter(q => q.status === 'completed').length,
      failed: this.conversionQueue.filter(q => q.status === 'failed').length,
      queue: this.conversionQueue
    };
  }

  /**
   * Clear conversion queue
   */
  clearQueue() {
    this.conversionQueue = [];
  }

  /**
   * Export converter data
   */
  exportData() {
    return {
      config: this.config,
      queue: this.getQueueStatus(),
      history: this.conversionHistory
    };
  }
}

// Make globally available
window.PDFConverter = PDFConverter;

// Initialize and load history
const pdfConverter = new PDFConverter();
pdfConverter.loadHistory();

console.log('[PDFConverter] Module loaded successfully');
