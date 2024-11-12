import express from "express";

const app = express();
const port = 3001;

app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World" });
});

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});