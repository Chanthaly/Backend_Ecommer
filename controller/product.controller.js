import dbExecute from "../db/db.js";
import {serviceMessage} from '../util/server.Message.js'
   
  export const getPorudcts = async(req,res) => {
   let filter = "";
   const {search} = req.query
   try{
       if(search) {
          filter = ` AND (product_name LIKE  '%${search}%'   OR  product_sign LIKE  '%${search}%') `;
     
      
        }    
           const sql = " SELECT * FROM products WHERE 1 " + filter;
          const params = [];
            const data = await dbExecute(sql , params)
            if(!data ) {
                return res.status(402).json({
                    resultCode:402,
                    message: serviceMessage.DATA_NOT_FOUND
                
                })
            }
            return res.status(201).json({
                resultCode:201,
                message:serviceMessage.OPERATION_SUCCESS,
                data: data
            })
    }catch(err) {
        console.log('Error =>',err)
        return res.status(500).json({
            resultCode:500,
            message:serviceMessage.SERVER_ERR
        }) 

    }

  }
  export const getProduct = async(req,res) => {
    const {product_id} = req.params;
    if(!product_id) {
        return res.status(401).json({
            resultCode:401,
            message:serviceMessage.ID_NOT_FOUND
        })
    }
    try{
    const sql = " SELECT *  FROM products WHERE product_id = ?"
    const params = [product_id]
      const data  =  await dbExecute(sql, params)
      if(!data) {
        return res.status(402).json({
            resultCode:402,
            message: serviceMessage.DATA_NOT_FOUND
        })
      }
      return res.status(200).json({
        resultCode:200,
        message:serviceMessage.OPERATION_SUCCESS,
        data:data
      })



    }
    catch(err) {
        console.log("err=>", err) 
        return res.status(500).json({
            resultCode:500,
            message:serviceMessage.SERVER_ERR
        })
    }
  }
export const  createProduct = async(req,res) => {
     const {
        product_name,
      product_qty_pack,
      product_qty_item,
      product_buy_price_pack,
      product_buy_price_item,
      product_sell_price_pack,
       product_sell_price_item,
      created_at,
      updated_at,
      product_expire,
      product_sign,
      product_img,
      Categories_id

     } = req.body;
     console.log(req.body)
 
     if(!product_name || !product_qty_pack || !product_qty_item || !product_buy_price_pack ||

        !product_buy_price_item || !product_sell_price_pack || !product_sell_price_item ||
        !created_at  || !product_expire || !Categories_id
     ) {

         return res.status(402).json({
             resultCode:402,
             message:serviceMessage.DATA_NOT_EXIT
            })
        }

         
   
     try
     {

      const sql = "INSERT INTO products(product_name,product_qty_pack,product_qty_item,product_buy_price_pack,product_buy_price_item,product_sell_price_pack,product_sell_price_item,created_at,updated_at,product_expire,product_sign,product_img,Categories_id)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)";
         const params = [product_name,product_qty_pack,product_qty_item,product_buy_price_pack,product_buy_price_item,product_sell_price_pack,product_sell_price_item,created_at,updated_at,product_expire,product_sign,product_img,Categories_id]
         const result = await dbExecute(sql,params)
         if(!result  || result.length === 0) {
             return res.status(401).json({
                resultCode:401,
                message:serviceMessage.DATA_NOT_FOUND,
                return: []
             })
         }
         return res.status(201).json({
            resultCode:201,
            message: serviceMessage.OPERATION_SUCCESS
         })

     }
     catch(err) 
     {
         console.log("err =>",err)
         return res.status(500).json({
            resultCode:500,
            message:serviceMessage.SERVER_ERR
         })

     }

}
export const  updateProduct = async(req,res) => {
    const {product_id} = req.params
     const {
        product_name,
      product_qty_pack,
      product_qty_item,
      product_buy_price_pack,
      product_buy_price_item,
      product_sell_price_pack,
       product_sell_price_item,
      created_at,
      updated_at,
      product_expire,
      product_sign,
      Categories_id,
      product_img

     } = req.body;
if(!product_id) {
     return res.status(402).json({
        resultCode:402,
        message:serviceMessage.ID_NOT_FOUND
     })
}
 
     if(!product_name || !product_qty_pack || !product_qty_item || !product_buy_price_pack ||

        !product_buy_price_item || !product_sell_price_pack || !product_sell_price_item ||
        !created_at  || !product_expire || !Categories_id
     ) {

         return res.status(402).json({
             resultCode:402,
             message:serviceMessage.DATA_NOT_EXIT
            })
        }

         
   
     try
     {

      const result  =  await dbExecute( " UPDATE products SET product_name=?,product_qty_pack=?,product_qty_item=?,product_buy_price_pack=?,product_buy_price_item=?,product_sell_price_pack=?,product_sell_price_item=?,created_at=?,updated_at=?,product_expire=?,product_sign=? ,product_img=?,Categories_id=? WHERE product_id = ?", 
        [product_name,product_qty_pack,product_qty_item,product_buy_price_pack,product_buy_price_item,product_sell_price_pack,product_sell_price_item,created_at,updated_at,product_expire,product_sign,product_img,Categories_id ,product_id]);
        
         if(!result|| result?.affectedRows< 1) {
             return res.status(401).json({
                resultCode:401,
                message:serviceMessage.OPERATION_NOT_FOUND,
                return: []
             })
         }
        
         return res.status(201).json({
            resultCode:201,
            message: serviceMessage.OPERATION_SUCCESS
         })

     }
     catch(err) 
     {
         console.log("err =>",err)
         return res.status(500).json({
            resultCode:500,
            message:serviceMessage.SERVER_ERR
         })

     }

}
export const deleteProduct = async(req,res) => {
     const {product_id} = req.params;
     if(!product_id) {
        return res.status(401).json({
            resultCode:401,
            message: serviceMessage.ID_NOT_FOUND
            
        })
     }
     try{
         const data= await dbExecute(" DELETE  FROM products WHERE product_id = ?" , [product_id])
  if(!data || data.affectedRows < 1) {
     return res.status(401).json({
        resultCode:401,
        message:serviceMessage.OPERATION_NOT_FOUND
     })
  }
  return res.status(200).json({
     resultCode:200,
     message:serviceMessage.OPERATION_SUCCESS
  })
     }
     catch(err) {
         console.log("err", err)
        return res.status(500).json({
            resultCode:500,
            message:serviceMessage.SERVER_ERR
        })
     }
}