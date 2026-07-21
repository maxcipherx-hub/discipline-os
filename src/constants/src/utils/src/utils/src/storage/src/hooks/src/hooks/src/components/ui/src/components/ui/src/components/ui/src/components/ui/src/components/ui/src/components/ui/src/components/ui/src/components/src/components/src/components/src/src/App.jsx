// ============================================
// APP.JSX — MAIN APPLICATION WRAPPER
// ============================================

import React, { useState, useEffect } from "react";
import { Home, BarChart3, User, AlertTriangle } from "lucide-react";

// Pages
import { HomePage } from "./pages/Home";
import { DetailsPage } from "./pages/Details";
import { ProfilePage } from "./pages/Profile";

// Components
import { EmergencyModal } from "./components/EmergencyModal";
import { ThemeToggle } from "./components/ui";
import { useAI } from "./hooks/useAI";

const App = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [theme, setTheme] = useState("dark");
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem("disciplineOS_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("disciplineOS_theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  // AI Hook (for emergency messages)
  const { getEmergencyMessage } = useAI();

  // Navigation items
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "details", label: "Details", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "details":
        return <DetailsPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage setEmergencyOpen={setEmergencyOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-border-DEFAULT md:bg-bg-surface/80 md:backdrop-blur-sm">
        <div className="flex h-16 items-center border-b border-border-DEFAULT px-6">
          <h1 className="text-xl font-bold tracking-tight">
            Discipline<span className="text-discipline-blue">OS</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                currentPage === item.id
                  ? "bg-discipline-blue/10 text-discipline-blue"
                  : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}

          {/* Emergency Button in Sidebar */}
          <button
            onClick={() => setEmergencyOpen(true)}
            className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-discipline-red hover:bg-discipline-red/10 transition-all"
          >
            <AlertTriangle size={20} />
            Emergency
          </button>
        </nav>

        <div className="border-t border-border-DEFAULT p-4">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {renderPage()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bottom-nav pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-all ${
              currentPage === item.id
                ? "text-discipline-blue"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            <item.icon size={22} strokeWidth={currentPage === item.id ? 2.5 : 1.5} />
            <span>{item.label}</span>
          </button>
        ))}

        {/* Emergency FAB (Mobile) */}
        <button
          onClick={() => setEmergencyOpen(true)}
          className="flex flex-col items-center gap-0.5 text-xs font-medium text-discipline-red hover:text-red-400 transition-all"
        >
          <AlertTriangle size={22} />
          <span>Emergency</span>
        </button>
      </nav>

      {/* Global Emergency Modal */}
      <EmergencyModal
        isOpen={emergencyOpen}
        onClose={() => setEmergencyOpen(false)}
        onReady={(mode) => {
          console.log(`Emergency mode used: ${mode}`);
        }}
        messages={{
          gentle: {
            title: getEmergencyMessage("gentle").title,
            content: getEmergencyMessage("gentle").content,
            color: "text-discipline-blue",
          },
          hard: {
            title: getEmergencyMessage("hard").title,
            content: getEmergencyMessage("hard").content,
            color: "text-discipline-amber",
          },
          war: {
            title: getEmergencyMessage("war").title,
            content: getEmergencyMessage("war").content,
            color: "text-discipline-red",
          },
        }}
      />
    </div>
  );
};

export default App;
