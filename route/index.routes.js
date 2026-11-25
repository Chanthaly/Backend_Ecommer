import express from 'express';
import { DeleteUsers, EditUser, getUser, getUsers } from '../controller/user.Controller.js';
import { Login, Register } from '../controller/user.auth.js';
import { verifyJWT } from '../middleware/jwt.middle.js';
import { createProduct, deleteProduct, getPorudcts, getProduct, updateProduct } from '../controller/product.controller.js';
import { createCustomer, deleteCustomer, getCustomer, getCustomers, updateCustomer } from '../controller/customer_controller.js';
import { getOrder, getOrders } from '../controller/order_controller.js';
import { addgetSell_items, getOrder_items, report } from '../controller/orderItems_controller.js';
import { uploadFile } from '../controller/upload.controller.js';
import { createCate, deleteCate, editeCate, getCategorie, getCategories } from '../controller/Categoreis.controller.js';
export const routes = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.user_premission !== 'admin') {
        return res.status(403).json({
            resultCode: 403,
            message: 'Forbidden'
        });
    }

    next();
};

routes.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'E-commer Backend is running!'
    });
  })
routes.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy'
    });
});
// user Auth 
routes.post('/createUser', verifyJWT, requireAdmin, Register);
routes.post('/loginUser',Login);


// user route
routes.get('/getUser/:user_id',verifyJWT ,getUser);
routes.get('/getUsers',getUsers);
 routes.delete('/deleteUser',verifyJWT,DeleteUsers);
 routes.put('/updateUser/:user_id',verifyJWT,EditUser);
 // product route
 routes.get('/getProducts',getPorudcts)
 routes.get('/getProduct/:product_id',verifyJWT,getProduct)
 routes.post('/createProduct',verifyJWT,createProduct)
 routes.put('/updateProduct/:product_id',verifyJWT,updateProduct)
 routes.delete('/deleteProduct/:product_id', verifyJWT,deleteProduct)

 // customer route
 routes.get('/getCustomers',getCustomers);
 routes.get('/getcustomer/:customer_id',getCustomer)
 routes.post('/createCustomer', createCustomer)
 routes.put('/updateCustomer/:customer_id', updateCustomer)
 routes.delete('/deleteCustomer/:customer_id', deleteCustomer)
 // orders route
  routes.get('/orders', verifyJWT, getOrders);
  routes.get('/getOrders/', verifyJWT, getOrders);
  routes.get('/orders/:order_id', verifyJWT, getOrder);
  routes.get('/getOrder/:order_id', verifyJWT, getOrder);
  routes.post('/orders', addgetSell_items);
  routes.post('/createOrder', addgetSell_items);
  routes.post('/getSell_items', addgetSell_items);
       // report 
    routes.get('/getReport', verifyJWT, report )
    routes.get('/sales-report', verifyJWT, report )

  // order_item
  routes.get('/getOrder_items/:order_item_id',getOrder_items);
  // upload image
routes.post('/upload',verifyJWT,uploadFile)
// categories 
routes.get('/getCates',verifyJWT,getCategories)
routes.get('/getCate/:Categories_id',verifyJWT,getCategorie)
routes.post('/createCate',verifyJWT, createCate)
routes.delete('/deleteCate/:Categories_id', verifyJWT,deleteCate)
routes.put('/updateCate/:Categories_id',verifyJWT,editeCate)
// get publit products 
routes.get('/public/Product',getPorudcts)
// get cate product
routes.get('/getCates/public',getCategories)