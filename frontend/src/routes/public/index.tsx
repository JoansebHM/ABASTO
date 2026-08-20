import React from 'react';
import { useState } from 'react';
import PublicMap from '@/features/map/components/PublicMap';
import EventSelector from '@/features/map/components/EventSelector';
import { usePublicMapData } from '@/features/map/hooks';

export default function HomePage() {
  const mapQuery = usePublicMapData();
  const rows = mapQuery.data ?? [];
  const events = rows.map(({ event_name, event_slug }) => ({
    event_name,
    event_slug,
  }));
  const [selectedEvent, setSelectedEvent] = useState('');
  const activeEvent = selectedEvent || events[0]?.event_slug || '';
  const filteredRows = activeEvent
    ? rows.filter((row) => row.event_slug === activeEvent)
    : rows;

  return (
    <div className="space-y-12 pb-12">
      <section className="border-b border-slate-200 py-12">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">Red de ayuda local</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-bold tracking-tight text-slate-950">
          ABASTO conecta suministros con las zonas que los necesitan.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-slate-600">
          Consulta puntos activos e inventario disponible para orientar tu ayuda con información pública y actualizada.
        </p>
      </section>
      <section aria-labelledby="home-map-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">Ahora</p>
            <h2 id="home-map-heading" className="mt-2 text-3xl font-bold text-slate-950">Disponibilidad por punto</h2>
          </div>
          <span className="text-sm text-slate-500">Lectura pública</span>
        </div>
        <div className="mb-5 max-w-xs">
          <EventSelector
            events={events}
            value={activeEvent}
            onChange={setSelectedEvent}
          />
        </div>
        <PublicMap rows={filteredRows} />
      </section>
    </div>
  );
}
