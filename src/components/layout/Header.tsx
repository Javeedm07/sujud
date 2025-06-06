
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, LogOut, CalendarDays, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

// Inline SVG for Mosque Icon
const InlineMosqueIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 -960 960 960"
    className={className}
    fill="currentColor"
  >
    <path d="M120-120v-480h80v190l280-175 280 175v-190h80v480H120Zm140-20h80v-170l-40-25-40 25v170Zm400 0h80v-170l-40-25-40 25v170ZM480-565 200-740v-100q0-24 18-42t42-18h400q24 0 42 18t18 42v100L480-565Z"/>
  </svg>
);


export default function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();

  const getInitials = (email?: string | null, name?: string | null) => {
    const normalizedName = name?.trim();
    if (normalizedName && normalizedName.toLowerCase() !== "user" && normalizedName !== "") {
      const parts = normalizedName.split(' ');
      if (parts.length > 1 && parts[0] && parts[parts.length - 1]) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      if (parts[0]) {
        return parts[0].substring(0, 2).toUpperCase();
      }
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "U"; 
  };

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/prayer-history", label: "History", icon: CalendarDays },
  ];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/home" className="flex items-center gap-2">
          <InlineMosqueIcon className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-bold text-primary">SUJUD</h1>
        </Link>
        
        <nav className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {user && (
            <>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={cn(
                      "flex items-center gap-1",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon size={18} /> <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  </Button>
                );
              })}
            </>
          )}
          
          {loading ? (
            <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                    <AvatarFallback>{getInitials(user.email, user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center w-full">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

