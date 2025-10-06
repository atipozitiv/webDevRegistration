import express from "express";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import { authRoutes } from "./routes/authRoutes";
import { courseRoutes } from "./routes/courseRoutes";
import { lessonRoutes } from "./routes/lessonRoutes";
import { commentRoutes } from "./routes/commentRoutes";
import path from "path";

dotenv.config();
const PORT = process.env.PORT || 3000;

connectDB();

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/comments", commentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});