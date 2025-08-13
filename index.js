const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // <-- Add this line
const connectDB = require("./config/db"); 
const userRoutes = require("./routes/userRoutes"); 

dotenv.config();

const app = express();

app.use(express.json());

// Add CORS middleware here
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

connectDB();

app.use("/", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});