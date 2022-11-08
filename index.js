const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{

     const photographerCollection = client.db("Photographer").collection("services");


        // get 3 services mongo--------
        app.get('/services', async(req,res)=>{
            const query = {}
            const cursor = photographerCollection.find(query)
            const services = await cursor.limit(3).toArray() 
            res.send(services)
        })


    }
    catch(err){
        console.log(err);
    }
}

run().catch(err => console.log(err))

app.get('/', (req,res)=>{
    res.send('Server Candid Captures is Running');
});

app.listen(port, console.log("server running port on:", port));