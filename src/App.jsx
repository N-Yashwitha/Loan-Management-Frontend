import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [activePage, setActivePage] = useState("login");
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  let content;
  if (user) {
    content = <DashboardPage user={user} onLogout={() => setUser(null)} />;
  } else if (activePage === "register") {
    content = (
      <RegisterPage
        onRegistered={() => setActivePage("login")}
        onSwitch={() => setActivePage("login")}
      />
    );
  } else {
    content = (
      <LoginPage
        onLogin={setUser}
        onSwitch={() => setActivePage("register")}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-logo">L</div>
          <div>
            <p className="brand-kicker">Smart loan workspace</p>
            <h1 className="brand-name">Loaniverse</h1>
          </div>
        </div>
        <nav className="site-nav">
          <span className="nav-pill">Secure Access</span>
          <span className="nav-pill">Role-Based Dashboard</span>
        </nav>
      </header>

      <main className="landing-layout">
        <section className="hero-copy card">
          <span className="eyebrow">Welcome to Loaniverse</span>
          <h2>Manage lending, borrowing, approvals, and payments with a cleaner experience.</h2>
          <p>
            Sign in to continue, or create an account and jump into a focused dashboard designed
            around your role.
          </p>

          <div className="hero-points">
            <div className="hero-point">
              <strong>For lenders</strong>
              <span>Create loans and review incoming requests with clear actions.</span>
            </div>
            <div className="hero-point">
              <strong>For borrowers</strong>
              <span>Browse loan options, apply quickly, and track repayment activity.</span>
            </div>
            <div className="hero-point">
              <strong>For admins and analysts</strong>
              <span>See the bigger picture with organized views and simple summaries.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          {content}
        </section>
      </main>
    </div>
  );
}
