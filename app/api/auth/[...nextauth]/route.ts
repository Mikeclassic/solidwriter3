import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// We cast to 'any' to resolve the type conflict caused by the custom declaration file
const handler = (NextAuth as any)(authOptions);

export { handler as GET, handler as POST };
