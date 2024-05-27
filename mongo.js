const express = require("express");
const { MongoClient} = require("mongodb"); 
const bodyParser = require("body-parser");
const app = express();
const port = 4055;
app.use(bodyParser.urlencoded({ extended: true }));
const mongoUrl = "mongodb://localhost:27017/";
const dbName = "Authentication";
let db; 
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName);
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); 
    });
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/mongo.html");
});
app.post("/insert", async (req, res) => {
    const { name,lname,mailid,age,address,date} = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        await db.collection("login").insertOne({ name,lname,mailid,age,address,date});
        console.log("Number of documents inserted: " + res.insertedCount);
        res.redirect("/");
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});
app.post("/find", async (req, res) => {
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const items = await db.collection("login").find().toArray();
        console.log(items);
        let tableContent = "<h1>All Documents</h1><table border='1'><tr><th>Name</th><th>Last Name</th><th>Email</th><th>Age</th><th>Address</th><th>Date</th></tr>";
        tableContent += items.map(item => `<tr><td>${item.name}</td><td>${item.lname}</td><td>${item.mailid}</td><td>${item.age}</td><td>${item.address}</td><td>${item.date}</td></tr>`).join("");
        tableContent += "</table><a href='/'>Back to form</a>"; 
        res.send(tableContent);
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});
app.post("/delete", async (req, res) => {
    const {name } = req.body; 
    if (!db) {
        res.status(500).send("Database not initialized");
        return;
    }
    try {
        const result = await db.collection("login").deleteOne({ name: name });
        if (result.deletedCount === 0) {
            res.status(404).send("No document found with the provided name");
            return;
        }
        console.log("Document deleted successfully");
        res.redirect("/"); 
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});
app.post("/update", async (req, res) => {
    const { name,lname,mailid,age,address,date } = req.body; 
    if (!db) {
        res.status(500).send("Database not initialized"); 
        return;
    }
    try {
        const result = await db.collection("login").updateOne(
            { name: name },
            { $set: { lname:lname,mailid: mailid,age:age,address:address,date:date}} 
        );
        console.log("Document updated successfully");
        res.redirect("/");
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
