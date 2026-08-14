import { OtpForm } from "@/components/otp-form"

export default function OtpPage() {
  return (
    <main className="flex h-dvh justify-center overflow-hidden bg-background px-6 pt-12 pb-10">
      <OtpForm nextHref="/balance" />
    </main>
  )
}
