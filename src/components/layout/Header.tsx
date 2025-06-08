
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, LogOut, UserCircle, Wand2, CalendarDays, Menu, BookOpenCheck } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

export default function Header() {
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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
    { href: "/verse-suggestion", label: "Verse Suggestion", icon: Wand2 },
    { href: "/salah-tips", label: "Salah Tips", icon: BookOpenCheck },
  ];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/home" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
          <Image src="/logo.svg" alt="SUJUD Logo" width={32} height={32} />
          <h1 className="text-2xl font-headline font-bold text-primary">SUJUD</h1>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2">
          {user ? (
            <>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] flex flex-col p-0">
                  <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
                  <div className="p-4 border-b border-border">
                    <Link href="/home" className="flex items-center gap-2" onClick={() => setIsSheetOpen(false)}>
                      <Image src="/logo.svg" alt="SUJUD Logo" width={28} height={28} />
                      <span className="text-xl font-bold font-headline text-primary">SUJUD</span>
                    </Link>
                  </div>

                  <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Button
                          key={item.label}
                          variant={isActive ? "secondary" : "ghost"}
                          asChild
                          className={cn(
                            "w-full justify-start text-base py-2.5 px-3",
                            isActive ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-primary/10 hover:text-primary"
                          )}
                          onClick={() => setIsSheetOpen(false)}
                        >
                          <Link href={item.href} className="flex items-center gap-3">
                            <item.icon size={20} />
                            <span>{item.label}</span>
                          </Link>
                        </Button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              {loading ? (
                 <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={undefined} alt={user.displayName || user.email || "User"} />
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
                    <DropdownMenuItem onClick={() => { signOut(); setIsSheetOpen(false); }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          ) : (
            <>
              {!loading && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild className="bg-gradient-to-br from-[#01A6F6] to-[#2D5AFA] text-primary-foreground hover:opacity-90">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </>
          )}
          {loading && !user && (
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
          )}
        </div>
      </div>
    </header>
  );
}
