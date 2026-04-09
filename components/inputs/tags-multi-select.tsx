"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getAllTags, type TagResponse } from "@/lib/api/tags";

export function TagsMultiSelect({
  value,
  onChange,
  placeholder = "Search tags...",
  disabled,
}: {
  value: number[];
  onChange: (ids: number[], tags?: TagResponse[]) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<TagResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const all = await getAllTags();
        if (!cancelled) setTags(all ?? []);
      } catch {
        if (!cancelled) setTags([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTags = useMemo(() => tags.filter((t) => value.includes(t.id)), [tags, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, query]);

  function toggle(id: number) {
    const next = value.includes(id) ? value.filter((x) => x !== id) : [...value, id];
    onChange(next, tags.filter((t) => next.includes(t.id)));
  }

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between" disabled={disabled}>
            <span className="truncate text-muted-foreground">
              {selectedTags.length ? `${selectedTags.length} selected` : "Tags"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[360px] p-0" align="start" side="bottom" sideOffset={8}>
          <Command shouldFilter={false}>
            <CommandInput placeholder={placeholder} value={query} onValueChange={setQuery} />
            <CommandList>
              <CommandEmpty>{loading ? "Loading..." : "No tags found."}</CommandEmpty>
              <CommandGroup heading="Tags">
                {filtered.map((t) => (
                  <CommandItem
                    key={t.id}
                    value={t.name}
                    onSelect={() => toggle(t.id)}
                    className="flex items-center"
                  >
                    <Check className={cn("mr-2 h-4 w-4", value.includes(t.id) ? "opacity-100" : "opacity-0")} />
                    <span className="truncate">{t.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup>
                <CommandItem
                  key="__clear"
                  value="__clear"
                  onSelect={() => onChange([], [])}
                >
                  Clear
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedTags.map((t) => (
            <Badge key={t.id} variant="secondary" className="gap-1">
              {t.name}
              <button
                type="button"
                className="ml-1 opacity-70 hover:opacity-100"
                onClick={() => toggle(t.id)}
                aria-label={`Remove ${t.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

