'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CompanyInfoForm } from "./CompanyInfoForm"
import { BrandKitForm } from "./BrandKitForm"
import { AdaptiveBrandAnalysisForm } from "./AdaptiveBrandAnalysisForm"
import { AnalysisResultsView } from "./AnalysisResultsView"
import { BrandDNAForm } from "./BrandDNAForm"
import { ProductMatrixForm } from "./ProductMatrixForm"
import { TargetAudienceForm } from "./TargetAudienceForm"
import { MarketContextForm } from "./MarketContextForm"
import { CompetitorsForm } from "./CompetitorsForm"
import { MarketingAssetsForm } from "./MarketingAssetsForm"
import { Database } from "@/lib/supabase/types"

type BrandIdentity = Database['public']['Tables']['brand_identity']['Row']

interface BrandIdentityTabsProps {
  initialData: BrandIdentity | null;
}

export function BrandIdentityTabs({ initialData }: BrandIdentityTabsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Column: Forms/Views (2/3) */}
      <div className="lg:col-span-2 overflow-auto pr-2">
        <Tabs defaultValue="results" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 mb-4 h-auto flex-wrap">
            <TabsTrigger value="results" className="bg-primary/5 data-[state=active]:bg-primary/10 text-primary font-medium">✨ Risultati</TabsTrigger>
            <TabsTrigger value="company">Azienda</TabsTrigger>
            <TabsTrigger value="brandkit">Brand Kit</TabsTrigger>
            <TabsTrigger value="dna">DNA</TabsTrigger>
            <TabsTrigger value="product">Prodotto</TabsTrigger>
            <TabsTrigger value="target">Target</TabsTrigger>
            <TabsTrigger value="market">Mercato</TabsTrigger>
            <TabsTrigger value="competitors">Competitor</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>
          
          <TabsContent value="results">
            <AnalysisResultsView organizationId={initialData?.organization_id || ''} />
          </TabsContent>

          <TabsContent value="company">
            <CompanyInfoForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="brandkit">
            <BrandKitForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="dna">
            <BrandDNAForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="product">
            <ProductMatrixForm initialData={initialData} />
          </TabsContent>

          <TabsContent value="target">
            <TargetAudienceForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="market">
            <MarketContextForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="competitors">
            <CompetitorsForm initialData={initialData} />
          </TabsContent>
          
          <TabsContent value="assets">
            <MarketingAssetsForm initialData={initialData} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: AI Analyst (1/3) */}
      <div className="lg:col-span-1 h-full">
        <AdaptiveBrandAnalysisForm initialData={initialData} />
      </div>
    </div>
  )
}
