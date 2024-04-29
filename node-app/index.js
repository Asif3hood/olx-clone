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
const { type } = require('os');
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

const Users = mongoose.model('Users',
 { username: String,
   password: String,
   mobile: String,
   email: String,
   likedProducts: [{type:mongoose.Schema.Types.ObjectId,ref:'Products'}] 
  });

const Schema = mongoose.Schema;

const productSchema = new Schema({
  pname: String,
  pdesc: String,
  price: String,
  category: String,
  pimage: String,
  pimage2: String,
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Assuming 'User' is your user model
  },
  pLoc: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number]
    }
  }
});

productSchema.index({ pLoc: '2dsphere' }); // Creating a geospatial index on pLoc

const Product = mongoose.model('Product', productSchema);

app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
  res.send('Hello Asif!');
});

app.post('/like-product' , (req,res) => {
  let productId = req.body.productId;
  let userId = req.body.userId;
  
  Users.updateOne({_id:userId},{$addToSet:{likedProducts:productId }})
  .then(()=>{
    res.send({message:'Liked success.'});
    })
    .catch(() => {
        res.send({message: 'server err'})
    })

})

app.post('/my-products' , (req,res) => {
  const  userId = req.body.userId;
  Product.find({addedBy : userId})
  .then((result)=>{
    res.send({message:'Liked success.',products: result});
    })
    .catch(() => {
        res.send({message: 'server err'})
    })

})

app.get('/my-profile/:userId' , (req,res) => {
  let uid =req.params.userId;
  Users.findOne({_id : uid})
  .then((result)=>{
    res.send({
      message: 'success', user :{
        email: result.email,
        mobile: result.mobile,
        username: result.username
       }
    })
  })
  .catch(() => {
      res.send({message: 'server err'})
  })
 
})

app.post('/signup', (req, res) => {

    const username = req.body.username; 
    const mobile = req.body.mobile; 
    const email = req.body.email; 
    const password = req.body.password; 
    const user = new Users({ username:username, password:password, mobile:mobile, email:email }); 
    user.save()
      .then(() => res.send({message:'saved successfully'}))
      .catch(err => res.status(500).send('Error creating user'));
  });


app.get('/get-user/:uId', (req, res) => {
  const _userId = req.params.uId;
  Users.findOne({ _id : _userId})
  .then((result)=>{
    res.send({message:'saved success.', user: {email:result.email , mobile:result.mobile , username:result.username}});
  })
  .catch(() => {
      res.send({message: 'server err'})
  })    

});  

app.post('/add-product', upload.fields([{name : 'pimage' } , {name : 'pimage2'}]),(req,res) => {
  console.log(req.body)

    const plat = req.body.plat; 
    const plong = req.body.plong; 
    const pname = req.body.pname; 
    const pdesc = req.body.pdesc; 
    const price = req.body.price; 
    const category = req.body.category; 
    const pimage = req.files.pimage[0].path; 
    const pimage2 = req.files.pimage2[0].path; 
    const addedBy = req.body.userId; 
    const product = new Product({
      pname: pname,
      pdesc: pdesc,
      price: price,
      category: category,
      pimage: pimage,
      pimage2: pimage2,
      addedBy: addedBy,
      pLoc: {
        type: 'Point',
        coordinates: [parseFloat(plong), parseFloat(plat)] // Correctly set coordinates as an array of numbers
      }
    });
    
    // Save the Product instance to the database
    product.save()
      .then(savedProduct => {
        res.send({message:'Product saved successfully',product:savedProduct});
      })
      .catch(error => {
        res.send({message: 'server err'})
      });
    return;
})  

app.get('/get-products',(req,res) =>{

  const catName = req.query.catName;
  let _f = {}
  if(catName){
    _f = {category : catName}
  }
  Product.find(_f)
    .then((result)=>{
        res.send({message:'saved success.',product : result});
    })
    .catch((err)=>{
        res.send({message: 'server err'})

    })
})

app.get('/search',(req,res) => {

  let latitude = req.query.loc.split(',')[0];
  let longitude = req.query.loc.split(',')[1];
  let search = req.query.search;
  let regexPattern = new RegExp(`.*${search}.*`, 'i');

  Product.find({
    $or:[
      { pname : { $regex :regexPattern }},
      { pdesc : { $regex :regexPattern }},
      { price : { $regex :regexPattern }},
      { pdesc : { $regex :regexPattern }},
    ],
    pLoc: {
      $near: {
        $geometry:{
          type: 'Point',
          coordinates: [parseFloat(longitude),parseFloat(latitude)]
        },
        $maxDistance : 500 * 10000
      }
    }
  })
  .then((results)=>{
      res.send({message:'saved success.',product : results });

  })
  .catch((err)=>{
      res.send({message: 'server err'})

  })
})

app.get('/get-product/:pId',(req,res) =>{
  Product.find({_id: req.params.pId})
    .then((result)=>{
        res.send({message:'saved success.',product : result});

    })
    .catch((err)=>{
        res.send({message: 'server err'})

    })
})

  
app.post('/liked-products', (req, res) => {
  const userId = req.body.userId;
  if (!userId) {
      return res.status(400).send({ message: 'User ID is required.' });
  }

  Users.findOne({_id: userId}).populate('')
    .then((result)=>{
      const likedProducts = result.likedProducts || [];
        Product.find({ _id: { $in: likedProducts } })
        .then((products) => {
          res.send({ message: 'Fetched products successfully.', products });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send({ message: 'Server error while fetching products.' });
        });

    })
    .catch((err)=>{
        res.send({message: 'server err'})

    })
});


app.post('/login', (req, res) => {

    const username = req.body.username; 
    const password = req.body.password; 
    // const user = new Users({ username:username, password:password }); 
    
    Users.findOne({username : username})
      .then((result) =>{
        if(!result){
        res.send({message:'user not found.'})

        }else{
            if(result.password ==  password){
                const token = jwt.sign({
                    data: result
                  }, 'MYKEY', { expiresIn:'1h' });
                res.send({message:'Login success.',token: token, userId: result._id})
            }else{
                res.send({message:'incorrect password.'})
            }
             
        }
      }) 
      .catch(err => res.status(500).send('Error creating user'))
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
