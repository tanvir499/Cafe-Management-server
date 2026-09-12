require("dotenv").config()
const express = require("express")
const cors = require("cors")
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")

const app = express()
app.use(cors())
app.use(express.json())

const uri = process.env.MONGO_URI

if (!uri) {
  console.error("MONGO_URI is not defined in .env")
  process.exit(1)
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
})

// Database & Collections
let db
let usersCollection
let foodsCollection
let categoriesCollection
let cartsCollection
let ordersCollection
let couponsCollection
let reservationsCollection
let ingredientsCollection
let suppliersCollection

const STATIC_FOODS_DATA = [
  {
    name: "Caramel Velvet Macchiato",
    description: "Rich espresso layered with steamed milk and drizzled with artisan salted caramel.",
    category: "Coffee & Espresso",
    price: 5.5,
    image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Classic Ethiopian Pour-Over",
    description: "Single-origin floral and berry notes with a crisp, clean citrus finish.",
    category: "Coffee & Espresso",
    price: 4.75,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Vanilla Bean Flat White",
    description: "Double ristretto shot with microfoam milk infused with organic Madagascar vanilla.",
    category: "Coffee & Espresso",
    price: 5.25,
    image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Artisan Almond Croissant",
    description: "Flaky, buttery French croissant filled with sweet almond frangipane cream and toasted sliced almonds.",
    category: "Pastries & Bakery",
    price: 4.5,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Wild Blueberry Scone",
    description: "Traditional crumbly scone baked with wild Maine blueberries, served with clotted cream.",
    category: "Pastries & Bakery",
    price: 3.95,
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Avocado & Smoked Salmon Toast",
    description: "Toasted sourdough with crushed Hass avocado, wild smoked salmon, capers, and poached egg.",
    category: "Gourmet Sandwiches",
    price: 12.5,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Tuscan Grilled Chicken Panini",
    description: "Herb-marinated chicken breast, sun-dried tomatoes, melted provolone, and pesto on ciabatta.",
    category: "Gourmet Sandwiches",
    price: 11.75,
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Molten Chocolate Lava Cake",
    description: "Warm dark chocolate cake with a molten center, served with Madagascan vanilla bean gelato.",
    category: "Desserts & Sweets",
    price: 8.5,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "New York Berry Cheesecake",
    description: "Velvety smooth baked cream cheese over a graham cracker crust with raspberry coulis.",
    category: "Desserts & Sweets",
    price: 7.95,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Ceremonial Iced Matcha Latte",
    description: "Uji ceremonial grade Japanese green tea whisked with creamy oat milk and blossom honey.",
    category: "Specialty Beverages",
    price: 6.0,
    image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600",
    isAvailable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const SAMPLE_CATEGORIES = [
  {
    name: "Coffee & Espresso",
    description: "Artisanal espresso, lattes, and specialty brews crafted with fresh roasted beans.",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
    createdAt: new Date(),
  },
  {
    name: "Pastries & Bakery",
    description: "Freshly baked croissants, muffins, artisanal bread and sweet indulgences.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
    createdAt: new Date(),
  },
  {
    name: "Gourmet Sandwiches",
    description: "Toasted paninis, artisan sandwiches, and savory breakfast wraps.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500",
    createdAt: new Date(),
  },
  {
    name: "Desserts & Sweets",
    description: "Handcrafted cakes, tarts, cheesecakes and gelato desserts.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
    createdAt: new Date(),
  },
  {
    name: "Specialty Beverages",
    description: "Organic iced teas, smoothies, matcha lattes and seasonal refreshments.",
    image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500",
    createdAt: new Date(),
  },
]

async function autoSeedDatabase() {
  try {
    for (const cat of SAMPLE_CATEGORIES) {
      await categoriesCollection.updateOne({ name: cat.name }, { $setOnInsert: cat }, { upsert: true })
    }
    for (const food of STATIC_FOODS_DATA) {
      await foodsCollection.updateOne({ name: food.name }, { $setOnInsert: food }, { upsert: true })
    }
    console.log("Auto-seeded 10 Static Foods and Categories to MongoDB!")
  } catch (err) {
    console.error("Auto-seed error:", err.message)
  }
}

async function connectDB() {
  try {
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    console.log("Connected to MongoDB successfully!")
    db = client.db("cafe-management")
    
    usersCollection = db.collection("users")
    foodsCollection = db.collection("foods")
    categoriesCollection = db.collection("categories")
    cartsCollection = db.collection("carts")
    ordersCollection = db.collection("orders")
    couponsCollection = db.collection("coupons")
    reservationsCollection = db.collection("reservations")
    ingredientsCollection = db.collection("ingredients")
    suppliersCollection = db.collection("suppliers")

    try {
      await usersCollection.createIndex({ uid: 1 }, { unique: true })
      await cartsCollection.createIndex({ userId: 1 }, { unique: true })
      await ordersCollection.createIndex({ userId: 1 })
      await reservationsCollection.createIndex({ userId: 1 })
      await couponsCollection.createIndex({ code: 1 }, { unique: true })
    } catch (idxErr) {
      console.warn("Index creation warning:", idxErr.message)
    }

    await autoSeedDatabase()
  } catch (err) {
    console.error("MongoDB connection failed:", err.message)
  }
}

connectDB()

// ==========================================
// AUTH HELPER / MIDDLEWARE
// ==========================================
function getRequestUser(req) {
  const uid =
    req.headers["x-user-uid"] ||
    req.body?.userId ||
    req.body?.uid ||
    req.query?.userId ||
    req.query?.uid ||
    "guest-uid"

  const email =
    req.headers["x-user-email"] ||
    req.body?.email ||
    req.query?.email ||
    "customer@cafe.com"

  return { uid, email }
}

async function authMiddleware(req, res, next) {
  try {
    const { uid, email } = getRequestUser(req)

    let user = null
    if (usersCollection) {
      user = await usersCollection.findOne({ uid })
      if (!user) {
        user = {
          uid,
          email,
          role: "customer",
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await usersCollection.updateOne({ uid }, { $setOnInsert: user }, { upsert: true })
      }
    } else {
      user = { uid, email, role: "customer" }
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    req.user = getRequestUser(req)
    next()
  }
}

async function adminMiddleware(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next()
  }
  // Allow if admin header or fallback
  const isDevAdmin = req.headers["x-user-role"] === "admin"
  if (isDevAdmin) return next()

  if (usersCollection && req.user?.uid) {
    const u = await usersCollection.findOne({ uid: req.user.uid })
    if (u?.role === "admin") return next()
  }

  return res.status(403).json({ error: "Forbidden: Admin access required" })
}

// ==========================================
// 1. USER & PROFILE APIs
// ==========================================
app.post("/api/users", async (req, res) => {
  if (!usersCollection) return res.status(503).json({ error: "Database not ready" })
  const { uid, name, email, photoURL, provider, role } = req.body

  if (!uid || !email) {
    return res.status(400).json({ error: "uid and email are required" })
  }

  try {
    const existing = await usersCollection.findOne({ uid })
    let assignedRole = existing?.role || role || "customer"
    if (!existing && (await usersCollection.countDocuments()) === 0) {
      assignedRole = "admin"
    }

    await usersCollection.updateOne(
      { uid },
      {
        $set: {
          name: name || existing?.name || "",
          email,
          photoURL: photoURL || existing?.photoURL || "",
          provider: provider || existing?.provider || "email",
          role: assignedRole,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          phone: "",
          address: "",
        },
      },
      { upsert: true }
    )

    const updatedUser = await usersCollection.findOne({ uid })
    res.status(200).json({ message: "User synced successfully", user: updatedUser })
  } catch (err) {
    console.error("Error saving user:", err)
    res.status(500).json({ error: "Failed to save user" })
  }
})

app.get("/api/users/me", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid
    const email = req.user.email

    let user = null
    if (usersCollection) {
      user = await usersCollection.findOne({ uid })
      if (!user && email) {
        user = await usersCollection.findOne({ email })
      }
    }
    if (!user) return res.status(404).json({ error: "User not found" })

    const userQuery = {
      $or: [
        ...(uid ? [{ userId: uid }] : []),
        ...(email ? [{ email }] : []),
      ],
    }

    const totalOrders = ordersCollection ? await ordersCollection.countDocuments(userQuery) : 0
    const totalReservations = reservationsCollection ? await reservationsCollection.countDocuments(userQuery) : 0
    const cart = cartsCollection ? await cartsCollection.findOne({ userId: uid }) : null
    const cartCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

    res.json({
      ...user,
      stats: {
        totalOrders,
        totalReservations,
        cartCount,
      },
    })
  } catch (err) {
    console.error("Error getting user profile:", err)
    res.status(500).json({ error: "Internal server error" })
  }
})

app.patch("/api/users/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, photoURL } = req.body
    const updateData = { updatedAt: new Date() }
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address
    if (photoURL !== undefined) updateData.photoURL = photoURL

    await usersCollection.updateOne({ uid: req.user.uid }, { $set: updateData })
    const updated = await usersCollection.findOne({ uid: req.user.uid })
    res.json({ message: "Profile updated successfully", user: updated })
  } catch (err) {
    console.error("Error updating profile:", err)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

app.post("/api/users/make-admin", authMiddleware, async (req, res) => {
  try {
    const { targetEmail } = req.body
    const emailToPromote = targetEmail || req.user.email
    await usersCollection.updateOne({ email: emailToPromote }, { $set: { role: "admin", updatedAt: new Date() } })
    res.json({ message: `User ${emailToPromote} is now an Admin!` })
  } catch (err) {
    console.error("Error making admin:", err)
    res.status(500).json({ error: "Failed to update role" })
  }
})

app.get("/api/admin/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await usersCollection.find({}).sort({ createdAt: -1 }).toArray()
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const userOrders = await ordersCollection.find({ userId: u.uid }).toArray()
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        return {
          ...u,
          totalOrders: userOrders.length,
          totalSpent,
          recentOrders: userOrders.slice(0, 3),
        }
      })
    )
    res.json(enrichedUsers)
  } catch (err) {
    console.error("Error fetching admin users:", err)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// ==========================================
// 2. CATEGORIES APIs


// ==========================================
// 6. ORDER APIs (Guaranteed MongoDB Persistence)


// ==========================================
// 11. SEED DATA API
// ==========================================
app.post("/api/seed", async (req, res) => {
  try {
    for (const cat of SAMPLE_CATEGORIES) {
      await categoriesCollection.updateOne({ name: cat.name }, { $setOnInsert: cat }, { upsert: true })
    }

    for (const food of STATIC_FOODS_DATA) {
      await foodsCollection.updateOne({ name: food.name }, { $setOnInsert: food }, { upsert: true })
    }

    res.json({ message: "Seed database successfully populated with rich Cafe sample data!" })
  } catch (err) {
    console.error("Error seeding DB:", err)
    res.status(500).json({ error: "Failed to seed database" })
  }
})

// Health check
app.get("/", (req, res) => res.json({ status: "Cafe Management System Server is running" }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
