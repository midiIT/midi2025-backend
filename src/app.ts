import express, { NextFunction, Request, Response } from "express";
import { DataTypes, Model, Sequelize } from "sequelize";
import process from "process";

const app = express();
const router = express.Router();
const port = process.env.PORT || 3001;

if (process.env.NODE_ENV == "development") {
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

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

class Tracking extends Model {}
Tracking.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true, // Add this
      defaultValue: DataTypes.UUIDV4, // Optional: auto-generates UUID
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    clicks: DataTypes.BIGINT,
  },
  { sequelize, modelName: "Tracking" },
);

void sequelize.sync();

router.get("/tracking", async (req, res) => {
  const trackingUrls = await Tracking.findAll();
  res.json(trackingUrls);
});

router.get("/tracking/:name", async (req, res) => {
  try {
    const trackingUrl = await Tracking.findOne({
      where: { name: req.params.name },
    });

    if (trackingUrl) {
      res.status(200).json(trackingUrl);
    } else {
      res.status(404).json(`Tracking URL named ${req.params.name} not found.`);
    }
  } catch {
    res.status(400).json({});
  }
});

router.post("/tracking/:name", async (req, res) => {
  try {
    const trackingUrl = await Tracking.create({
      name: req.params.name,
      clicks: 0,
    });

    res.status(201).json(trackingUrl);
  } catch {
    res.status(409).json({});
  }
});

router.put("/tracking/:name", async (req, res) => {
  try {
    const trackingUrl = await Tracking.findOne({
      where: { name: req.params.name },
    });

    if (trackingUrl) {
      await trackingUrl.update({ clicks: trackingUrl.toJSON().clicks + 1 });
      res.status(200).json(trackingUrl);
    } else {
      const trackingUrl = await Tracking.create({
        name: req.params.name,
        clicks: 1,
      });

      res.status(201).json(trackingUrl);
    }
  } catch {
    res.status(400).json({});
  }
});

app.use("/api", router);

app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});
