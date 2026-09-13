"use client";

import { Flame } from "lucide-react";
import { SellerRank } from "@/lib/types";

interface StreakBadgeProps {
  streakCount: number;
  sellerRank?: SellerRank;
  deliveredCount?: number;
}

export default function StreakBadge({ streakCount }: StreakBadgeProps) {
  return (
    <div
      className="flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-950/50 px-2.5 py-1 text-xs font-bold text-orange-400 shadow-sm shadow-orange-950/50 select-none"
      title={`Racha activa: ${streakCount} día(s) consecutivos registrando ventas`}
    >
      <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-400" />
      <span>{streakCount}d</span>
    </div>
  );
}

