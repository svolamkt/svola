import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { redirect } from 'next/navigation';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <header className="h-16 border-b px-6 flex items-center justify-between bg-background">
      <h1 className="font-semibold text-lg">Dashboard</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <form action={signOut}>
            <Button variant="outline" size="sm">Sign Out</Button>
        </form>
      </div>
    </header>
  );
}

