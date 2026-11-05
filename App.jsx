
import React, { useEffect, useState } from "react";
import "./app.css";

const API = "http://localhost:5000/api";

const initialProfile = {
  name: "Louise Zyril U. Macape",
  nickname: "Louise",
  email: "louise.macape@example.com",
  address: "Barangay Mocag, Baggao, Cagayan"
};

const menu = [
  ["Dashboard", "⌂"],
  ["Residents", "♙"],
  ["Officials", "♟"],
  ["Announcements", "▤"],
  ["Reports & Concerns", "⚑"],
  ["Request Certificate", "▧"],
  ["Community Services", "♡"],
  ["Health Services", "✚"],
  ["Messages", "✉"],
  ["Notifications", "♧"],
  ["Archive", "▣"],
  ["Residents Profile", "◉"],
  ["Settings", "⚙"],
  ["Contact", "☎"]
];

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [profile, setProfile] = useState(initialProfile);
  const [stats, setStats] = useState({});
  const [residents, setResidents] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [reports, setReports] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [certificateOptions, setCertificateOptions] = useState([]);
  const [community, setCommunity] = useState([]);
  const [health, setHealth] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [archive, setArchive] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [certType, setCertType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportCategory, setReportCategory] = useState("Community");
  const [reportDescription, setReportDescription] = useState("");
  const [recipient, setRecipient] = useState("Barangay Officials");
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (page === "Residents") loadResidents(search);
  }, [search, page]);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [
        dashboard, p, r, o, a, rp, c, co, h, n, m, ar, options
      ] = await Promise.all([
        api("/dashboard"),
        api("/profile"),
        api("/residents"),
        api("/officials"),
        api("/announcements"),
        api("/reports"),
        api("/certificates"),
        api("/services/community"),
        api("/services/health"),
        api("/notifications"),
        api("/messages"),
        api("/archive"),
        api("/certificates/options")
      ]);

      setStats(dashboard);
      setProfile(p);
      setResidents(r);
      setOfficials(o);
      setAnnouncements(a);
      setReports(rp);
      setCertificates(c);
      setCommunity(co);
      setHealth(h);
      setNotifications(n);
      setMessages(m);
      setArchive(ar);
      setCertificateOptions(options);
      setCertType(options[0]?.name || "");
    } catch (e) {
      setError("Cannot connect to the backend. Start node server.js first.");
    } finally {
      setLoading(false);
    }
  }

  async function loadResidents(q) {
    try {
      setResidents(await api(`/residents?search=${encodeURIComponent(q)}`));
    } catch {
      setError("Unable to load residents.");
    }
  }

  function notify(text) {
    setSuccess(text);
    setError("");
    setTimeout(() => setSuccess(""), 4000);
  }

  async function submitCertificate(e) {
    e.preventDefault();
    try {
      const result = await api("/certificates", {
        method: "POST",
        body: JSON.stringify({ type: certType, purpose })
      });
      setPurpose("");
      await loadAll();
      notify(`Request submitted! Reference: ${result.id}`);
    } catch (e) {
      setError(e.message);
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    try {
      await api("/reports", {
        method: "POST",
        body: JSON.stringify({
          title: reportTitle,
          category: reportCategory,
          description: reportDescription
        })
      });
      setReportTitle("");
      setReportDescription("");
      await loadAll();
      notify("Your concern has been submitted.");
    } catch (e) {
      setError(e.message);
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    try {
      await api("/messages", {
        method: "POST",
        body: JSON.stringify({ to: recipient, message })
      });
      setMessage("");
      await loadAll();
      notify("Message sent successfully.");
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const updated = await api("/profile", {
        method: "PUT",
        body: JSON.stringify(profile)
      });
      setProfile(updated);
      notify("Profile settings saved.");
    } catch (e) {
      setError(e.message);
    }
  }

  async function archiveItem(type, id) {
    try {
      await api("/archive", {
        method: "POST",
        body: JSON.stringify({ type, id })
      });
      await loadAll();
      notify("Item added to archive.");
    } catch (e) {
      setError(e.message);
    }
  }

  function renderDashboard() {
    const cards = [
      ["Total Residents", stats.residents || 0, "♙"],
      ["Barangay Officials", stats.officials || 0, "♟"],
      ["Announcements", stats.announcements || 0, "▤"],
      ["My Reports", stats.reports || 0, "⚑"],
      ["Certificate Requests", stats.certificates || 0, "▧"],
      ["Pending Certificates", stats.pendingCertificates || 0, "◷"]
    ];

    return (
      <>
        <div className="welcome">
          <div>
            <span className="eyebrow">BARANGAY MOCAG</span>
            <h1>Welcome back, {profile.nickname || profile.name}!</h1>
            <p>Your community information and services in one place.</p>
          </div>
          <div className="welcome-icon">🏘️</div>
        </div>

        <div className="stat-grid">
          {cards.map(([label, value, icon]) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon">{icon}</div>
              <div>
                <p>{label}</p>
                <h2>{value}</h2>
              </div>
            </div>
          ))}
        </div>

        <div className="section-heading">
          <h2>Quick Services</h2>
          <span>Access frequently used features</span>
        </div>

        <div className="quick-grid">
          {[
            ["Request Certificate", "Apply for barangay certificates", "▧"],
            ["Reports & Concerns", "Submit a community concern", "⚑"],
            ["Community Services", "Explore assistance programs", "♡"],
            ["Health Services", "Explore health center services", "✚"]
          ].map(([name, description, icon]) => (
            <button className="quick-card" key={name} onClick={() => setPage(name)}>
              <span className="quick-icon">{icon}</span>
              <strong>{name}</strong>
              <small>{description}</small>
              <span className="quick-arrow">→</span>
            </button>
          ))}
        </div>

        <div className="section-heading">
          <h2>Latest Announcements</h2>
          <button className="text-button" onClick={() => setPage("Announcements")}>
            View all →
          </button>
        </div>

        <div className="announcement-grid">
          {announcements.slice(0, 3).map(a => (
            <article className="announcement-card" key={a.id}>
              <span className="tag">{a.category}</span>
              <h3>{a.title}</h3>
              <p>{a.body}</p>
              <small>{a.date}</small>
            </article>
          ))}
        </div>
      </>
    );
  }

  function renderResidents() {
    return (
      <>
        <div className="section-heading">
          <h2>Barangay Residents</h2>
          <span>{residents.length} residents displayed</span>
        </div>
        <input
          className="search"
          placeholder="Search resident name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Resident ID</th><th>Name</th><th>Status</th></tr>
            </thead>
            <tbody>
              {residents.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td><td>{r.name}</td>
                  <td><span className="status">{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="notice">Resident directory is for community viewing. Private resident records are restricted.</p>
      </>
    );
  }

  function renderOfficials() {
    return (
      <>
        <div className="section-heading"><h2>Barangay Officials</h2></div>
        <div className="people-grid">
          {officials.map(o => (
            <article className="person-card" key={o.position}>
              <div className="avatar">{o.name.charAt(0)}</div>
              <h3>{o.name}</h3>
              <p>{o.position}</p>
            </article>
          ))}
        </div>
      </>
    );
  }

  function renderAnnouncements() {
    return (
      <div className="announcement-grid">
        {announcements.map(a => (
          <article className="announcement-card" key={a.id}>
            <span className="tag">{a.category}</span>
            <h3>{a.title}</h3>
            <p>{a.body}</p>
            <small>{a.date}</small>
          </article>
        ))}
      </div>
    );
  }

  function renderCertificates() {
    const selected = certificateOptions.find(c => c.name === certType);
    return (
      <>
        <div className="certificate-info">
          <h3>How to request a certificate</h3>
          <ol>
            <li>Select the certificate you need.</li>
            <li>Read the requirements and prepare documents.</li>
            <li>Submit the online request and save your reference number.</li>
            <li>Visit the indicated barangay office for verification.</li>
            <li>Wait for approval and follow claiming instructions.</li>
          </ol>
        </div>

        <form className="form-card" onSubmit={submitCertificate}>
          <h2>Certificate Application</h2>
          <label>Certificate type</label>
          <select value={certType} onChange={e => setCertType(e.target.value)} required>
            {certificateOptions.map(c => <option key={c.name}>{c.name}</option>)}
          </select>

          {selected && (
            <div className="requirements">
              <strong>Requirements</strong>
              <ul>{selected.requirements.map(r => <li key={r}>{r}</li>)}</ul>
              <strong>First office to visit</strong>
              <p>{selected.firstOffice}</p>
              <strong>Steps</strong>
              <ol>{selected.steps.map(s => <li key={s}>{s}</li>)}</ol>
            </div>
          )}

          <label>Purpose of request</label>
          <textarea value={purpose} onChange={e => setPurpose(e.target.value)} required placeholder="Explain why you need this certificate..." />
          <button className="primary-button">Submit Certificate Request</button>
        </form>

        <div className="section-heading"><h2>My Certificate Requests</h2></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Reference</th><th>Certificate</th><th>Status</th><th>Office</th></tr></thead>
            <tbody>{certificates.map(c => (
              <tr key={c.id}><td>{c.id}</td><td>{c.type}</td><td><span className="status">{c.status}</span></td><td>{c.firstOffice}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </>
    );
  }

  function renderReports() {
    return (
      <>
        <form className="form-card" onSubmit={submitReport}>
          <h2>Submit a Barangay Concern</h2>
          <label>Concern title</label>
          <input value={reportTitle} onChange={e => setReportTitle(e.target.value)} required placeholder="Enter concern title" />
          <label>Category</label>
          <select value={reportCategory} onChange={e => setReportCategory(e.target.value)}>
            {["Community", "Environment", "Safety", "Infrastructure", "Health", "Other"].map(x => <option key={x}>{x}</option>)}
          </select>
          <label>Description</label>
          <textarea value={reportDescription} onChange={e => setReportDescription(e.target.value)} required placeholder="Describe the concern..." />
          <button className="primary-button">Submit Concern</button>
        </form>
        <div className="section-heading"><h2>Submitted Concerns</h2></div>
        {reports.map(r => (
          <article className="list-card" key={r.id}>
            <div><strong>{r.title}</strong><p>{r.description}</p><small>{r.id} • {r.category}</small></div>
            <span className="status">{r.status}</span>
            <button className="small-button" onClick={() => archiveItem("report", r.id)}>Archive</button>
          </article>
        ))}
      </>
    );
  }

  function renderServices(items) {
    return (
      <div className="service-grid">
        {items.map((item, index) => (
          <article className="service-card" key={item}>
            <div className="service-number">{String(index + 1).padStart(2, "0")}</div>
            <h3>{item}</h3>
            <p>Contact the barangay office or health center for availability, eligibility, requirements, and schedules.</p>
          </article>
        ))}
      </div>
    );
  }

  function renderMessages() {
    return (
      <>
        <form className="form-card" onSubmit={sendMessage}>
          <h2>Send a Message</h2>
          <label>Recipient</label>
          <select value={recipient} onChange={e => setRecipient(e.target.value)}>
            <option>Barangay Officials</option>
            {residents.map(r => <option key={r.id}>{r.name}</option>)}
          </select>
          <label>Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} required placeholder="Write a respectful message..." />
          <p className="notice">Messages containing inappropriate language will be rejected.</p>
          <button className="primary-button">Send Message</button>
        </form>
        <div className="section-heading"><h2>Message History</h2></div>
        {messages.map(m => (
          <article className="list-card" key={m.id}>
            <div><strong>To: {m.to}</strong><p>{m.message}</p><small>{new Date(m.date).toLocaleString()}</small></div>
            <button className="small-button" onClick={() => archiveItem("message", m.id)}>Archive</button>
          </article>
        ))}
      </>
    );
  }

  function renderProfile() {
    return (
      <form className="form-card" onSubmit={saveProfile}>
        <h2>My Resident Profile</h2>
        <label>Full name</label>
        <input value={profile.name} disabled />
        <label>Nickname</label>
        <input value={profile.nickname || ""} onChange={e => setProfile({ ...profile, nickname: e.target.value })} />
        <label>Email address</label>
        <input type="email" value={profile.email || ""} onChange={e => setProfile({ ...profile, email: e.target.value })} />
        <label>Address</label>
        <input value={profile.address || ""} onChange={e => setProfile({ ...profile, address: e.target.value })} />
        <button className="primary-button">Save Profile</button>
      </form>
    );
  }

  function renderSettings() {
    return (
      <div className="settings-grid">
        <form className="form-card" onSubmit={saveProfile}>
          <h2>Account Settings</h2>
          <label>Nickname</label>
          <input value={profile.nickname || ""} onChange={e => setProfile({ ...profile, nickname: e.target.value })} />
          <label>Email address</label>
          <input type="email" value={profile.email || ""} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          <label>Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option>English</option><option>Filipino</option><option>Iloko</option>
          </select>
          <button className="primary-button">Save Settings</button>
        </form>
        <div className="form-card">
          <h2>Security and Privacy</h2>
          <p>Your account profile is editable. Password authentication is not enabled in this demo.</p>
          <p>Private resident information should only be accessible to authorized officials.</p>
          <p>Never share your password with other people.</p>
        </div>
      </div>
    );
  }

  function renderNotifications() {
    return notifications.map(n => (
      <article className="list-card" key={n.id}>
        <div><strong>{n.title}</strong><p>{n.body}</p><small>{n.date}</small></div>
      </article>
    ));
  }

  function renderArchive() {
    return archive.length ? archive.map(a => (
      <article className="list-card" key={`${a.type}-${a.id}`}>
        <div><strong>{a.type}</strong><p>Reference: {a.id}</p><small>{a.date}</small></div>
      </article>
    )) : <div className="empty-state">Your archive is empty.</div>;
  }

  function renderContact() {
    return (
      <div className="people-grid">
        {officials.map(o => (
          <article className="person-card" key={o.position}>
            <div className="avatar">☎</div>
            <h3>{o.name}</h3>
            <p>{o.position}</p>
            <button className="small-button" onClick={() => { setRecipient(o.name); setPage("Messages"); }}>Message Official</button>
          </article>
        ))}
      </div>
    );
  }

  const pageRenderers = {
    Dashboard: renderDashboard,
    Residents: renderResidents,
    Officials: renderOfficials,
    Announcements: renderAnnouncements,
    "Reports & Concerns": renderReports,
    "Request Certificate": renderCertificates,
    "Community Services": () => renderServices(community),
    "Health Services": () => renderServices(health),
    Messages: renderMessages,
    Notifications: renderNotifications,
    Archive: renderArchive,
    "Residents Profile": renderProfile,
    Settings: renderSettings,
    Contact: renderContact
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">M</div>
          <div><strong>BIMS MOCAG</strong><small>Barangay Information System</small></div>
        </div>
        <div className="sidebar-label">MAIN MENU</div>
        <nav>
          {menu.map(([name, icon]) => (
            <button key={name} className={`nav-link ${page === name ? "active" : ""}`} onClick={() => setPage(name)}>
              <span>{icon}</span>{name}
              {name === "Notifications" && notifications.length > 0 && <i>{notifications.length}</i>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-profile">
            <div className="avatar">L</div>
            <div><strong>{profile.nickname || profile.name}</strong><small>Resident Account</small></div>
          </div>
          <button className="logout" onClick={() => { setPage("Dashboard"); notify("You are back on the dashboard."); }}>↪ Return to Dashboard</button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-brand" onClick={() => setPage("Dashboard")}>☰ BIMS MOCAG</button>
          <div className="breadcrumb">Barangay Mocag <span>/</span> {page}</div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setPage("Notifications")}>♧ <span className="notification-dot"></span></button>
            <button className="account-button" onClick={() => setPage("Residents Profile")}><div className="avatar">L</div><span>{profile.nickname || profile.name}</span></button>
          </div>
        </header>

        <div className="content">
          <div className="page-title"><div><span className="eyebrow">MOCAG • COMMUNITY PORTAL</span><h1>{page}</h1></div><span className="date-label">{new Date().toLocaleDateString()}</span></div>
          {error && <div className="alert error">{error}<button onClick={() => setError("")}>×</button></div>}
          {success && <div className="alert success">{success}<button onClick={() => setSuccess("")}>×</button></div>}
          {loading ? <div className="empty-state">Loading BIMS data...</div> : pageRenderers[page]?.()}
          <footer>© 2026 Barangay Information Management System • MOCAG</footer>
        </div>
      </main>
    </div>
  );
}
