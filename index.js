const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.ols3g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('yooda');
        const foodItems = database.collection('foodItems');
        const users = database.collection('users');
        const students = database.collection('students');
        const reviews = database.collection('reviews');

        // // rendering for home
        // app.get('/home', async (req, res) => {
        //     const cursor = products.find({}).limit(6);
        //     const homeProducts = await cursor.toArray();
        //     res.json(homeProducts);
        // });

        // get all products
        // app.get('/explore', async (req, res) => {
        //     const allProducts = await products.find({}).toArray();
        //     res.json(allProducts);
        // });

        // single student rendering
        app.get('/student/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const student = await students.findOne(query);
            res.json(student);
        });

        // single food item rendering
        app.get('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const food = await foodItems.findOne(query);
            res.json(food);
        });

        // get all students
        app.get('/students', async (req, res) => {
            const cursor = students.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count()
            let allStudents;
            if (page) {
                allStudents = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                allStudents = await cursor.toArray();
            }
            res.json({
                count,
                allStudents: allStudents
            });
        });

        // get all foods
        app.get('/foods', async (req, res) => {
            const cursor = foodItems.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count()
            let allFoods;
            if (page) {
                allFoods = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                allFoods = await cursor.toArray();
            }
            res.json({
                count,
                allFoods: allFoods
            });
        });

        // my orders rendering by email
        // app.get('/myOrder', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email };
        //     const result = await students.find(query).toArray();
        //     res.json(result);
        // })

        // get all reviews
        // app.get('/review', async (req, res) => {
        //     const result = await reviews.find({}).toArray();
        //     res.json(result);
        // });

        // check admin
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await users.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // all foodItems added in database
        app.post('/foodItems', async (req, res) => {
            const product = req.body;
            const result = await foodItems.insertOne(product);
            res.json(result);
        });

        // users added in database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
        });

        // order added in database
        app.post('/students', async (req, res) => {
            const student = req.body;
            const result = await students.insertOne(student);
            res.json(result);
        });

        // review added in database
        // app.post('/review', async (req, res) => {
        //     const review = req.body;
        //     const result = await reviews.insertOne(review);
        //     res.json(result);
        // });

        // delivery status update
        app.put('/status/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await students.updateOne(query, updateDoc, options);
            res.json(result);
        })
        // make an admin
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await users.updateOne(filter, updateDoc);
            res.json(result);
        });

        // update a particular student
        app.put('/student/:id', async (req, res) => {
            const id = req.params.id;
            const updateStudent = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateStudent.name,
                    roll: updateStudent.roll,
                    age: updateStudent.age,
                    class: updateStudent.class,
                    hall: updateStudent.hall
                }
            };
            const result = await students.updateOne(query, updateDoc, options);
            res.json(result);
        });

        // update a particular food
        app.put('/food/:id', async (req, res) => {
            const id = req.params.id;
            const updateFood = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    name: updateFood.name,
                    price: updateFood.price
                }
            };
            const result = await foodItems.updateOne(query, updateDoc, options);
            res.json(result);
        });

        // delete a particular student
        app.delete('/student/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await students.deleteOne(query);
            res.json(result);
        });

        // delete a particular Food Item
        app.delete('/food/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await foodItems.deleteOne(query);
            res.json(result);
        });

        // delete a particular product
        // app.delete('/product/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await products.deleteOne(query);
        //     res.json(result);
        // });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('yooda hostel server is running');
})

app.listen(port, () => {
    console.log(`listening at port ${port}`);
})