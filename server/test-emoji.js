const PDFDocument = require('pdfkit');
const fs = require('fs');

try {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('test-emoji.pdf'));
  doc.font('Helvetica').text('Hello World 🚀');
  doc.end();
  console.log('PDF generated successfully!');
} catch (err) {
  console.error('PDF generation crashed:', err.message);
}
