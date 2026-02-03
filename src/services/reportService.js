const xlsx = require("xlsx");
const path = require("path");
const submissionService = require("./submissionService");

const generateDailyReport = async () => {
  const submissions = await submissionService.getDailySubmission();

  if (submissions.length === 0) return null;

  // Prepare data for Excel
  const data = submissions.map((submission) => {
    const row = {
      Department: submission.department.name,
      "Submitted By": submission.submittedBy.name,
      "Submission Time": submission.createdAt.toLocaleString(),
    };

    submission.department.metrics.forEach((metric) => {
      row[metric] = submission.data.get(metric) || 0;
    });

    return row;
  });

  // create wordbock (create xlsx file)
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(data);

  // Auto-adjust column widths
  const colWidths = Object.keys(data).map((key) => ({ wch: key.length + 5 }));
  ws["!cols"] = colWidths;

  xlsx.utils.book_append_sheet(wb, ws, "Daily Statistics");

  // Save file
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `Daily_Report_${dateStr}.xlsx`;
  const filePath = path.join(__dirname, "../../", "reports", fileName);

  xlsx.writeFile(wb, filePath);

  return filePath;
};

module.exports = {
  generateDailyReport,
};
