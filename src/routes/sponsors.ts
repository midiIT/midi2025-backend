import { Router } from "express";
import { Sequelize, DataTypes, Model } from "sequelize";

const router = Router();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

class Sponsor extends Model {}
Sponsor.init(
  {
    companyName: DataTypes.STRING,
    contactInfo: DataTypes.STRING,
    message: DataTypes.TEXT,
  },
  { sequelize, modelName: "Sponsors" },
);

void sequelize.sync();

router.post("/sponsors", async (req, res) => {
  try {
    const sponsor = await Sponsor.create(req.body);
    res.status(201).json(sponsor);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error while creating sponsor:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
});

export default router;
