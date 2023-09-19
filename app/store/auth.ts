import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";
import { requestLogin } from "../requests";
import {
  requestRegister,
  requestSendEmailCode,
  requestResetPassword,
} from "../requests";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL ?? "https://jwbuwrzmdqukmribxeya.supabase.co",
  process.env.SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3YnV3cnptZHF1a21yaWJ4ZXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUxMDk2MTIsImV4cCI6MjAxMDY4NTYxMn0.-dC6WBTENapwROw-C27qVDOBeK1UPpqTG5XhumqT70g",
);

export interface AuthStore {
  session: any;
  email: string;
  login: (
    email: string,
    password: string,
  ) => Promise<{ msg: string; res: boolean }>;
  logout: () => void;
  sendEmailCode: (email: string) => Promise<any>;
  sendEmailCodeForResetPassword: (email: string) => Promise<any>;
  register: (
    name: string,
    password: string,
    email: string,
  ) => Promise<{ msg: string; res: boolean }>;
  resetPassword: (
    password: string,
    email: string,
    code: string,
  ) => Promise<any>;
  removeToken: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      name: "",
      username: "",
      email: "",
      session: null,

      async login(email, password): Promise<{ msg: string; res: boolean }> {
        const { data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!data.user) return { msg: "Login failed", res: false };
        if (!data.user.email_confirmed_at)
          return { msg: "Email not verified", res: false };
        set(() => ({
          email: data.user.email,
          session: data.session,
        }));
        localStorage.setItem("userId", email);
        return { msg: "Successfully logged in", res: true };
      },
      logout() {
        set(() => ({
          email: "",
          session: null,
        }));
      },
      removeToken() {
        set(() => ({ session: null }));
      },
      async sendEmailCodeForResetPassword(email) {
        let result = await requestSendEmailCode(email, true, {
          onError: (err) => {
            console.error(err);
          },
        });
        return result;
      },
      async sendEmailCode(email) {
        let result = await requestSendEmailCode(email, false, {
          onError: (err) => {
            console.error(err);
          },
        });
        return result;
      },
      async register(
        name,
        email,
        password,
      ): Promise<{ msg: string; res: boolean }> {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });
        if (data.user && !data.session)
          return { msg: "You need to verify your email", res: false };
        else return { msg: "", res: true };
      },
      async resetPassword(password, email, code) {
        let result = await requestResetPassword(password, email, code, {
          onError: (err) => {
            console.error(err);
          },
        });
        //console.log("result", result);
        if (result && result.code == 0 && result.data) {
          const data = result.data;
          const user = data.userEntity;
          set(() => ({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            token: data.token || "",
          }));
        }
        return result;
      },
    }),
    {
      name: StoreKey.Auth,
      version: 1,
    },
  ),
);
