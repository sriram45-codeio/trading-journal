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
    const tradesRes = await db.query('SELECT * FROM trades WHERE user_id = $1 AND deleted_at IS NULL ORDER BY trade_date DESC, created_at DESC, id DESC', [req.user.id]);
    const trades = tradesRes.rows;

    const wins = trades.filter(t => t.outcome === 'WIN');
    const losses = trades.filter(t => t.outcome === 'LOSS');
    const activeTrades = trades.filter(t => t.outcome !== 'HOLD');
    const total_trades = activeTrades.length;

    const win_rate = total_trades > 0 ? ((wins.length / total_trades) * 100).toFixed(2) : '0.00';
    const total_net_pnl = trades.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0).toFixed(2);
    const avg_win_pnl = wins.length > 0 ? (wins.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0) / wins.length).toFixed(2) : '0.00';
    const avg_loss_pnl = losses.length > 0 ? (losses.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0) / losses.length).toFixed(2) : '0.00';
    
    // Tap count as adherence metric
    const rules_followed_count = activeTrades.filter(t => t.key_level_tap === 'YES').length;
    const rules_followed_rate = total_trades > 0 ? ((rules_followed_count / total_trades) * 100).toFixed(2) : '0.00';

    const userRes = await db.query('SELECT starting_capital FROM users WHERE id = $1', [req.user.id]);
    const rawCap = userRes.rows[0]?.starting_capital;
    const startingCapital = (rawCap !== null && rawCap !== undefined && !isNaN(parseFloat(rawCap))) 
      ? parseFloat(rawCap) 
      : 0.0;

    // Compute running balances chronologically
    const tradesAsc = [...trades].reverse();
    let currentBalance = startingCapital;
    const balanceMap = {};
    tradesAsc.forEach(t => {
      currentBalance += parseFloat(t.net_pnl);
      balanceMap[t.id] = parseFloat(currentBalance.toFixed(2));
    });

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      bufferPages: true,
      autoFirstPage: false
    });

    // Automatically draw dark background on every page
    doc.on('pageAdded', () => {
      doc.save();
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#191919').fill();
      doc.restore();
    });

    // Add initial page
    doc.addPage();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="trading-journal-report.pdf"');
    doc.pipe(res);

    // HEADER SECTION
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#f35936').text('TRADING JOURNAL REPORT', { align: 'center' });
    doc.moveDown(0.2);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#E5E7EB').lineWidth(1).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9.5).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleDateString()}  |  Account: ${req.user.email}  |  Starting Capital: $${startingCapital.toFixed(2)}  |  End Balance: $${(startingCapital + parseFloat(total_net_pnl)).toFixed(2)}`, { align: 'center' });
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
      checkPageBreak(190);

      const entryY = doc.y;
      const cardWidth = doc.page.width - 80;
      
      const headerHeight = 22;
      const isWin = trade.outcome === 'WIN';
      const sideColor = trade.direction === 'BUY' ? '#4184f3' : '#df514c';
      
      doc.rect(40, entryY, cardWidth, headerHeight)
         .fill(isWin ? '#1b2c24' : trade.outcome === 'LOSS' ? '#2d1b1a' : '#222222');

      doc.rect(40, entryY, 4, headerHeight).fill(sideColor);

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text(`TRADE #${trade.id}`, 48, entryY + 6);
      doc.font('Helvetica').fontSize(8.5);
      doc.text(`Date: ${trade.trade_date} ${trade.trade_time || ''}`, 120, entryY + 6);
      doc.text(`Session: ${trade.session || '—'}`, 260, entryY + 6);
      doc.font('Helvetica-Bold').fillColor(sideColor);
      doc.text(`${trade.direction}`, 360, entryY + 6);
      
      const parsedPnl = parseFloat(trade.net_pnl || 0);
      const pnlSign = parsedPnl >= 0 ? '+' : '';
      const pnlColor = parsedPnl > 0 ? '#2ebd85' : parsedPnl < 0 ? '#df514c' : '#888888';
      doc.fillColor(pnlColor).text(`P&L: ${pnlSign}$${parsedPnl.toFixed(2)}`, 430, entryY + 6);

      let currentY = entryY + headerHeight + 8;
      doc.y = currentY;

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#f35936').text('Checklist / Metrics', 45, doc.y);
      doc.font('Helvetica-Bold').fontSize(8.5).text('Financials', 285, doc.y);
      doc.moveDown(0.2);

      const valY = doc.y;
      doc.font('Helvetica').fontSize(8).fillColor('#FFFFFF');
      doc.text(`Bias: ${trade.bias || '—'}`, 45, valY);
      doc.text(`Keylevel: ${trade.key_level || '—'}`, 45, valY + 11);
      doc.text(`Keylevel Tap: ${trade.key_level_tap || '—'}`, 45, valY + 22);
      doc.text(`CISD: ${trade.cisd || '—'}`, 45, valY + 33);

      const balanceAfter = balanceMap[trade.id] !== undefined ? balanceMap[trade.id] : startingCapital;

      doc.text(`Direction: ${trade.direction}`, 285, valY);
      doc.text(`Risk / Exposure: ${trade.risk != null ? `$${trade.risk}` : '—'}`, 285, valY + 11);
      doc.text(`Risk:Reward: ${trade.rr_ratio || '1:1'}`, 285, valY + 22);
      doc.text(`Outcome Result: ${trade.outcome}`, 285, valY + 33);
      doc.text(`Account Balance: $${balanceAfter.toFixed(2)}`, 285, valY + 44);

      doc.y = valY + 56;

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

      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#2D2D2D').lineWidth(1).stroke();
      doc.moveDown(1);
    });

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.fillColor('#888888').font('Helvetica').fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pages.count}  |  Zerodha Kite Styled Report`,
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
      doc.page.margins.bottom = oldBottomMargin;
    }

    doc.end();
  } catch (error) {
    console.error('PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

router.get('/export-monthly-pdf', async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res.status(400).json({ error: 'Month parameter is required (YYYY-MM)' });
    }

    const userRes = await db.query('SELECT starting_capital FROM users WHERE id = $1', [req.user.id]);
    const rawCap = userRes.rows[0]?.starting_capital;
    const startingCapital = (rawCap !== null && rawCap !== undefined && !isNaN(parseFloat(rawCap))) 
      ? parseFloat(rawCap) 
      : 0.0;

    const allTradesRes = await db.query(
      'SELECT * FROM trades WHERE user_id = $1 AND deleted_at IS NULL ORDER BY trade_date ASC, created_at ASC, id ASC',
      [req.user.id]
    );
    const allTrades = allTradesRes.rows;

    let runningBalance = startingCapital;
    const balanceMap = {};
    let monthStartingBalance = startingCapital;
    let foundMonth = false;

    allTrades.forEach(t => {
      let dateStr = "";
      if (typeof t.trade_date === 'string') {
        dateStr = t.trade_date;
      } else if (t.trade_date instanceof Date) {
        const year = t.trade_date.getFullYear();
        const monthVal = String(t.trade_date.getMonth() + 1).padStart(2, '0');
        const day = String(t.trade_date.getDate()).padStart(2, '0');
        dateStr = `${year}-${monthVal}-${day}`;
      } else if (t.trade_date) {
        dateStr = String(t.trade_date);
      } else {
        dateStr = new Date().toISOString().substring(0, 10);
      }
      const tMonth = dateStr.substring(0, 7);
      if (tMonth === month && !foundMonth) {
        monthStartingBalance = runningBalance;
        foundMonth = true;
      }
      runningBalance += parseFloat(t.net_pnl);
      balanceMap[t.id] = parseFloat(runningBalance.toFixed(2));
    });

    if (!foundMonth && allTrades.length > 0) {
      monthStartingBalance = runningBalance;
    }

    const monthTrades = allTrades
      .filter(t => {
        let dateStr = "";
        if (typeof t.trade_date === 'string') {
          dateStr = t.trade_date;
        } else if (t.trade_date instanceof Date) {
          const year = t.trade_date.getFullYear();
          const monthVal = String(t.trade_date.getMonth() + 1).padStart(2, '0');
          const day = String(t.trade_date.getDate()).padStart(2, '0');
          dateStr = `${year}-${monthVal}-${day}`;
        } else if (t.trade_date) {
          dateStr = String(t.trade_date);
        } else {
          dateStr = new Date().toISOString().substring(0, 10);
        }
        return dateStr.substring(0, 7) === month;
      })
      .reverse();

    const wins = monthTrades.filter(t => t.outcome === 'WIN');
    const losses = monthTrades.filter(t => t.outcome === 'LOSS');
    const activeTrades = monthTrades.filter(t => t.outcome !== 'HOLD');
    const total_trades = activeTrades.length;

    const win_rate = total_trades > 0 ? ((wins.length / total_trades) * 100).toFixed(2) : '0.00';
    const total_net_pnl = monthTrades.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0).toFixed(2);
    const ending_balance = parseFloat((monthStartingBalance + parseFloat(total_net_pnl)).toFixed(2));
    const avg_win_pnl = wins.length > 0 ? (wins.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0) / wins.length).toFixed(2) : '0.00';
    const avg_loss_pnl = losses.length > 0 ? (losses.reduce((sum, t) => sum + parseFloat(t.net_pnl || 0), 0) / losses.length).toFixed(2) : '0.00';
    
    const rules_followed_count = activeTrades.filter(t => t.key_level_tap === 'YES').length;
    const rules_followed_rate = total_trades > 0 ? ((rules_followed_count / total_trades) * 100).toFixed(2) : '0.00';

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      bufferPages: true,
      autoFirstPage: false
    });

    doc.on('pageAdded', () => {
      doc.save();
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#191919').fill();
      doc.restore();
    });

    doc.addPage();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trading-journal-report-${month}.pdf"`);
    doc.pipe(res);

    doc.font('Helvetica-Bold').fontSize(22).fillColor('#f35936').text(`MONTHLY REPORT: ${month}`, { align: 'center' });
    doc.moveDown(0.2);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#E5E7EB').lineWidth(1).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9.5).fillColor('#6B7280').text(`Generated: ${new Date().toLocaleDateString()}  |  Account: ${req.user.email}  |  Starting Balance: $${monthStartingBalance.toFixed(2)}  |  Ending Balance: $${ending_balance.toFixed(2)}`, { align: 'center' });
    doc.moveDown(1.2);

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
    doc.font('Helvetica-Bold').fontSize(11).text(`${month} Monthly Summary`, boxX + 15, boxY + 12);

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

    doc.font('Helvetica-Bold').fontSize(14).fillColor('#f35936').text('Detailed Monthly Trade Logs');
    doc.moveDown(0.5);

    const checkPageBreak = (neededHeight) => {
      const bottomLimit = doc.page.height - 50;
      if (doc.y + neededHeight > bottomLimit) {
        doc.addPage();
        return true;
      }
      return false;
    };

    monthTrades.forEach((trade, idx) => {
      checkPageBreak(190);

      const entryY = doc.y;
      const cardWidth = doc.page.width - 80;
      
      const headerHeight = 22;
      const isWin = trade.outcome === 'WIN';
      const sideColor = trade.direction === 'BUY' ? '#4184f3' : '#df514c';
      
      doc.rect(40, entryY, cardWidth, headerHeight)
         .fill(isWin ? '#1b2c24' : trade.outcome === 'LOSS' ? '#2d1b1a' : '#222222');

      doc.rect(40, entryY, 4, headerHeight).fill(sideColor);

      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);
      doc.text(`TRADE #${trade.id}`, 48, entryY + 6);
      doc.font('Helvetica').fontSize(8.5);
      doc.text(`Date: ${trade.trade_date} ${trade.trade_time || ''}`, 120, entryY + 6);
      doc.text(`Session: ${trade.session || '—'}`, 260, entryY + 6);
      doc.font('Helvetica-Bold').fillColor(sideColor);
      doc.text(`${trade.direction}`, 360, entryY + 6);
      
      const parsedPnl = parseFloat(trade.net_pnl || 0);
      const pnlSign = parsedPnl >= 0 ? '+' : '';
      const pnlColor = parsedPnl > 0 ? '#2ebd85' : parsedPnl < 0 ? '#df514c' : '#888888';
      doc.fillColor(pnlColor).text(`P&L: ${pnlSign}$${parsedPnl.toFixed(2)}`, 430, entryY + 6);

      let currentY = entryY + headerHeight + 8;
      doc.y = currentY;

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#f35936').text('Checklist / Metrics', 45, doc.y);
      doc.font('Helvetica-Bold').fontSize(8.5).text('Financials', 285, doc.y);
      doc.moveDown(0.2);

      const valY = doc.y;
      doc.font('Helvetica').fontSize(8).fillColor('#FFFFFF');
      doc.text(`Bias: ${trade.bias || '—'}`, 45, valY);
      doc.text(`Keylevel: ${trade.key_level || '—'}`, 45, valY + 11);
      doc.text(`Keylevel Tap: ${trade.key_level_tap || '—'}`, 45, valY + 22);
      doc.text(`CISD: ${trade.cisd || '—'}`, 45, valY + 33);

      const balanceAfter = balanceMap[trade.id] !== undefined ? balanceMap[trade.id] : startingCapital;

      doc.text(`Direction: ${trade.direction}`, 285, valY);
      doc.text(`Risk / Exposure: ${trade.risk != null ? `$${trade.risk}` : '—'}`, 285, valY + 11);
      doc.text(`Risk:Reward: ${trade.rr_ratio || '1:1'}`, 285, valY + 22);
      doc.text(`Outcome Result: ${trade.outcome}`, 285, valY + 33);
      doc.text(`Account Balance: $${balanceAfter.toFixed(2)}`, 285, valY + 44);

      doc.y = valY + 56;

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

      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#2D2D2D').lineWidth(1).stroke();
      doc.moveDown(1);
    });

    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.fillColor('#888888').font('Helvetica').fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pages.count}  |  Zerodha Kite Styled Monthly Report`,
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
      doc.page.margins.bottom = oldBottomMargin;
    }

    doc.end();
  } catch (error) {
    console.error('Monthly PDF error:', error);
    res.status(500).json({ error: 'Failed to generate monthly PDF' });
  }
});



router.get('/:id/export-pdf', async (req, res) => {
  try {
    const tradeId = req.params.id;
    const tradeRes = await db.query(
      'SELECT * FROM trades WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [tradeId, req.user.id]
    );
    const trade = tradeRes.rows[0];

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 40, bottom: 40, left: 40, right: 40 },
      bufferPages: true,
      autoFirstPage: false
    });

    // Automatically draw dark background on every page
    doc.on('pageAdded', () => {
      doc.save();
      doc.rect(0, 0, doc.page.width, doc.page.height).fillColor('#191919').fill();
      doc.restore();
    });

    // Add initial page
    doc.addPage();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trade-${tradeId}-report.pdf"`);
    doc.pipe(res);

    // 2. Header Branding
    doc.font('Helvetica-Bold').fontSize(20).fillColor('#06b6d4').text('INDIVIDUAL TRADE RUNSHEET', { align: 'center' });
    doc.moveDown(0.2);
    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).strokeColor('#2D2D2D').lineWidth(1.5).stroke();
    doc.moveDown(0.4);
    
    // Sub-header details
    doc.font('Helvetica').fontSize(9).fillColor('#888888').text(
      `Generated: ${new Date().toLocaleDateString()}  |  Account: ${req.user.email}  |  Trade Reference ID: #${trade.id}`,
      { align: 'center' }
    );
    doc.moveDown(1.5);

    // 3. Two-Column Stats Block
    const startY = doc.y;
    const boxWidth = 245;
    const boxHeight = 135;

    // LEFT COLUMN: Checklist & Verification
    doc.roundedRect(40, startY, boxWidth, boxHeight, 6)
       .fillColor('#1E293B') // slate-800
       .strokeColor('#334155') // slate-700
       .lineWidth(1)
       .fillAndStroke();

    doc.fillColor('#06b6d4').font('Helvetica-Bold').fontSize(11).text('Checklist Verification', 55, startY + 12);
    
    const drawItem = (label, value, isAccented = false, accentVal = '', valColor = '#FFFFFF', xOff = 55, yOff = 0) => {
      doc.fillColor('#888888').font('Helvetica').fontSize(8.5).text(label, xOff, yOff);
      doc.fillColor(valColor).font('Helvetica-Bold').fontSize(9.5).text(value, xOff + 95, yOff);
    };

    drawItem('Trading Session:', trade.session || '—', false, '', '#FFFFFF', 55, startY + 36);
    drawItem('Market Bias:', trade.bias || '—', false, '', trade.bias === 'Bullish' ? '#2ebd85' : trade.bias === 'Bearish' ? '#df514c' : '#FFFFFF', 55, startY + 54);
    drawItem('Key Level:', trade.key_level || '—', false, '', '#FFFFFF', 55, startY + 72);
    drawItem('Key Level Tap:', trade.key_level_tap || '—', false, '', trade.key_level_tap === 'YES' ? '#2ebd85' : '#df514c', 55, startY + 90);
    drawItem('CISD Formed:', trade.cisd || '—', false, '', trade.cisd === 'YES' ? '#2ebd85' : '#df514c', 55, startY + 108);

    // RIGHT COLUMN: Financials & Outcome
    doc.roundedRect(305, startY, boxWidth, boxHeight, 6)
       .fillColor('#1E293B')
       .strokeColor('#334155')
       .lineWidth(1)
       .fillAndStroke();

    doc.fillColor('#7c3aed').font('Helvetica-Bold').fontSize(11).text('Financials & Outcome', 320, startY + 12);

    const isWin = trade.outcome === 'WIN';
    const isHold = trade.outcome === 'HOLD';
    const sideColor = trade.direction === 'BUY' ? '#4184f3' : '#df514c';
    const parsedPnl = parseFloat(trade.net_pnl || 0);
    const pnlColor = parsedPnl > 0 ? '#2ebd85' : parsedPnl < 0 ? '#df514c' : '#888888';
    const pnlSign = parsedPnl >= 0 ? '+' : '';

    drawItem('Trade Date:', trade.trade_date, false, '', '#FFFFFF', 320, startY + 36);
    drawItem('Trade Time (IST):', trade.trade_time || '—', false, '', '#FFFFFF', 320, startY + 54);
    drawItem('Order Direction:', trade.direction, false, '', sideColor, 320, startY + 72);
    drawItem('Risk Exposure:', trade.risk != null ? `$${trade.risk.toFixed(2)}` : '—', false, '', '#FFFFFF', 320, startY + 90);
    drawItem('Outcome Result:', trade.outcome, false, '', isWin ? '#2ebd85' : isHold ? '#888888' : '#df514c', 320, startY + 108);

    doc.y = startY + boxHeight + 20;

    // 4. Hero P&L Banner
    const pnlBannerY = doc.y;
    doc.roundedRect(40, pnlBannerY, doc.page.width - 80, 54, 6)
       .fillColor(isWin ? '#1b2c24' : isHold ? '#222222' : '#2d1b1a')
       .strokeColor(isWin ? '#233d32' : isHold ? '#333333' : '#3d2322')
       .lineWidth(1)
       .fillAndStroke();

    // Accent line on left of P&L
    doc.rect(40, pnlBannerY, 4, 54).fill(isWin ? '#2ebd85' : isHold ? '#888888' : '#df514c');

    doc.fillColor('#FFFFFF').font('Helvetica').fontSize(9.5).text('NET PROFIT / LOSS:', 60, pnlBannerY + 22);
    doc.fillColor(pnlColor).font('Helvetica-Bold').fontSize(20).text(
      `${pnlSign}$${parsedPnl.toFixed(2)}`,
      200,
      pnlBannerY + 16
    );
    doc.fillColor(isWin ? '#2ebd85' : isHold ? '#888888' : '#df514c').font('Helvetica-Bold').fontSize(12).text(
      trade.outcome === 'WIN' ? 'WINNING TRADE' : trade.outcome === 'HOLD' ? 'TRADE ON HOLD' : 'LOSS ENCOUNTERED',
      380,
      pnlBannerY + 21
    );

    doc.y = pnlBannerY + 54 + 20;

    // 5. Narrative blocks
    const drawNarrativeBlock = (title, content, headerColor, iconColor) => {
      const boxW = doc.page.width - 80;
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(headerColor).text(title);
      doc.moveDown(0.2);
      
      const textHeight = content ? doc.heightOfString(content, { width: boxW - 20, align: 'justify' }) : 14;
      const cardH = Math.max(textHeight + 20, 42);

      const blockY = doc.y;
      doc.roundedRect(40, blockY, boxW, cardH, 6)
         .fillColor('#0F172A') // slate-900
         .strokeColor('#1E293B')
         .lineWidth(1)
         .fillAndStroke();

      doc.fillColor('#CCCCCC').font('Helvetica').fontSize(9);
      doc.text(
        content || 'No journal narrative recorded for this section.',
        50,
        blockY + 10,
        { width: boxW - 20, align: 'justify', lineHeight: 1.3 }
      );
      doc.y = blockY + cardH + 16;
    };

    drawNarrativeBlock('PART A: SETUP LOGIC (WHY THIS TRADE?)', trade.why_this_trade, '#06b6d4', '#06b6d4');
    drawNarrativeBlock('PART B: PSYCHOLOGY (EMOTION / MINDSET NOTES)', trade.emotion_mindset, '#7c3aed', '#7c3aed');
    drawNarrativeBlock('PART C: MISTAKE & ACTIONABLE IMPROVEMENTS', trade.mistake_improve, '#df514c', '#df514c');

    // Footer Page Tag on all pages
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Temporarily disable bottom margin wrap to prevent extra page creation
      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      
      doc.fillColor('#888888').font('Helvetica').fontSize(8);
      doc.text(
        `Page ${i + 1} of ${pages.count}  |  Zerodha Kite Premium Runsheet  |  Confidential Trading Journal`,
        40,
        doc.page.height - 25,
        { align: 'center', width: doc.page.width - 80 }
      );
      
      doc.page.margins.bottom = oldBottomMargin;
    }

    doc.end();
  } catch (error) {
    console.error('PDF error for single trade:', error);
    res.status(500).json({ error: 'Failed to generate single trade PDF' });
  }
});

module.exports = router;
