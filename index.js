const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); 
const connectDB = require("./config/db"); 
const userRoutes = require("./routes/userRoutes"); 
const blogRouter = require("./routes/blogRouter");

dotenv.config();

const app = express();

app.use(express.json());

// Add CORS middleware here
app.use(cors({
  origin: 'https://devbook-mini-blog-front-l52g.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

connectDB();

app.use("/", userRoutes);
app.use("/", blogRouter); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});