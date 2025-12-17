
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

// Define the props interface
interface NavbarProps {
  userId: string | null;
}

// Use the props in the component signature
const Navbar = ({ userId }: NavbarProps) => {
  return (
    <nav className="flex items-center justify-between px-8 py-6 absolute top-0 w-full z-50 text-white">
      <Link href="/" className="text-2xl font-bold tracking-wider">
        Skill<span className="text-purple-400">Swap</span>
      </Link>
      
      <ul className="hidden md:flex gap-8 text-sm font-medium text-slate-300">
        <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
        <li><Link href="/#features" className="hover:text-white transition-colors">How It Works</Link></li>
        <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
      </ul>

      <div className="flex items-center gap-4">
        {userId ? (
          <>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Dashboard
              </Button>
            </Link>
            <form action={signOut}>
              <Button type="submit" className="rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700">
                Logout
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                Log In
              </Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 border-0">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;