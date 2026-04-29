import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function calculateInterest(amount, rate, duration) {
  return (Number(amount) * Number(rate) * Number(duration)) / 100;
}

function prettyRole(role) {
  if (!role) return "";
  return role.charAt(0) +
         role.slice(1).toLowerCase();
}

function SectionHeader({ badge, title, description }) {
  return (
    <div className="section-heading">
      {badge ? <span className="section-badge">{badge}</span> : null}
      <h3>{title}</h3>
      {description ? <p className="muted">{description}</p> : null}
    </div>
  );
}

function LenderSection({ user }) {
  const [loanForm, setLoanForm] = useState({
    amount: "",
    interestRate: "",
    duration: ""
  });
  const [loans, setLoans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allLoans, lenderRequests] = await Promise.all([
        apiFetch("/loans"),
        apiFetch(`/loan-requests/lender/${user.id}`)
      ]);

      setLoans(allLoans.filter((loan) => loan.lenderId === user.id));
      setRequests(lenderRequests);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoanChange = (event) => {
    setLoanForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleCreateLoan = async (event) => {
    event.preventDefault();

    try {
      await apiFetch("/loans", {
        method: "POST",
        body: JSON.stringify({
          ...loanForm,
          amount: Number(loanForm.amount),
          interestRate: Number(loanForm.interestRate),
          duration: Number(loanForm.duration),
          lenderId: user.id,
          status: "AVAILABLE"
        })
      });

      alert("Loan created successfully");
      setLoanForm({ amount: "", interestRate: "", duration: "" });
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await apiFetch(`/loan-requests/${requestId}/approve`, {
        method: "PUT"
      });
      alert("Loan request approved");
      loadData();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="card">
        <SectionHeader
          badge="Create Loan"
          title="Add a new lending offer"
          description="Set the amount, interest rate, and duration to publish a loan for borrowers."
        />
        <form onSubmit={handleCreateLoan} className="form-grid">
          <label className="form-field">
            <span>Amount</span>
            <input name="amount" type="number" value={loanForm.amount} onChange={handleLoanChange} required />
          </label>
          <label className="form-field">
            <span>Interest Rate (%)</span>
            <input name="interestRate" type="number" value={loanForm.interestRate} onChange={handleLoanChange} required />
          </label>
          <label className="form-field">
            <span>Duration (years)</span>
            <input name="duration" type="number" value={loanForm.duration} onChange={handleLoanChange} required />
          </label>
          <button type="submit" className="primary-btn">Create Loan</button>
        </form>
      </section>

      <section className="card">
        <SectionHeader
          badge="My Loans"
          title="Your lending portfolio"
          description="Review the loans you have created and their current status."
        />
        {loading ? <p className="loading-text">Loading your loans...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Interest</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="5">No loans created yet.</td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.id}</td>
                    <td>{formatCurrency(loan.amount)}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.duration}</td>
                    <td>{loan.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card card-wide">
        <SectionHeader
          badge="Loan Requests"
          title="Borrower applications"
          description="Approve pending borrower requests directly from this section."
        />
        {loading ? <p className="loading-text">Loading loan requests...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Loan ID</th>
                <th>Borrower ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="5">No requests found.</td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.loanId}</td>
                    <td>{request.borrowerId}</td>
                    <td>{request.status}</td>
                    <td>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleApprove(request.id)}
                        disabled={request.status === "APPROVED"}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function BorrowerSection({ user }) {
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    loanId: "",
    amountPaid: "",
    paymentDate: ""
  });
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const loadLoans = async () => {
    setLoadingLoans(true);
    try {
      const allLoans = await apiFetch("/loans");
      setLoans(allLoans);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingLoans(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleApply = async (loanId) => {
    try {
      await apiFetch("/loan-requests", {
        method: "POST",
        body: JSON.stringify({
          loanId,
          borrowerId: user.id,
          status: "PENDING"
        })
      });
      alert("Loan request submitted");
      loadLoans();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLoadPayments = async (loanId) => {
    setLoadingPayments(true);
    try {
      const loanPayments = await apiFetch(`/payments/${loanId}`);
      setSelectedLoanId(loanId);
      setPayments(loanPayments);
      setPaymentForm((current) => ({ ...current, loanId }));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handlePaymentChange = (event) => {
    setPaymentForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();

    try {
      await apiFetch("/payments", {
        method: "POST",
        body: JSON.stringify({
          loanId: Number(paymentForm.loanId),
          amountPaid: Number(paymentForm.amountPaid),
          paymentDate: paymentForm.paymentDate || null
        })
      });
      alert("Payment saved successfully");
      setPaymentForm((current) => ({ ...current, amountPaid: "", paymentDate: "" }));
      handleLoadPayments(Number(paymentForm.loanId));
      loadLoans();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="dashboard-grid">
      <section className="card card-wide">
        <SectionHeader
          badge="Available Loans"
          title="Explore loan opportunities"
          description="Browse open loans, apply in one step, or open the payment history for any loan."
        />
        {loadingLoans ? <p className="loading-text">Loading available loans...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Interest Rate</th>
                <th>Duration</th>
                <th>Total Interest</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.length === 0 ? (
                <tr>
                  <td colSpan="7">No loans available.</td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>{loan.id}</td>
                    <td>{formatCurrency(loan.amount)}</td>
                    <td>{loan.interestRate}%</td>
                    <td>{loan.duration}</td>
                    <td>{formatCurrency(calculateInterest(loan.amount, loan.interestRate, loan.duration))}</td>
                    <td>{loan.status}</td>
                    <td className="actions-cell">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleApply(loan.id)}
                        disabled={loan.status !== "AVAILABLE"}
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => handleLoadPayments(loan.id)}
                      >
                        View Payments
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <SectionHeader
          badge="Payments"
          title="Make a repayment"
          description="Enter the loan number and payment details to record a repayment."
        />
        <form onSubmit={handlePaymentSubmit} className="form-grid">
          <label className="form-field">
            <span>Loan ID</span>
            <input
              name="loanId"
              type="number"
              value={paymentForm.loanId}
              onChange={handlePaymentChange}
              required
            />
          </label>
          <label className="form-field">
            <span>Amount Paid</span>
            <input
              name="amountPaid"
              type="number"
              value={paymentForm.amountPaid}
              onChange={handlePaymentChange}
              required
            />
          </label>
          <label className="form-field">
            <span>Payment Date</span>
            <input
              name="paymentDate"
              type="date"
              value={paymentForm.paymentDate}
              onChange={handlePaymentChange}
            />
          </label>
          <button type="submit" className="primary-btn">Submit Payment</button>
        </form>
      </section>

      <section className="card">
        <SectionHeader
          badge="Payment History"
          title={selectedLoanId ? `Payments for Loan ${selectedLoanId}` : "Recent payments"}
          description="Choose a loan from the list above to view its repayment records."
        />
        {loadingPayments ? <p className="loading-text">Loading payment history...</p> : null}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Loan ID</th>
                <th>Amount Paid</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="4">No payments found.</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{payment.loanId}</td>
                    <td>{formatCurrency(payment.amountPaid)}</td>
                    <td>{payment.paymentDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminSection() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await apiFetch("/users");
        setUsers(allUsers);
      } catch (error) {
        alert(error.message);
      }
    };

    loadUsers();
  }, []);

  return (
    <section className="card card-wide">
      <SectionHeader
        badge="Admin"
        title="Registered users"
        description="A clear list of all users currently available in the system."
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function AnalystSection() {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const allLoans = await apiFetch("/loans");
        setLoans(allLoans);
      } catch (error) {
        alert(error.message);
      }
    };

    loadLoans();
  }, []);

  return (
    <section className="card card-wide">
      <SectionHeader
        badge="Analyst Overview"
        title="Loan portfolio summary"
        description="Quick visibility into overall lending activity and loan progress."
      />
      <div className="stats-grid">
        <div className="stat-box">
          <strong>{loans.length}</strong>
          <span>Total Loans</span>
        </div>
        <div className="stat-box">
          <strong>{loans.filter((loan) => loan.status === "AVAILABLE").length}</strong>
          <span>Available</span>
        </div>
        <div className="stat-box">
          <strong>{loans.filter((loan) => loan.status === "APPROVED").length}</strong>
          <span>Approved</span>
        </div>
        <div className="stat-box">
          <strong>{loans.filter((loan) => loan.status === "COMPLETED").length}</strong>
          <span>Completed</span>
        </div>
      </div>
    </section>
  );
}

export default function DashboardPage({ user, onLogout }) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar card">
        <div className="dashboard-brand">
          <div className="brand-logo brand-logo-small">L</div>
          <div>
            <p className="brand-kicker">Loaniverse workspace</p>
            <h1>Welcome back, {user.name}</h1>
            <p className="muted">Signed in as {prettyRole(user.role)}</p>
          </div>
        </div>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            localStorage.removeItem("loggedInUser");
            onLogout();
          }}
        >
          Logout
        </button>
      </header>

      <section className="summary-strip">
        <article className="summary-card">
          <span className="summary-label">Role</span>
          <strong>{prettyRole(user.role)}</strong>
        </article>
        <article className="summary-card">
          <span className="summary-label">Focus</span>
          <strong>
            {user.role === "LENDER" && "Manage loans and approvals"}
            {user.role === "BORROWER" && "Apply and track payments"}
            {user.role === "ADMIN" && "View registered users"}
            {user.role === "ANALYST" && "Monitor portfolio performance"}
          </strong>
        </article>
      </section>

      {user.role === "LENDER" && <LenderSection user={user} />}
      {user.role === "BORROWER" && <BorrowerSection user={user} />}
      {user.role === "ADMIN" && <AdminSection />}
      {user.role === "ANALYST" && <AnalystSection />}
    </div>
  );
}
