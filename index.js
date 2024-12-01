const http = require("http");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require('mongodb');
const cors = require('cors');  // Import cors

// MongoDB connection URI
const uri = "mongodb+srv://KrishaPatel:Kishu1104@cluster0.zgong.mongodb.net/Pharmacy?retryWrites=true&w=majority";

// MongoDB client initialization
const client = new MongoClient(uri);

async function findMedicines() {
  try {
    // Connect to MongoDB
    await client.connect();

    // Fetch all medicines from the Medicine collection in the Pharmacy database
    const cursor = client.db("Pharmacy").collection("Medicine").find({});
    const results = await cursor.toArray();

    return results;

  } catch (e) {
    console.error("Error fetching data:", e);
    return [];
  } finally {
    // Ensure the client is closed after the operation
    await client.close();
  }
}

const server = http.createServer(async (req, res) => {
  // CORS headers for every request
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins, you can specify domains if needed
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Allowed methods
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allowed headers

  if (req.url === "/") {
    // Serve the index.html file
    fs.readFile(path.join(__dirname, "public", "index.html"), (err, content) => {
      if (err) throw err;
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(content);
    });
  } else if (req.url === "/api") {
    // Fetch medicines data from MongoDB
    const medicines = await findMedicines();

    if (medicines.length > 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(medicines));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "No medicines found." }));
    }
  } else {
    // Serve 404.html or a default 404 message
    fs.readFile(path.join(__dirname, "public", "404.html"), (err, content) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end("<h1>404 Page Not Found</h1>");
      } else {
        res.writeHead(404, { "Content-Type": "text/html" });
        res.end(content);
      }
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5960;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
