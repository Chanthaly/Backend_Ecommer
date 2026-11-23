import dbExecute from "../db/db.js";
import { serviceMessage } from "../util/server.Message.js";
import { io } from "../server.js";

// ─── GET /getOrders ───────────────────────────────────────────────────────────
// export const getOrders = async (req, res) => {
//   let filter = "";
//   const params = [];
//   const { search } = req.query;   

//   if (search) {
//     filter += ` AND (u.user_name LIKE ? OR c.customer_name LIKE ?)`;
//     params.push(`%${search}%`, `%${search}%`); 
//   }

//   try {
//     const sql = ` 
//     SELECT 
//   o.order_id,
//   o.order_date,
//   o.customer_id,
//   o.user_id,
//   c.name,
//   u.user_name,
// SUM(t.total) AS grand_total
// FROM orders o 
// INNER JOIN customer c ON o.customer_id = c.customer_id
// INNER JOIN users1 u   ON o.user_id     = u.user_id
// LEFT JOIN  order_details t ON o.order_id = t.order_id
// WHERE 1 = 1
// ${filter}
// GROUP BY 
//   o.order_id,
//   o.order_date,
//   o.customer_id,
//   o.user_id,
//   c.name,
//   u.user_name
//   ORDER BY o.order_id DESC;
    
//     ` 

//     const result = await dbExecute(sql, params);

//     if (!result || result.length === 0) {
//       return res.status(404).json({
//         resultCode: 404,
//         message: serviceMessage.DATA_NOT_FOUND,
//       });
//     }

//     return res.status(200).json({
//       resultCode: 200,
//       message: serviceMessage.OPERATION_SUCCESS,
//       data: result,
//     });

//   } catch (err) {
//     console.log("getOrders err =>", err);
//     return res.status(500).json({
//       resultCode: 500,
//       message: serviceMessage.SERVER_ERR,
//     });
//   }
// };
export const getOrders = async (req, res) => {
  let filter = "";
  const params = [];
  const { search } = req.query;   

  if (search) {
    filter += ` AND (u.user_name LIKE ? OR c.name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`); 
  }

  try {
    // Query 1: ดึง orders + grand total
    const orderSql = `
      SELECT 
        o.order_id,
          o.order_no,
        o.order_date,
        o.customer_id,
        o.user_id,
       o.total,
        c.name AS customer_name,
        u.user_name,
        SUM(t.total) AS grand_total,
        COUNT(t.order_detail_id) AS item_count  
      FROM orders o 
      INNER JOIN customer c ON o.customer_id = c.customer_id
      INNER JOIN users1 u   ON o.user_id     = u.user_id
      LEFT JOIN  order_details t ON o.order_id = t.order_id
      WHERE 1 = 1 ${filter}
      GROUP BY 
        o.order_id, o.order_date, o.customer_id, o.user_id, c.name, u.user_name
      ORDER BY o.order_id DESC
      LIMIT 50;   -- แนะนำใส่ limit ถ้ายังไม่มี pagination
    `;

    const orders = await dbExecute(orderSql, params);
   const orderIds = orders.map(o=>o.order_id);
   if(orderIds.length === 0) {
     return  res.status(403).json({
      resultCode:403,
      message: "ບໍພົບຂໍ້ມູນ"
     })

   }
   const placeholders = orderIds.map(()=>'?').join(', ')
    const detailSql = `
      SELECT 
        od.order_id,
        od.order_detail_id,
        od.product_id,          
        od.quantity,
        od.price AS  unit_price,
        od.unit_type,
        od.total,
        p.product_name
      FROM order_details od
      INNER JOIN products p ON od.product_id = p.product_id
      WHERE od.order_id IN (${placeholders})
      ORDER BY od.order_id, od.order_detail_id ASC
    `;
    console.log('Delail SQL run', detailSql)
    console.log('detail for param', orderIds)

const details = await dbExecute(detailSql, orderIds);

    // Group details ตาม order_id (ใช้ Map)
    const detailsMap = new Map();
    details.forEach(d => {
      if (!detailsMap.has(d.order_id)) {
        detailsMap.set(d.order_id, []);
      }
      detailsMap.get(d.order_id).push(d);
    });

    // รวม details เข้าไปใน orders
    const result = orders.map(order => ({
      ...order,
      details: detailsMap.get(order.order_id) || []
    }));

    return res.status(200).json({
      resultCode: 200,
      message: "สำเร็จ",
      data: result
    });

  } catch (err) {
    console.error("getOrders error:", err);
    return res.status(500).json({ resultCode: 500, message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
  }
};

// ─── GET /getOrder/:order_id ──────────────────────────────────────────────────
export const getOrder = async (req, res) => {
  const { order_id } = req.params;
  console.log("ID", order_id);

  if (!order_id) {
    return res.status(400).json({
      resultCode: 400,
      message: serviceMessage.ID_NOT_FOUND,
    });
  }

  try {
    // Query 1: ดึงข้อมูล order หลัก
    const orderSql = `
      SELECT 
        o.order_id,
        o.order_no,
        o.order_date,
        o.user_id,
        o.customer_id,
        c.name AS customer_name,
        u.user_name,
        SUM(od.total) AS grand_total
      FROM orders o 
      INNER JOIN customer c ON o.customer_id = c.customer_id
      INNER JOIN users1 u   ON o.user_id     = u.user_id
      LEFT JOIN  order_details od ON o.order_id = od.order_id
      WHERE o.order_id = ?
      GROUP BY o.order_id, o.order_no, o.order_date, 
               o.user_id, o.customer_id, c.name, u.user_name
    `;

    // Query 2: ดึง items พร้อม product_name ✅
    const itemsSql = `
      SELECT 
        od.order_detail_id,
        od.product_id,
        od.quantity,
        od.price,
        od.total,
        p.product_name
      FROM order_details od
      INNER JOIN products p ON od.product_id = p.product_id
      WHERE od.order_id = ?
      ORDER BY od.order_detail_id ASC
    `;

    const [orderData, itemsData] = await Promise.all([
      dbExecute(orderSql, [order_id]),
      dbExecute(itemsSql, [order_id]),
    ]);

    console.log("order =>", orderData);
    console.log("items =>", itemsData);

    if (!orderData || orderData.length === 0) {
      return res.status(404).json({
        resultCode: 404,
        message: serviceMessage.DATA_NOT_FOUND,
      });
    }

    return res.status(200).json({
      resultCode: 200,
      message: "OPERATION_SUCCESS",
      data: {
        order: orderData[0],    // ✅ ดึงจาก query จริง ไม่ใช่ object literal
        items: itemsData ?? [], // ✅ array items พร้อม product_name
      },
    });

  } catch (err) {
    console.log("getOrder err =>", err);
    return res.status(500).json({
      resultCode: 500,
      message: serviceMessage.SERVER_ERR,
    });
  }
};

// ─── POST /createOrder ────────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  const { customer_id, user_id , total} = req.body;
console.log(total)
  if (!customer_id || !user_id  || !total )    {
    return res.status(400).json({
      resultCode: 400,
      message: "customer_id and user_id are required",
    });
  }

  try {
    const order_no = "ORD" + Date.now();
    const sql      = "INSERT INTO orders(order_no, customer_id, user_id,total) VALUES(?,?,?)";
    const data     = await dbExecute(sql, [order_no, customer_id,total, user_id]);

    // Emit new order notification
    io.emit("new_order", {
      order_id: data.insertId,
      order_no,
      customer_id,
      user_id,
      total
    });

    return res.status(201).json({
      resultCode: 201,
      message: "Order created successfully",
      data: {
        order_id: data.insertId,
        order_no,
      },
    });

  } catch (err) {
    console.log("createOrder err =>", err);
    return res.status(500).json({
      resultCode: 500,
      message: "Server error",
      error: err.message,
    });
  }
};