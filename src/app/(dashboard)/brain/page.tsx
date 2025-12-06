import { BrandIdentityTabs } from "@/components/modules/strategy/BrandIdentityTabs"

export default function BrainPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">The Brain</h1>
        <p className="text-muted-foreground">Brand Identity & Strategy</p>
      </div>
      
      <BrandIdentityTabs />
    </div>
  )
}
