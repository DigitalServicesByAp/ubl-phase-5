"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { UblLogo } from "@/components/ubl-logo"

export function SignInForm() {
  const router = useRouter()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")

  function handleMobile(value: string) {
    setMobile(value.replace(/\D/g, ""))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (username.trim() && password && mobile.length > 0) {
      router.push("/card")
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 pb-10 pt-12 text-foreground sm:px-10 sm:pt-16">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-10 sm:mb-14">
          <UblLogo />
        </div>

        <header className="mb-8 sm:mb-10">
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Hi there
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">Sign in to continue</p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Username"
            aria-label="Username"
            className="h-14 w-full rounded-full border-0 bg-card px-6 text-base text-foreground outline-none placeholder:text-muted-foreground/75 focus:ring-2 focus:ring-ring/50 sm:h-16 sm:text-lg"
          />

          <div className="relative">
            <input
              type={passwordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              aria-label="Password"
              className="h-14 w-full rounded-full border-0 bg-card px-6 pr-14 text-base text-foreground outline-none placeholder:text-muted-foreground/75 focus:ring-2 focus:ring-ring/50 sm:h-16 sm:text-lg"
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((visible) => !visible)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {passwordVisible ? <Eye size={20} strokeWidth={1.8} /> : <EyeOff size={20} strokeWidth={1.8} />}
            </button>
          </div>

          <input
            type="tel"
            inputMode="numeric"
            required
            value={mobile}
            onChange={(event) => handleMobile(event.target.value)}
            placeholder="Mobile Number (03XXXXXXXXX)"
            aria-label="Mobile Number"
            className="h-14 w-full rounded-full border-0 bg-card px-6 text-sm text-foreground outline-none placeholder:text-muted-foreground/75 focus:ring-2 focus:ring-ring/50 sm:h-16 sm:text-base"
          />

          <div className="flex items-center justify-between px-2 pt-2 text-sm font-semibold sm:text-base">
            <button type="button" onClick={() => router.push("/card?showMobile=true")} className="text-accent hover:underline">
              Sign Up
            </button>
            <button type="button" onClick={() => router.push("/card?showMobile=true")} className="text-foreground hover:underline">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="mt-2 h-14 w-full rounded-full bg-primary text-base font-bold text-primary-foreground transition-opacity hover:opacity-95 sm:h-16 sm:text-lg"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  )
}

export default SignInForm

