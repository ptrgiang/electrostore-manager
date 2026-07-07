const cors = require("cors");
const express = require("express");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const customerRoutes = require("./routes/customer.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const reportRoutes = require("./routes/report.routes");
const employeeRoutes = require("./routes/employee.routes");
const { errorMiddleware } = require("./middlewares/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ data: { ok: true, service: "ElectroStore Manager API" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/employees", employeeRoutes);

app.use(errorMiddleware);

module.exports = { app };
