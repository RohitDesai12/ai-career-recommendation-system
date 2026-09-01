import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/auth-context";
import { ThemeProvider } from "./context/theme-context";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}
