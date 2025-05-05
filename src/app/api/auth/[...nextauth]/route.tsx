import { handlers } from "@/auth";
export const { GET, POST } = handlers;
export const config = {
  runtime: "nodejs", // ✅ Forces Node.js runtime
};
