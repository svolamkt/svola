import { BrandIdentityTabs } from "@/components/modules/strategy/BrandIdentityTabs"
import { getBrandIdentity } from "@/server/queries/brand-identity"

export default async function BrainPage() {
  const brandIdentity = await getBrandIdentity()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">The Brain</h1>
        <p className="text-muted-foreground">Brand Identity & Strategy</p>
      </div>
      
      <BrandIdentityTabs initialData={brandIdentity} />
    </div>
  )
}
