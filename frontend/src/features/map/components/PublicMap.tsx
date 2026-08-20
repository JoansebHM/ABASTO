import type { PublicMapRow } from '../api/mapService';
import { usePublicMapData } from '../hooks';

export interface PublicMapProps {
  rows?: PublicMapRow[];
  eventSlug?: string;
}

interface PublicPoint {
  id: string;
  name: string;
  zoneType: string;
  latitude: number;
  longitude: number;
  supplies: Array<{ type: string; quantity: number }>;
}

function groupPoints(rows: PublicMapRow[]): PublicPoint[] {
  const points = new Map<string, PublicPoint>();

  rows.forEach((row) => {
    const point = points.get(row.point_id) ?? {
      id: row.point_id,
      name: row.point_name,
      zoneType: row.zone_type,
      latitude: row.latitude,
      longitude: row.longitude,
      supplies: [],
    };

    point.supplies.push({ type: row.supply_type, quantity: row.quantity });
    points.set(row.point_id, point);
  });

  return Array.from(points.values());
}

function formatZone(zoneType: string) {
  return zoneType.replaceAll('_', ' ');
}

export function PublicMap({ rows }: PublicMapProps) {
  const query = usePublicMapData();
  const points = groupPoints(rows ?? query.data ?? []);

  if (query.isLoading && !rows) {
    return <p className="text-sm text-slate-500">Cargando puntos activos...</p>;
  }

  if (query.isError && !rows) {
    return (
      <p role="alert" className="text-sm text-rose-700">
        No se pudo cargar el mapa público.
      </p>
    );
  }

  if (points.length === 0) {
    return (
      <div className="border border-dashed border-slate-300 p-8 text-center">
        <p className="font-medium text-slate-800">No hay puntos activos todavía.</p>
        <p className="mt-1 text-sm text-slate-500">
          La disponibilidad aparecerá aquí cuando un líder publique un punto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="relative min-h-[360px] overflow-hidden border border-slate-200 bg-slate-900 p-5 text-white">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="relative flex h-full min-h-[320px] flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Mapa activo</p>
            <p className="mt-2 max-w-xs text-sm text-slate-300">
              Puntos de acopio publicados para consulta anónima.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {points.map((point) => (
              <div key={point.id} className="border border-cyan-300/60 bg-slate-950/80 px-3 py-2 text-xs">
                <span className="block font-semibold text-cyan-200">{point.name}</span>
                <span className="text-slate-400">
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {points.map((point) => (
          <article key={point.id} className="border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{point.name}</h3>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {formatZone(point.zoneType)}
                </p>
              </div>
              <span className="text-xs text-emerald-700">Activo</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {point.supplies.map((supply) => (
                <div key={supply.type} className="bg-slate-50 p-2">
                  <dt className="text-slate-500">{supply.type}</dt>
                  <dd className="font-semibold text-slate-900">{supply.quantity}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}

export default PublicMap;