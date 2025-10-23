require("dotenv").config();
console.log("📍 Using MongoDB URI:", process.env.MONGO_URI);


const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

// 错误处理初始化
process.removeAllListeners("uncaughtException");
process.removeAllListeners("unhandledRejection");
process.on("uncaughtException", (err) => console.error("💥 Uncaught Exception:", err.stack || err.message));
process.on("unhandledRejection", (reason, promise) => {
    console.error("💥 Unhandled Rejection at:", promise);
    console.error("Reason:", reason.stack || reason.message);
});
Error.prepareStackTrace = undefined;

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const port = process.env.PORT || 5000;
const host = process.env.HOST || "0.0.0.0";

let db, mongoClient;

// ===== 检查环境变量 =====
function checkEnvVariables() {
    if (!uri) throw new Error("MONGO_URI is not defined in .env file");
    if (!dbName) throw new Error("DB_NAME is not defined in .env file");
}

// ===== 优雅关闭 =====
async function shutdownServer(signal) {
    console.log(`Received ${signal}, shutting down...`);
    try {
        console.log("MongoDB connection remains open.");
        process.exit(0);
    } catch (err) {
        console.error("Error during shutdown:", err);
        process.exit(1);
    }
}
process.on("SIGINT", shutdownServer);
process.on("SIGTERM", shutdownServer);

// ===== 启动服务器 =====
async function startServer() {
    try {
        checkEnvVariables();
        console.log("Attempting to connect to MongoDB...");

        mongoClient = await MongoClient.connect(uri);
        db = mongoClient.db(dbName);
        console.log(`✅ Connected to MongoDB: ${dbName}`);

        // ========== 基础接口 ==========
        app.get("/health", async (req, res) => {
            try {
                await db.command({ ping: 1 });
                res.json({ status: "healthy", db: "connected", time: new Date().toISOString() });
            } catch {
                res.status(500).json({ status: "unhealthy" });
            }
        });

        // 菜单接口
        app.get("/api/menu", async (req, res) => {
            try {
                const menu = await db.collection("menu").find().toArray();
                res.json(menu);
            } catch (err) {
                res.status(500).json({ error: "Failed to load menu" });
            }
        });

        app.post("/api/menu", async (req, res) => {
            const { name, category, price, description } = req.body;
            if (!name || !category || !price) return res.status(400).json({ error: "Missing required fields" });
            const item = { name, category, price: parseFloat(price), description: description || "", createdAt: new Date() };
            const result = await db.collection("menu").insertOne(item);
            res.json({ message: "Menu item added", insertedId: result.insertedId });
        });

        app.put("/api/menu/:id", async (req, res) => {
            try {
                const id = req.params.id;

                // 检查 ID 合法性
                if (!ObjectId.isValid(id)) {
                    return res.status(400).json({ error: "Invalid ID format" });
                }

                // 提取要更新的字段
                const { name, category, price, description } = req.body;
                const updateData = {};
                if (name) updateData.name = name;
                if (category) updateData.category = category;
                if (price) updateData.price = parseFloat(price);
                if (description) updateData.description = description;

                // 直接使用全局 db 更新
                const result = await db.collection("menu").updateOne(
                    { _id: new ObjectId(id) },
                    { $set: updateData }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: "Menu item not found" });
                }

                res.json({ message: "✅ Menu item updated successfully" });
            } catch (err) {
                console.error("❌ Update menu error:", err);
                res.status(500).json({ error: "Server error updating menu" });
            }
        });



        app.delete("/api/menu/:id", async (req, res) => {
            const result = await db.collection("menu").deleteOne({ _id: new ObjectId(req.params.id) });
            if (result.deletedCount === 0) return res.status(404).json({ error: "Item not found" });
            res.json({ message: "Menu item deleted" });
        });

        // ====== 订单与预订接口 ======
        app.get("/api/orders", async (req, res) => {
            const orders = await db.collection("orders").find().sort({ createdAt: -1 }).toArray();
            res.json(orders);
        });

        app.post("/api/orders", async (req, res) => {
            const order = { ...req.body, createdAt: new Date(), status: "Pending" };
            const result = await db.collection("orders").insertOne(order);
            res.json(result);
        });

        app.put("/api/orders/:id", async (req, res) => {
            const { status } = req.body;
            await db.collection("orders").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
            res.json({ success: true });
        });

        app.delete("/api/orders/:id", async (req, res) => {
            await db.collection("orders").deleteOne({ _id: new ObjectId(req.params.id) });
            res.json({ success: true });
        });

        app.get("/api/reservations", async (req, res) => {
            const reservations = await db.collection("reservations").find().sort({ createdAt: -1 }).toArray();
            res.json(reservations);
        });

        app.post("/api/reservations", async (req, res) => {
            const reservation = { ...req.body, createdAt: new Date(), status: "Pending" };
            const result = await db.collection("reservations").insertOne(reservation);
            res.json(result);
        });

        app.put("/api/reservations/:id", async (req, res) => {
            const { status } = req.body;
            await db.collection("reservations").updateOne({ _id: new ObjectId(req.params.id) }, { $set: { status } });
            res.json({ success: true });
        });

        app.delete("/api/reservations/:id", async (req, res) => {
            await db.collection("reservations").deleteOne({ _id: new ObjectId(req.params.id) });
            res.json({ success: true });
        });

        // ====== AI Assistant 智能模块 ======
        let userPreferences = {};

        app.get("/api/ai/recommend", (req, res) => {
            const type = req.query.type || "";
            const base = [
                { name: "Grilled Chicken", price: 15.99, reason: "Popular main dish 🍗" },
                { name: "Chocolate Cake", price: 6.0, reason: "Highly rated dessert 🍫" },
                { name: "Caesar Salad", price: 8.99, reason: "Refreshing starter 🥗" },
            ];
            const byType = {
                Main: [{ name: "Lemonade", price: 3.5, reason: "Perfect drink with your main 🍋" }],
                Dessert: [{ name: "Coffee", price: 2.5, reason: "Pairs perfectly with desserts ☕" }],
            };
            res.json(byType[type] || base);
        });

        app.post("/api/ai/learn", (req, res) => {
            const { category } = req.body;
            userPreferences[category] = (userPreferences[category] || 0) + 1;
            res.json({ success: true });
        });

        app.post("/api/ai/chat", (req, res) => {
            const msg = (req.body.message || "").toLowerCase();
            let reply = "";

            if (msg.includes("special")) reply = "Today's specials: Grilled Chicken 🍗 and Lemonade 🍋.";
            else if (msg.includes("vegan")) reply = "Our vegan-friendly options include Caesar Salad and Tomato Soup 🌱.";
            else if (msg.includes("gluten")) reply = "Gluten-free options: Grilled Chicken and Orange Juice 🍊.";
            else if (msg.includes("dessert")) reply = "Try our Chocolate Cake and Apple Pie 🍰!";
            else if (msg.includes("recommend")) {
                const top = Object.entries(userPreferences).sort((a, b) => b[1] - a[1])[0];
                reply = top
                    ? `Since you often choose ${top[0]} dishes, I suggest trying something similar!`
                    : "I recommend our Grilled Chicken and Caesar Salad today!";
            } else {
                reply = "You can ask me about specials, vegan options, gluten-free meals, or recommendations.";
            }
            res.json({ reply });
        });

        console.log("🤖 AI Assistant module loaded successfully!");

        // ===== 默认页 =====
        app.get("/", (req, res) => {
            res.send(`
        <h2>✅ Smart Restaurant API is running!</h2>
        <ul>
          <li><a href="/api/menu">🍕 /api/menu</a></li>
          <li><a href="/api/orders">📦 /api/orders</a></li>
          <li><a href="/api/reservations">📅 /api/reservations</a></li>
          <li><a href="/api/ai/recommend">🤖 /api/ai/recommend</a></li>
        </ul>
      `);
        });

        app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));

        app.listen(port, host, () => {
            console.log(`🚀 Server running on http://${host}:${port}`);
            console.log("✅ API routes loaded:");
            console.log("- GET /api/menu");
            console.log("- GET /api/orders");
            console.log("- GET /api/ai/chat");
            console.log("- GET /api/ai/recommend");
        });

    } catch (err) {
        console.error("❌ Server startup failed:", err);
        if (mongoClient) await mongoClient.close();
        process.exit(1);
    }
}

startServer();
