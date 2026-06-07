import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["new_order", "new_contact", "new_user", "order_status", "system"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const notifications = [
    {
      type: "new_order",
      title: "New Order #1042",
      message: "Kofi Annan placed an order — GH₵ 450.00",
      link: "/admin/orders",
      metadata: { orderId: "demo-order-1", totalAmount: 450, email: "kofi@example.com" },
    },
    {
      type: "new_contact",
      title: "New Contact Form Submission",
      message: "Abena Osei (abena@example.com) sent a message: Catering Inquiry",
      link: null,
      metadata: { name: "Abena Osei", email: "abena@example.com", subject: "Catering Inquiry" },
    },
    {
      type: "new_order",
      title: "New Order #1043",
      message: "Yaa Asantewaa placed an order — GH₵ 890.00",
      link: "/admin/orders",
      metadata: { orderId: "demo-order-2", totalAmount: 890, email: "yaa@example.com" },
    },
    {
      type: "system",
      title: "Low Stock Alert",
      message: "Tropical Mix is down to 3 bottles — restock soon",
      link: "/admin",
      metadata: { product: "Tropical Mix", stock: 3 },
    },
    {
      type: "new_user",
      title: "New User Registered",
      message: "Kwame Nkrumah just created an account",
      link: "/admin/users",
      metadata: { userId: "demo-user-1" },
    },
  ];

  await Notification.insertMany(notifications);
  console.log(`Inserted ${notifications.length} notifications`);

  await mongoose.disconnect();
  console.log("Done");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
