import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Target, BrainCircuit, Settings } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-64 bg-background border-r p-6 flex flex-col h-full">
      <div className="font-bold text-2xl mb-10 flex items-center gap-2">
        <span className="bg-primary text-primary-foreground p-1 rounded">NX</span>
        Nexus AI
      </div>
      
      <nav className="space-y-2 flex-1">
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/feed">
            <LayoutDashboard className="h-4 w-4" />
            The Feed
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/hunter">
            <Target className="h-4 w-4" />
            The Hunter
          </Link>
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/brain">
            <BrainCircuit className="h-4 w-4" />
            The Brain
          </Link>
        </Button>
      </nav>

      <div className="border-t pt-4">
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </aside>
  );
}

