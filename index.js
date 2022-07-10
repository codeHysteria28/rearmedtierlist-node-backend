const express = require('express');
const app = express();
const db = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const multerAzure = require('multer-azure');
require('dotenv').config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors({
    origin: "https://dayzrearmedpngs.z16.web.core.windows.net", // <-- location of the react app were connecting to
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}));

// Schema
const Item = require('./ItemSchema');

db.on('error', console.error.bind(console, "mongo conn err"));

db.on('connected', () => {
   console.log('connected to mongodb');
});

let upload = multer({
    storage: multerAzure({
       connectionString: process.env.storage_connection_string,
       account: process.env.storage_name,
       key: process.env.storage_key,
       container: process.env.storage_container,
       blobPathResolver: function(req, file, callback) {
          let blobPath = file.originalname;
          callback(null, blobPath);
       }
    }),
    fileFilter: (req, file, callback) => {
       if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
          callback(null, true);
       }else {
          console.log('not support file');
          callback(null, false);
       }
    },
    limits: {
       fileSize: 1024 * 1024 * 2
    }
 });


// register user
app.post('/upload_item', upload.single('item_image'), (req,res) => {
    if(req.body !== {}) {
       Item.findOne({item_name: req.body.item_name}, async (err, doc) => {
             if(err) throw err;
             if (doc) res.send('Item Already Exists');
             if(!doc){
 
                // apply data for prepared schema
                const item = new Item({
                    item_name: req.body.item_name,
                    item_image: process.env.storage_url + req.file.originalname,
                    slot_size: req.body.slot_size,
                    sell_price: req.body.sell_price,
                    buy_price: req.body.buy_price,
                    item_category: req.body.item_category
                });
 
                // save user to db
                await item.save();
 
                // send response
                res.send('success');
             }
       });
    }else {
       res.send('error');
    }
 });

app.get('/getAllItems', (req,res) => {
    Item.find({}, (err,items) => {
        if (err) {
            res.send(err);
        } else {
            res.send(items);
        }
    });
});

 app.listen(process.env.PORT || 1998, () => console.log("Running on port " + process.env.PORT || 1998));