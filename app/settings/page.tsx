/**
 * Pantalla de configuración de rutinas
 * Permite crear, editar y desactivar rutinas
 */

import { redirect } from 'next/navigation';
import { getUserRoutines } from '@/lib/sheets-routines';
import { getCurrentUser } from '@/lib/auth';
import RoutinesList from '@/components/RoutinesList';
import CreateRoutineForm from '@/components/CreateRoutineForm';

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/');
  }

  const userId = user.id;
  const routines = await getUserRoutines(userId);

  return (
    <div className="container">
      <div className="card">
        <div className="page-header">
          <h1 className="page-title">Tus rutinas</h1>
          <a href="/dashboard" className="header-icon" title="Volver">
            ←
          </a>
        </div>

        <div className="settings-layout">
          <div className="settings-form-section">
            <h2 className="text-lg font-semibold mb-4">Crear nueva rutina</h2>
            <CreateRoutineForm userId={userId} />
          </div>

          <div className="settings-routines-section">
            <h2 className="text-lg font-semibold mb-4">
              Rutinas activas ({routines.filter(r => r.active).length})
            </h2>
            {routines.length === 0 ? (
              <p className="text-sm opacity-60">Aún no tenés rutinas creadas</p>
            ) : (
              <RoutinesList routines={routines} userId={userId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
