import express from "express";
import axios from "axios";
import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

dotenv.config();

// Middleware to parse JSON
app.use(cors());
app.use(express.json());

let chatHistory = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// MongoDB Atlas connection
const MONGODB_URI = process.env.MONGODB_URI;
let db;
let usersCollection;
let tireSizesCollection;
let carsCollection;
let locationsCollection;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB Atlas!");

    db = client.db("cultural-journey");
    usersCollection = db.collection("users");
    tireSizesCollection = db.collection("tire-sizes");
    carsCollection = db.collection("cars");
    locationsCollection = db.collection("locations");

    // Create indexes for better performance
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await tireSizesCollection.createIndex({ username: 1 });
    await carsCollection.createIndex({ username: 1 });
    await locationsCollection.createIndex({ username: 1 });

    console.log("✅ Database collections initialized");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

connectDB();

// Chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // Add user message to history
    chatHistory.push({ role: 'user', content: message });

    // Call Groq API with full history
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Keep responses short (2-3 sentences) and professional."
          },
          ...chatHistory  // <-- append previous messages
        ],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const answer = response.data.choices[0]?.message?.content || 'No response generated';

    // Add model reply to history
    chatHistory.push({ role: 'assistant', content: answer });

    res.json({ success: true, answer });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password, locationOptIn, latitude, longitude } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required"
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        error: "Username must be at least 3 characters long"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long"
      });
    }

    // Validate location data if provided
    if (locationOptIn && (latitude !== undefined || longitude !== undefined)) {
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: "Both latitude and longitude are required when providing location"
        });
      }

      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({
          error: "Latitude must be between -90 and 90"
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({
          error: "Longitude must be between -180 and 180"
        });
      }
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        error: "Username already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      username,
      password: hashedPassword,
      locationOptIn: locationOptIn === true, // Default to false if not provided
      createdAt: new Date(),
      lastLogin: new Date()
    };

    await usersCollection.insertOne(newUser);

    // Save initial location if provided and user opted in
    let locationSaved = false;
    if (locationOptIn && latitude !== undefined && longitude !== undefined) {
      try {
        const locationData = {
          username,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date(),
          source: 'signup'
        };

        await locationsCollection.insertOne(locationData);
        locationSaved = true;
      } catch (error) {
        console.error("Error saving signup location:", error);
        // Don't fail signup if location save fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      username: username,
      locationOptIn: newUser.locationOptIn,
      locationSaved: locationSaved
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to create account" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required"
      });
    }

    // Find user
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    // Update last login
    await usersCollection.updateOne(
      { username },
      { $set: { lastLogin: new Date() } }
    );

    res.json({
      success: true,
      message: "Login successful",
      username: user.username,
      locationOptIn: user.locationOptIn,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.post("/addCar", async (req, res) => {
  try {
    console.log(req.body);
    const { username, make, model, year, mileage, tireAge } = req.body;

    // Validate input
    if (!username || !make || !model || !year || mileage === undefined) {
      return res.status(400).json({
        error: "Username, make, model, year, and mileage are required"
      });
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear + 1) {
      return res.status(400).json({
        error: `Year must be between 1900 and ${currentYear + 1}`
      });
    }

    // Validate mileage
    if (mileage < 0) {
      return res.status(400).json({
        error: "Mileage cannot be negative"
      });
    }

    // Validate tireAge if provided
    if (tireAge !== undefined) {
      const tireAgeNum = parseInt(tireAge);
      if (isNaN(tireAgeNum) || tireAgeNum < 2000 || tireAgeNum > 2026) {
        return res.status(400).json({
          error: "Tire age must be between 0 and 20 years"
        });
      }
    }

    // Verify user exists
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Save car details
    const carData = {
      username,
      make,
      model,
      year: parseInt(year),
      mileage: parseInt(mileage),
      tireAge: tireAge !== undefined ? parseInt(tireAge) : null,
      addedAt: new Date()
    };

    const result = await carsCollection.insertOne(carData);

    res.status(201).json({
      success: true,
      message: "Car added successfully",
      carId: result.insertedId,
      data: carData
    });
  } catch (error) {
    console.error("Error adding car:", error);
    res.status(500).json({ error: "Failed to add car" });
  }
});

app.get("/getCars", async (req, res) => {
  try {
    const username = req.query.username;

    const cars = await carsCollection
      .find({ username })
      .sort({ addedAt: -1 })
      .toArray();

    res.json({
      success: true,
      cars: cars
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

app.get("/getLocation/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const limit = parseInt(req.query.limit) || 100; // Default to last 100 locations

    // Verify user exists and has opted in
    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.locationOptIn) {
      return res.status(403).json({
        error: "User has not opted in for location tracking"
      });
    }

    const locations = await locationsCollection
      .find({ username })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    console.log(locations);

    res.json({
      success: true,
      count: locations.length,
      locations: locations
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Failed to fetch locations" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/chat`);
});