import express from "express";

const app = express();

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const port = 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Minimal server running on port ${port}`);
});