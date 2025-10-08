import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", async(req, res) => {
  try {
    const admins = await prisma.aDMIN.findMany();
    res.json({ 
      message: "✅ E-Voting Platform Server is running!", 
      status: "Connected to database",
      adminCount: admins.length 
    });
  } catch (error) {
    console.error("❌ Database error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
