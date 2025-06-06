
"use client";

import Link from 'next/link';
import { Home, LayoutDashboard, LogOut, User, Settings, Moon, Sun, BookOpenText } from 'lucide-react';
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

export default function Header() {
  const { user, signOut, loading } = useAuth();

  const getInitials = (email?: string | null) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/home" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" className="text-primary" fill="currentColor">
            <path d="M120-120v-480h80v190l280-175 280 175v-190h80v480H120Zm140-20h80v-170l-40-25-40 25v170Zm400 0h80v-170l-40-25-40 25v170ZM480-565 200-740v-100q0-24 18-42t42-18h400q24 0 42 18t18 42v100L480-565Z"/>
          </svg>
          <h1 className="text-2xl font-headline font-bold text-primary">SUJUD</h1>
        </Link>
        
        <nav className="flex items-center gap-4">
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/home" className="flex items-center gap-1">
                  <Home size={18} /> Home
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center gap-1">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              </Button>
            </>
          )}
          
          {loading ? (
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
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
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {/* Fallback for when header is shown on a public page before AuthContext redirects (should be rare) */}
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
