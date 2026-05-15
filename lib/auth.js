import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error("Todos los campos son obligatorios");
        }

        const result = await query(
          `SELECT u.*, r.name_rol
           FROM users u
           JOIN roles r ON u.id_rol = r.id_rol
           WHERE u.login_usr = $1`,
          [credentials.login]
        );

        const user = result.rows[0];
        if (!user) {
          throw new Error("Usuario no encontrado");
        }

        const valid = await bcrypt.compare(credentials.password, user.password_usr);
        if (!valid) {
          throw new Error("Contraseña incorrecta");
        }

        return {
          id: user.id_usr,
          name: user.name_usr,
          login: user.login_usr,
          email: user.email_usr,
          role: user.name_rol,
          roleId: user.id_rol,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.login = user.login;
        token.role = user.role;
        token.roleId = user.roleId;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.login = token.login;
        session.user.role = token.role;
        session.user.roleId = token.roleId;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
