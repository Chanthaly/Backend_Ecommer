

import dbExecute from "../db/db.js";
import bcrypt from 'bcrypt'
import { serviceMessage } from "../util/server.Message.js";
import { genAccessTlken } from "../util/jwt.Helper.js";

export const Register = async(req,res) => {
   const {user_name, password, user_age , user_premission,user_address} = req.body; 
    


    if(!user_name|| !password|| !user_premission|| !user_age|| !user_address || !["user", "admin"].includes(user_premission)){
        return res.status(422).json({
            resultCode: 42200,
            message: serviceMessage.FIELD_IS_REQUIRED
        });
    } 


    try 
    {

        const key = bcrypt.genSaltSync(10);
        const newPwd = bcrypt.hashSync(password, key);

        const sql = `INSERT INTO users1(user_name, password, user_age,user_address,user_premission) VALUES(?,?,?,?,?)`;
        const params = [user_name, newPwd, user_age,user_address, user_premission]


        const result = await dbExecute(sql, params);

        if(!result){
            return res.status(422).json({
                resultCode: 42200,
                message: serviceMessage.OPERATION_FAIL
            })
        }


        return res.status(201).json({
            resultCode: 20001,
            message: serviceMessage.OPERATION_SUCCESS
        });
    } 
    catch (error) 
    {
        console.log(error);

        return res.status(500).json({
            resultCode: "ERR_500",
            message: serviceMessage.SERVER_ERR
        });
    }

}
export const Login = async(req,res) => {
const {user_name, password} = req.body;

    if(!user_name || !password){
        return res.status(422).json({
            resultCode: 42200,
            message: serviceMessage.FIELD_IS_REQUIRED
        })
    }


    try 
    {
        const result = await dbExecute('SELECT*FROM users1 WHERE user_name=?', [user_name]);

        if(!result){
                return res.status(422).json({
                resultCode: 42200,
                message: serviceMessage.USER_NOT_FOUND
            })
        }

        for(let i=0; i <= result.length-1; i++)
        {
            const isValid = bcrypt.compareSync(password, result[i].password); ///false|true
         
            if(isValid){
                const validUser = result[i] 
                    const accessToken = genAccessTlken({
                       user_id: validUser.user_id,
                       user_name:validUser.user_name,
                       user_premission:validUser.user_premission

                    })
              
                return res.status(200).json({
                    resultCode: 200,
                    message: serviceMessage.OPERATION_SUCCESS,
                    accessToken,
                    data: {
                        user_id: validUser.user_id,
                        user_name: validUser.user_name,
                       user_premission:validUser.user_premission
                    }
                })
            }
        }


        return res.status(422).json({
            resultCode: 42200,
            message: serviceMessage.USER_NOT_FOUND
        });

    } 
    catch (error) 
    {
        console.log(error)

        return res.send(500)
    }
}