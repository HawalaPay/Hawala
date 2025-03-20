const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Mock data
const stats = [
  { label: "Available Balance", amount: "$2,450.90", trend: 12 },
  { label: "Monthly Spending", amount: "$1,450.00", trend: -8 },
];

const contacts = [
  { id: 1, name: "Sarah Wilson", amount: "120", image: "" },
  { id: 2, name: "Mike Chen", amount: "50", image: "" },
  { id: 3, name: "Alex Smith", amount: "200", image: "" },
  { id: 4, name: "Lisa Johnson", amount: "75", image: "" },
  { id: 5, name: "Tom Brown", amount: "150", image: "" },
];

const activities = [
  { id: 1, name: "Sarah Wilson", amount: "120", type: "sent", time: "2 hours ago" },
  { id: 2, name: "Mike Chen", amount: "50", type: "received", time: "5 hours ago" },
  { id: 3, name: "Alex Smith", amount: "200", type: "sent", time: "Yesterday" },
];

// API Endpoints
app.get("/api/stats", (req, res) => {
  res.json(stats);
});

app.get("/api/contacts", (req, res) => {
  res.json(contacts);
});

app.get("/api/activities", (req, res) => {
  res.json(activities);
});

// Add new contact (example for POST)
app.post("/api/contacts", (req, res) => {
  const { name, amount, image } = req.body;

  if (!name || !amount) {
    return res.status(400).json({ error: "Name and amount are required." });
  }

  const newContact = {
    id: contacts.length + 1,
    name,
    amount,
    image: image || "",
  };

  contacts.push(newContact);
  res.status(201).json(newContact);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
