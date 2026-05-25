import { useState, useEffect } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { HardwareCard } from "@/components/HardwareCard";
import { equipmentApi } from "@/lib/api";

const STATUSES = ["All", "Available", "Issued", "Reserved", "Maintenance"];

export default function Inventory() {
  const [search,    setSearch]    = useState("");
  const [category,  setCategory]  = useState("All");
  const [status,    setStatus]    = useState("All");
  const [items,     setItems]     = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  // Load equipment from backend on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [equip, cats] = await Promise.all([
          equipmentApi.list(),
          equipmentApi.categories(),
        ]);
        setItems(equip);
        setCategories(["All", ...cats]);
      } catch (err) {
        console.error("Failed to load equipment:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchSearch   = !q
      || item.name?.toLowerCase().includes(q)
      || item.category?.toLowerCase().includes(q)
      || item.description?.toLowerCase().includes(q);
    const matchCategory = category === "All" || item.category === category;
    const matchStatus   = status   === "All" || item.availabilityStatus === status.toLowerCase();
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <>
      <section className="bg-muted/30 border-b border-border py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Hardware Inventory</h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse available development boards, sensors, and lab equipment.
            Check availability and condition status before requesting access.
          </p>
        </div>
      </section>

      {/* Sticky filters */}
      <div className="sticky top-16 z-40 bg-card border-b border-border py-3">
        <div className="container flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search hardware..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="pl-8 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer min-w-[160px]"
              >
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer min-w-[130px]"
            >
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-5">
              Showing {filtered.length} of {items.length} items
            </p>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((item, i) => (
                  <div key={item.id ?? item.slug} className="animate-fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <HardwareCard item={item} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg mb-4">
                  {items.length === 0
                    ? "No equipment has been added to the inventory yet."
                    : "No hardware items match your filters."}
                </p>
                {items.length > 0 && (
                  <button
                    onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
