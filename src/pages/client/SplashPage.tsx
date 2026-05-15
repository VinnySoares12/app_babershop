import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appRoutes } from "@/lib/routes";

const logoUrl = "/assets/saviella-logo.png";

export function SplashPage() {
  const navigate = useNavigate();
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => navigate(appRoutes.home, { replace: true }), 2400);
    return () => window.clearTimeout(timeout);
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(200,164,93,0.16),transparent_24rem)]" />
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="flex aspect-square w-[clamp(11rem,46vw,15rem)] items-center justify-center overflow-hidden rounded-full border border-gold/20 bg-white/[0.03] p-2 shadow-premium backdrop-blur">
          {!logoFailed ? (
            <img
              src={logoUrl}
              alt="Saviella The Barber"
              className="h-[92%] w-[92%] object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="px-6 text-center">
              <p className="text-3xl font-extrabold leading-tight text-[#C12A3A]">Saviella</p>
              <p className="text-2xl font-extrabold leading-tight text-[#C12A3A]">The Barber</p>
            </div>
          )}
        </div>

        <h1 className="mt-8 text-2xl font-bold">Saviella The Barber</h1>
        <p className="mt-2 text-sm text-muted">Preparando sua experiência premium</p>

        <div className="mt-8 flex h-8 items-end gap-2">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-2.5 w-2.5 rounded-full bg-gold"
              animate={{ y: [0, -12, 0], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 0.72, repeat: Infinity, delay: dot * 0.14, ease: "easeInOut" }}
            />
          ))}
        </div>
      </motion.section>
    </main>
  );
}
