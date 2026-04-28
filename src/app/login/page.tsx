"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  function handleLogin() {
    setError("");
    startTransition(async () => {
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  function handleSignup() {
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to create account");
          return;
        }

        const loginRes = await signIn("credentials", {
          email: form.email,
          password: form.password,
          redirect: false,
        });

        if (loginRes?.error) {
          setSuccess("Account created! Please sign in.");
          setTab("login");
          return;
        }

        router.push("/");
        router.refresh();
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div
      className="relative flex justify-center items-center w-full min-h-screen overflow-hidden"
      style={{ background: "#eef2ff" }}
    >
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "-15%",
            left: "-10%",
            width: "60%",
            height: "65%",
            background:
              "radial-gradient(ellipse, #3b5bdb55 0%, #4263eb30 40%, transparent 70%)",
            filter: "blur(56px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-15%",
            right: "-8%",
            width: "58%",
            height: "60%",
            background:
              "radial-gradient(ellipse, #3451d135 0%, #2f44c830 40%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "30%",
            left: "50%",
            width: "40%",
            height: "40%",
            background:
              "radial-gradient(ellipse, #748ffc20 0%, transparent 65%)",
            filter: "blur(44px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "5%",
            right: "5%",
            width: "30%",
            height: "35%",
            background:
              "radial-gradient(ellipse, #a5b4fc25 0%, transparent 70%)",
            filter: "blur(36px)",
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #3b5bdb1a 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Card */}
      <div
        className="z-10 relative mx-4 w-full overflow-hidden"
        style={{
          maxWidth: 520,
          borderRadius: 28,
          background: "rgba(255,255,255,0.65)",
          border: "1px solid rgba(255,255,255,0.92)",
          backdropFilter: "blur(36px)",
          WebkitBackdropFilter: "blur(36px)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.98) inset, 0 24px 64px rgba(59,91,219,0.14), 0 8px 24px rgba(59,91,219,0.08)",
        }}
      >
        {/* Card header band */}
        <div
          style={{
            padding: "32px 44px 28px",
            borderBottom: "1px solid rgba(59,91,219,0.09)",
            background:
              "linear-gradient(160deg, rgba(224,231,255,0.65) 0%, rgba(255,255,255,0.2) 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Logo box */}
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                flexShrink: 0,
                background: "linear-gradient(145deg, #ffffff 0%, #e8eeff 100%)",
                border: "1px solid rgba(59,91,219,0.2)",
                boxShadow:
                  "0 4px 16px rgba(59,91,219,0.16), 0 1px 0 rgba(255,255,255,1) inset",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* <Image
                src="/next.svg"
                alt="Anthrovoice"
                width={16}
                height={16}
                style={{ objectFit: "contain" }}
              /> */}
            </div>

            {/* Brand text */}
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1a2b6b",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                CA FileTrack
              </p>
              <p
                style={{
                  margin: "3px 0 0",
                  fontSize: 13,
                  color: "#6b80c9",
                  fontWeight: 400,
                }}
              >
                Multi-Tenant Firm Management
              </p>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div style={{ padding: "32px 44px 36px" }}>
          {/* Heading */}
          <div style={{ marginBottom: 22 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                color: "#1a2b6b",
                letterSpacing: "-0.025em",
              }}
            >
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#7b8dc4" }}>
              {tab === "login"
                ? "Sign in to your account to continue"
                : "Get started with CA FileTrack today"}
            </p>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              background: "rgba(59,91,219,0.07)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
            }}
          >
            {(["login", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setError("");
                  setSuccess("");
                }}
                style={{
                  flex: 1,
                  padding: "7px 0",
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13.5,
                  fontWeight: 600,
                  transition: "all 0.15s",
                  background:
                    tab === t ? "rgba(255,255,255,0.9)" : "transparent",
                  color: tab === t ? "#1a2b6b" : "#8da0d4",
                  boxShadow:
                    tab === t ? "0 1px 4px rgba(59,91,219,0.12)" : "none",
                }}
              >
                {t === "login" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#4a63b3",
                }}
              >
                Email address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (tab === "login" ? handleLogin() : handleSignup())
                }
                required
                disabled={isPending}
                autoComplete="email"
                className="rounded-xl h-12 transition-all"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(59,91,219,0.2)",
                  color: "#1a2b6b",
                  fontSize: 14,
                  boxShadow: "0 1px 4px rgba(59,91,219,0.06) inset",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#4a63b3",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && tab === "login" && handleLogin()
                  }
                  required
                  disabled={isPending}
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  className="rounded-xl h-12 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.8)",
                    border: "1px solid rgba(59,91,219,0.2)",
                    color: "#1a2b6b",
                    fontSize: 14,
                    paddingRight: 44,
                    boxShadow: "0 1px 4px rgba(59,91,219,0.06) inset",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    color: "#8da0d4",
                    display: "flex",
                    alignItems: "center",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: 16, height: 16 }} />
                  ) : (
                    <Eye style={{ width: 16, height: 16 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (signup only) */}
            {tab === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "#4a63b3",
                  }}
                >
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                    required
                    disabled={isPending}
                    autoComplete="new-password"
                    className="rounded-xl h-12 transition-all"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(59,91,219,0.2)",
                      color: "#1a2b6b",
                      fontSize: 14,
                      paddingRight: 44,
                      boxShadow: "0 1px 4px rgba(59,91,219,0.06) inset",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isPending}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#8da0d4",
                      display: "flex",
                      alignItems: "center",
                    }}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff style={{ width: 16, height: 16 }} />
                    ) : (
                      <Eye style={{ width: 16, height: 16 }} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error / Success messages */}
            {error && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#d84040",
                  fontWeight: 500,
                }}
              >
                {error}
              </p>
            )}
            {success && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#2a7d4f",
                  fontWeight: 500,
                }}
              >
                {success}
              </p>
            )}

            {/* Submit */}
            <div style={{ marginTop: 4 }}>
              <Button
                onClick={tab === "login" ? handleLogin : handleSignup}
                disabled={
                  isPending ||
                  !form.email ||
                  !form.password ||
                  (tab === "signup" && !form.confirmPassword)
                }
                className="hover:opacity-90 border-0 w-full text-white active:scale-[0.99] transition-all duration-200"
                style={{
                  height: 48,
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  background: isPending
                    ? "#748ffc"
                    : "linear-gradient(135deg, #4263eb 0%, #3451d1 60%, #2f44c8 100%)",
                  boxShadow: isPending
                    ? "none"
                    : "0 6px 24px rgba(59,91,219,0.42), 0 1px 0 rgba(255,255,255,0.2) inset",
                }}
              >
                {isPending ? (
                  <span className="flex justify-center items-center gap-2">
                    <Loader2
                      style={{ width: 16, height: 16 }}
                      className="animate-spin"
                    />
                    {tab === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : tab === "login" ? (
                  "Sign in"
                ) : (
                  "Create account"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
