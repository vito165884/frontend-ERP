"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  getInstallationTechniciansBaseInfos,
  type InstallationTechnicianBaseInfo,
} from "@/lib/api/installation-technicians";

export function TechnicianCombobox({
  value,
  onChange,
  placeholder = "Select an installer",
  disabled,
}: {
  value: number | null;
  onChange: (id: number | null, technician?: InstallationTechnicianBaseInfo | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InstallationTechnicianBaseInfo[]>([]);
  const [selected, setSelected] = useState<InstallationTechnicianBaseInfo | null>(null);

  const label = useMemo(() => selected?.nom ?? (value ? `#${value}` : ""), [selected, value]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const resp = await getInstallationTechniciansBaseInfos();
        if (cancelled) return;
        setItems(resp ?? []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => `${t.id} ${t.nom ?? ""} ${t.tel ?? ""}`.toLowerCase().includes(q));
  }, [items, query]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    const match = items.find((t) => t.id === value);
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
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search installers..." value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>{loading ? "Loading..." : "No installer found."}</CommandEmpty>
            <CommandGroup heading="Installers">
              {filtered.map((t) => (
                <CommandItem
                  key={t.id}
                  value={`${t.id} ${t.nom ?? ""}`.trim()}
                  onSelect={() => {
                    setOpen(false);
                    setSelected(t);
                    onChange(t.id, t);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === t.id ? "opacity-100" : "opacity-0")} />
                  <span className="truncate">{t.nom ?? `#${t.id}`}</span>
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

