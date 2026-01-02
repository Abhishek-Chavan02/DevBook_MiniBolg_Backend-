const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors"); 
const connectDB = require("./config/db"); 
const userRoutes = require("./routes/userRoutes"); 
const blogRouter = require("./routes/blogRouter");

const app = express();

app.use(express.json());

// Add CORS middleware here
app.use(cors({
  origin: 'http://localhost:5173',
  // origin: 'https://devbook-mini-blog-front-l52g.vercel.app', 
  credentials: true
}));

connectDB();

app.use("/", userRoutes);
app.use("/", blogRouter); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});