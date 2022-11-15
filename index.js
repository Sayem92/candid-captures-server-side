require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken')

const app = express()
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lhckmem.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify token jwt----------------
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    const token = authHeader.split(' ')[1];
   
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(401).send({ message: "forbidden access" })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {

        const photographerCollection = client.db("Photographer").collection("services");
        const reviewsCollection = client.db("Photographer").collection("reviews");


         //jwt token---------------------
         app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
       
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10d' });
           
            console.log(token);
            res.send({ token })
        })

        // get 3 services data mongo--------
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = photographerCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        });

        // get all services data mongo--------
        app.get('/allServices', async (req, res) => {
            const query = {}
            const cursor = photographerCollection.find(query)
            const allServices = await cursor.toArray()
            res.send(allServices)
        });

        //details service-------
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const serDetails = await photographerCollection.findOne(query)
            res.send(serDetails)
        });

        // add review mongo------
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        });

        //details service-------
        app.get('/getReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { reviewId : id }
            const cursor =  reviewsCollection.find(query)
            const review = await cursor.toArray();
            res.send(review)
        });

        // add new service mongo------
        app.post('/addNewService', async (req, res) => {
            const newService = req.body;
            const result = await photographerCollection.insertOne(newService)
            res.send(result)
        });

        //my reviews all get-------
        app.get('/myReviews', verifyJwt, async (req, res) => {
            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor =  reviewsCollection.find(query)
            const myReviews = await cursor.toArray();
            res.send(myReviews)
        });


        // delete myReview api----------
        app.delete('/myReviews/:id',  async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
           
        });

        // get review for update -------
        app.get('/myReviewUpdate/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const serDetails = await reviewsCollection.findOne(query)
            res.send(serDetails);

        });

        //  review  update -------
        app.put('/updateSingleReview/:id', async (req, res) => {
            const id = req.params.id;
            const rev = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set : {
                    review : rev.review
                }
            }
            const options = {upsert : true}

            const serDetails = await reviewsCollection.updateOne(filter, updateDoc, options);
            res.send(serDetails);
            console.log(id, rev);

        });




    }
    catch (err) {
        console.log(err);
    }
}

run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Server Candid Captures is Running');
});

app.listen(port, console.log("server running port on:", port));