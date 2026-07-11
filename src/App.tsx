import { Route, Switch } from "wouter";
import { ClockPage } from "./pages/ClockPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

function RootRoute() {
  const rawName = new URLSearchParams(window.location.search).get("name");
  if (rawName === null) return <LandingPage />;

  const mosqueName = rawName
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .trim();

  return <ClockPage mosqueName={mosqueName} />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/" component={RootRoute} />
          <Route>
            <RootRoute />
          </Route>
        </Switch>
      </LanguageProvider>
    </AuthProvider>
  );
}
