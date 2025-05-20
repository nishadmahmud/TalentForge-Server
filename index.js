const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ph-cluster.8kwdmtt.mongodb.net/?retryWrites=true&w=majority&appName=PH-Cluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database and collection references
const database = client.db("freelanceMarketplace");
const tasksCollection = database.collection("tasks");

async function run() {
  try {
    app.post("/tasks", async (req, res) => {
      try {
        const taskData = req.body;
        const result = await tasksCollection.insertOne({
          ...taskData,
          createdAt: new Date(),
          status: "open"
        });
        
        res.status(201).json({
          success: true,
          message: "Task created successfully",
          taskId: result.insertedId
        });
      } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({
          success: false,
          message: "Failed to create task"
        });
      }
    });

    app.get("/tasks", async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.json(tasks);
      } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tasks" });
      }
    });

    app.get("/my-tasks", async (req, res) => {
      try {
        const userEmail = req.query.email;
        if (!userEmail) {
          return res.status(400).json({ success: false, message: "Email query parameter is required" });
        }
        const tasks = await tasksCollection.find({ userEmail }).toArray();
        res.json({ success: true, tasks });
      } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch user's tasks" });
      }
    });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is Hot now");
});

app.listen(port, (req, res) => {
  console.log(`Server running on port: ${port}`);
});
