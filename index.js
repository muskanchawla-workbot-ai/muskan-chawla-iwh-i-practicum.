require('dotenv').config();
const hubspot = require('@hubspot/api-client');

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");


const app = express();
const PORT = 3000;

// HubSpot API Config
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
console.log('Loaded HubSpot API Key:', process.env.HUBSPOT_ACCESS_TOKEN);

const hubspotClient = new hubspot.Client({ apiKey: HUBSPOT_ACCESS_TOKEN });

const HUBSPOT_OBJECT_URL = "https://api.hubapi.com/crm/v3/objects/2-41802037"; // Replace with your custom object endpoint

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Route for homepage - Retrieve and display CRM records
app.get("/", async (req, res) => {
  try {
    const response = await axios.get(HUBSPOT_OBJECT_URL, {
      headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}` },
      params: { properties: "name,bio,game" },
    });

    const records = response.data.results || [];
    res.render("homepage", { title: "CRM Records", records });
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).send("Error retrieving CRM records.");
  }
});

// Route to render the update form
app.get("/update-cobj", (req, res) => {
  res.render("updates", { title: "Update Custom Object Form | Integrating With HubSpot I Practicum" });
});

// Route to handle form submission and create a new CRM record
app.post("/update-cobj", async (req, res) => {
  const { name, bio, game } = req.body;

  try {
    await axios.post(
      HUBSPOT_OBJECT_URL,
      { properties: { name, bio, game } },
      { headers: { Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`, "Content-Type": "application/json" } }
    );

    res.redirect("/");
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).send("Error creating CRM record.");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
