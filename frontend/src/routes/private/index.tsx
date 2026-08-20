import { getUserProfile } from '@/features/auth/api/authService';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '@/lib/database.types';
import { VerificationStatus } from '@/lib/domain';

export default function DashboardPage() {
  const { user, setSession } = useAuthStore();
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
