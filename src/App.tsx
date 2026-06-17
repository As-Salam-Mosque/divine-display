import { ClockPage } from "./pages/ClockPage";
import { LandingPage } from "./pages/LandingPage";

export default function App() {
  const mosqueName = new URLSearchParams(window.location.search)
    .get("name")
    ?.trim();

  return mosqueName ? <ClockPage mosqueName={mosqueName} /> : <LandingPage />;
}
