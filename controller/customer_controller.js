import dbExecute from "../db/db.js";
import { serviceMessage } from "../util/server.Message.js";

export const getCustomers = async(req,res) => {
  
   let filter = "";
   const params = [];
   const { search, serach } = req.query;
   const query = (typeof search === 'string' ? search : typeof serach === 'string' ? serach : '').trim();
   if (query) {
     filter = ` AND (name LIKE ? OR address LIKE ? OR email LIKE ? OR phone LIKE ?) `;
     params.push(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`);
   }
try {
     const sql = 'SELECT customer_id, name AS customer_name, phone, email, address, created_at FROM customer WHERE 1 ' + filter;
     const data = await dbExecute(sql, params);
     if (!data) {
        return res.status(402).json ({
            resultCode:402,
            message:serviceMessage.DATA_NOT_FOUND
        })
     }
      return res.status(200).json({
        resultCode:200,
        message:serviceMessage.OPERATION_SUCCESS,
        data:data
      })
    
}
catch(err) {
    return res.status(500).json({
        resultCode: 500,
        message:serviceMessage.SERVER_ERR
    })
}



}
export const getCustomer = async(req,res) => {
     const {customer_id} = req.params
     if(!customer_id) {
        return res.status(402).json({
            resultCode:402,
            message:serviceMessage.ID_NOT_FOUND
        })
     }
     try{
        const sql = "SELECT customer_id, name AS customer_name, phone, email, address, created_at FROM customer WHERE customer_id = ?"
        const params = [customer_id];
        const data = await dbExecute(sql,params)
        if(!data || data.length === 0) {
            return res.status(401).json({
                resultCode:402,
                message:serviceMessage.DATA_NOT_FOUND
            })
        }
        return res.status(200).json({
            resultCode:200,
            message:serviceMessage.OPERATION_SUCCESS,
            data:data
        })

     }
     catch(err) 
     {
         console.log("err",err)
         return res.status(500).json({
            resultCode:500,
            message:serviceMessage.SERVER_ERR
         })

     }
}
export const createCustomer = async(req,res) => {
     const { 
        customer_name,
        name,
        phone,
        email,
        address,
        created_at,
     } = req.body
     const customerName = customer_name || name;
     if(!customerName || !phone || !email || !address || !created_at) {
         return res.status(401).json({
             resultCode:401,
             message:serviceMessage.DATA_NOT_EXIT
         })
     }
     try {
        const sql = "INSERT INTO customer (name, phone, email, address, created_at) VALUES(?,?,?,?,?)"
        const params = [customerName, phone, email, address, created_at]
        const result = await dbExecute(sql, params)
        if(!result) {
          return res.status(401).json({
             resultCode:401,
             message:serviceMessage.OPERATION_NOT_FOUND
          })
        }
        return res.status(201).json({
          resultCode:201,
          message:serviceMessage.OPERATION_SUCCESS,
          data: {
            customer_id: result.insertId,
          }
        })
     }
     catch(err) {
         console.log("err => ", err)
         return res.status(500).json({
               resultCode:500,
               message:serviceMessage.SERVER_ERR,
               error: err?.message || err,
               sqlError: err?.sqlMessage || null,
         })
     }
}
export const updateCustomer = async(req,res) => {
      const {customer_id} = req.params
     const { 

         customer_name,
      customer_phone,
      customer_email,
      customer_address
     } = req.body
     if(!customer_id) {
         return res.status(401).json({
            resultCode:401,
            message:serviceMessage.ID_NOT_FOUND
         })
     }
     if(!customer_name || !customer_phone || !customer_email) {
            return res.status(401).json({
                resultCode:401,
                message:serviceMessage.DATA_NOT_EXIT
            })
        }
        try 
        {
     const  result  =  await dbExecute( "UPDATE customer SET name=?, phone=?, email=?, address=? WHERE customer_id =? ",
      [ customer_name, customer_phone, customer_email, customer_address, customer_id])

       if(!result  || result.affectedRows < 1 ) {
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
        catch(err) 
        {
            console.log("err => ",err)
            return res.status(500).json({
                  resultCode:500,
                  message:serviceMessage.SERVER_ERR
            })
        }
    }
export const deleteCustomer = async(req,res) => {
      const {customer_id} = req.params
    
     if(!customer_id) {
         return res.status(401).json({
            resultCode:401,
            message:serviceMessage.ID_NOT_FOUND
         })
     }
   
        try 
        {
        const result = await dbExecute("DELETE  FROM customer WHERE customer_id = ?" ,[customer_id])

       if(!result  || result.affectedRows < 1 ) {
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
        catch(err) 
        {
            console.log("err => ",err)
            return res.status(500).json({
                  resultCode:500,
                  message:serviceMessage.SERVER_ERR
            })
        }
    }

     
