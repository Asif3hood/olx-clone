const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


const Users = mongoose.model('Users',
 { username: String,
   password: String,
   mobile: String,
   email: String,
   likedProducts: [{type:mongoose.Schema.Types.ObjectId,ref:'Product'}] 
  });

module.exports.likedProducts = (req,res) => {
    let productId = req.body.productId;
    let userId = req.body.userId;
    
    Users.updateOne({_id:userId},{$addToSet:{likedProducts:productId }})
    .then(()=>{
      res.send({message:'Liked success.'});
      })
      .catch(() => {
          res.send({message: 'server err'})
      })
  
  }

module.exports.signup = (req, res) => {

    const username = req.body.username; 
    const mobile = req.body.mobile; 
    const email = req.body.email; 
    const password = req.body.password; 
    const user = new Users({ username:username, password:password, mobile:mobile, email:email }); 
    user.save()
      .then(() => res.send({message:'saved successfully'}))
      .catch(err => res.status(500).send('Error creating user'));
  }
  module.exports.myProfileById = (req,res) => {
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
   
  }
  
  module.exports.getUserById =  (req, res) => {
    const _userId = req.params.uId;
    Users.findOne({ _id : _userId})
    .then((result)=>{
      res.send({message:'saved success.', user: {email:result.email , mobile:result.mobile , username:result.username}});
    })
    .catch(() => {
        res.send({message: 'server err'})
    })    
  
  }

  module.exports.login =  (req, res) => {

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
  }

  module.exports.likeProducts = (req, res) => {
    console.log({ _id: req.body.userId });
    Users.find({ _id: req.body.userId })
      .populate('likedProducts') // Populate the 'likedProducts' field of the user document
      .then((result) => {
        // Handle the result of the query
        if (result.length === 0) {
          // If no user found with the provided _id
          res.status(404).send({ message: 'User not found' });
        } else {
          // Send the fetched liked products in the response
          res.send({ message: 'Fetched products successfully.', products: result[0].likedProducts });
        }
      })
      .catch((err) => {
        // Handle any errors that occur during the query
        console.error('Error fetching liked products:', err);
        res.status(500).send({ message: 'Server error' });
      });
  };
  