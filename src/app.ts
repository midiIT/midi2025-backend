import express, { Request, Response, NextFunction } from "express";
import process from "process";
import dotenv from "dotenv";
import trackingRouter from "./routes/tracking";
import volunteerRouter from "./routes/volunteer";
import weatherRouter from "./routes/weather";

const app = express();
const port = process.env.PORT || 3001;

dotenv.config();
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }
    next();
  });
}

app.use("/api", trackingRouter);
app.use("/api", volunteerRouter);
app.use("/api", weatherRouter);

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
