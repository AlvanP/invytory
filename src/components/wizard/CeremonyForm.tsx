import type { CeremonyDraft } from '@/types'
import { CEREMONY_TYPE_LABELS } from '@/types'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export function CeremonyFormFields({
  value,
  onChange,
}: {
  value: CeremonyDraft
  onChange: (patch: Partial<CeremonyDraft>) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Select
        label="Ceremony type"
        className="sm:col-span-2"
        value={value.ceremonyType}
        onChange={(e) => onChange({ ceremonyType: e.target.value as CeremonyDraft['ceremonyType'] })}
      >
        {Object.entries(CEREMONY_TYPE_LABELS).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </Select>

      {value.ceremonyType === 'custom' && (
        <Input
          label="Ceremony name"
          className="sm:col-span-2"
          value={value.ceremonyLabel ?? ''}
          onChange={(e) => onChange({ ceremonyLabel: e.target.value })}
          placeholder="e.g. Edo Traditional Wedding"
        />
      )}

      <Input
        label="Date"
        type="date"
        value={value.weddingDate ?? ''}
        onChange={(e) => onChange({ weddingDate: e.target.value })}
        required
      />
      <Input
        label="Time"
        type="time"
        optional
        value={value.weddingTime ?? ''}
        onChange={(e) => onChange({ weddingTime: e.target.value })}
      />
      <Input
        label="Venue name"
        className="sm:col-span-2"
        value={value.venueName ?? ''}
        onChange={(e) => onChange({ venueName: e.target.value })}
        required
      />
      <Input
        label="Venue address"
        className="sm:col-span-2"
        optional
        value={value.venueAddress ?? ''}
        onChange={(e) => onChange({ venueAddress: e.target.value })}
      />
      <Input
        label="City"
        optional
        value={value.city ?? ''}
        onChange={(e) => onChange({ city: e.target.value })}
      />
      <Input
        label="State"
        optional
        value={value.state ?? ''}
        onChange={(e) => onChange({ state: e.target.value })}
      />
      <Input
        label="Dress code"
        optional
        value={value.dressCode ?? ''}
        onChange={(e) => onChange({ dressCode: e.target.value })}
      />
      <Input
        label="Reception info"
        optional
        value={value.receptionInfo ?? ''}
        onChange={(e) => onChange({ receptionInfo: e.target.value })}
      />
    </div>
  )
}