import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const seedDefaultAdmin = async () => {
  try {
    const adminCount = await prisma.aDMIN.count();

    if (adminCount > 0) {
      return;
    }

    console.log("⚠ No admin accounts found. Creating default admin...");
    const defaultAdmin = {
      Admin_name: process.env.DEFAULT_ADMIN_NAME || "System Administrator",
      Admin_email: process.env.DEFAULT_ADMIN_EMAIL || "admin@evoting.com",
      Admin_password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123",
      Admin_phone: process.env.DEFAULT_ADMIN_PHONE || "9999999999",
    };

    const hashedPassword = await  bcrypt.hash(defaultAdmin.Admin_password,12);
    const admin = await prisma.aDMIN.create({
      data: {
        Admin_name: defaultAdmin.Admin_name,
        Admin_email: defaultAdmin.Admin_email,
        Admin_password: hashedPassword,
        Admin_phone: defaultAdmin.Admin_phone,
      },
    });

    console.log("✓ Default admin created successfully!");

    return admin;
  } catch (error) {
    console.error("Error seeding default admin:", error);
    throw error;
  }
};
