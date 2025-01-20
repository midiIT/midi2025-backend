import { Router } from "express";
import { Sequelize, DataTypes, Model } from "sequelize";

const router = Router();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

class Volunteer extends Model {}
Volunteer.init(
  {
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    events: {
      type: DataTypes.TEXT,
      get() {
        const value = this.getDataValue("events");
        return value ? JSON.parse(value) : [];
      },
      set(value: string[]) {
        this.setDataValue("events", JSON.stringify(value));
      },
    },
    comments: DataTypes.TEXT,
  },
  { sequelize, modelName: "Volunteers" },
);

void sequelize.sync();

router.post("/volunteer", async (req, res) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    res.status(201).json(volunteer);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error while creating volunteer:", error.message);
      res.status(500).json({ error: error.message });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
});

export default router;
