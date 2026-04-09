"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getProducts, type Product } from "@/lib/api/products";

export function ProductCombobox({
  value,
  onChange,
  placeholder = "Select a product",
  disabled,
}: {
  value: string | null;
  onChange: (refe: string | null, product?: Product | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);

  const label = useMemo(() => {
    const found = items.find((p) => p.reference === value) ?? (selected?.reference === value ? selected : null);
    if (!found) return value ? value : null;
    return `${found.name} (${found.reference})`;
  }, [items, selected, value]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getProducts({ pageNumber: 1, pageSize: 20, searchKeyword: query.trim() || null });
        if (!cancelled) setItems(res.items ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    const handle = setTimeout(() => void load(), 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {label || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full min-w-[360px] p-0" align="start" side="bottom" sideOffset={8}>
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search product..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : "No product found."}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="__clear"
                onSelect={() => {
                  onChange(null, null);
                  setSelected(null);
                  setOpen(false);
                }}
              >
                Clear
              </CommandItem>
              {items.map((p) => (
                <CommandItem
                  key={p.reference || String(p.id)}
                  value={p.reference}
                  onSelect={() => {
                    setSelected(p);
                    onChange(p.reference, p);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === p.reference ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{p.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{p.reference}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

