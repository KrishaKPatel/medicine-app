const path = require('path');
const fs = require('fs');
const http = require('http');
const { MongoClient } = require('mongodb');

// Define the port for the server
const httpPort = process.env.PORT || 5960;

// Function to determine the content type based on the file extension
const getFileContentType = (filePath) => {
  const extName = path.extname(filePath);
  const contentTypeObj = {
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.html': 'text/html',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
  };
  return contentTypeObj[extName] || 'text/plain';
};

// Function to render an error page if file not found
const renderErrorPage = (res) => {
  fs.readFile(path.join(__dirname, "public", "errorPage.html"), (error, data) => {
    if (error) {
      console.log("Something went wrong when rendering the error page");
      console.error(error);
    } else {
      res.writeHead(200, "Success", { "content-type": "text/html" });
      res.write(data, "utf-8");
      res.end();
    }
  });
};

// MongoDB connection URI and client initialization
const uri = "mongodb+srv://KrishaPatel:Kishu1104@cluster0.zgong.mongodb.net/Pharmacy?retryWrites=true&w=majority";
const client = new MongoClient(uri);

// Function to fetch medicines from the database
async function fetchMedicines() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    // Fetch all medicines from the Medicine collection in the Pharmacy database
    const cursor = client.db("Pharmacy").collection("Medicine").find({});
    const results = await cursor.toArray();
    return JSON.stringify(results);  // Returning the data as a string
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return JSON.stringify({ message: "Error fetching medicines" });
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Create the HTTP server
http.createServer((req, res) => {
  if (req.url === '/api') {
    // Fetch medicine data from the database when the /api route is hit
    fetchMedicines().then((medicines) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(medicines);
    });
  } else {
    // Serve static files (HTML, CSS, JS, images)
    let filePath = path.join(__dirname, "public", req.url === '/' ? "index.html" : req.url);

    fs.readFile(filePath, (error, data) => {
      if (error) {
        if (error.code === "ENOENT") {
          renderErrorPage(res);
        } else {
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Server error");
        }
      } else {
        const contType = getFileContentType(filePath);
        res.writeHead(200, "Success", { "content-type": contType });
        res.write(data, "utf-8");
        res.end();
      }
    });
  }
}).listen(httpPort, () => console.log(`Server running on Port ${httpPort}`));
