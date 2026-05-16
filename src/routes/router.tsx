import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthShell } from "@/components/layout/AuthShell";
import { PremiumAppShell } from "@/components/layout/PremiumAppShell";
import { useSession } from "@/hooks/use-session";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { SimpleAdminPage } from "@/pages/admin/SimpleAdminPage";
import { AppointmentDetailsPage } from "@/pages/client/AppointmentDetailsPage";
import { BookingPage } from "@/pages/client/BookingPage";
import { ConfirmationPage } from "@/pages/client/ConfirmationPage";
import { HomePage } from "@/pages/client/HomePage";
import { NotificationsPage } from "@/pages/client/NotificationsPage";
import { PlansPage } from "@/pages/client/PlansPage";
import { ProfilePage } from "@/pages/client/ProfilePage";
import { SimpleClientPage } from "@/pages/client/SimpleClientPage";
import { SplashPage } from "@/pages/client/SplashPage";
import { appRoutes } from "@/lib/routes";

function ProtectedAppShell() {
  const session = useSession();

  if (session.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="text-sm text-muted">Carregando sua sessão...</p>
      </main>
    );
  }

  if (!session.data) {
    return <Navigate to={appRoutes.login} replace />;
  }

  return <PremiumAppShell />;
}

export const router = createBrowserRouter([
  {
    path: appRoutes.splash,
    element: <SplashPage />,
  },
  {
    path: appRoutes.onboarding,
    element: (
      <SimpleClientPage
        title="Experiência Saviella"
        subtitle="Onboarding premium preparado para apresentar agenda, planos, cashback e benefícios."
      />
    ),
  },
  {
    path: "/auth",
    element: <AuthShell />,
    children: [
      { index: true, element: <Navigate to={appRoutes.login} replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "cadastro", element: <RegisterPage /> },
      { path: "recuperar-senha", element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: "/app",
    element: <ProtectedAppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "agendamento", element: <BookingPage /> },
      { path: "agendamento/detalhes", element: <AppointmentDetailsPage /> },
      { path: "checkout", element: <SimpleClientPage title="Checkout" subtitle="Pagamento seguro por Pix, cartão ou assinatura via Edge Functions." /> },
      { path: "pix-pendente", element: <SimpleClientPage title="Pix pendente" subtitle="Tela preparada para ouvir payments em tempo real ate confirmacao." /> },
      { path: "confirmacao", element: <ConfirmationPage /> },
      { path: "historico", element: <SimpleClientPage title="Histórico" subtitle="Lista de atendimentos, pagamentos e avaliações." /> },
      { path: "perfil", element: <ProfilePage /> },
      { path: "planos", element: <PlansPage /> },
      { path: "assinatura", element: <SimpleClientPage title="Assinatura" subtitle="Ciclo ativo, cortes restantes, renovacao e cobrancas." /> },
      { path: "cashback", element: <SimpleClientPage title="Cashback" subtitle="Saldo, extrato e uso no checkout." /> },
      { path: "cupons", element: <SimpleClientPage title="Cupons" subtitle="Cupons ativos e validacao antes do pagamento." /> },
      { path: "notificacoes", element: <NotificationsPage /> },
    ],
  },
  {
    path: "/admin",
    element: <PremiumAppShell />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: "agenda", element: <SimpleAdminPage title="Agenda" /> },
      { path: "clientes", element: <SimpleAdminPage title="Clientes" /> },
      { path: "barbeiros", element: <SimpleAdminPage title="Barbeiros" /> },
      { path: "servicos", element: <SimpleAdminPage title="Serviços" /> },
      { path: "financeiro", element: <SimpleAdminPage title="Financeiro" /> },
      { path: "relatorios", element: <SimpleAdminPage title="Relatorios" /> },
      { path: "configuracoes", element: <SimpleAdminPage title="Configurações" /> },
    ],
  },
]);
