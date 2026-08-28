const cron = require("node-cron");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const Invoice = require("../models/DivineitpngInvoice");

const REPORT_RECIPIENT = "Divineitpngwhitefield@gmail.com";
let schedulerStarted = false;
const emailPass = String(process.env.EMAIL_PASS || "").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPass,
  },
});

const compareInvoiceNumbers = (left, right) =>
  String(left || "").localeCompare(String(right || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });

const parseInvoiceDate = (value) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const parts = String(value).split(/[/-]/).map((item) => Number(item));
  if (parts.length === 3) {
    const [first, second, third] = parts;
    const fallback = new Date(third, second - 1, first);
    if (!Number.isNaN(fallback.getTime())) {
      return fallback;
    }
  }

  return null;
};

const resolveTargetMonth = ({ period = "current", month, year, baseDate = new Date() } = {}) => {
  if (Number.isInteger(Number(month)) && Number.isInteger(Number(year))) {
    return {
      month: Number(month),
      year: Number(year),
    };
  }

  const targetDate = new Date(baseDate);
  if (period === "previous") {
    targetDate.setMonth(targetDate.getMonth() - 1);
  }

  return {
    month: targetDate.getMonth() + 1,
    year: targetDate.getFullYear(),
  };
};

const monthLabel = ({ month, year }) =>
  new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

const formatInvoiceRows = (invoices) =>
  invoices.map((invoice) => ({
    invoiceNumber: invoice.invoiceNumber || "",
    jobNumber: invoice.jobNumber || "",
    customerName: invoice.customerName || "",
    customerEmail: invoice.customerEmail || "",
    customerNumber: invoice.customerNumber || "",
    gstNumber: invoice.gstNumber || "",
    invoiceDate: invoice.invoiceDate || "",
    taxPercent: Number(invoice.taxPercent || 0),
    products: Array.isArray(invoice.products)
      ? invoice.products
          .map(
            (product) => `${product.name || ""} (Qty: ${product.quantity || 0}, Price: ${product.price || 0})`,
          )
          .join("; ")
      : "",
    subtotal: Number(invoice.subtotal || 0),
    tax: Number(invoice.tax || 0),
    total: Number(invoice.total || 0),
  }));

const buildWorkbook = ({ invoices }) => {
  const invoiceRows = formatInvoiceRows(invoices);
  const workbook = XLSX.utils.book_new();
  const invoicesSheet = XLSX.utils.json_to_sheet(invoiceRows);

  XLSX.utils.book_append_sheet(workbook, invoicesSheet, "Invoices");

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
};

const fetchInvoicesForMonth = async ({ month, year }) => {
  const invoices = await Invoice.find({ deleted: false }).lean();

  return invoices
    .filter((invoice) => {
      const parsedDate = parseInvoiceDate(invoice.invoiceDate);
      return parsedDate && parsedDate.getMonth() + 1 === month && parsedDate.getFullYear() === year;
    })
    .sort((left, right) => compareInvoiceNumbers(left.invoiceNumber, right.invoiceNumber));
};

const sendMonthlyInvoiceReport = async (options = {}) => {
  const target = resolveTargetMonth(options);
  const invoices = await fetchInvoicesForMonth(target);

  if (invoices.length === 0) {
    throw new Error(`No invoices found for ${monthLabel(target)}`);
  }

  const periodLabel = monthLabel(target);
  const workbookBuffer = buildWorkbook({ invoices });
  const fileName = `Divineitpng_Monthly_Report_${target.year}_${String(target.month).padStart(2, "0")}.xlsx`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: REPORT_RECIPIENT,
    subject: `Divineitpng Monthly Invoice Report - ${periodLabel}`,
    text: `Attached is the Divineitpng monthly invoice report for ${periodLabel}.`,
    html: `<p>Attached is the Divineitpng monthly invoice report for <strong>${periodLabel}</strong>.</p>`,
    attachments: [
      {
        filename: fileName,
        content: workbookBuffer,
      },
    ],
  });

  return {
    recipient: REPORT_RECIPIENT,
    periodLabel,
    invoiceCount: invoices.length,
    fileName,
  };
};

const initializeMonthlyInvoiceReportScheduler = () => {
  if (schedulerStarted) {
    return;
  }

  cron.schedule("0 9 1 * *", async () => {
    try {
      const result = await sendMonthlyInvoiceReport({ period: "previous" });
      console.log(`Monthly invoice report sent to ${result.recipient} for ${result.periodLabel}`);
    } catch (error) {
      console.error("Failed to send scheduled monthly invoice report:", error.message);
    }
  });

  schedulerStarted = true;
};

module.exports = {
  formatInvoiceRows,
  initializeMonthlyInvoiceReportScheduler,
  sendMonthlyInvoiceReport,
};