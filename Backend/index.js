const express = require("express");
const db = require("./config/firebaseadmin");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const imageRoute = require("./routes/imageroute");

app.use('/api/images', imageRoute);

app.post("/add-user", async (req, res) => {
  const docRef = await db.collection("users").add(req.body);
  res.send({ id: docRef.id });
});

app.get("/users", async (req, res) => {
  const snapshot = await db.collection("users").get();
  const users = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  res.send(users);
});

app.listen(process.env.PORT, () => console.log("Server running"));