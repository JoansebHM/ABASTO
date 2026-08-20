import PublicMap from '../components/PublicMap';

export default function PublicMapPage() {
  return (
    <section aria-labelledby="public-map-heading">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-700">Disponibilidad</p>
      <h1 id="public-map-heading" className="mt-2 text-3xl font-bold text-slate-950">
        Puntos de acopio activos
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Consulta ubicaciones e inventario publicado sin crear una cuenta.
      </p>
      <div className="mt-8">
        <PublicMap />
      </div>
    </section>
  );
}