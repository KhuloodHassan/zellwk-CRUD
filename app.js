const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = 3000
require('dotenv').config()

let db
let dbConnectionStr = process.env.DB_STRING
let dbName = 'star-wars-quotes'
let quotesCollection
let collectionName = 'quotes'

const client = new MongoClient(dbConnectionStr, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db(dbName)
        quotesCollection = db.collection(collectionName)

        app.listen(PORT, () => {
            console.log(`Listening on ${PORT}`);
        });

    } catch (error) {
        console.error(error)
    }
}

connectToDatabase()

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(express.json())

app.get('/', async (req, res) => {
    try {
        const getResults = await quotesCollection.find().toArray();
        res.render('index.ejs', { quotes: getResults })
    } catch (error) {
        console.error(error);
    }

});

app.post('/quotes', async (req, res) => {
    try {
        const postResult = await quotesCollection.insertOne(req.body)
        res.redirect('/')
    } catch (error) {
        console.error(error)
    }
})

app.put('/quotes', async (req, res) => {
    try {
        const putResult = await quotesCollection.findOneAndUpdate(
            { name: 'Yoda' },
            {
                $set: {
                    name: req.body.name,
                    quote: req.body.quote,
                    movie: req.body.movie,
                },
            },
            {
                upsert: true,
            }
        )

        if (res.ok) return res.json()
        await res.json(`Success`)
    } catch (error) {
        console.error(error)
    }
})

app.delete('/quotes', async (req, res) => {
    try {
        const deleteResult = await quotesCollection.deleteOne({ name: req.body.name })

        if (deleteResult.deletedCount === 0) return res.json('No quote to delete')

        res.json(`Deleted Darth Vader's quote`)
    } catch (error) {
        console.error(error)
    }
})


// async function startServer() {
//     try {
//         await connectToDatabase();
//         app.listen(PORT, () => {
//             console.log(`Listening on ${PORT}`);
//         });
//     } catch (error) {
//         console.error(error);
//     }
// }

// startServer();