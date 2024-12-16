// lib/adminAuth.ts
import { kv } from "@vercel/kv";

export interface Admin {
  id: string;
  name: string;
  accessCode: string;
  role: "admin" | "super_admin";
  createdAt: number;
}

const ADMIN_PREFIX = "meme:admin:";
const ADMIN_CODE_PREFIX = "meme:admin_code:";

export const adminAuth = {
  async createAdmin(
    name: string,
    role: Admin["role"] = "admin"
  ): Promise<Admin> {
    const id = crypto.randomUUID();
    const accessCode = generateAdminCode();

    const admin: Admin = {
      id,
      name,
      accessCode,
      role,
      createdAt: Date.now(),
    };

    // Store admin data
    await kv.set(`${ADMIN_PREFIX}${id}`, admin);
    // Store access code mapping
    await kv.set(`${ADMIN_CODE_PREFIX}${accessCode}`, id);
    // Add to admin set
    await kv.sadd("meme:admins", id);

    return admin;
  },

  async verifyAdmin(accessCode: string): Promise<Admin | null> {
    const adminId = await kv.get(`${ADMIN_CODE_PREFIX}${accessCode}`);
    if (!adminId) return null;
    return kv.get(`${ADMIN_PREFIX}${adminId}`);
  },

  async getAllAdmins(): Promise<Admin[]> {
    const adminIds = await kv.smembers("meme:admins");
    const admins = await Promise.all(
      adminIds.map((id) => kv.get(`${ADMIN_PREFIX}${id}`))
    );
    return admins.filter(Boolean) as Admin[];
  },

  async removeAdmin(id: string): Promise<boolean> {
    const admin = (await kv.get(`${ADMIN_PREFIX}${id}`)) as Admin;
    if (!admin) return false;

    await kv.del(`${ADMIN_PREFIX}${id}`);
    await kv.del(`${ADMIN_CODE_PREFIX}${admin.accessCode}`);
    await kv.srem("meme:admins", id);

    return true;
  },
};

function generateAdminCode(): string {
  // Generate a longer, more complex code for admins
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `ADMIN-${code}`;
}
