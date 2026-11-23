import { serviceMessage } from "../util/server.Message.js";
import dbExecute from "../db/db.js";

export const  getCategories  =  async( req,res) => {

     let filter = " ";
     const {search} = req.query
    


    try{
   if(search) {
       filter =` AND (Cate_Name LIKE "%${search}%") `
     }

   const sql =  "SELECT * FROM  categories WHERE 1" + filter;
   const params = [];
   const  data = await dbExecute(sql,params)

   if(!data)
   {
    return res.status(402).json({
        resultCode:402,
        message: serviceMessage.DATA_NOT_FOUND,
     
    })

   }
   return res.status(201).json({
    resultCode: 201,
    message:serviceMessage.OPERATION_SUCCESS,
    data: data
   })



    }
catch(error) 
{
         console.log("error => ", error)
    return res.status(500).json({
         resultCode:500,
         message: serviceMessage.SERVER_ERR
    })

}

}
export const  getCategorie  =  async( req,res) => {
const   {Categories_id} = req.params
  if(!Categories_id) {
      return res.status(402).json({
          resultCode: 402,
          message: serviceMessage.ID_NOT_FOUND
      })
  }
  try {

  
   const sql =  "SELECT *  FROM  categories WHERE  Categories_id = ? ";
   const params = [id];
   const  data = await dbExecute(sql,params)

     if(!data)
   {
    return res.status(402).json({
        resultCode:402,
        message: serviceMessage.DATA_NOT_FOUND,
     
    })

   }
   return res.status(201).json({
    resultCode: 201,
    message:serviceMessage.OPERATION_SUCCESS,
    data: data
   })



    }
catch(error) 
{
         console.log("error => ", error)
    return res.status(500).json({
         resultCode:500,
         message: serviceMessage.SERVER_ERR
    })

}

}
export  const  createCate = async(req,res) => {
     const { Cate_Name,created_at,created_by} = req.body
     console.log(req.body)
     if(!Cate_Name || !created_at || !created_by) {
         return res.status(401).json({
            resultCode: 401, 
            message: serviceMessage.DATA_NOT_EXIT
         })
     }
  try
  {
  const sql = "INSERT INTO  categories(Cate_Name,created_at,created_by)VALUES(?,?,?)"
   const params = [Cate_Name,created_at,created_by]
   const data = await dbExecute(sql,params)
   if(!data ) {
    return res.status(402).json({
         resultCode:402,
         message: serviceMessage.OPERATION_NOT_FOUND
    })
   }
   return res.status(201).json({
     resultCode:200,
     message:serviceMessage.OPERATION_SUCCESS
   })
  }
  catch(error) 
  {
    console.log("Error=>", error)
    return res.status(500).json({
         resultCode:500,
         message: serviceMessage.SERVER_ERR
    })

  }




}

export const deleteCate = async(req,res) => {
     const {Categories_id} = req.params
     console.log(Categories_id)
     if(!Categories_id) {
         return res.status(401).json({
             resultCode:401,
             message: serviceMessage.ID_NOT_FOUND
         })
     }
     try{
          const data =  await dbExecute( "DELETE FROM categories  WHERE Categories_id = ?", [Categories_id])
         
           if(!data  || data.affectedRows < 1) {
            return res.status(402).json({
                resultCode:402,
                message: serviceMessage.OPERATION_NOT_FOUND
            })
           }
           return res.status(200).json({
            resultCode:200,
            message:serviceMessage.OPERATION_SUCCESS
           })
     }
     catch(error) 
     {
         
     }
}
export const  editeCate  = async(req,res) => {
    const {Categories_id} = req.params
    console.log(req.params)
    const  { Cate_Name, created_at, created_by} = req.body;
    console.log(req.body)
    if(!Cate_Name || !created_at || !created_by) {
        return res.status(401).json({
             resultCode:401,
             message: serviceMessage.DATA_NOT_EXIT
        })
    }
    try{
       const  result =    await dbExecute("UPDATE categories SET Cate_Name = ?, created_at=?,created_by=? WHERE Categories_id = ?",[Cate_Name,created_at,created_by,Categories_id]);
     
       if(!result || result?.affectedRows < 1) {
        return  res.status(402).json({
             resultCode: 402,
             message:serviceMessage.DATA_NOT_FOUND
        })
       }
       return res.status(201).json({
        resultCode:200,
        message:serviceMessage.OPERATION_SUCCESS
       })

    }
    catch(error) {
        console.log("error=> ",error)
          return res.status(500).json({

            resultCode:500,
            message: serviceMessage.SERVER_ERR
          })
    }

}