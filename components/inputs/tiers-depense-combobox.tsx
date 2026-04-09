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
import {
  getTiersDepensesFonctionnement,
  type TiersDepenseFonctionnement,
} from "@/lib/api/tiers-depenses-fonctionnement";

export function TiersDepenseCombobox({
  value,
  onChange,
  placeholder = "Select expense vendor",
  disabled,
}: {
  value: number | null;
  onChange: (id: number | null, tiers?: TiersDepenseFonctionnement | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TiersDepenseFonctionnement[]>([]);
  const [selected, setSelected] = useState<TiersDepenseFonctionnement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getTiersDepensesFonctionnement({ pageNumber: 1, pageSize: 50, searchKeyword: query || null });
        if (!cancelled) setItems(res.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [query]);

  const label = useMemo(() => {
    const found = items.find((i) => i.id === value) ?? (selected?.id === value ? selected : null);
    return found?.nom ?? null;
  }, [items, selected, value]);

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
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search expense vendor..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{loading ? "Loading…" : "No expense vendor found."}</CommandEmpty>
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
              {items.map((i) => (
                <CommandItem
                  key={i.id}
                  value={String(i.id)}
                  onSelect={() => {
                    setSelected(i);
                    onChange(i.id, i);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === i.id ? "opacity-100" : "opacity-0")} />
                  {i.nom}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

