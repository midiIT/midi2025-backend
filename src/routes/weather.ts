import { Router, Request, Response } from "express";
import { Sequelize, DataTypes, Model } from "sequelize";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const API_KEY = process.env.WEATHER_API_KEY;

if (!API_KEY) {
  console.error("API key is missing. Please configure your .env file.");
  process.exit(1);
}

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
});

class Weather extends Model {}

Weather.init(
  {
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    weather: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    temperature: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, modelName: "Weather" },
);

void sequelize.sync();

// Cache duration 30 minutes
const CACHE_DURATION = 30 * 60 * 1000;

router.get("/weather", async (req: Request, res: Response): Promise<void> => {
  const city = "Vilnius";

  try {
    const latestWeather = await Weather.findOne({
      where: { city },
    });

    const currentTime = Date.now();

    if (
      latestWeather &&
      new Date(latestWeather.getDataValue("timestamp")).getTime() +
        CACHE_DURATION >
        currentTime
    ) {
      res.json({
        weather: latestWeather.getDataValue("weather"),
        temperature: latestWeather.getDataValue("temperature"),
      });
      return;
    }

    // Fetch new weather data from the API
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: city,
          units: "metric",
          lang: "lt",
          appid: API_KEY,
        },
      },
    );

    const { weather, main } = response.data;

    const weatherData = {
      city,
      weather: weather[0]?.description ?? "Nėra duomenų",
      temperature:
        main?.temp !== undefined ? `${Math.round(main.temp)}°C` : "--",
      timestamp: new Date(),
    };

    if (latestWeather) {
      // Update existing weather data
      await latestWeather.update(weatherData);
      console.log("Updated existing weather data in database");
    } else {
      // Create new weather data
      await Weather.create(weatherData);
      console.log("Inserted new weather data into database");
    }

    res.json({
      weather: weatherData.weather,
      temperature: weatherData.temperature,
    });
  } catch (error: unknown) {
    console.error("Error fetching weather data:", (error as Error).message);
    res
      .status(500)
      .json({ error: "Nepavyko gauti orų duomenų. Bandykite vėliau." });
  }
});

export default router;
