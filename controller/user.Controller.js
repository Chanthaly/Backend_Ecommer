
import dbExecute from "../db/db.js";
import { serviceMessage } from "../util/server.Message.js";
import bcrypt from 'bcrypt'

export const getUser = async(req,res) => {
    const {user_id} = req.params;
    if(!user_id) {
        return res.status(402).json({
            resultCode: 402,
            message: serviceMessage.DATA_NOT_EXIT
        })
    }
    try
    {
  const result =  await dbExecute('SELECT * FROM users1  WHERE user_id = ?', [user_id])
  if(!result || result.length === 0){
    return res.status(401).json({
        resultCode: 401,
        message: serviceMessage.DATA_NOT_FOUND
    })
  }
    return res.status(201).json({
        resultCode: 201,
        message: serviceMessage.OPERATION_SUCCESS,
    data: result
    })
    }
    catch(err) {
return res.status(500).json({
    resultCode: 500,
    message: serviceMessage.SERVER_ERR
})
    }

}
export const getUsers = async(req,res) => {

    let filter = "";
    
    try
    {
        const search = req.query?.search;
        if(search) {
              filter = `AND (user_name LIKE '%${search}%'  OR  user_premission LIKE '%${search}%')`
        }
  const sql = "SELECT * FROM  users1 WHERE 1   " + filter;
  const params = []
  const resutls = await dbExecute(sql,params)
      if(!resutls){
        return res.status(401).json({
             resultCode:401,
             message:serviceMessage.DATA_NOT_FOUND,
           
        })
      }
      return res.status(201).json({
        resultCode:201,
        message:serviceMessage.OPERATION_SUCCESS,
        data: resutls
      })

    }
    catch(err){
      return res.status(500).json({
        resultCode:500,
        message:serviceMessage.SERVER_ERR
      })
    }
}
export const DeleteUsers = async(req,res) => {
  const {user_id} = req.query;
  console.log(user_id)
  if(!user_id) {
    return res.status(401).json({
      resultCode:401,
      message:serviceMessage.ID_NOT_FOUND 
    })
  }
  console.log(user_id)
  try{
     const data = await dbExecute('DELETE FROM users1 WHERE user_id = ?',  [user_id]
     )
     console.log('data => ',data)
       if(!data)  {
        return res.status(402).json({
          resultCode:402,
          message:serviceMessage.DATA_NOT_EXIT
        })
       }
       if(data?.affectedRows  === 0 ) {
        return res.status(401).json({
          resultCode: 401,
          message:serviceMessage.DATA_NOT_FOUND
        })
       }
       return res.status(201).json({
        resultCode:201,
        message: serviceMessage.OPERATION_SUCCESS
       })
       
  }
  catch (err) {
    return res.status(500).json({
      resultCode:500,
      message:serviceMessage.SERVER_ERR
    })


  }
}
export const EditUser = async(req,res) => {
  const {user_id} = req.params
  const {user_name,user_age,user_address,user_premission,password} = req.body;
 if(!user_id) {
    return res.status(401).json({
      resultCode:401,
      message:serviceMessage.ID_NOT_FOUND 
    })
  }

    if(!user_name || !user_age||!user_address||!user_premission||!password) {
      return res.status(401).json({
        resultCode:401,
        message:serviceMessage.DATA_NOT_FOUND
      })
    }
   
  try{
    const key =   bcrypt.genSaltSync(10)
        const  NewPSD = bcrypt.hashSync(password,key)
    const sql = `UPDATE users1
    SET 
    USER_NAME = ?, USER_AGE=?,USER_ADDRESS=?,USER_PREMISSION=?,PASSWORD=? WHERE USER_ID = ?
    `;
    const params = [user_name,user_age,user_address,user_premission,NewPSD,user_id];
    const data= await dbExecute(sql,params);
    console.log(data)
    if(!data || data?.affectedRows === 0 ) {
      return res.status(422).json({
        resultCode:422,
        message:serviceMessage.DATA_NOT_FOUND
      })
    }
    return res.status(201).json({
      resultCode:201,
      message:serviceMessage.OPERATION_SUCCESS,
      data:data
    })

  }
  catch (err) {
      console.error("EditUser ERROR:", err);
return res.status(500).json({
  resultCode:500,
  message:serviceMessage.SERVER_ERR
})


  }



}