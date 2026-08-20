import type { PublicMapRow } from '../api/mapService';

export interface EventSelectorProps {
  events: Array<Pick<PublicMapRow, 'event_name' | 'event_slug'>>;
  value: string;
  onChange: (eventSlug: string) => void;
}

export function EventSelector({
  events,
  value,
  onChange,
}: EventSelectorProps) {
  const uniqueEvents = Array.from(
    new Map(events.map((event) => [event.event_slug, event])).values()
  );

  if (uniqueEvents.length <= 1) {
    return null;
  }

  return (
    <div>
      <label htmlFor="public-event-selector" className="text-sm font-medium text-slate-700">
        Evento
      </label>
      <select
        id="public-event-selector"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
      >
        {uniqueEvents.map((event) => (
          <option key={event.event_slug} value={event.event_slug}>
            {event.event_name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EventSelector;