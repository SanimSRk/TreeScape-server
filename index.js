const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  res.send('tree scop server is runing ');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mqe77mp.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const treeScopData = client.db('TreeScops');
    const userCollection = treeScopData.collection('Users');
    const addProductCollection = treeScopData.collection('store-product');
    const myCardProductCollection = treeScopData.collection('Card-product');
    //-------------- everone access data sction ---------------------

    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      const qurey = { email: userInfo.email };
      const isExist = await userCollection.findOne(qurey);
      if (!isExist) {
        const result = await userCollection.insertOne(userInfo);
        res.send(result);
      } else {
        return res.send({ message: 'You have a alredy account' });
      }
    });

    app.get('/users-datas', async (req, res) => {
      const qurey = { email: req.query.email };
      const result = await userCollection.findOne(qurey);
      res.send(result);
    });

    app.get('/products-paginagtion', async (req, res) => {
      const pages = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await addProductCollection
        .find()
        .skip(pages * size)
        .limit(size)
        .toArray();
      res.send(result);
    });
    app.get('/Product-home', async (req, res) => {
      const result = await addProductCollection.find().limit(9).toArray();
      res.send(result);
    });
    app.get('/user-searchData', async (req, res) => {
      const qurey = { commonName: { $regex: req.query.search, $options: 'i' } };
      const result = await addProductCollection.find(qurey).toArray();
      res.send(result);
    });
    app.post('/addTo-cards', async (req, res) => {
      const productInf = req.body;
      const result = await myCardProductCollection.insertOne(productInf);
      res.send(result);
    });

    app.get('/count-pages', async (req, res) => {
      const result = await addProductCollection.estimatedDocumentCount();
      res.send({ count: result });
    });

    app.get('/scientfic-name', async (req, res) => {
      const qurey = { scientificName: req.query.scient };
      const result = await addProductCollection.find(qurey).toArray();
      res.send(result);
    });
    app.get('/height-range', async (req, res) => {
      const main = parseFloat(req.query.main);
      const max = parseFloat(req.query.max);
      const qurey = { height: { $gte: main, $lte: max } };
      const result = await addProductCollection.find(qurey).toArray();

      res.send(result);
    });
    app.get('/prices-range', async (req, res) => {
      const main = parseFloat(req.query.main);
      const max = parseFloat(req.query.max);
      const qurey = { price: { $gte: main, $lte: max } };
      const result = await addProductCollection.find(qurey).toArray();

      res.send(result);
    });

    //----------------user data handiling section ---------------------------------
    app.get('/my-products', async (req, res) => {
      const qurey = { email: req?.query?.email };
      const result = await myCardProductCollection.find(qurey).toArray();
      res.send(result);
    });
    app.delete('/delete-myProducts/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await myCardProductCollection.deleteOne(qurey);
      res.send(result);
    });

    app.get('/totle-products', async (req, res) => {
      const qurey = { email: req.query.email };
      const Counts = await myCardProductCollection.find(qurey).toArray();
      res.send(Counts);
    });

    // -----------this is admin data handiling section -------------------

    app.post('/add-products', async (req, res) => {
      const productInfo = req.body;
      const result = await addProductCollection.insertOne(productInfo);
      res.send(result);
    });

    app.get('/all-userData', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.delete('/user-delete/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(qurey);
      res.send(result);
    });
    app.get('/manageProducts', async (req, res) => {
      const result = await addProductCollection.find().toArray();
      res.send(result);
    });
    app.get('/update-deatils/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await addProductCollection.findOne(qurey);
      res.send(result);
    });

    app.put('/updates-products/:id', async (req, res) => {
      const id = req.params.id;
      const updateInfo = req.body;
      const qurey = { _id: new ObjectId(id) };
      const updatesDc = {
        $set: {
          commonName: updateInfo.commonName,
          scientificName: updateInfo.scientificName,
          height: updateInfo.height,
          price: updateInfo.price,
          lifespan: updateInfo.lifespan,
          habitat: updateInfo.habitat,
          descriptiont: updateInfo.descriptiont,
          image: updateInfo.image,
        },
      };
      const result = await addProductCollection.updateOne(qurey, updatesDc);
      res.send(result);
    });

    app.delete('/delete-product/:id', async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await addProductCollection.deleteOne(qurey);
      res.send(result);
    });
    // await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`tree scop server port is ${port}`);
});
