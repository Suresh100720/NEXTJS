import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { authConfig } from "./auth.config";
import { z } from "zod";

const FIREBASE_API_KEY = "AIzaSyBHlg15tbsqHUQpKqyI2IxanAbNoo40dso";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-google-client-secret",
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || "mock-github-client-id",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "mock-github-client-secret",
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log("❌ Zod validation failed for credentials");
          return null;
        }

        const { email, password } = parsedCredentials.data;

        try {
          // Authenticate with Firebase REST API
          const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("❌ Firebase authentication failed:", data.error?.message);
            throw new Error(data.error?.message || "Invalid credentials.");
          }

          console.log("✅ Firebase auth successful for:", data.email);

          return {
            id: data.localId,
            email: data.email,
            name: data.displayName || data.email.split("@")[0],
          };
        } catch (error) {
          console.error("❌ Auth error in authorize:", error);
          return null;
        }
      },
    }),
  ],
});
