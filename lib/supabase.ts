import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validasi environment variables (hanya di server-side)
if (typeof window === "undefined") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing Supabase environment variables");
  }
}

// Fallback values untuk development
const isDevelopment = process.env.NODE_ENV === "development";
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "placeholder-anon-key";

// Gunakan environment variables atau fallback
const url = supabaseUrl || (isDevelopment ? fallbackUrl : "");
const key = supabaseAnonKey || (isDevelopment ? fallbackKey : "");

// Validasi sebelum membuat client
if (!url || !key) {
  console.error("Missing Supabase URL or Anon Key:", {
    url: !!url,
    key: !!key,
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    envKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  // Untuk development, buat client placeholder dengan warning
  if (isDevelopment) {
    console.warn("Using placeholder Supabase client for development");
  } else {
    throw new Error("Supabase credentials are required");
  }
}

// Create Supabase client
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "x-application-name": "travel-ai-planner",
    },
  },
});

// Admin client untuk server-side (hanya jika ada service key)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Helper untuk mendapatkan session dengan error handling
export async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session:", error);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Unexpected error in getSession:", error);
    return null;
  }
}

// Helper untuk mendapatkan current user dengan error handling
export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Helper untuk mendapatkan user profile dengan error handling
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getUserProfile:", error);
    return null;
  }
}

// Helper untuk sign in dengan Google dengan error handling
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google sign in error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in signInWithGoogle:", error);
    throw error;
  }
}

// Helper untuk sign out dengan error handling
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Unexpected error in signOut:", error);
    throw error;
  }
}

// Helper untuk sign up dengan email/password dengan error handling
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Sign up error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in signUpWithEmail:", error);
    throw error;
  }
}

// Helper untuk sign in dengan email/password dengan error handling
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in signInWithEmail:", error);
    throw error;
  }
}

// Helper untuk reset password dengan error handling
export async function resetPassword(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error("Reset password error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in resetPassword:", error);
    throw error;
  }
}

// Helper untuk update profile dengan error handling
export async function updateProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) {
      console.error("Update profile error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in updateProfile:", error);
    throw error;
  }
}

// Helper untuk check if Supabase is initialized
export function isSupabaseInitialized() {
  return !!url && !!key;
}
