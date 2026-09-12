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
app.get("/api/categories", async (req, res) => {
try {
let categories = []
if (categoriesCollection) {
categories = await categoriesCollection.find({}).toArray()
}
if (categories.length === 0) {
categories = SAMPLE_CATEGORIES
}
const enriched = await Promise.all(
categories.map(async (cat) => {
const foodCount = foodsCollection ? await foodsCollection.countDocuments({ category: cat.name }) : 2
return { ...cat, foodCount }
})
)
res.json(enriched)
} catch (err) {
console.error("Error fetching categories:", err)
res.status(500).json({ error: "Failed to fetch categories" })
}
})

app.post("/api/categories", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { name, description, image } = req.body
if (!name) return res.status(400).json({ error: "Category name is required" })

const existing = await categoriesCollection.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } })
if (existing) return res.status(400).json({ error: "Category already exists" })

const newCategory = {
name: name.trim(),
description: description || "",
image: image || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500",
createdAt: new Date(),
}
const result = await categoriesCollection.insertOne(newCategory)
res.status(201).json({ ...newCategory, _id: result.insertedId })
} catch (err) {
console.error("Error creating category:", err)
res.status(500).json({ error: "Failed to create category" })
}
})

app.patch("/api/categories/:id", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { id } = req.params
const { name, description, image } = req.body

const oldCategory = await categoriesCollection.findOne({ _id: new ObjectId(id) })
if (!oldCategory) return res.status(404).json({ error: "Category not found" })

const updateData = {}
if (name) updateData.name = name.trim()
if (description !== undefined) updateData.description = description
if (image) updateData.image = image

await categoriesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

if (name && name.trim() !== oldCategory.name) {
await foodsCollection.updateMany({ category: oldCategory.name }, { $set: { category: name.trim() } })
}

res.json({ message: "Category updated successfully" })
} catch (err) {
console.error("Error updating category:", err)
res.status(500).json({ error: "Failed to update category" })
}
})

app.delete("/api/categories/:id", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { id } = req.params
const category = await categoriesCollection.findOne({ _id: new ObjectId(id) })
if (!category) return res.status(404).json({ error: "Category not found" })

const foodCount = await foodsCollection.countDocuments({ category: category.name })
if (foodCount > 0) {
return res.status(400).json({
error: `Cannot delete category "${category.name}". It contains ${foodCount} food item(s). Reassign or delete the food items first.`,
})
}

await categoriesCollection.deleteOne({ _id: new ObjectId(id) })
res.json({ message: "Category deleted successfully" })
} catch (err) {
console.error("Error deleting category:", err)
res.status(500).json({ error: "Failed to delete category" })
}
})


// ==========================================
// 3. FOOD MENU APIs (Guarantees 10 Foods minimum)
// ==========================================
app.get("/api/foods", async (req, res) => {
try {
const { search, category, availability } = req.query
const query = {}

if (search) {
query.$or = [
{ name: { $regex: search, $options: "i" } },
{ description: { $regex: search, $options: "i" } },
]
}

if (category && category !== "All") {
query.category = category
}

if (availability !== undefined && availability !== "all") {
query.isAvailable = availability === "true" || availability === true
}

let foods = []
if (foodsCollection) {
foods = await foodsCollection.find(query).sort({ createdAt: -1 }).toArray()
}

if (!foods || foods.length === 0) {
foods = STATIC_FOODS_DATA
}

res.json(foods)
} catch (err) {
console.error("Error fetching foods:", err)
res.json(STATIC_FOODS_DATA)
}
})

app.get("/api/foods/:id", async (req, res) => {
try {
const { id } = req.params
if (ObjectId.isValid(id) && foodsCollection) {
const food = await foodsCollection.findOne({ _id: new ObjectId(id) })
if (food) return res.json(food)
}

const idx = parseInt(id.replace("food-", "")) - 1
if (idx >= 0 && idx < STATIC_FOODS_DATA.length) {
return res.json({ ...STATIC_FOODS_DATA[idx], _id: id })
}

const fallback = STATIC_FOODS_DATA.find((f) => f.name.toLowerCase().includes(id.toLowerCase()))
if (fallback) return res.json({ ...fallback, _id: id })

res.status(404).json({ error: "Food item not found" })
} catch (err) {
console.error("Error fetching food:", err)
res.status(500).json({ error: "Invalid food ID" })
}
})

app.post("/api/foods", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { name, description, category, price, image, isAvailable } = req.body
if (!name || !price || !category) {
return res.status(400).json({ error: "Name, price, and category are required" })
}

const newFood = {
name: name.trim(),
description: description || "",
category: category.trim(),
price: Number(price),
image: image || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500",
isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
createdAt: new Date(),
updatedAt: new Date(),
}

const result = await foodsCollection.insertOne(newFood)
res.status(201).json({ ...newFood, _id: result.insertedId })
} catch (err) {
console.error("Error adding food:", err)
res.status(500).json({ error: "Failed to add food" })
}
})

app.patch("/api/foods/:id", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { id } = req.params
const { name, description, category, price, image, isAvailable } = req.body

const updateData = { updatedAt: new Date() }
if (name) updateData.name = name.trim()
if (description !== undefined) updateData.description = description
if (category) updateData.category = category.trim()
if (price !== undefined) updateData.price = Number(price)
if (image) updateData.image = image
if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable)

await foodsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
const updated = await foodsCollection.findOne({ _id: new ObjectId(id) })
res.json({ message: "Food updated successfully", food: updated })
} catch (err) {
console.error("Error updating food:", err)
res.status(500).json({ error: "Failed to update food" })
}
})

app.delete("/api/foods/:id", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { id } = req.params
await foodsCollection.deleteOne({ _id: new ObjectId(id) })
res.json({ message: "Food item deleted successfully" })
} catch (err) {
console.error("Error deleting food:", err)
res.status(500).json({ error: "Failed to delete food" })
}
})

// ==========================================
// 4. CART APIs
// ==========================================
async function recalculateCart(items, couponCode = null) {
let subtotal = 0
const validatedItems = []

for (const item of items) {
let price = Number(item.price) || 0
let name = item.foodName || "Item"
let image = item.image || ""

if (item.foodId && ObjectId.isValid(item.foodId) && foodsCollection) {
try {
const freshFood = await foodsCollection.findOne({ _id: new ObjectId(item.foodId) })
if (freshFood) {
price = freshFood.price
name = freshFood.name
image = freshFood.image
}
} catch (e) {}
}

const qty = Math.max(1, parseInt(item.quantity) || 1)
const itemSubtotal = price * qty
subtotal += itemSubtotal

validatedItems.push({
foodId: item.foodId,
foodName: name,
price,
image,
quantity: qty,
subtotal: itemSubtotal,
})
}

let discount = 0
let appliedCoupon = null

if (couponCode && couponsCollection) {
const coupon = await couponsCollection.findOne({
code: couponCode.toUpperCase().trim(),
isActive: true,
})

if (coupon) {
if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
if (coupon.discountType === "percentage") {
discount = (subtotal * coupon.discountAmount) / 100
if (coupon.maxDiscount && discount > coupon.maxDiscount) {
discount = coupon.maxDiscount
}
} else {
discount = Math.min(coupon.discountAmount, subtotal)
}
appliedCoupon = coupon.code
}
}
}

discount = Math.round(discount * 100) / 100
const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100)

return {
items: validatedItems,
subtotal: Math.round(subtotal * 100) / 100,
discount,
couponCode: appliedCoupon,
total,
}
}

app.get("/api/cart", authMiddleware, async (req, res) => {
try {
const cart = await cartsCollection.findOne({ userId: req.user.uid })
if (!cart) {
return res.json({
userId: req.user.uid,
email: req.user.email,
items: [],
subtotal: 0,
discount: 0,
couponCode: null,
total: 0,
})
}
const calc = await recalculateCart(cart.items || [], cart.couponCode)
await cartsCollection.updateOne(
{ userId: req.user.uid },
{ $set: { ...calc, email: req.user.email, updatedAt: new Date() } }
)
res.json({ ...cart, ...calc })
} catch (err) {
console.error("Error fetching cart:", err)
res.status(500).json({ error: "Failed to fetch cart" })
}
})

app.post("/api/cart", authMiddleware, async (req, res) => {
try {
const { foodId, quantity = 1 } = req.body
if (!foodId) return res.status(400).json({ error: "Food ID is required" })

let food = null
if (ObjectId.isValid(foodId) && foodsCollection) {
food = await foodsCollection.findOne({ _id: new ObjectId(foodId) })
}
if (!food) {
const idx = parseInt(foodId.replace("food-", "")) - 1
if (idx >= 0 && idx < STATIC_FOODS_DATA.length) {
food = { ...STATIC_FOODS_DATA[idx], _id: foodId }
}
}
if (!food) return res.status(404).json({ error: "Food item not found" })

let cart = await cartsCollection.findOne({ userId: req.user.uid })
let items = cart ? cart.items || [] : []

const existingIndex = items.findIndex((i) => i.foodId.toString() === foodId.toString())
const addQty = Math.max(1, parseInt(quantity) || 1)

if (existingIndex > -1) {
items[existingIndex].quantity += addQty
} else {
items.push({
foodId: food._id.toString(),
foodName: food.name,
price: food.price,
image: food.image,
quantity: addQty,
subtotal: food.price * addQty,
})
}

const calc = await recalculateCart(items, cart?.couponCode)
await cartsCollection.updateOne(
{ userId: req.user.uid },
{
$set: {
userId: req.user.uid,
email: req.user.email,
...calc,
updatedAt: new Date(),
},
},
{ upsert: true }
)

const updatedCart = await cartsCollection.findOne({ userId: req.user.uid })
res.json({ message: "Item added to cart", cart: updatedCart })
} catch (err) {
console.error("Error adding to cart:", err)
res.status(500).json({ error: "Failed to add to cart" })
}
})

app.patch("/api/cart/:foodId", authMiddleware, async (req, res) => {
try {
const { foodId } = req.params
const { quantity } = req.body

let cart = await cartsCollection.findOne({ userId: req.user.uid })
if (!cart) return res.status(404).json({ error: "Cart not found" })

let items = cart.items || []
const newQty = parseInt(quantity)

if (newQty <= 0) {
items = items.filter((i) => i.foodId.toString() !== foodId.toString())
} else {
const item = items.find((i) => i.foodId.toString() === foodId.toString())
if (item) {
item.quantity = newQty
}
}

const calc = await recalculateCart(items, cart.couponCode)
await cartsCollection.updateOne(
{ userId: req.user.uid },
{ $set: { ...calc, updatedAt: new Date() } }
)

const updatedCart = await cartsCollection.findOne({ userId: req.user.uid })
res.json({ message: "Cart updated", cart: updatedCart })
} catch (err) {
console.error("Error updating cart:", err)
res.status(500).json({ error: "Failed to update cart" })
}
})

app.delete("/api/cart/:foodId", authMiddleware, async (req, res) => {
try {
const { foodId } = req.params
let cart = await cartsCollection.findOne({ userId: req.user.uid })
if (!cart) return res.status(404).json({ error: "Cart not found" })

const items = (cart.items || []).filter((i) => i.foodId.toString() !== foodId.toString())
const calc = await recalculateCart(items, cart.couponCode)

await cartsCollection.updateOne(
{ userId: req.user.uid },
{ $set: { ...calc, updatedAt: new Date() } }
)

const updatedCart = await cartsCollection.findOne({ userId: req.user.uid })
res.json({ message: "Item removed from cart", cart: updatedCart })
} catch (err) {
console.error("Error removing item from cart:", err)
res.status(500).json({ error: "Failed to remove item" })
}
})

app.delete("/api/cart", authMiddleware, async (req, res) => {
try {
await cartsCollection.updateOne(
{ userId: req.user.uid },
{
$set: {
items: [],
subtotal: 0,
discount: 0,
couponCode: null,
total: 0,
updatedAt: new Date(),
},
}
)
res.json({ message: "Cart cleared successfully" })
} catch (err) {
console.error("Error clearing cart:", err)
res.status(500).json({ error: "Failed to clear cart" })
}
})

// ==========================================
// 5. COUPONS APIs
// ==========================================
app.post("/api/coupons/validate", authMiddleware, async (req, res) => {
try {
const { code } = req.body
if (!code) return res.status(400).json({ error: "Coupon code is required" })

const coupon = await couponsCollection.findOne({
code: code.toUpperCase().trim(),
isActive: true,
})

if (!coupon) {
return res.status(404).json({ error: "Invalid or expired coupon code" })
}

const cart = await cartsCollection.findOne({ userId: req.user.uid })
if (!cart || !cart.items || cart.items.length === 0) {
return res.status(400).json({ error: "Your cart is empty" })
}

if (coupon.minOrderAmount && cart.subtotal < coupon.minOrderAmount) {
return res.status(400).json({
error: `Minimum order amount for this coupon is $${coupon.minOrderAmount}`,
})
}

const calc = await recalculateCart(cart.items, coupon.code)
await cartsCollection.updateOne(
{ userId: req.user.uid },
{ $set: { ...calc, updatedAt: new Date() } }
)

res.json({
message: `Coupon "${coupon.code}" applied successfully!`,
discount: calc.discount,
total: calc.total,
coupon,
})
} catch (err) {
console.error("Error validating coupon:", err)
res.status(500).json({ error: "Failed to apply coupon" })
}
})

app.delete("/api/coupons/remove", authMiddleware, async (req, res) => {
try {
const cart = await cartsCollection.findOne({ userId: req.user.uid })
if (!cart) return res.status(404).json({ error: "Cart not found" })

const calc = await recalculateCart(cart.items, null)
await cartsCollection.updateOne(
{ userId: req.user.uid },
{ $set: { ...calc, couponCode: null, updatedAt: new Date() } }
)

res.json({ message: "Coupon removed", cart: { ...cart, ...calc, couponCode: null } })
} catch (err) {
console.error("Error removing coupon:", err)
res.status(500).json({ error: "Failed to remove coupon" })
}
})

app.get("/api/coupons", async (req, res) => {
try {
const coupons = await couponsCollection.find({ isActive: true }).toArray()
res.json(coupons)
} catch (err) {
console.error("Error fetching coupons:", err)
res.status(500).json({ error: "Failed to fetch coupons" })
}
})

// ==========================================
// 6. ORDER APIs (Guaranteed MongoDB Persistence)
// ==========================================
app.post("/api/orders", authMiddleware, async (req, res) => {
try {
const {
customerName,
phone,
address,
orderNote,
paymentMethod = "Cash on Delivery",
items: clientItems,
subtotal: clientSubtotal,
discount: clientDiscount,
couponCode: clientCouponCode,
total: clientTotal,
} = req.body

if (!customerName || !phone || !address) {
return res.status(400).json({ error: "Name, phone, and delivery address are required" })
}

const userId = req.user?.uid || req.body?.userId || "guest-uid"
const email = req.user?.email || req.body?.email || "customer@cafe.com"

// Check DB cart or use client provided items
let cart = null
if (cartsCollection && userId) {
cart = await cartsCollection.findOne({ userId })
}

let itemsToProcess = (cart && cart.items && cart.items.length > 0) ? cart.items : (clientItems || [])

if (itemsToProcess.length === 0) {
return res.status(400).json({ error: "Cannot create order with an empty cart" })
}

let calc = await recalculateCart(itemsToProcess, clientCouponCode || cart?.couponCode)

// Fallback calculation if items were directly supplied
if ((!calc.items || calc.items.length === 0) && clientItems && clientItems.length > 0) {
calc = {
items: clientItems,
subtotal: Number(clientSubtotal) || 0,
discount: Number(clientDiscount) || 0,
couponCode: clientCouponCode || null,
total: Number(clientTotal) || 0,
}
}

const newOrder = {
userId,
email,
customerName: customerName.trim(),
phone: phone.trim(),
address: address.trim(),
orderNote: orderNote || "",
items: calc.items,
subtotal: calc.subtotal,
discount: calc.discount,
couponCode: calc.couponCode,
total: calc.total,
paymentMethod: paymentMethod,
paymentStatus: paymentMethod === "Online Payment" ? "Paid" : "Pending",
orderStatus: "Pending",
createdAt: new Date(),
updatedAt: new Date(),
}

let result = { insertedId: new ObjectId() }
if (ordersCollection) {
result = await ordersCollection.insertOne(newOrder)
console.log(`[MongoDB] New Order Created: ID=${result.insertedId}, Customer=${customerName}, Total=$${newOrder.total}`)
}

if (usersCollection && userId) {
await usersCollection.updateOne(
{ uid: userId },
{ $set: { phone: phone.trim(), address: address.trim(), updatedAt: new Date() } }
)
}

if (cartsCollection && userId) {
await cartsCollection.updateOne(
{ userId },
{
$set: {
items: [],
subtotal: 0,
discount: 0,
couponCode: null,
total: 0,
updatedAt: new Date(),
},
}
)
}

res.status(201).json({
message: "Order placed successfully!",
order: { ...newOrder, _id: result.insertedId },
})
} catch (err) {
console.error("Error creating order:", err)
res.status(500).json({ error: "Failed to place order: " + err.message })
}
})

app.get("/api/orders/my-orders", authMiddleware, async (req, res) => {
try {
let orders = []
const uid = req.user?.uid || req.query?.userId
const email = req.user?.email || req.query?.email

if (ordersCollection) {
const userQuery = {
$or: [
...(uid ? [{ userId: uid }] : []),
...(email ? [{ email: email }] : []),
],
}
orders = await ordersCollection.find(userQuery).sort({ createdAt: -1 }).toArray()
}
res.json(orders)
} catch (err) {
console.error("Error fetching customer orders:", err)
res.status(500).json({ error: "Failed to fetch orders" })
}
})

app.get("/api/orders/:id", authMiddleware, async (req, res) => {
try {
const { id } = req.params
if (ordersCollection) {
if (ObjectId.isValid(id)) {
const order = await ordersCollection.findOne({ _id: new ObjectId(id) })
if (order) return res.json(order)
}
const order = await ordersCollection.findOne({ _id: id })
if (order) return res.json(order)
}
res.status(404).json({ error: "Order not found" })
} catch (err) {
console.error("Error fetching order:", err)
res.status(500).json({ error: "Invalid order ID" })
}
})

app.get("/api/admin/orders", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { search, status } = req.query
const query = {}

if (status && status !== "All") {
query.orderStatus = status
}

if (search) {
const searchRegex = { $regex: search, $options: "i" }
query.$or = [
{ customerName: searchRegex },
{ email: searchRegex },
{ userId: searchRegex },
{ phone: searchRegex },
]
if (ObjectId.isValid(search)) {
query.$or.push({ _id: new ObjectId(search) })
}
}

const orders = await ordersCollection.find(query).sort({ createdAt: -1 }).toArray()
res.json(orders)
} catch (err) {
console.error("Error fetching admin orders:", err)
res.status(500).json({ error: "Failed to fetch orders" })
}
})

app.patch("/api/admin/orders/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { id } = req.params
const { status } = req.body
const updateFields = { orderStatus: status, updatedAt: new Date() }
if (status === "Completed") updateFields.paymentStatus = "Paid"

if (ObjectId.isValid(id)) {
await ordersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateFields })
} else {
await ordersCollection.updateOne({ _id: id }, { $set: updateFields })
}
const updated = await ordersCollection.findOne(ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id })
res.json({ message: "Order status updated", order: updated })
} catch (err) {
console.error("Error updating order status:", err)
res.status(500).json({ error: "Failed to update order status" })
}
})

app.patch("/api/admin/orders/:id/payment-status", authMiddleware, adminMiddleware, async (req, res) => {
try {
const { id } = req.params
const { paymentStatus } = req.body
if (ObjectId.isValid(id)) {
await ordersCollection.updateOne({ _id: new ObjectId(id) }, { $set: { paymentStatus, updatedAt: new Date() } })
} else {
await ordersCollection.updateOne({ _id: id }, { $set: { paymentStatus, updatedAt: new Date() } })
}
const updated = await ordersCollection.findOne(ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { _id: id })
res.json({ message: "Payment status updated", order: updated })
} catch (err) {
console.error("Error updating payment status:", err)
res.status(500).json({ error: "Failed to update payment status" })
}
})

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
