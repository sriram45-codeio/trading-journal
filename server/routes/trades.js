const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const authMiddleware = require('../middleware/auth');
const tradesController = require('../controllers/tradesController');
const db = require('../db/database');

router.use(authMiddleware);

router.post('/', tradesController.createTrade);
router.get('/', tradesController.getAllTrades);
router.put('/:id', tradesController.updateTrade);
router.delete('/:id', tradesController.deleteTrade);

router.get('/export-pdf', async (req, res) => {
  try {
    const tradesRes = await db.query('SELECT * FROM trades WHERE user_id = $1 AND deleted_at IS NULL ORDER BY trade_date DESC, created_at DESC', [req.user.id]);
    const trades = tradesRes.rows;

    const wins = trades.filter(t => t.outcome === 'WIN');
    const losses = trades.filter(t => t.outcome === 'LOSS');
    const total_trades = trades.length;

    const win_rate = total_trades > 0 ? ((wins.length / total_trades) * 100).toFixed(2) : '0.00';
    const total_net_pnl = trades.reduce((sum, t) => sum + t.net_pnl, 0).toFixed(2);
    const avg_win_pnl = wins.length > 0 ? (wins.reduce((sum, t) => sum + t.net_pnl, 0) / wins.length).toFixed(2) : '0.00';
    const avg_loss_pnl = losses.length > 0 ? (losses.reduce((sum, t) => sum + t.net_pnl, 0) / losses.length).toFixed(2) : '0.00';
    
    // Tap count as adherence metric
    const rules_followed_count = trades.filter(t => t.key_level_tap === 'YES').length;
    const rules_followed_rate = total_trades > 0 ? ((rules_followed_count / total_trades) * 100).toFixed(2) : '0.00';

    const doc = new PDFDocument({ size: 'A4', margins: { top: 40, bottom: 40, left: 40, right: 40 }, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="trading-journal-report.pdf"');
    doc.pipe(res);

    // HEADER SECTION
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#f35936').text('TRADING JOURNAL REPORT', { align: 'center' });
    doc.moveDown(0.2);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#E5E7EB').lineWidth(1).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9.5).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleDateString()}  |  Account: ${req.user.email}  |  Platform: Zerodha Kite Style`, { align: 'center' });
    doc.moveDown(1.2);

    // ANALYTICS SUMMARY BOX
    const boxX = 40;
    const boxY = doc.y;
    const boxWidth = doc.page.width - 80;
    const boxHeight = 110;

    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 4)
       .fillColor('#1F1F1F')
       .strokeColor('#2D2D2D')
       .lineWidth(1)
       .fillAndStroke();

    doc.fillColor('#FFFFFF');
    doc.font('Helvetica-Bold').fontSize(11).text('Performance Summary Dashboard', boxX + 15, boxY + 12);

    const drawStat = (label, value, x, y, valColor = '#FFFFFF') => {
      doc.fillColor('#888888').font('Helvetica').fontSize(8).text(label, x, y);
      doc.fillColor(valColor).font('Helvetica-Bold').fontSize(12).text(value, x, y + 10);
    };

    const row1Y = boxY + 32;
    const row2Y = boxY + 70;

    drawStat('Total Trades', total_trades.toString(), boxX + 15, row1Y);
    drawStat('Win Rate', `${win_rate}%`, boxX + 130, row1Y, '#2ebd85');
    drawStat('Net P&L', `$${total_net_pnl}`, boxX + 245, row1Y, parseFloat(total_net_pnl) >= 0 ? '#2ebd85' : '#df514c');
    drawStat('Key Level Taps', `${rules_followed_rate}%`, boxX + 360, row1Y, parseFloat(rules_followed_rate) >= 80 ? '#2ebd85' : '#df514c');

    drawStat('Total Wins', wins.length.toString(), boxX + 15, row2Y, '#2ebd85');
    drawStat('Total Losses', losses.length.toString(), boxX + 130, row2Y, '#df514c');
    drawStat('Avg Win P&L', `$${avg_win_pnl}`, boxX + 245, row2Y, '#2ebd85');
    drawStat('Avg Loss P&L', `$${avg_loss_pnl}`, boxX + 360, row2Y, '#df514c');

    doc.y = boxY + boxHeight + 20;

    // DETAILED JOURNAL ENTRY LOGS
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#f35936').text('Detailed Trade Logs');
    doc.moveDown(0.5);

    const checkPageBreak = (neededHeight) => {
      const bottomLimit = doc.page.height - 50;
      if (doc.y + neededHeight > bottomLimit) {
        doc.addPage();
        return true;
      }
      return false;
    };

    trades.forEach((trade, idx) => {
      // Estimated height for this trade report card
      // Let's budget ~180 points for headings + notes text
      checkPageBreak(170);

      const entryY = doc.y;
      const cardWidth = doc.page.width - 80;
      
      // Trade Header Bar
      const headerHeight = 22;
      const isWin = trade.outcome === 'WIN';
      const sideColor = trade.direction === 'BUY' ? '#4184f3' : '#df514c';
      
      doc.rect(40, entryY, cardWidth, headerHeight)
         .fill(isWin ? '#1b2c24' : trade.outcome === 'LOSS' ? '#2d1b1a' : '#222222');

      // Left Accent bar indicating BUY or SELL direction
      doc.rect(40, entryY, 4, headerHeight).fill(sideColor);

      // Header Text
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text(`TRADE #${trade.id}`, 48, entryY + 6);
      doc.font('Helvetica').fontSize(8.5);
      doc.text(`Date: ${trade.trade_date} ${trade.trade_time || ''}`, 120, entryY + 6);
      doc.text(`Session: ${trade.session || '—'}`, 260, entryY + 6);
      doc.font('Helvetica-Bold');
      doc.text(`${trade.direction}`, 360, entryY + 6, { color: sideColor });
      
      const pnlSign = trade.net_pnl >= 0 ? '+' : '';
      const pnlColor = trade.net_pnl > 0 ? '#2ebd85' : trade.net_pnl < 0 ? '#df514c' : '#888888';
      doc.fillColor(pnlColor).text(`P&L: ${pnlSign}$${trade.net_pnl.toFixed(2)}`, 430, entryY + 6);

      let currentY = entryY + headerHeight + 8;
      doc.y = currentY;

      // 2-Column Metrics Box
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#f35936').text('Checklist / Metrics', 45, doc.y);
      doc.font('Helvetica-Bold').fontSize(8.5).text('Financials', 285, doc.y);
      doc.moveDown(0.2);

      // Draw values
      const valY = doc.y;
      doc.font('Helvetica').fontSize(8).fillColor('#FFFFFF');
      doc.text(`Bias: ${trade.bias || '—'}`, 45, valY);
      doc.text(`Keylevel: ${trade.key_level || '—'}`, 45, valY + 11);
      doc.text(`Keylevel Tap: ${trade.key_level_tap || '—'}`, 45, valY + 22);
      doc.text(`CISD: ${trade.cisd || '—'}`, 45, valY + 33);

      doc.text(`Direction: ${trade.direction}`, 285, valY);
      doc.text(`Risk / Exposure: ${trade.risk != null ? `$${trade.risk}` : '—'}`, 285, valY + 11);
      doc.text(`Outcome Result: ${trade.outcome}`, 285, valY + 22);

      doc.y = valY + 45;

      // Large Narrative logs
      const drawTextLog = (title, content) => {
        if (!content) return;
        checkPageBreak(35);
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#f35936').text(title);
        doc.font('Helvetica').fontSize(8).fillColor('#CCCCCC');
        doc.moveDown(0.15);
        doc.text(content, { width: cardWidth - 10, align: 'justify' });
        doc.moveDown(0.5);
      };

      drawTextLog('Why This Trade (Market Logic & Setup Confirmation)', trade.why_this_trade);
      drawTextLog('Emotion / Mindset Notes', trade.emotion_mindset);
      drawTextLog('Mistake / Improvement Actions', trade.mistake_improve);

      // Card bottom divider line
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#2D2D2D').lineWidth(1).stroke();
      doc.moveDown(1);
    });

    // Add page numbers on the footer of all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      // Dark background accent for PDF
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#191919').fill('destination-over');
      
      doc.fillColor('#888888').font('Helvetica').fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pages.count}  |  Zerodha Kite Styled Report`,
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
    }

    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;
