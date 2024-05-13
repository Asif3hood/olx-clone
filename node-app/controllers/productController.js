const mongoose = require('mongoose');
 

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


module.exports.search = (req,res) => {

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
  }

module.exports.addProduct = (req,res) => {
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
  }

module.exports.getProducts = (req,res) =>{

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
  }
module.exports.getProductsById = (req,res) =>{
    Product.findOne({_id: req.params.pId})
      .then((result)=>{
          res.send({message:'saved success.',product : result});
  
      })
      .catch((err)=>{
          res.send({message: 'server err'})
  
      })
  }
module.exports.MyProducts =  (req,res) => {
    const  userId = req.body.userId;
    Product.find({addedBy : userId})
    .then((result)=>{
      res.send({message:'Liked success.',products: result});
      })
      .catch(() => {
          res.send({message: 'server err'})
      })
  
  }
