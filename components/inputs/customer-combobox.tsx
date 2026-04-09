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
import { getCustomers, type Customer } from "@/lib/api/customers";

export function CustomerCombobox({
  value,
  onChange,
  placeholder = "Select a customer",
  disabled,
}: {
  value: number | null;
  onChange: (id: number | null, customer?: Customer | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Customer[]>([]);
  const [selected, setSelected] = useState<Customer | null>(null);

  const label = useMemo(() => selected?.name ?? (value ? `#${value}` : ""), [selected, value]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await getCustomers({
          pageNumber: 1,
          pageSize: 20,
          searchKeyword: query.trim() || null,
        });
        if (cancelled) return;
        setItems(resp.items ?? []);
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

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    const match = items.find((c) => c.id === value);
    if (match) setSelected(match);
  }, [value, items]);

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
          <span className={cn("truncate", !label && "text-muted-foreground")}>{label || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[360px] p-0" align="start">
        <Command shouldFilter>
          <CommandInput placeholder="Search customers..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{loading ? "Loading..." : "No customer found."}</CommandEmpty>
            <CommandGroup heading="Customers">
              {items.map((c) => (
                <CommandItem
                  key={c.id}
                  value={`${c.id} ${c.name ?? ""}`.trim()}
                  onSelect={() => {
                    setOpen(false);
                    setSelected(c);
                    onChange(c.id, c);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === c.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{c.name ?? `#${c.id}`}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup>
              <CommandItem
                key="__clear"
                value="__clear"
                onSelect={() => {
                  setOpen(false);
                  setSelected(null);
                  onChange(null, null);
                }}
              >
                Clear
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

