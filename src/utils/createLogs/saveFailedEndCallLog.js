const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

async function appendEndCallLogToExcel({ agentId, callId, duration, errorMessage }) {
  const logsDir = path.join(__dirname, '..', '../protected/logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

//   console.log('[appendEndCallLogToExcel] logsDir =', logsDir);

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const fileName = `failed_End_Call_Logs_${year}_${month}.xlsx`;
  const filePath = path.join(logsDir, fileName);

  const logEntry = {
    timestamp: now.toISOString(),
    agentId,
    callId,
    duration,
    errorMessage
  };
// console.log('[appendEndCallLogToExcel] will write entry:', logEntry);

  let workbook;
  let worksheet;
try {
  if (fs.existsSync(filePath)) {
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
  } else {
    workbook = XLSX.utils.book_new();
    worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
  }

  const existingData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  existingData.push(logEntry);

  const newSheet = XLSX.utils.json_to_sheet(existingData);
  workbook.Sheets[workbook.SheetNames[0]] = newSheet;

  XLSX.writeFile(workbook, filePath);
} catch (xlsxErr) {
  console.error('‼️  XLSX.writeFile failed:', xlsxErr);
}
}

module.exports = { appendEndCallLogToExcel };
