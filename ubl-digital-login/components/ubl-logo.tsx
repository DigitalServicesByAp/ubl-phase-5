import Image from "next/image"

export function UblLogo() {
  return (
    <Image
      src="/ubl-digital-logo.png"
      alt="UBL digital"
      width={84}
      height={84}
      priority
      className="h-[84px] w-[84px] rounded-2xl object-contain"
    />
  )
}
