var express = require("express");

const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");


var router = express.Router();

const verfyLogin=(req,res,next)=>{
  if(req.session.adminLoggedIn){
    next() 
  }else{

    res.redirect('/admin/login')
  
  }
}


/* GET users listing. */
router.get("/", function (req, res, next) { 
  
  productHelpers.getAllProducts().then((products)=>{ 
    res.render("./admin/admin", { products, admin: true });
  })
});

router.get('/login',(req,res)=>{
  if(req.session.adminLoggedIn){
    res.redirect('/admin') 
  }else{
    
    res.render('admin/login',{loginErr:req.session.adminloginErr, admin:true})
    req.session.adminloginErr=null
  }
})

router.post('/login',(req,res)=>{
  userHelpers.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn=true
      req.session.admin = response.admin
      
      res.redirect('/admin')

    }else{ 
      req.session.adminloginErr ="Invalid Username or Password"
      res.redirect('/admin/login')
      
    }
  })
})

router.get("/add-product",verfyLogin, (req, res) => { 
  let category = [
    'Mobile',
    'Laptop',
    'Watch',
    'Footwear',
    'Shirt',
    'Mens-cloth',
    'Ladies-cloth',
    'I-pads',
    'Shoes',
    'Computer'
  ]
  res.render("admin/add-product",{admin:true,category});
});


router.post("/add-product",(req,res)=>{ 

  productHelpers.addProduct(req.body).then((id)=>{

  
    let image = req.files.productImage;

    image.mv('./public/product-images/'+id+'.jpeg',(err,done)=>{  
      if(!err){
        res.redirect('/admin/')
      }else{
        console.log(err)
      } 
    })
  })
  
  
})


router.get('/delete-product/:id',verfyLogin,(req,res)=>{
  let productId=req.params.id
  console.log(productId)
  productHelpers.deleteProduct(productId,(response)=>{
    res.redirect('/admin/')
  })

})

router.get('/edit-product/:id',verfyLogin,async(req,res)=>{
  let product= await productHelpers.getProductDetails(req.params.id)
  let category = [
    'Mobile',
    'Laptop',
    'Watch',
    'Footwear',
    'Shirt',
    'Mens-cloth',
    'Ladies-cloth',
    'I-pads',
    'Shoes',
    'Computer'
  ]
  res.render('admin/edit-product',{product,admin:true,category}) 
})

router.post('/edit-product/:id',verfyLogin,(req,res)=>{
  let id=req.params.id
  productHelpers.updateProduct(req.body,id).then((response)=>{
    
    res.redirect('/admin/')
    if(req.files){
      let image=req.files.productImage;
      image.mv('./public/product-images/'+id+'.jpeg')
    }
  })
})

router.get('/view-orders',verfyLogin,async(req,res)=>{
  let orders=await productHelpers.getAllOrders()
  let ordersExist=false
  if(orders[0]){
    ordersExist=true
  }
  res.render('admin/view-all-orders',{orders,ordersExist,admin:true})
})

router.get('/view-users',verfyLogin,async(req,res)=>{
  let users=await userHelpers.getAllUsers()
  let usersExist=false
  if(users[0]){
    usersExist=true
  }
  res.render('admin/view-all-users',{users,usersExist,admin:true}) 
})


router.post('/tracking',(req,res)=>{
  let orderId=req.body.orderId 
  userHelpers.changeOrderStatus(orderId).then((response)=>{
    res.json(response)
  })
})

router.get('/view-order-products/:id',verfyLogin,async(req,res)=>{
  let orderId=req.params.id
  let products= await productHelpers.getAllOrderProducts(orderId) 
  res.render('admin/view-order-products',{products,admin:true})
})
router.get('/create-offers',verfyLogin,(req,res)=>{
  
  res.render('admin/create-offers',{admin:true })
})
router.post('/create-offers',(req,res)=>{
  
  let title = req.body;
  
  productHelpers.addOffer(title).then((id)=>{
    let image = req.files.offerImage;
    
    image.mv('./public/offers-images/'+id+'.jpeg',(err,done)=>{
      
      let url = '/offers-images/'+id+'.jpeg';

      productHelpers.pushUrl(url,id).then(()=>{
        res.redirect('/admin')
      })

    })
    
  })
  
})
module.exports = router;



