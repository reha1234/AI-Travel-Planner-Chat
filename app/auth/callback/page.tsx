"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Tunggu sesi auth terupdate
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Redirect ke chat setelah login sukses
          router.push("/chat");
        } else {
          // Jika tidak ada session, redirect ke login
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        router.push("/login");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Verifying your account...
        </h2>
        <p className="text-gray-600">Please wait a moment.</p>
      </div>
    </div>
  );
}
