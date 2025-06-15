
import { createContext, useState, useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Ensure theme is only used client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme for convenience
export { useTheme };
