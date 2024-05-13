const express = require('express');
const path = require('path');
const app = express();
app.use('/uploads', express.static(path.join(__dirname,'uploads')));
const port = 4000;
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const productController = require("./controllers/productController");
const userController = require("./controllers/userController"); 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
  })
    
const upload = multer({ storage: storage })
app.use(cors());
app.use(bodyParser.json());
app.use(urlencodedParser = bodyParser.urlencoded({ extended: false }));
mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB Connected."))
  .catch(err => console.error("Error connecting to DB:", err));

app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.send('Hello Asif!');
});

app.post('/like-product' , userController.likedProducts);

app.post('/my-products' , productController.MyProducts);

app.get('/my-profile/:userId' , userController.myProfileById);

app.post('/signup', userController.signup);

app.get('/get-user/:uId', userController.getUserById);  

app.post('/add-product', upload.fields([{name : 'pimage' } , {name : 'pimage2'}]), productController.addProduct);

app.get('/get-products', productController.getProducts);

app.get('/search', productController.search);

app.get('/get-product/:pId', productController.getProductsById);

app.post('/liked-products', userController.likeProducts);

app.post('/login',userController.login);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
