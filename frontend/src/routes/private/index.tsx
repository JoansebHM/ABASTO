import { getUserProfile } from '@/features/auth/api/authService';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '@/lib/database.types';
import { VerificationStatus } from '@/lib/domain';
import { canCreatePoint } from '@/lib/guards';
import { PointForm } from '@/features/points/components/PointForm';
import type { PointFormValues } from '@/features/points/schemas/point.schema';
import { useCreatePoint } from '@/features/points/hooks/useCreatePoint';
import { InventoryEditor } from '@/features/points/components/InventoryEditor';
import type { InventoryFormValues } from '@/features/points/schemas/inventory.schema';
import { useAdjustInventory } from '@/features/points/hooks/useAdjustInventory';

export default function DashboardPage() {
  const { user, setSession } = useAuthStore();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pointFormMessage, setPointFormMessage] = useState<string | null>(null);
  const [inventoryMessage, setInventoryMessage] = useState<string | null>(null);
  const createPointMutation = useCreatePoint();
  const adjustInventoryMutation = useAdjustInventory();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getUserProfile(user.id)
      .then((profile) => {
        if (!cancelled) {
          setUserProfile(profile);
          console.log('User Profile:', profile);
        }
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleLogout = () => {
    setSession(null);
    navigate('/');
  };

  const canRegisterPoint = Boolean(
    userProfile &&
      canCreatePoint(userProfile.role, userProfile.verification_status)
  );
  const canAdjustInventory = Boolean(
    userProfile &&
      userProfile.role !== 'admin_general' &&
      userProfile.verification_status === VerificationStatus.Approved
  );

  const handlePointSubmit = async (values: PointFormValues) => {
    setPointFormMessage(null);

    try {
      const point = await createPointMutation.mutateAsync(values);
      setPointFormMessage(`Punto ${point.name} creado correctamente.`);
    } catch (error) {
      setPointFormMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo crear el punto de acopio.'
      );
    }
  };

  const handleInventorySubmit = async (values: InventoryFormValues) => {
    setInventoryMessage(null);

    try {
      const ledgerId = await adjustInventoryMutation.mutateAsync(values);
      setInventoryMessage(`Inventario actualizado. Movimiento: ${ledgerId}.`);
    } catch (error) {
      setInventoryMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el inventario.'
      );
    }
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">Área privada: contenido protegido.</p>
      {userProfile && (
        <p className="mt-2 text-sm text-gray-500">
          Bienvenido, {userProfile.full_name} ({userProfile.role}) Estado de
          verificación:{' '}
          {userProfile.verification_status === VerificationStatus.Pending &&
            'Pendiente'}
        </p>
      )}
      {canRegisterPoint ? (
        <section className="mt-6" aria-labelledby="register-point-heading">
          <h2 id="register-point-heading" className="text-xl font-semibold">
            Registrar punto de acopio
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Disponible para líderes con verificación aprobada.
          </p>
          <PointForm
            className="mt-4 space-y-4"
            onSubmit={handlePointSubmit}
            isBusy={createPointMutation.isPending}
          />
          {pointFormMessage && (
            <p role="status" className="mt-3 text-sm text-emerald-700">
              {pointFormMessage}
            </p>
          )}
        </section>
      ) : (
        <p className="mt-6 text-sm text-amber-700" role="status">
          El registro de puntos requiere una verificación de líder aprobada.
        </p>
      )}
      {canAdjustInventory && (
        <section className="mt-6" aria-labelledby="inventory-heading">
          <h2 id="inventory-heading" className="text-xl font-semibold">
            Actualizar inventario
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Disponible únicamente para líderes con verificación aprobada.
          </p>
          <InventoryEditor
            className="mt-4 space-y-4"
            onSubmit={handleInventorySubmit}
            isBusy={adjustInventoryMutation.isPending}
          />
          {inventoryMessage && (
            <p role="status" className="mt-3 text-sm text-emerald-700">
              {inventoryMessage}
            </p>
          )}
        </section>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
