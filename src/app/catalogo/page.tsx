"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, ExternalLink, PlusCircle, Search, Sparkles, DollarSign, Package } from "lucide-react";
import { store } from "@/lib/store";
import { Product } from "@/lib/types";
import { showToast } from "@/components/Toast";

export default function CatalogoPage() {
  const [products] = useState<Product[]>(store.getProducts());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");

  const categories = ["Todas", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = (prod: Product) => {
    navigator.clipboard.writeText(prod.marketingCopy);
    setCopiedId(prod.id);
    showToast(`¡Copy de "${prod.title.slice(0, 20)}..." copiado al portapapeles! Listo para WhatsApp o TikTok Ads.`, "success");
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 sm:max-w-xl md:max-w-2xl">
      {/* Header del Catálogo */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>Catálogo de Productos</span>
          <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            Bodega Ecuador
          </span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Vende sin inventario. Selecciona productos ganadores, copia el copy y gana tu comisión con cobro COD.
        </p>
      </div>

      {/* Buscador y Categorías */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o palabra clave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const isCopied = copiedId === product.id;

          return (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-lg transition hover:border-neutral-700"
            >
              <div className="flex gap-3.5">
                {/* Imagen del Producto */}
                <div className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-neutral-300">
                    Stock: {product.stock}
                  </div>
                </div>

                {/* Información */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h2 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                      {product.title}
                    </h2>
                    <p className="mt-1 text-[11px] text-neutral-400 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  {/* Desglose de Ganancia */}
                  <div className="mt-2 flex items-center justify-between border-t border-neutral-800/80 pt-2">
                    <div>
                      <span className="block text-[9px] text-neutral-500">PVP SUGERIDO</span>
                      <span className="text-xs font-semibold text-white">
                        ${product.suggestedRetailPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-[9px] text-emerald-400 font-medium">
                        TU COMISIÓN ESTIMADA
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        +${product.fixedCommission.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botonera de Venta Rápida */}
              <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-neutral-800/60 pt-3">
                {/* Botón 1: Copiar Material de Venta */}
                <button
                  onClick={() => handleCopy(product)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2.5 px-2 text-xs font-semibold transition active:scale-95 ${
                    isCopied
                      ? "border-emerald-500 bg-emerald-950/60 text-emerald-400"
                      : "border-neutral-700 bg-neutral-850 text-neutral-200 hover:bg-neutral-800 hover:text-white"
                  }`}
                  title="Copiar material de venta predefinido para WhatsApp o TikTok"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-neutral-400" />
                      <span>Copiar Material de Venta</span>
                    </>
                  )}
                </button>

                {/* Botón 2: Registrar Pedido */}
                <Link
                  href={`/pedidos/nuevo?productId=${product.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-2.5 px-2 text-xs font-bold text-black shadow-md shadow-emerald-500/20 transition hover:opacity-95 active:scale-95"
                >
                  <PlusCircle className="h-4 w-4 stroke-[2.5]" />
                  <span>Registrar Pedido</span>
                </Link>
              </div>

              {/* Enlace a material promocional (Drive/Telegram) */}
              {product.promoMaterialUrl && (
                <div className="mt-2 text-center">
                  <a
                    href={product.promoMaterialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 transition"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Descargar fotos y videos publicitarios para anuncios (Drive)</span>
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
            <Package className="mx-auto h-8 w-8 text-neutral-600" />
            <p className="mt-2 text-xs text-neutral-400">
              No se encontraron productos con el filtro seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
