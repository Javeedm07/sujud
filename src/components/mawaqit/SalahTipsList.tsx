
"use client";

import React, { useEffect, useState } from 'react';
import { getSalahTips } from '@/lib/firestore';
import type { SalahTip } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const SalahTipCard: React.FC<{ tip: SalahTip; onClick: () => void }> = ({ tip, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 ease-in-out bg-card/80 backdrop-blur-sm transform hover:scale-[1.02]"
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      role="button"
      aria-label={`Read more about ${tip.title}`}
    >
      <CardHeader>
        <CardTitle className="text-xl font-headline text-primary">{tip.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{tip.summary}</p>
      </CardContent>
    </Card>
  );
};

export default function SalahTipsList() {
  const [tips, setTips] = useState<SalahTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTip, setSelectedTip] = useState<SalahTip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedTips = await getSalahTips();
        setTips(fetchedTips);
      } catch (err) {
        console.error("Failed to fetch Salah tips:", err);
        setError("Could not load tips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  const handleTipClick = (tip: SalahTip) => {
    setSelectedTip(tip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTip(null);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive text-destructive-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle /> Error Loading Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (tips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Tips Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There are currently no Salah improvement tips available. Please check back later or add tips to the 'salahTips' collection in Firestore.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tips.map((tip) => (
          <SalahTipCard key={tip.id} tip={tip} onClick={() => handleTipClick(tip)} />
        ))}
      </div>

      {selectedTip && (
        <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <AlertDialogContent className="max-w-2xl">
             <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-headline text-primary">{selectedTip.title}</AlertDialogTitle>
            </AlertDialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4"> {/* Added ScrollArea */}
              <AlertDialogDescription className="text-base text-foreground whitespace-pre-wrap">
                {selectedTip.content}
              </AlertDialogDescription>
            </ScrollArea>
            {/* Footer can be removed if only for closing */}
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
