const Order = require("../models/order");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { formatDate } = require("./userAccount_controller");

const getSalesReport = async (req, res) => {
  try {
    let grandTotal = 0;
    let totalDiscount = 0;
    let filter = {};
    const filterValue = req.query.f || "t";

    const startDate = req.query["s-date"];
    const endDate = req.query["e-date"];
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate + "T00:00:00Z"),
        $lt: new Date(endDate + "T23:59:59Z"),
      };
    } else if (filterValue === "all") {
      filter = {};
    } else if (filterValue === "t") {
      filter = {
        createdAt: {
          $gte: new Date(new Date().setHours(00, 00, 00)),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
    } else if (filterValue === "w") {
      const today = new Date();
      const startOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay()
      );
      const endOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + (6 - today.getDay()),
        23,
        59,
        59,
        999
      );
      filter = {
        createdAt: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      };
    } else if (filterValue === "m") {
      const startOfMonth = new Date();
      startOfMonth.setHours(0, 0, 0, 0);
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setHours(23, 59, 59, 999);
      endOfMonth.setDate(
        new Date(
          startOfMonth.getFullYear(),
          startOfMonth.getMonth() + 1,
          0
        ).getDate()
      );
      filter = {
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      };
    }

    const orders = await Order.find({ status: "Delivered", ...filter })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name",
      })
      .populate("user", "fname")
      .sort({ createdAt: 1 })
      .exec();
    if (!orders) {
      console.log("no orders");
    }

    const sales = await Promise.all(
      orders.map(async (order) => ({
        ...order.toObject(),
        date: await formatDate(order.createdAt),
        user: order.user?.fname,
      }))
    );
    // find grand total and total discount
    await orders.forEach((order) => {
      grandTotal += order.totalAmount;
      totalDiscount += order.discount;
    });
    res.render("sales_report", {
      title: "Sales Report",
      sales,
      grandTotal,
      totalDiscount,
      filterValue,
      startDate,
      endDate,
    });
  } catch (err) {
    console.error("sales report page rendering error: ", err);
  }
};

// Download sales report
const downloadSalesReport = async (req, res) => {
  try {
    console.log("reached in sales report download route");
    let grandTotal = 0;
    let totalDiscount = 0;
    let filter = {};
    const format = req.query.f;
    const startDate = req.query["s-date"];
    const endDate = req.query["e-date"];
    const filterValue = req.query.d;

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate + "T00:00:00Z"),
        $lt: new Date(endDate + "T23:59:59Z"),
      };
    } else if (filterValue === "all") {
      filter = {};
    } else if (filterValue === "t") {
      filter = {
        createdAt: {
          $gte: new Date(new Date().setHours(00, 00, 00)),
          $lt: new Date(new Date().setHours(23, 59, 59)),
        },
      };
    } else if (filterValue === "w") {
      const today = new Date();
      const startOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - today.getDay()
      );
      const endOfWeek = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + (6 - today.getDay()),
        23,
        59,
        59,
        999
      );
      filter = {
        createdAt: {
          $gte: startOfWeek,
          $lt: endOfWeek,
        },
      };
    } else if (filterValue === "m") {
      const startOfMonth = new Date();
      startOfMonth.setHours(0, 0, 0, 0);
      startOfMonth.setDate(1);
      const endOfMonth = new Date();
      endOfMonth.setHours(23, 59, 59, 999);
      endOfMonth.setDate(
        new Date(
          startOfMonth.getFullYear(),
          startOfMonth.getMonth() + 1,
          0
        ).getDate()
      );
      filter = {
        createdAt: {
          $gte: startOfMonth,
          $lt: endOfMonth,
        },
      };
    }

    const orders = await Order.find({ status: "Delivered", ...filter })
      .populate({
        path: "products.product",
        model: "Product",
        select: "name",
      })
      .populate("user", "fname")
      .sort({ createdAt: 1 })
      .exec();
    if (!orders) {
      console.log("no orders");
    }
    console.log("order", orders);
    const sales = await Promise.all(
      orders.map(async (order) => ({
        ...order.toObject(),
        date: await formatDate(order.createdAt),
        user: order.user?.fname || "unknown",
      }))
    );
    // find grand total and total discount
    await orders.forEach((order) => {
      grandTotal += order.totalAmount;
      totalDiscount += order.discount;
    });

    // Generate pdf or excel format file for download
    if (format === "pdf") {
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      doc.pipe(res);

      // Set up table properties
      const tableHeaders = [
        "Order ID",
        "Date",
        "Customer",
        "Payment Method",
        "Product",
        "Quantity",
        "Unit Price",
        "Discount",
        "Total Amount",
      ];
      const tableRows = [];

      // Add data rows
      sales.forEach((sale) => {
        sale.products.forEach((product, index) => {
          if (index === 0) {
            tableRows.push([
              sale.orderId,
              sale.date,
              sale.user,
              sale.paymentMethod,
              product.product?.name,
              product.quantity,
              product.price,
              sale.discount,
              sale.totalAmount,
            ]);
          } else {
            tableRows.push([
              "",
              "",
              "",
              "",
              product?.product?.name,
              product.quantity,
              product.price,
              "",
              "",
            ]);
          }
        });
      });

      // Add total row
      tableRows.push([
        "",
        "",
        "",
        "",
        "",
        "",
        "Total:",
        totalDiscount,
        grandTotal,
      ]);

      // Draw the table
      const table = {
        headers: tableHeaders,
        rows: tableRows,
      };

      const tableTop = 50; // Adjust the top position of the table
      const rowHeight = 25; // Adjust the height of each row
      const columnWidth = 60; // Adjust the width of each column
      const startY = 50; // Adjust the starting Y position of the table
      const startX = 40; // Adjust the starting X position of the table

      doc.font("Helvetica-Bold").fontSize(6);
      table.headers.forEach((header, i) => {
        doc.text(header, startX + i * columnWidth, startY);
      });

      doc.font("Helvetica").fontSize(5);
      table.rows.forEach((row, rowIndex) => {
        const isLastRow = rowIndex === table.rows.length - 1;
        row.forEach((cell, cellIndex) => {
          // Check if cell is defined before calling toString()
          const cellText = cell !== undefined ? cell.toString() : "";

          // Calculate the width of the current cell
          const width = columnWidth;

          // Calculate the height required for the text
          const lines = doc.heightOfString(cellText, { width: width });

          // Calculate the position for the current cell
          const x = startX + cellIndex * columnWidth;
          let y = tableTop + (rowIndex + 1) * rowHeight;

          // Check if the text needs to be wrapped
          if (lines > 1) {
            // Wrap the text within the cell's width
            doc.text(cellText, x, y, { width: width, lineGap: 1 });
          } else {
            if (isLastRow) {
              doc.font("Helvetica-Bold").text(cellText, x, y); // Apply bold font for the last row
            } else {
              doc.text(cellText, x, y);
            }
          }
        });
      });

      doc.end();
    } else if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Report");

      // Add header row
      worksheet.addRow([
        "Order ID",
        "Date",
        "Customer",
        "Payment Method",
        "Product",
        "Quantity",
        "Unit Price",
        "Discount",
        "Total Amount",
      ]);

      // Add data rows
      sales.forEach((sale) => {
        sale.products.forEach((product, index) => {
          if (index === 0) {
            worksheet.addRow([
              index === 0 ? sale.orderId : "", // Only add orderId for the first product
              index === 0 ? sale.date : "", // Only add date for the first product
              index === 0 ? sale.user : "", // Only add user for the first product
              index === 0 ? sale.paymentMethod : "", // Only add paymentMethod for the first product
              product.product.name, // Always add product name
              product.quantity,
              product.price,
              index === 0 ? sale.discount : "", // Only add discount for the first product
              index === 0 ? sale.totalAmount : "", // Only add totalAmount for the first product
            ]);
          } else {
            worksheet.addRow([
              "",
              "",
              "",
              "",
              product.product?.name,
              product.quantity,
              product.price,
              "",
              "",
            ]);
          }
        });
      });

      // Add total row
      worksheet.addRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "Total:",
        totalDiscount,
        grandTotal,
      ]);

      // Set content type and disposition for download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="sales_report.xlsx"'
      );

      // Write the Excel file to the response
      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (err) {
    console.error("sales report downloading error: ", err);
  }
};

module.exports = {
  getSalesReport,
  downloadSalesReport,
};
