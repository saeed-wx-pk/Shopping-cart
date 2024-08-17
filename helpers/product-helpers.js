var db = require('../config/connection')
var collection = require('../config/collections')
const { ObjectId } = require('mongodb')


module.exports={
    addProduct:(product)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then(async(data)=>{
                
                resolve(data.insertedId)
                // let category=product.Category
                // let productsCategory=await db.get().collection(collection.PRODUCTS_CATEGORY_COLLECTION).findOne({Name:category})
                // if(productsCategory){
                //     db.get().collection(collection.PRODUCTS_CATEGORY_COLLECTION).updateOne({Name:category},
                //         {
                //             $push:{products:data.insertedId}
                //         }
                //     )
                // }else{
                //     let categoryObj={
                //         Name:category,
                //         products:[data.insertedId]
                //     }
                //     db.get().collection(collection.PRODUCTS_CATEGORY_COLLECTION).insertOne(categoryObj)
                // }
                
            })
        })
       
    },
    getAllProducts:async()=>{
        return new Promise(async(resolve,reject)=>{
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
        
        
    },
    deleteProduct:(productId,cb)=>{
        let id=new ObjectId(productId)
        let qurey={_id:id}
        
        db.get().collection(collection.PRODUCT_COLLECTION).deleteOne(qurey).then((res)=>{
            cb(res)
        })
    },
    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            let id=new ObjectId(productId)
            let qurey={_id:id}
            db.get().collection(collection.PRODUCT_COLLECTION).findOne(qurey).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(productDetails,productId)=>{
        return new Promise(async(resolve,reject)=>{
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:new ObjectId(productId)})
            
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:new ObjectId(productId)},{
                $set:{
                    Name:productDetails.Name,
                    Price:productDetails.Price,
                    Description:productDetails.Description,
                    Category:productDetails.Category
                }
            }).then(async(response)=>{
                resolve(response)
                // if(product.Category===productDetails.Category){
                //     resolve(response)
                // }else{
                //    await db.get().collection(collection.PRODUCTS_CATEGORY_COLLECTION).updateOne({Name:productDetails.Category},
                //         {
                //             $push:{
                //                 products:productId
                //             }
                //         }
                //     )
                //     db.get().collection(collection.PRODUCTS_CATEGORY_COLLECTION).updateOne({Name:product.Category},
                //         {
                //             $pull:{products:{ObjectId:new ObjectId(productId)} }
                //         }
                //     )
                // }

                
            })
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{
                            $arrayElemAt:['$product',0]
                        }
                    }
                }

            ]).toArray()
            
            resolve(cartItems) 
        })

    },
    getTotalAmount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let total= await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:new ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{
                            $arrayElemAt:['$product',0]
                        }
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity',{$toInt:'$product.Price'}]}}
                    }
                }

            ]).toArray()
            
            if(total[0]){
                
                resolve(total[0].total) 
            }else{
                resolve()
            }
            
        })

    },
    getAllOrderProducts:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            let orderProducts= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:new ObjectId(orderId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{
                            $arrayElemAt:['$product',0]
                        }
                    }
                }

            ]).toArray()
            
            resolve(orderProducts)  
        })
    },
    // GET ALL ORDERS OF ALL USERS FOR ADMIN
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders =await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            resolve(orders)
        })
    },

    getAllCategory:(category)=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:category}).toArray()
            resolve(products)
        })
    },
    addOffer:(title)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OFFER_COLLECTION).insertOne(title).then((data)=>{
                console.log(data.insertedId);
                
                resolve(data.insertedId)
            })
        })
    },
    pushUrl:(url,id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.OFFER_COLLECTION).updateOne({_id:new ObjectId(id)},
            {
                $set:{
                    url:url
                }
            }
        )
            .then(()=>{
                    resolve()
            })
        })
    },
    getAllOffers:()=>{
        return new Promise(async(resolve,reject)=>{
            let images = await db.get().collection(collection.OFFER_COLLECTION).find().toArray()
            resolve(images)
        })
    }
}
