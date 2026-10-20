import { Check, ChevronsUpDown, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { COUNTRIES, countryFlag, countryName } from '@/lib/countries'
import { cn } from '@/lib/utils'
import type { Country } from '@/lib/countries'

interface CountryMultiSelectProps {
  id?: string
  /** Codes ISO alpha-2 sélectionnés, dans l'ordre de sélection. */
  value: Array<string>
  onChange: (value: Array<string>) => void
  max?: number
  invalid?: boolean
}

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Recherche insensible aux accents, sur le libellé ou le code ISO. */
const filterCountries = (value: string, search: string): number =>
  normalize(value).includes(normalize(search.trim())) ? 1 : 0

export const CountryMultiSelect: React.FC<CountryMultiSelectProps> = ({
  id,
  value,
  onChange,
  max = 10,
  invalid,
}) => {
  const [open, setOpen] = useState(false)
  const selected = new Set(value)
  const isFull = value.length >= max

  const toggle = (code: string) =>
    onChange(
      selected.has(code)
        ? value.filter((c) => c !== code)
        : isFull
          ? value
          : [...value, code],
    )

  const renderItem = (country: Country) => {
    const isSelected = selected.has(country.code)
    return (
      <CommandItem
        key={country.code}
        value={`${country.name} ${country.code}`}
        onSelect={() => toggle(country.code)}
        disabled={!isSelected && isFull}
        className="gap-2"
      >
        <span aria-hidden className="text-base leading-none">
          {countryFlag(country.code)}
        </span>
        <span className="flex-1 truncate">{country.name}</span>
        <span className="text-xs text-muted-foreground">{country.code}</span>
        <Check
          className={cn('size-4 text-primary', !isSelected && 'invisible')}
        />
      </CommandItem>
    )
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            className="w-full justify-between font-normal"
          >
            <span className={cn(value.length === 0 && 'text-muted-foreground')}>
              {value.length === 0
                ? 'Choisir un ou plusieurs pays'
                : `${value.length} pays sélectionné${value.length > 1 ? 's' : ''}`}
            </span>
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) min-w-72 p-0"
        >
          <Command filter={filterCountries}>
            <CommandInput placeholder="Rechercher un pays…" />
            <CommandList className="max-h-72">
              <CommandEmpty>Aucun pays trouvé.</CommandEmpty>
              {value.length > 0 && (
                <CommandGroup heading="Sélectionnés">
                  {COUNTRIES.filter((c) => selected.has(c.code)).map(
                    renderItem,
                  )}
                </CommandGroup>
              )}
              <CommandGroup
                heading={isFull ? `Maximum ${max} pays` : 'Tous les pays'}
              >
                {COUNTRIES.filter((c) => !selected.has(c.code)).map(renderItem)}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Pays sélectionnés">
          {value.map((code) => (
            <li key={code}>
              <Badge variant="secondary" className="gap-1.5 py-1 pr-1 pl-2">
                <span aria-hidden>{countryFlag(code)}</span>
                {countryName(code)}
                <button
                  type="button"
                  onClick={() => toggle(code)}
                  aria-label={`Retirer ${countryName(code)}`}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
