var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId


module.exports={
    doSignup:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            userdata.Password = await bcrypt.hash(userdata.Password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userdata).then(async(data)=>{
                
                let user =await db.get().collection(collection.USER_COLLECTION).findOne({Email:userdata.Email}) 
                resolve(user)
            })
        })
        
    },
    doUserLogin:(userdata)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({Email:userdata.Email}) 
            if(user){
                bcrypt.compare(userdata.Password,user.Password).then((status)=>{
                    if(status){
                        console.log('Login Successfully completed')
                        response.user=user
                        response.status=true
                        resolve(response)

                    }else{
                        console.log("Login err password")
                        resolve({status:false})

                    }
                })
            }else{
                console.log("Login err email not correct")
                resolve({status:false})
            }
        })
    },
    addToCart:(proId,userId)=>{

        let proObj={
            item:new objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            if(userCart){
                let proExist=userCart.products.findIndex(product=> product.item==proId) 
                
                if(proExist!=-1){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:new objectId(userId),'products.item':new objectId(proId)},
                {
                    $inc:{'products.$.quantity':1}
                }
                ).then(()=>{
                    resolve()
                })
                }else{
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:new objectId(userId)},{
                    
                        $push:{products:proObj}
                    
                }).then((response)=>{
                    resolve()  
                })
            }
            }else{
                let cartObj={
                    user:new objectId(userId),
                    products:[proObj] 

                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart= await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            if(cart){
                count=cart.products.length
                
            }
            resolve(count)
        })
    },
    changeProductQuantity:(details)=>{
        let quantity=parseInt(details.quantity)
        let count=parseInt(details.count)
        return new Promise((resolve,reject)=>{
            if(count==-1 && quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:new objectId(details.cart)},
            {
                $pull:{products:{item:new objectId(details.product)}}
            }
            ).then((response)=>{
                resolve({removeProduct:true})
            })
            }else{
                db.get().collection(collection.CART_COLLECTION)
                        .updateOne({_id:new objectId(details.cart),'products.item':new objectId(details.product)},
                    {
                        $inc:{'products.$.quantity':count}
                    }
                    ).then(()=>{
                        resolve({status:true})
                    })
            }
        })
    },
    removeCartProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:new objectId(details.cartId)},
            {
                $pull:{products:{item:new objectId(details.proId)}}
            }
            ).then((response)=>{
                resolve({removeCartProduct:true})
            })
        })
    },
    placeOrder:(order,products,amount)=>{
        return new Promise((resolve,reject)=>{
           
            let status= order['payment-method']==='COD'?'placed':'pending'
            let orderObj={
                userName:order.userName,
                deliveryDetails:{
                    mobile:order.mobile,
                    address:order.address,
                    pincode:order.pincode
                },
                userId:new objectId(order.userId),
                paymentMethod:order['payment-method'],
                products:products,
                totalAmount:amount,
                status:status,
                date:new Date()
                
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((res)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:new objectId(order.userId)})
                resolve({status:status})
            })
        })

    },
    getCartProductsList:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:new objectId(userId)})
            resolve(cart.products)
        })
    },
    // GET ALL ORDERS OF A USER
    getAllOrders:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:new objectId(userId)}).toArray()
            resolve(orders)
        })
    },
    editProfile:(userId,userData)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(userId)},
        {
            $set:{
                Name:userData.Name,
                Email:userData.Email,
                Mobile:userData.Mobile 
            }
        }
        ).then(async()=>{
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email}) 
                resolve(user)
            
            
        })
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    changeOrderStatus:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new objectId(orderId)})
            if(order.status==="placed"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},
                {
                    $set:{
                        status:"shipped"
                    }
                }
                ).then((response)=>{
                    
                    resolve({status:true,orderStatus:"shipped"})
                })
            }else if(order.status==="shipped"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},
                {
                    $set:{
                        status:"on the way"
                    }
                }
                ).then((response)=>{
                    
                    resolve({status:true,orderStatus:"on the way"})
                })
            }else if(order.status==="on the way"){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:new objectId(orderId)},
                {
                    $set:{
                        status:"delivered"
                    }
                }
                ).then((response)=>{
                    
                    resolve({status:true,orderStatus:"delivered"})
                })
            }else if(order.status==="delivered"){
                resolve({status:false,noAction:"completed"})
            }else{ 
                resolve({status:false,noAction:"pending"})
            }
            
            
       
        })
    },
    doAdminLogin:(adminDetails)=>{
        return new Promise(async(resolve,reject)=>{
            let response={}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminDetails.Email}) 
            if(admin){
                bcrypt.compare(adminDetails.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log('Login Successfully completed')
                        response.admin=admin
                        response.status=true
                        resolve(response)

                    }else{
                        console.log("Login err password")
                        resolve({status:false})

                    }
                })
            }else{
                console.log("Login err email not correct")
                resolve({status:false})
            }
        })
    },
    cancelOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:new objectId(orderId)})
            if(order.status==="pending" ){

            
                db.get().collection(collection.ORDER_COLLECTION)
                    .deleteOne({_id:new objectId(orderId)})
                .then((response)=>{
                    resolve({status:true})
                })
            }else if(order.status==="placed"){

            
                db.get().collection(collection.ORDER_COLLECTION)
                    .deleteOne({_id:new objectId(orderId)})
                .then((response)=>{
                    resolve({status:true})
                })
            }else if(order.status==="shipped"){

            
                db.get().collection(collection.ORDER_COLLECTION)
                    .deleteOne({_id:new objectId(orderId)})
                .then((response)=>{
                    resolve({status:true})
                })
            }else{
                resolve({status:false})
            }
        })
    }

    
}