var express = require('express');
var router = express.Router();
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const { ObjectId } = require('mongodb');


const verfyLogin=(req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{

    res.redirect('/login')
  
  }
}

/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  
  let cartCount=null 
  if(user){
    cartCount=await userHelpers.getCartCount(user._id)
  }
 
  
  let products=await productHelpers.getAllProducts()
  let obj=true
    

  res.render("users/user", { products, user,cartCount,obj});
    
});

router.get('/login',(req,res)=>{
  
  if(req.session.userLoggedIn){
    res.redirect('/') 
  }else{
    
    res.render('users/login',{loginErr:req.session.userloginErr})
    req.session.userloginErr=null
  }
  
})

router.get('/signup',(req,res)=>{
  
  res.render('users/signup')
})


router.post('/signup',(req,res)=>{
  
  userHelpers.doSignup(req.body).then((user)=>{
    
    let profileImage=req.files.profileImage
    profileImage.mv('./public/users-image/'+user._id+'.jpeg',(err,done)=>{ 
      if(!err){
        req.session.userLoggedIn=true
        req.session.user = user  
        res.redirect('/')
      }else{
        console.log(err) 
      } 
    })
    
    
  })
})


router.post('/login',(req,res)=>{
  userHelpers.doUserLogin(req.body).then((response)=>{
    if(response.status){
      req.session.userLoggedIn=true
      req.session.user = response.user
      
      res.redirect('/')

    }else{ 
      req.session.userloginErr ="Invalid Username or Password"
      res.redirect('/login')
      
    }
  })
})


router.get('/logout',(req,res)=>{
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})

router.get('/cart',verfyLogin,async(req,res)=>{
  let products = await productHelpers.getCartProducts(req.session.user._id)

  let user=req.session.user
  let totalAmount= await productHelpers.getTotalAmount(req.session.user._id)
  let proExist=false
  if(products[0] ){ 
    proExist=true 
  }
  console.log(proExist)
  res.render('users/cart',{products,user,totalAmount,proExist})
})

router.get('/add-to-cart/:id',(req,res)=>{
   
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true}) 
    
  })
})


router.post('/change-product-quantity',(req,res)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    let total= await productHelpers.getTotalAmount(req.body.user)
    response.totalAmount=parseInt(total)
    res.json(response)
  })
})


router.post('/remove-cart-product',(req,res)=>{ 
  userHelpers.removeCartProduct(req.body).then((response)=>{
    
    res.json(response)
  })
})

router.get('/place-order',verfyLogin,async(req,res)=>{
  let user=req.session.user
  let totalAmount= await productHelpers.getTotalAmount(user._id)
  res.render('users/place-order',{totalAmount,user})
})

router.post('/place-order',async(req,res)=>{
  
  let products=await userHelpers.getCartProductsList(req.body.userId)
  let totalAmount= await productHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalAmount).then((response)=>{
    res.json(response)
  })
})

router.get('/order-success',verfyLogin,(req,res)=>{ 
  let user=req.session.user
  let msg = 'Your order placed successfully'
  res.render('users/order-success',{user,msg})
})
router.get('/order-pending',verfyLogin,(req,res)=>{
  let user=req.session.user
  let msg = 'Your order pending beacause online payment'
  res.render('users/order-success',{user,msg})
})

router.get('/view-orders',verfyLogin,async(req,res)=>{ 
  let user=req.session.user
  let orders=await userHelpers.getAllOrders(user._id)
  let orderExist=false
  if(orders[0] ){ 
    orderExist=true 
  }
  
  res.render('users/view-orders',{user,orders,orderExist})  
})

router.get('/view-order-products/:id',verfyLogin,async(req,res)=>{  
  let orderId=req.params.id
  console.log(orderId)
  let products=await productHelpers.getAllOrderProducts(orderId)
  console.log(products);
  res.render('users/view-order-products',{user:req.session.user,products}) 
})

router.get('/view-profile',verfyLogin,async(req,res)=>{ 
  
  let user=req.session.user
  let products = await productHelpers.getCartProducts(user._id) 

  
  
  let orders=await userHelpers.getAllOrders(user._id)
  let orderExist=false
  if(orders[0] ){ 
    orderExist=true 
  }
  let proExist=false
  if(products[0] ){ 
    proExist=true 
  }
  res.render('users/view-profile',{user,orders,products,orderExist,proExist})    

})
router.get('/edit-profile',verfyLogin,(req,res)=>{
  let user=req.session.user
  res.render('users/edit-profile',{user})
  
})
router.post('/edit-profile',(req,res)=>{
  let userId=req.session.user._id
  

  userHelpers.editProfile(userId,req.body).then((user)=>{ 
    req.session.user =user
    
    
    
    if(req.files){
      let profileImage=req.files.profileImage
      profileImage.mv('./public/users-image/'+user._id+'.jpeg')
      res.redirect('/view-profile')
    }else{
      res.redirect('/view-profile') 
    }
    
  })
})

router.post('/cancel-the-order',(req,res)=>{
  let orderId=req.body.orderId
  userHelpers.cancelOrder(orderId).then((response)=>{
    res.json(response)
  })
})

router.get('/offer-images',async(req,res)=>{ 
  let images = await productHelpers.getAllOffers()
  console.log(images);
  
  res.json(images)
})    
module.exports = router; 
