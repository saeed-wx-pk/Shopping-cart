function addToCart(proId){
    $.ajax({
      url:"/add-to-cart/"+proId,
      method:"get",
      success:(response)=>{
        if(response.status){
          alert('product added to cart successfully')
          let count=$('#cart-count').html()
          count=parseInt(count)+1
          $("#cart-count").html(count)
        }
        
      }
    })
  }

  function changeQuantity(cartId,proId,userId,count){
    let quantity=parseInt(document.getElementById(proId).innerHTML)
    count=parseInt(count)
    $.ajax({
      url:'/change-product-quantity',
      data:{
        user:userId,
        cart:cartId,
        product:proId,
        count:count,
        quantity:quantity
      },
      method:'post',
      success:(response)=>{
        if(response.removeProduct){
          alert("Product removed from cart")
          location.reload()
        }else{
          document.getElementById(proId).innerHTML=quantity+count
          document.getElementById('total').innerHTML=response.totalAmount
        }
      }
    })
  }
  function removeCartProduct(cartId,proId){
    $.ajax({
      url:'/remove-cart-product',
      data:{
        cartId:cartId,
        proId:proId
      },
      method:'post',
      success:(response)=>{
        if(response.removeCartProduct){
          alert("Product removed from cart")
          location.reload()
        }
      }
    })
  }

  $("#checkout-form").submit((e)=>{
    e.preventDefault()
    $.ajax({
      url:'/place-order',
      method:'post',
      data:$('#checkout-form').serialize(),
      success:(response)=>{
        if(response.status==='placed'){
          location.href='/order-success'
        }else{
          location.href='/order-pending'
        }

      }
    })

  })

  function tracking(orderId){
    $.ajax({
      url:'/admin/tracking',
      data:{
        orderId:orderId
      },
      method:'post',
      success:(response)=>{
        if(response.status){

          alert("Order "+response.orderStatus+" successfully")
          var btn = document.getElementById('track-btn-'+orderId)

          if(response.orderStatus==="shipped"){
            btn.innerHTML='On the Way'
          }else if(response.orderStatus==="on the way"){
            btn.innerHTML='delivered'
          }else if(response.orderStatus==="delivered"){
            btn.innerHTML='Completed'
          }
        }else{
          if(response.noAction==="completed"){
            alert("This order is completed")
          }else{
            alert("This order is pending order")
          }
          
        }
      }
    })

  }

  function orderCancel(orderId){
    $.ajax({
      url:'/cancel-the-order',
      data:{
        orderId:orderId
      },
      method:'post',
      success:(response)=>{
        if(response.status){
          alert("Order Canceled Successfully")
          location.reload()
        }else{
          alert("Sorry this order is on the way, can't cancel it")
        }
      }
    })
  }
  
  