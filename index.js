const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5500;

app.use(cors({
    origin: [
        'http://localhost:5173',

    ],    
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(cookieParser())

const verifyToken = (req, res, next) =>{
    
}
 
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

    app.post('/jwt', async (req, res) => {
        const user = req.body;
        console.log('User = ', user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:'365d'
        })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV ==='production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

        }).send({success: true})
    })

    app.get('/logout', (req, res) =>{
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV ==='production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' :'strict',
            maxAge:0,
        })
        .send({success: true})
    })

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
        const token = req.cookies?.token;
        console.log(token);
        if(token){
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if(err){
                  return console.log(err);
                }
                console.log(decoded);
            } )
        }
        let query = {};
        if(req.query?.email){
            query = {email: req.query.email}
        }
        const result = await assignmentCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/difficulty-assignments/', async (req, res) => {
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
    res.send(result);
    })

    app.patch('/update-marks/:id', async (req, res) => {
        const query = {_id: new ObjectId(req.params.id)};
        const updateData = {
            $set:{
                marks : req.body.marks
            }
        }
        const result = await assignmentCollection.updateOne(query, updateData);
        res.send(result);
        
    })

    app.delete('/delete/:id', async (req, res) => {
        const query = {_id: new ObjectId(req.params.id)};
        const result = await assignmentCollection.deleteOne(query);
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