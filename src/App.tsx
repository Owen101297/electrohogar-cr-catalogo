import React, { useCallback, useEffect, useState } from 'react';
import { PublicCatalog } from './components/PublicCatalog';
import { AdvisorDashboard } from './components/AdvisorDashboard';
import { ConfirmDialog } from './components/ConfirmDialog';
import {
  ADVISOR_GATE_COPY,
  endAdvisorSession,
  isAdvisorSessionActive,
  resolveRoute,
  startAdvisorSession,
} from './utils/routing';

/**
 * Enrutador de la aplicación.
 *
 * La ruta decide qué pantalla se monta:
 *   - `/`        → catálogo público (cliente)
 *   - `/asesor`  → interfaz de administración (asesora)
 *
 * La sesión de asesor vive en sessionStorage, por lo que se cierra sola
 * cuando el navegador se cierra.
 */
export default function App() {
  const [route, setRoute] = useState(() =>
    resolveRoute(typeof window !== 'undefined' ? window.location.pathname : '/')
  );

  const [hasSession, setHasSession] = useState(() => isAdvisorSessionActive());
  const [isGateOpen, setIsGateOpen] = useState(false);

  // Si el asesor navega dentro de la SPA, se recalcula la ruta.
  useEffect(() => {
    const handlePopState = () => {
      setRoute(resolveRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // En la ruta interna sin sesión activa, se pide confirmación explícita.
  useEffect(() => {
    if (route === 'advisor' && !hasSession) {
      setIsGateOpen(true);
    }
  }, [route, hasSession]);

  const navigateTo = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setRoute(resolveRoute(path));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleEnterAdvisor = useCallback(() => {
    startAdvisorSession();
    setHasSession(true);
    setIsGateOpen(false);
  }, []);

  const handleCancelGate = useCallback(() => {
    setIsGateOpen(false);
    navigateTo('/');
  }, [navigateTo]);

  const handleExitAdvisor = useCallback(() => {
    endAdvisorSession();
    setHasSession(false);
    navigateTo('/');
  }, [navigateTo]);

  if (route === 'advisor' && hasSession) {
    return <AdvisorDashboard onExitAdvisorMode={handleExitAdvisor} />;
  }

  return (
    <>
      <PublicCatalog />

      <ConfirmDialog
        isOpen={isGateOpen}
        title={ADVISOR_GATE_COPY.title}
        message={ADVISOR_GATE_COPY.body}
        confirmLabel={ADVISOR_GATE_COPY.enter}
        cancelLabel={ADVISOR_GATE_COPY.cancel}
        onConfirm={handleEnterAdvisor}
        onClose={handleCancelGate}
      />
    </>
  );
}
