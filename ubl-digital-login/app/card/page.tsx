import { CardDetailsForm } from "@/components/card-details-form"

type CardPageProps = {
  searchParams: Promise<{ showMobile?: string }>
}

export default async function CardPage({ searchParams }: CardPageProps) {
  const params = await searchParams
  const showMobile = params.showMobile === "true"

  return (
    <main className="flex min-h-screen justify-center bg-background px-6 pt-12 pb-16">
      <CardDetailsForm showMobile={showMobile} />
    </main>
  )
}
