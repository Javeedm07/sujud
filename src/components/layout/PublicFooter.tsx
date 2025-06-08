
"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start"> {/* Changed items-center to items-start for overall grid alignment */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-2">
              <Image src="/logo.svg" alt="SUJUD Logo" width={28} height={28} className="text-primary" />
              <span className="text-xl font-bold font-headline text-primary">SUJUD</span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Your personal companion for consistent prayer and spiritual growth.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start"> {/* Changed md:items-center to md:items-start */}
            <h3 className="text-md font-semibold text-foreground mb-2">Quick Links</h3>
            <ul className="space-y-1 text-left"> {/* Changed text-center to text-left */}
              <li><Link href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary">How It Works</Link></li>
              <li><Link href="/signup" className="text-sm text-muted-foreground hover:text-primary">Sign Up</Link></li>
              <li><Link href="/login" className="text-sm text-muted-foreground hover:text-primary">Login</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start"> {/* Changed md:items-end to md:items-start */}
            <h3 className="text-md font-semibold text-foreground mb-2">Legal</h3>
             <ul className="space-y-1 text-left"> {/* Changed text-center md:text-right to text-left */}
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          © {currentYear} SUJUD. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
