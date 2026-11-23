import { MulterError } from "multer";
import { buildPath , createMulterUpload, generateStorage} from "../util/Multer.Helper.js";
   const UPLOAD_URL = 'product_img';
   export const uploadFile = async (req,res)  => {

    try{
        const Storage = generateStorage(UPLOAD_URL);
        const upload = createMulterUpload(Storage).fields([
            {name: "file", maxCount:1}
        ])
        upload(req,res, async(error) => {
            if(error instanceof MulterError) {
                console.log( 'Empty field =>', error?.message)
               return res.status(error.statusCode || 500).json({
                message: error.message || "Upload error, Please,double check spelling field name or limitation"

               }) ;

            }
            else if(error) {
                console.log('Unknow multer ==>'+error.message);
                return res.status(206).json({
                    resultCode:206,
                    message:error.message || "Upload failed."

                })
            }
            return res.status(200).json({
                resultCode:200,
                message: "Operatuib successfully!",
                fileName: buildPath(UPLOAD_URL,req?.files['file'][0]?.filename),
                mimeType:req?.files['file'][0]?.mimeType,
                 fileSize:req?.files['file'][0].size || 0,
                 encodeSize:req?.files['file'][0].encoding

            })
        } )

    }
    catch(error)
    {
console.log(error?.message ?? "Internal Service Error");
        return res.status(500).send("Internal Server Error");
    }
   }