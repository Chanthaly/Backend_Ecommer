import dbExecute from "../db/db.js";
import { io } from "../util/socket.js";
import { serviceMessage } from "../util/server.Message.js";


// ─── GET /getCustomers ────────────────────────────────────────────────────────
export const getCustomers = async (req, res) => {
  try {
    const sql  = "SELECT customer_id, name AS customer_name, phone FROM customer ORDER BY name ASC";
    const data = await dbExecute(sql, []);
    return res.status(200).json({
      resultCode: 200,
      message: serviceMessage.OPERATION_SUCCESS,
      data: data
    });
  } catch (err) {
    return res.status(500).json({ resultCode: 500, message: serviceMessage.SERVER_ERR });
  }
};

// ─── GET /getOrder_items/:order_item_id ───────────────────────────────────────
export const getOrder_items = async (req, res) => {
  const { order_item_id } = req.params;
  try {
    const sql  = "SELECT * FROM order_items WHERE order_item_id = ?";
    const data = await dbExecute(sql, [order_item_id]);

    // ✅ dbExecute คืน array — ต้องเช็ค length ไม่ใช่ !data
    if (!data || data.length === 0) {
      return res.status(404).json({
        resultCode: 404,
        message: serviceMessage.OPERATION_NOT_FOUND
      });
    }
    return res.status(200).json({
      resultCode: 200,
      message: serviceMessage.OPERATION_SUCCESS,
      data: data[0]
    });
  } catch (err) {
    return res.status(500).json({ resultCode: 500, message: serviceMessage.SERVER_ERR });
  }
};

// ─── POST /getSell_items ──────────────────────────────────────────────────────
export const addgetSell_items = async (req, res) => {
  const { order_no, customer_id, user_id, items } = req.body;

  // ── Validate ──
  if (!order_no)    return res.status(400).json({ resultCode: 400, message: "order_no is required" });
  if (!customer_id) return res.status(400).json({ resultCode: 400, message: "customer_id is required" });
  // user_id อาจเป็น null ชั่วคราว — log ไว้ก่อน
  console.log("📥 BODY:", JSON.stringify(req.body));
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ resultCode: 400, message: "items must be a non-empty array" });
  }

  try {
    // ── STEP 1: ตรวจ stock ทุก item ก่อน (อย่า insert ก่อนแล้วค่อยเจอ error ทีหลัง) ──
    for (const item of items) {
      const { product_id, quantity, unit_type } = item;

      if (!product_id || !quantity || quantity < 1) {
        return res.status(400).json({ resultCode: 400, message: `product_id/quantity invalid` });
      }
      if (!["item", "pack"].includes(unit_type)) {
        return res.status(400).json({ resultCode: 400, message: `unit_type must be 'item' or 'pack'` });
      }

      const product = await dbExecute(
        "SELECT * FROM products WHERE product_id = ?",
        [product_id]
      );
      if (!product || product.length === 0) {
        return res.status(404).json({ resultCode: 404, message: `PRODUCT ID ${product_id} NOT FOUND` });
      }

      const p = product[0];
      if (unit_type === "pack" && p.product_qty_pack < quantity) {
        return res.status(400).json({ resultCode: 400, message: `PRODUCT "${p.product_name}" STOCK OUT (PACK)` });
      }
      if (unit_type === "item" && p.product_qty_item < quantity) {
        return res.status(400).json({ resultCode: 400, message: `PRODUCT "${p.product_name}" STOCK OUT (ITEM)` });
      }
    }

    // ── STEP 2: Insert orders → ได้ order_id ──
    const orderSql = "INSERT INTO orders(order_no, customer_id, user_id,total) VALUES(?, ?, ?,?)";
    const orderResult = await dbExecute(orderSql, [order_no, customer_id,user_id,0]);
    const order_id = orderResult.insertId;  // ✅ แก้ bug: เดิม order_id ไม่ถูก define

    if (!order_id) {
      throw new Error("Failed to create order — no insertId");
    }

    // ── STEP 3: Insert order_details + update stock ──
    let orderTotal = 0;
    const insertedItems = [];

    for (const item of items) {
      const { product_id, quantity, unit_type, price } = item;
      const priceNum = parseFloat(price);
      const total    = quantity * priceNum;
      orderTotal    += total;

      // Insert order_details
      const insertSql = `
        INSERT INTO order_details(order_id, product_id, quantity, price, unit_type, total)
        VALUES(?, ?, ?, ?, ?, ?)
      `;
      const result = await dbExecute(insertSql, [order_id, product_id, quantity, priceNum, unit_type, total]);

      // Update stock
      if (unit_type === "pack") {
        await dbExecute(
          "UPDATE products SET product_qty_pack = product_qty_pack - ? WHERE product_id = ?",
          [quantity, product_id]
        );
      } else {
        await dbExecute(
          "UPDATE products SET product_qty_item = product_qty_item - ? WHERE product_id = ?",
          [quantity, product_id]
        );
      }

      insertedItems.push({
        order_detail_id: result.insertId,
        order_id,
        product_id,
        quantity,
        price: priceNum,
        unit_type,
        total,
      });
    }
    await dbExecute ("UPDATE orders SET total = ? WHERE order_id = ? ", [orderTotal,order_id])
    io.emit("new_order", {
  order_id,
  order_no,
  customer_id,
  user_id,
  total: orderTotal,
  created_at: new Date(),
});
  
    // ── Response ──
    console.log(`✅ Order saved: ${order_no} (id=${order_id}) | ${insertedItems.length} items | total=${orderTotal}`);

    return res.status(201).json({
      resultCode: 201,
      message: "ORDER SUCCESS",
      data: {
        order_id,        // ✅ ส่ง order_id กลับให้ frontend ใช้ใบเสร็จ
        order_no,
        items: insertedItems,
        orderTotal,
      }
    });

  } catch (err) {
    console.error("❌ addgetSell_items error:", err);
    return res.status(500).json({
      resultCode: 500,
      message: "SERVER ERROR",
      error: err.message
    });
  }
};

// ─── GET /report ──────────────────────────────────────────────────────────────
export const report = async (req, res) => {
  let filter = "";
  const params = [];
  const { startDate, endDate, userName, search } = req.query;

  try {
    if (startDate) {
      filter += " AND o.order_date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      filter += " AND o.order_date <= ?";
      params.push(endDate);
    }
    if (userName) {
      filter += " AND u.user_name = ?";
      params.push(userName);
    }
    if (search) {
      filter += " AND (o.order_no LIKE ? OR c.name LIKE ? OR u.user_name LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const sql = `
      SELECT
        o.order_id,
        o.order_no,
        o.order_date,
        c.name AS customer_name,
        u.user_name AS user_name,
        IFNULL(o.total, 0) AS grand_total
      FROM orders o
      INNER JOIN customer c ON o.customer_id = c.customer_id
      INNER JOIN users1 u ON o.user_id = u.user_id
      WHERE 1 = 1 ${filter}
      ORDER BY o.order_date DESC
    `;

    const data = await dbExecute(sql, params);

    return res.status(200).json({
      resultCode: 200,
      message: serviceMessage.OPERATION_SUCCESS,
      data: data || []
    });

  } catch (err) {
    console.error("❌ report error:", err);
    return res.status(500).json({
      resultCode: 500,
      message: serviceMessage.SERVER_ERR
    });
  }
};