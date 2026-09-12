"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, PlusCircle, Package, Wallet, LayoutDashboard } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Inicio",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/"
    },
    {
      label: "Catálogo",
      href: "/catalogo",
      icon: ShoppingBag,
      active: pathname === "/catalogo"
    },
    {
      label: "+ Venta COD",
      href: "/pedidos/nuevo",
      icon: PlusCircle,
      active: pathname === "/pedidos/nuevo",
      highlight: true
    },
    {
      label: "Mis Ventas",
      href: "/pedidos",
      icon: Package,
      active: pathname === "/pedidos"
    },
    {
      label: "Billetera",
      href: "/billetera",
      icon: Wallet,
      active: pathname === "/billetera"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5 sm:max-w-xl md:max-w-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative -top-3 flex flex-col items-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 group-hover:scale-105">
                  <Icon className="h-6 w-6 stroke-[2.5]" />
                </div>
                <span className="mt-0.5 text-[10px] font-bold text-emerald-400">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 transition-colors ${
                item.active
                  ? "text-emerald-400"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className={`h-5 w-5 ${item.active ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span className={`text-[10px] mt-1 ${item.active ? "font-bold text-emerald-400" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
