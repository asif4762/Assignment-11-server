const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rurzeff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const assignmentCollection = client.db('assignmentDB').collection('assignements');

    app.get('/assignments', async(req, res) =>{
        const cursor = assignmentCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/assignments/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)}
        const result = await assignmentCollection.findOne(query);
        res.send(result);
    })

    app.get('/my-assignments', async (req, res) =>{
        console.log(req.query.email);
        let query = {};
        if(req.query?.email){
            query = {email: req.query.email}
        }
        const result = await assignmentCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/difficulty-assignments/', async (req, res) => {
        console.log(req.query.difficulty_level);
        let query = {};
        if(req.query?.difficulty_level){
            query = {difficulty_level: req.query.difficulty_level}
        }
        const result = await assignmentCollection.find(query).toArray();
        res.send(result);
    })

    app.post('/assignments', async(req, res) => {
        const assignment = req.body;
        const result = await assignmentCollection.insertOne(assignment);
        res.send(result);
    })

    app.put('/Update-assignments/:id', async (req, res) => {
        const query = {_id: new ObjectId(req.params.id)};
        const updateData = {
            $set:{
                title : req.body.title,
                description : req.body.description,
                difficulty_level : req.body.difficulty_level,
                thumbnail : req.body.thumbnail
            }
        }
        const result = await assignmentCollection.updateOne(query, updateData);
    console.log(result);
    res.send(result);
    })

    app.patch('/update-marks/:id', async (req, res) => {
        const query = {_id: new ObjectId(req.params.id)};
        console.log(req.body.marks);
        const updateData = {
            $set:{
                marks : req.body.marks
            }
        }
        const result = await assignmentCollection.updateOne(query, updateData);
        console.log(result);
        res.send(result);
        
    })

    app.delete('/delete/:id', async (req, res) => {
        const query = {_id: new ObjectId(req.params.id)};
        const result = await assignmentCollection.deleteOne(query);
        console.log(result);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Assignment 11 is running");
})

app.listen(port, () =>{
    console.log(`Assignment 11 is running on port ${port}`);
})