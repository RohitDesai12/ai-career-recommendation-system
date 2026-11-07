import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "./context/theme-context";
import { CookieConsentBanner } from "./components/cookie-consent-banner";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
        <CookieConsentBanner />
      </AuthProvider>
    </ThemeProvider>
  );
}
