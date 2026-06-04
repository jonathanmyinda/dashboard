const accounts = {
  "admin@churenaissance.cd": { password: "Admin@123", role: "admin", name: "Administrateur CHU" },
  "accueil@churenaissance.cd": { password: "Accueil@123", role: "reception", name: "Infirmiere accueil" },
  "medecin@churenaissance.cd": { password: "Medecin@123", role: "doctor", name: "Dr. Jean Kabongo" }
};

const roleLabels = {
  admin: "Administrateur",
  reception: "Infirmiere a l'accueil",
  doctor: "Medecin"
};

const navByRole = {
  admin: [
    ["dashboard", "▦", "Tableau de bord"], ["patients", "☤", "Patients"], ["appointments", "◷", "Rendez-vous"],
    ["doctors", "⚕", "Medecins"], ["nurses", "✚", "Infirmieres"], ["departments", "⌂", "Departements"],
    ["records", "▤", "Dossiers medicaux"], ["admissions", "⇥", "Admissions"], ["laboratory", "⌬", "Laboratoire"],
    ["pharmacy", "⚕", "Pharmacie"], ["billing", "□", "Facturation"], ["reports", "◫", "Rapports"],
    ["users", "◉", "Utilisateurs et roles"], ["logs", "≡", "Activite"], ["settings", "⚙", "Parametres"]
  ],
  reception: [
    ["dashboard", "▦", "Tableau de bord"], ["patients", "☤", "Patients"], ["register-patient", "+", "Nouveau patient"],
    ["appointments", "◷", "Rendez-vous"], ["waiting", "⌛", "Liste d'attente"], ["availability", "⚕", "Disponibilite"],
    ["notifications", "●", "Notifications"], ["profile", "◉", "Mon profil"]
  ],
  doctor: [
    ["dashboard", "▦", "Tableau de bord"], ["consultations", "◷", "Consultations"], ["my-patients", "☤", "Mes patients"],
    ["records", "▤", "Dossiers medicaux"], ["prescriptions", "℞", "Ordonnances"], ["lab-requests", "⌬", "Demandes labo"],
    ["lab-results", "✓", "Resultats labo"], ["schedule", "□", "Planning"], ["notifications", "●", "Notifications"], ["profile", "◉", "Mon profil"]
  ]
};

const permissions = {
  admin: new Set(["dashboard","patients","appointments","doctors","nurses","departments","records","admissions","laboratory","pharmacy","billing","reports","users","logs","settings","notifications","profile","add-user","roles","matrix","mobile","tablet"]),
  reception: new Set(["dashboard","patients","register-patient","appointments","waiting","availability","notifications","profile","mobile","tablet"]),
  doctor: new Set(["dashboard","consultations","my-patients","records","prescriptions","lab-requests","lab-results","schedule","notifications","profile","mobile","tablet"])
};

let state = {
  user: null,
  route: "login",
  dark: false,
  sidebarOpen: false,
  patientTab: "resume",
  patients: [
    { id:"PAT-2026-001", name:"Esther Kalonji", gender:"F", age:34, phone:"+243 812 410 322", dept:"Cardiologie", doctor:"Dr. Jean Kabongo", priority:"Urgence", status:"En attente", blood:"O+", reason:"Douleurs thoraciques" },
    { id:"PAT-2026-002", name:"Patrick Mbuyi", gender:"M", age:48, phone:"+243 899 221 114", dept:"Medecine interne", doctor:"Dr. Patrick Mbuyi", priority:"Normal", status:"En consultation", blood:"A+", reason:"Fievre persistante" },
    { id:"PAT-2026-003", name:"Grace Ilunga", gender:"F", age:9, phone:"+243 840 102 771", dept:"Pediatrie", doctor:"Dr. Grace Mutombo", priority:"Eleve", status:"Hospitalise", blood:"B-", reason:"Crise respiratoire" },
    { id:"PAT-2026-004", name:"Jonathan Kabeya", gender:"M", age:56, phone:"+243 817 009 441", dept:"Chirurgie", doctor:"Dr. Alain Tshibangu", priority:"Normal", status:"Consultation terminee", blood:"AB+", reason:"Controle post-operatoire" },
    { id:"PAT-2026-005", name:"Sarah Mutombo", gender:"F", age:29, phone:"+243 820 711 890", dept:"Gynecologie", doctor:"Dr. Sarah Ilunga", priority:"Normal", status:"Resultat disponible", blood:"O-", reason:"Consultation prenatale" }
  ],
  appointments: [
    { time:"08:30", patient:"Esther Kalonji", doctor:"Dr. Jean Kabongo", dept:"Cardiologie", status:"Confirme" },
    { time:"09:15", patient:"Grace Ilunga", doctor:"Dr. Grace Mutombo", dept:"Pediatrie", status:"Arrive" },
    { time:"10:00", patient:"Sarah Mutombo", doctor:"Dr. Sarah Ilunga", dept:"Gynecologie", status:"En attente" },
    { time:"11:45", patient:"Alain Tshimanga", doctor:"Dr. Alain Tshibangu", dept:"Chirurgie", status:"Reporte" }
  ],
  notifications: [
    "Resultat laboratoire disponible pour Sarah Mutombo",
    "Alerte stock pharmacie: Ceftriaxone faible",
    "Nouvelle admission aux urgences"
  ],
  modal: null,
  toasts: []
};

const doctors = [
  ["Dr. Jean Kabongo", "Cardiologie", "Disponible", "12 patients"],
  ["Dr. Grace Mutombo", "Pediatrie", "En consultation", "9 patients"],
  ["Dr. Sarah Ilunga", "Gynecologie", "Disponible", "8 patients"],
  ["Dr. Alain Tshibangu", "Chirurgie", "Bloc operatoire", "6 patients"],
  ["Dr. Patrick Mbuyi", "Medecine interne", "Disponible", "11 patients"]
];
const departments = ["Cardiologie","Pediatrie","Gynecologie","Chirurgie","Urgences","Laboratoire","Radiologie","Medecine interne"];
const app = document.getElementById("app");

function setState(patch) {
  state = { ...state, ...patch };
  render();
}

function toast(message) {
  state.toasts.push(message);
  render();
  setTimeout(() => { state.toasts.shift(); render(); }, 2600);
}

function go(route) {
  if (!state.user && !["login","forgot","reset"].includes(route)) return setState({ route:"login" });
  state.route = route;
  state.sidebarOpen = false;
  render();
}

function hasAccess(route) {
  if (!state.user) return false;
  if (route === "dashboard") return true;
  return permissions[state.user.role].has(route);
}

function login(email, password, role) {
  const account = accounts[email.trim().toLowerCase()];
  if (!account || account.password !== password || (role && role !== "auto" && role !== account.role)) return false;
  state.user = { email, ...account };
  state.route = "dashboard";
  toast(`Bienvenue, ${account.name}`);
  return true;
}

function logout() {
  state.user = null;
  state.route = "login";
  render();
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function badge(status) {
  const s = String(status);
  const cls = /Urgence|Reporte|faible|Refuse/i.test(s) ? "danger" : /attente|Bloc|Eleve|Paiement/i.test(s) ? "warn" : /Disponible|Confirme|terminee|Arrive|disponible/i.test(s) ? "success" : "teal";
  return `<span class="badge ${cls}">${esc(s)}</span>`;
}

function render() {
  document.body.classList.toggle("dark", state.dark);
  app.innerHTML = !state.user ? authView() : shellView();
  bindEvents();
}

function authView() {
  const reset = state.route === "reset";
  const forgot = state.route === "forgot";
  const title = reset ? "Reinitialiser le mot de passe" : forgot ? "Mot de passe oublie" : "Connexion securisee";
  const body = reset ? resetForm() : forgot ? forgotForm() : loginForm();
  return `
    <main class="login-shell">
      <section class="login-panel">
        ${brand()}
        <h1>${title}</h1>
        <p>Plateforme hospitaliere operationnelle pour les equipes du CHU Renaissance.</p>
        ${body}
      </section>
      <section class="login-art">
        <div class="facility-card">
          <div>
            <h2>CHU Renaissance Hospital Management System</h2>
            <p>Centre Hospitalier Universitaire de Reference. Coordination des patients, consultations, laboratoires, equipes medicales et rapports dans une experience unique.</p>
          </div>
        </div>
      </section>
    </main>`;
}

function brand() {
  return `<div class="brand-row"><div class="brand-mark"></div><div><div class="brand-title">CHU Renaissance</div><div class="brand-subtitle">Centre Hospitalier Universitaire de Reference</div></div></div>`;
}

function loginForm() {
  return `<form id="loginForm">
    <div class="field"><label>Email ou nom d'utilisateur</label><input name="email" value="admin@churenaissance.cd" autocomplete="username"></div>
    <div class="field"><label>Mot de passe</label><input name="password" type="password" value="Admin@123" autocomplete="current-password"></div>
    <div class="field"><label>Role</label><select name="role"><option value="auto">Detection automatique</option><option value="admin">Administrateur</option><option value="reception">Infirmiere accueil</option><option value="doctor">Medecin</option></select></div>
    <div class="check-row"><label><input type="checkbox" checked> Se souvenir de moi</label><button type="button" class="link-btn" data-route="forgot">Mot de passe oublie</button></div>
    <div class="error-text" id="loginError"></div>
    <button class="btn primary" type="submit" style="width:100%">Se connecter</button>
    <div class="demo-accounts">
      <strong>Comptes de demonstration</strong><br>
      admin@churenaissance.cd / Admin@123<br>
      accueil@churenaissance.cd / Accueil@123<br>
      medecin@churenaissance.cd / Medecin@123<br>
      <button class="btn" type="button" data-fill="admin">Admin</button>
      <button class="btn" type="button" data-fill="reception">Accueil</button>
      <button class="btn" type="button" data-fill="doctor">Medecin</button>
    </div>
  </form>`;
}

function forgotForm() {
  return `<form id="forgotForm">
    <div class="field"><label>Email professionnel</label><input name="email" value="admin@churenaissance.cd"></div>
    <button class="btn primary" type="submit" style="width:100%">Envoyer le lien</button>
    <div style="margin-top:16px"><button type="button" class="link-btn" data-route="login">Retour connexion</button></div>
  </form>`;
}

function resetForm() {
  return `<form id="resetForm">
    <div class="field"><label>Nouveau mot de passe</label><input type="password" value="Nouveau@123"></div>
    <div class="field"><label>Confirmer</label><input type="password" value="Nouveau@123"></div>
    <button class="btn primary" type="submit" style="width:100%">Reinitialiser</button>
  </form>`;
}

function shellView() {
  const denied = !hasAccess(state.route);
  const title = denied ? "Acces refuse" : titleForRoute(state.route);
  return `
    <div class="app-shell">
      <aside class="sidebar ${state.sidebarOpen ? "open" : ""}">
        ${brand()}
        <nav class="nav-list">${navByRole[state.user.role].map(n => navButton(n)).join("")}</nav>
        <div class="sidebar-foot">${roleLabels[state.user.role]}<br>${state.user.email}</div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-left">
            <button class="btn icon menu-btn" data-action="menu">☰</button>
            <div><div class="page-kicker">${roleLabels[state.user.role]}</div><div class="page-title">${title}</div></div>
          </div>
          <div class="topbar-actions">
            <div class="field search" style="margin:0"><input id="globalSearch" placeholder="Rechercher patient, medecin, dossier"></div>
            <button class="btn icon" title="Mode sombre" data-action="dark">${state.dark ? "☀" : "☾"}</button>
            <button class="btn icon" title="Notifications" data-route="notifications">●</button>
            <button class="profile-pill" data-route="profile"><span class="avatar">${state.user.name[0]}</span><span>${esc(state.user.name)}</span></button>
            <button class="btn" data-action="logout">Sortir</button>
          </div>
        </header>
        <section class="content">${denied ? accessDenied() : screen(state.route)}</section>
      </main>
    </div>
    ${modalView()}
    <div class="toast-stack">${state.toasts.map(t => `<div class="toast">${esc(t)}</div>`).join("")}</div>`;
}

function navButton([route, icon, label]) {
  return `<button class="nav-item ${state.route === route ? "active" : ""}" data-route="${route}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`;
}

function titleForRoute(route) {
  return ({
    dashboard:"Tableau de bord", patients:"Patients", appointments:"Rendez-vous", doctors:"Medecins", nurses:"Infirmieres",
    departments:"Departements", records:"Dossiers medicaux", admissions:"Admissions", laboratory:"Laboratoire", pharmacy:"Pharmacie",
    billing:"Facturation", reports:"Rapports et analyses", users:"Utilisateurs et roles", logs:"Journaux d'activite", settings:"Parametres",
    "register-patient":"Nouveau patient", waiting:"Liste d'attente", availability:"Disponibilite des medecins",
    consultations:"Consultations du jour", "my-patients":"Mes patients", prescriptions:"Ordonnances", "lab-requests":"Demandes laboratoire",
    "lab-results":"Resultats d'analyse", schedule:"Planning", notifications:"Centre de notifications", profile:"Profil utilisateur",
    roles:"Roles et permissions", matrix:"Matrice des permissions", "add-user":"Ajouter utilisateur",
    mobile:"Dashboard mobile", tablet:"Dashboard tablette"
  })[route] || route;
}

function screen(route) {
  if (route === "dashboard") return dashboard();
  if (route === "users") return usersScreen();
  if (route === "roles") return rolesScreen();
  if (route === "matrix") return `<div class="screen">${permissionMatrix()}</div>`;
  if (route === "add-user") return addUserScreen();
  if (route === "reports") return reportsScreen();
  if (route === "logs") return logsScreen();
  if (route === "settings") return settingsScreen();
  if (route === "register-patient") return patientFormScreen();
  if (route === "patients" || route === "my-patients") return patientsScreen(route === "my-patients");
  if (route === "appointments") return appointmentsScreen();
  if (route === "waiting") return waitingScreen();
  if (route === "availability" || route === "doctors") return doctorsScreen();
  if (route === "consultations") return consultationsScreen();
  if (route === "records") return recordsScreen();
  if (route === "prescriptions") return prescriptionScreen();
  if (route === "lab-requests") return labRequestScreen();
  if (route === "lab-results") return labResultsScreen();
  if (route === "schedule") return calendarScreen("Planning medical");
  if (route === "departments") return departmentsScreen();
  if (route === "nurses") return genericList("Infirmieres actives", ["Beatrice Ndaya","Mireille Lukusa","Aline Kanku","Clarisse Monga"], "Unite de soins");
  if (route === "admissions") return genericList("Admissions", ["Urgences - Lit U12","Cardiologie - Lit C08","Pediatrie - Lit P14"], "Occupation hospitaliere");
  if (route === "laboratory") return labResultsScreen(true);
  if (route === "pharmacy") return genericList("Pharmacie", ["Ceftriaxone 1g","Paracetamol 500mg","Amoxicilline","SRO"], "Stock et alertes");
  if (route === "billing") return billingScreen();
  if (route === "notifications") return notificationsScreen();
  if (route === "profile") return profileScreen();
  if (route === "mobile") return mobileScreen();
  if (route === "tablet") return tabletScreen();
  return empty("Ecran pret pour le developpement", "Ce module est inclus dans la structure de navigation et les permissions.");
}

function dashboard() {
  if (state.user.role === "reception") return receptionDashboard();
  if (state.user.role === "doctor") return doctorDashboard();
  return adminDashboard();
}

function kpis(items) {
  return `<div class="grid kpi-grid">${items.map(i => `<article class="card kpi"><div class="kpi-top"><span>${i[0]}</span><span>${i[3] || ""}</span></div><div class="kpi-value">${i[1]}</div><div class="trend ${i[4] || ""}">${i[2]}</div></article>`).join("")}</div>`;
}

function adminDashboard() {
  return `<div class="screen">
    ${kpis([["Total patients","12 486","+8,4% ce mois","☤"],["Rendez-vous aujourd'hui","128","24 urgences","◷","warn"],["Medecins disponibles","42","91% couverture","⚕"],["Taux occupation","82%","+6 lits libres","⌂"],["Cas urgents","14","3 critiques","!","danger"],["Revenu mensuel","$248k","+12,1%","□"],["Infirmieres actives","96","18 services","✚"],["Alertes systeme","5","2 a traiter","●","warn"]])}
    <div class="grid two-col">
      <section class="card pad"><div class="card-title"><h3>Performance par departement</h3><span>Derniers 30 jours</span></div>${barChart(["Cardio",70],["Pediatrie",58],["Gyneco",74],["Urgences",90],["Labo",64],["Chir",52])}</section>
      <section class="card pad"><div class="card-title"><h3>Occupation hospitaliere</h3><span>Lits utilises</span></div><div class="donut"></div></section>
    </div>
    <div class="grid two-col">
      ${activityCard()}
      ${alertsCard()}
    </div>
  </div>`;
}

function receptionDashboard() {
  return `<div class="screen">
    ${kpis([["Patients en attente","37","9 priorites elevees","⌛","warn"],["Nouveaux enregistrements","18","+4 depuis 10h","+"],["Rendez-vous aujourd'hui","86","72 confirmes","◷"],["Medecins disponibles","19","8 departements","⚕"]])}
    <div class="toolbar"><div class="toolbar-group">
      <button class="btn primary" data-route="register-patient">+ Nouveau patient</button>
      <button class="btn teal" data-modal="appointment">◷ Programmer</button>
      <button class="btn" data-route="patients">⌕ Rechercher</button>
    </div></div>
    <div class="grid two-col">${waitingScreen(true)}${doctorsScreen(true)}</div>
  </div>`;
}

function doctorDashboard() {
  return `<div class="screen">
    ${kpis([["Consultations du jour","18","5 terminees","◷"],["Patients assignes","46","7 a risque","☤","warn"],["Resultats en attente","9","3 critiques","⌬","danger"],["Notes recentes","24","+6 aujourd'hui","▤"]])}
    <div class="toolbar"><div class="toolbar-group">
      <button class="btn primary" data-route="consultations">▶ Demarrer consultation</button>
      <button class="btn teal" data-route="prescriptions">℞ Ordonnance</button>
      <button class="btn" data-route="lab-requests">⌬ Demande labo</button>
    </div></div>
    <div class="grid two-col">${consultationsScreen(true)}${alertsCard("Alertes patients critiques")}</div>
  </div>`;
}

function barChart(...bars) {
  return `<div class="chart-bars">${bars.map(([label,val]) => `<div class="bar" style="height:${val}%"><span>${label}</span></div>`).join("")}</div>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function patientsScreen(mine=false) {
  const rows = state.patients.map(p => [p.id, p.name, p.age, p.dept, p.doctor, badge(p.status), `<button class="btn" data-patient="${p.id}">Ouvrir</button>`]);
  return `<div class="screen">
    <div class="toolbar"><div class="toolbar-group"><div class="field search" style="margin:0"><input placeholder="Filtrer les patients"></div><select class="btn"><option>Tous les statuts</option><option>En attente</option><option>Urgence</option></select></div>${mine ? "" : `<button class="btn primary" data-route="register-patient">+ Nouveau patient</button>`}</div>
    <section class="card">${table(["ID","Patient","Age","Departement","Medecin","Statut","Action"], rows)}</section>
    <div class="grid three-col">${state.patients.slice(0,3).map(patientCard).join("")}</div>
  </div>`;
}

function patientCard(p) {
  return `<article class="card patient-card"><header><div class="patient-avatar">${p.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><div class="item-title">${p.name}</div><div class="item-sub">${p.id} · ${p.dept}</div></div></header><div>${badge(p.status)} ${badge(p.priority)}</div><button class="btn" data-patient="${p.id}">Voir le dossier</button></article>`;
}

function patientProfile(p) {
  const tabs = ["resume","histoire","consultations","facturation"].map(t => `<button class="tab ${state.patientTab===t?"active":""}" data-tab="${t}">${({resume:"Resume",histoire:"Historique",consultations:"Consultations",facturation:"Facturation"})[t]}</button>`).join("");
  const sensitive = state.user.role === "reception" && state.patientTab !== "resume";
  return `<div class="screen">
    <div class="toolbar"><div><h2 style="margin:0">${p.name}</h2><div class="item-sub">${p.id} · ${p.gender} · ${p.age} ans · Groupe ${p.blood}</div></div><div class="toolbar-group"><button class="btn" data-modal="appointment">◷ Rendez-vous</button>${state.user.role === "doctor" ? `<button class="btn primary" data-route="consultations">Demarrer consultation</button>` : ""}</div></div>
    <section class="card pad">${tabs}<div style="padding-top:18px">${sensitive ? accessDenied("Dossier medical protege", "L'accueil peut voir uniquement les informations administratives de base.") : patientTabContent(p)}</div></section>
  </div>`;
}

function patientTabContent(p) {
  if (state.patientTab === "histoire") return list(["Hypertension familiale","Allergie penicilline","Hospitalisation 2024 - Pneumonie","Vaccins a jour"]);
  if (state.patientTab === "consultations") return consultationsScreen(true);
  if (state.patientTab === "facturation") return state.user.role === "admin" ? billingScreen(true) : accessDenied("Donnees financieres protegees", "Module reserve a l'administration.");
  return `<div class="grid three-col">
    ${infoBox("Telephone", p.phone)}${infoBox("Adresse", "Kinshasa, RDC")}${infoBox("Contact urgence", "+243 810 552 004")}
    ${infoBox("Motif", p.reason)}${infoBox("Departement", p.dept)}${infoBox("Medecin assigne", p.doctor)}
  </div>`;
}

function infoBox(label, value) { return `<div class="list-item"><div class="item-main"><span class="item-sub">${label}</span><span class="item-title">${value}</span></div></div>`; }

function patientFormScreen() {
  return `<div class="screen">
    <section class="card pad">
      <div class="card-title"><h3>Enregistrement patient</h3><span>ID genere automatiquement</span></div>
      <form id="patientForm">${patientFields()}<div class="form-actions"><button class="btn" type="reset">Annuler</button><button class="btn primary" type="submit">Enregistrer</button></div></form>
    </section>
  </div>`;
}

function patientFields() {
  return `<div class="form-row three">
    <div class="field"><label>Patient ID</label><input name="id" value="PAT-2026-${String(state.patients.length+1).padStart(3,"0")}" readonly></div>
    <div class="field"><label>Nom complet</label><input name="name" value="Alain Tshimanga" required></div>
    <div class="field"><label>Genre</label><select name="gender"><option>M</option><option>F</option></select></div>
  </div>
  <div class="form-row three">
    <div class="field"><label>Date de naissance</label><input type="date" value="1988-04-12"></div>
    <div class="field"><label>Age</label><input name="age" type="number" value="38"></div>
    <div class="field"><label>Telephone</label><input name="phone" value="+243 812 009 448"></div>
  </div>
  <div class="form-row">
    <div class="field"><label>Adresse</label><input value="Kinshasa, Gombe"></div>
    <div class="field"><label>Contact urgence</label><input value="+243 899 001 221"></div>
  </div>
  <div class="form-row three">
    <div class="field"><label>Groupe sanguin</label><select name="blood"><option>O+</option><option>A+</option><option>B-</option><option>AB+</option><option>O-</option></select></div>
    <div class="field"><label>Departement</label><select name="dept">${departments.map(d=>`<option>${d}</option>`).join("")}</select></div>
    <div class="field"><label>Priorite</label><select name="priority"><option>Normal</option><option>Eleve</option><option>Urgence</option></select></div>
  </div>
  <div class="form-row">
    <div class="field"><label>Medecin assigne</label><select name="doctor">${doctors.map(d=>`<option>${d[0]}</option>`).join("")}</select></div>
    <div class="field"><label>Motif de visite</label><input name="reason" value="Consultation initiale"></div>
  </div>
  <div class="field"><label>Notes</label><textarea>Patient oriente vers le service apres triage.</textarea></div>`;
}

function appointmentsScreen() {
  return `<div class="screen">
    <div class="toolbar"><div class="toolbar-group"><button class="btn primary" data-modal="appointment">+ Nouveau rendez-vous</button><button class="btn" data-route="waiting">Liste d'attente</button></div></div>
    <section class="card">${table(["Heure","Patient","Medecin","Departement","Statut"], state.appointments.map(a => [a.time,a.patient,a.doctor,a.dept,badge(a.status)]))}</section>
    ${calendarScreen("Calendrier des rendez-vous")}
  </div>`;
}

function waitingScreen(embedded=false) {
  const rows = state.patients.filter(p => /attente|Urgence|Hospitalise/i.test(p.status + p.priority)).map(p => [p.id,p.name,p.dept,badge(p.priority),p.doctor,`<button class="btn" data-action="checkin" data-id="${p.id}">Arrive</button>`]);
  const body = `<section class="card">${table(["ID","Patient","Service","Priorite","Medecin","Action"], rows)}</section>`;
  return embedded ? `<div>${body}</div>` : `<div class="screen"><div class="toolbar"><h3>Patients en attente aujourd'hui</h3><button class="btn primary" data-route="register-patient">+ Ajouter</button></div>${body}</div>`;
}

function doctorsScreen(embedded=false) {
  const rows = doctors.map(d => [d[0],d[1],badge(d[2]),d[3],`<button class="btn" data-modal="appointment">Assigner</button>`]);
  const body = `<section class="card">${table(["Medecin","Specialite","Disponibilite","Charge","Action"], rows)}</section>`;
  return embedded ? `<div>${body}</div>` : `<div class="screen"><section class="card">${table(["Medecin","Specialite","Disponibilite","Charge","Action"], rows)}</section></div>`;
}

function consultationsScreen(embedded=false) {
  const rows = state.patients.slice(0,4).map((p,i) => [`${8+i}:30`, p.name, p.reason, badge(i===0?"Urgence":i===1?"En consultation":"En attente"), `<button class="btn primary" data-modal="consultation" data-id="${p.id}">Ouvrir</button>`]);
  const body = `<section class="card">${table(["Heure","Patient","Motif","Statut","Action"], rows)}</section>`;
  return embedded ? `<div>${body}</div>` : `<div class="screen"><div class="toolbar"><button class="btn primary" data-modal="consultation">+ Consultation</button></div>${body}</div>`;
}

function recordsScreen() {
  const p = state.patients[0];
  return patientProfile(p);
}

function prescriptionScreen() {
  return formCard("Nouvelle ordonnance", `<div class="form-row"><div class="field"><label>Patient</label><select>${state.patients.map(p=>`<option>${p.name}</option>`)}</select></div><div class="field"><label>Date</label><input type="date" value="2026-06-04"></div></div><div class="field"><label>Prescription</label><textarea>Paracetamol 500mg, 1 comprime toutes les 8h pendant 5 jours.</textarea></div><div class="field"><label>Instructions</label><textarea>Revoir le patient si fievre persistante.</textarea></div>`, "Creer ordonnance");
}

function labRequestScreen() {
  return formCard("Demande d'examens laboratoire", `<div class="form-row"><div class="field"><label>Patient</label><select>${state.patients.map(p=>`<option>${p.name}</option>`)}</select></div><div class="field"><label>Priorite</label><select><option>Routine</option><option>Urgent</option></select></div></div><div class="form-row three"><label><input type="checkbox" checked> Hemogramme</label><label><input type="checkbox"> Glycemie</label><label><input type="checkbox" checked> CRP</label></div><div class="field"><label>Notes cliniques</label><textarea>Suspicion d'infection; confirmer par bilan inflammatoire.</textarea></div>`, "Envoyer demande");
}

function labResultsScreen(admin=false) {
  const rows = [["LAB-4412","Sarah Mutombo","Hemogramme",badge("Resultat disponible"),"Aujourd'hui"],["LAB-4413","Esther Kalonji","Troponine",badge("Urgence"),"Aujourd'hui"],["LAB-4409","Grace Ilunga","CRP",badge("En attente"),"Hier"]];
  return `<div class="screen"><section class="card">${table(["Reference","Patient","Examen","Statut","Date"], rows)}</section>${admin ? reportsScreen(true) : ""}</div>`;
}

function usersScreen() {
  return `<div class="screen">
    <div class="toolbar"><div class="toolbar-group"><button class="btn primary" data-modal="user">+ Ajouter utilisateur</button><button class="btn" data-route="add-user">Formulaire complet</button><button class="btn" data-route="roles">Roles</button><button class="btn" data-route="matrix">Matrice permissions</button></div></div>
    <section class="card">${table(["Nom","Email","Role","Statut","Derniere activite"], [["Administrateur CHU","admin@churenaissance.cd",badge("Administrateur"),badge("Actif"),"Il y a 4 min"],["Infirmiere accueil","accueil@churenaissance.cd",badge("Accueil"),badge("Actif"),"Il y a 11 min"],["Dr. Jean Kabongo","medecin@churenaissance.cd",badge("Medecin"),badge("Actif"),"Il y a 2 min"]])}</section>
    ${permissionMatrix()}
  </div>`;
}

function addUserScreen() {
  return formCard("Ajouter un utilisateur", `<div class="form-row"><div class="field"><label>Nom complet</label><input value="Nouvel utilisateur"></div><div class="field"><label>Email</label><input value="user@churenaissance.cd"></div></div><div class="form-row three"><div class="field"><label>Role</label><select><option>Reception</option><option>Medecin</option><option>Administrateur</option></select></div><div class="field"><label>Departement</label><select>${departments.map(d=>`<option>${d}</option>`).join("")}</select></div><div class="field"><label>Statut</label><select><option>Actif</option><option>Invite</option><option>Suspendu</option></select></div></div><div class="field"><label>Permissions additionnelles</label><textarea>Acces lecture aux rendez-vous et notifications de service.</textarea></div>`, "Creer utilisateur");
}

function rolesScreen() {
  return `<div class="screen"><div class="grid three-col">
    ${roleCard("Administrateur", "Acces complet a la plateforme", ["Utilisateurs", "Rapports", "Facturation", "Parametres"])}
    ${roleCard("Accueil", "Flux reception et orientation patient", ["Patients", "Rendez-vous", "Attente", "Disponibilite"])}
    ${roleCard("Medecin", "Soins et dossiers des patients assignes", ["Consultations", "Ordonnances", "Laboratoire", "Planning"])}
  </div>${permissionMatrix()}</div>`;
}

function roleCard(title, description, items) {
  return `<article class="card pad"><div class="card-title"><h3>${title}</h3>${badge("Role")}</div><p class="item-sub">${description}</p>${list(items)}</article>`;
}

function permissionMatrix() {
  const rows = ["Patients","Rendez-vous","Dossiers medicaux complets","Facturation","Parametres systeme","Utilisateurs","Laboratoire"].map(x => [x, x==="Patients"?"✓":"✓", /Facturation|Parametres|Utilisateurs/.test(x)?"-":"✓", /Facturation|Parametres|Utilisateurs/.test(x)?"-":"✓"]);
  return `<section class="card pad"><div class="card-title"><h3>Matrice des permissions</h3><span>Controle d'acces par role</span></div><div class="permission-grid"><div class="head">Module</div><div class="head">Admin</div><div class="head">Accueil</div><div class="head">Medecin</div>${rows.flatMap(r => r.map(c => `<div>${c}</div>`)).join("")}</div></section>`;
}

function reportsScreen(embedded=false) {
  const content = `<section class="card pad"><div class="card-title"><h3>Analyses operationnelles</h3><button class="btn" data-action="export">Exporter</button></div>${barChart(["Jan",42],["Fev",55],["Mar",64],["Avr",58],["Mai",72],["Juin",86])}</section><section class="card pad"><div class="card-title"><h3>Indicateurs financiers</h3><span>Administration seulement</span></div>${kpis([["Recettes","$248k","+12%","□"],["Paiements en attente","$32k","18 dossiers","□","warn"],["Cout pharmacie","$41k","Stable","⚕"],["Taux recouvrement","93%","+2%","✓"]])}</section>`;
  return embedded ? content : `<div class="screen">${content}</div>`;
}

function logsScreen() {
  return `<div class="screen">${activityCard()}<section class="card">${table(["Heure","Utilisateur","Action","Adresse IP"], [["14:11","admin@churenaissance.cd","Creation utilisateur","10.0.4.21"],["13:58","accueil@churenaissance.cd","Enregistrement patient","10.0.4.31"],["13:44","medecin@churenaissance.cd","Ordonnance creee","10.0.4.52"]])}</section></div>`;
}

function settingsScreen() {
  return formCard("Parametres systeme", `<div class="form-row"><div class="field"><label>Nom hopital</label><input value="CHU Renaissance"></div><div class="field"><label>Fuseau horaire</label><select><option>Africa/Kinshasa</option><option>Europe/Paris</option></select></div></div><div class="form-row"><div class="field"><label>Duree consultation par defaut</label><input value="30 minutes"></div><div class="field"><label>Langue</label><select><option>Francais</option></select></div></div>`, "Enregistrer");
}

function departmentsScreen() {
  return `<div class="screen"><section class="card">${table(["Departement","Chef de service","Lits","Performance"], departments.map((d,i)=>[d, doctors[i%doctors.length][0], 12+i*3, badge(i%3===0?"Sature":"Normal")]))}</section></div>`;
}

function billingScreen(embedded=false) {
  const body = `<section class="card">${table(["Dossier","Patient","Montant","Statut"], [["FAC-1001","Esther Kalonji","$84",badge("Paiement en attente")],["FAC-1002","Grace Ilunga","$120",badge("Regle")],["FAC-1003","Jonathan Kabeya","$310",badge("Regle")]])}</section>`;
  return embedded ? body : `<div class="screen">${kpis([["Recettes jour","$8 420","+7%","□"],["Impayes","$1 260","12 patients","□","warn"],["Assurances","36","5 en validation","✓"],["Factures","92","+18","□"]])}${body}</div>`;
}

function calendarScreen(title) {
  const days = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
  return `<section class="card pad"><div class="card-title"><h3>${title}</h3><span>Juin 2026</span></div><div class="calendar">${days.map((d,i)=>`<div class="day"><strong>${d} ${i+1}</strong>${i<5?badge(`${8+i} RDV`):badge("Garde")}</div>`).join("")}</div></section>`;
}

function notificationsScreen() {
  return `<div class="screen"><section class="card pad"><div class="card-title"><h3>Notifications</h3><button class="btn">Tout marquer lu</button></div>${list(state.notifications)}</section></div>`;
}

function profileScreen() {
  return formCard("Profil utilisateur", `<div class="form-row"><div class="field"><label>Nom</label><input value="${esc(state.user.name)}"></div><div class="field"><label>Email</label><input value="${esc(state.user.email)}"></div></div><div class="form-row"><div class="field"><label>Role</label><input value="${roleLabels[state.user.role]}" readonly></div><div class="field"><label>Telephone</label><input value="+243 810 000 000"></div></div>`, "Mettre a jour");
}

function mobileScreen() {
  return `<div class="screen"><div class="mobile-preview"><div style="padding:16px">${brand()}${kpis([["Patients","37","+4",""],["RDV","86","72 confirmes",""]])}<div style="margin-top:14px">${list(["Nouveau patient","Liste d'attente","Notifications"])}</div></div></div></div>`;
}

function tabletScreen() {
  return `<div class="screen"><div class="tablet-preview"><div style="padding:18px">${adminDashboard()}</div></div></div>`;
}

function formCard(title, fields, submitLabel) {
  return `<div class="screen"><section class="card pad"><div class="card-title"><h3>${title}</h3></div><form class="simForm">${fields}<div class="form-actions"><button class="btn" type="reset">Annuler</button><button class="btn primary" type="submit">${submitLabel}</button></div></form></section></div>`;
}

function activityCard(title="Activites recentes") {
  return `<section class="card pad"><div class="card-title"><h3>${title}</h3><span>Temps reel</span></div>${list(["Patient Esther Kalonji oriente en cardiologie","Dr. Grace Mutombo a publie une note medicale","Stock pharmacie mis a jour","Nouveau role Reception superviseur cree"])}</section>`;
}

function alertsCard(title="Alertes systeme") {
  return `<section class="card pad"><div class="card-title"><h3>${title}</h3><span>Priorite</span></div>${list(["Urgence cardiologie en attente depuis 14 min","Sauvegarde systeme completee","3 resultats laboratoire critiques","Occupation urgences a 91%"])}</section>`;
}

function list(items) {
  return `<div class="list">${items.map((x,i)=>`<div class="list-item"><div class="item-main"><span class="item-title">${esc(x)}</span><span class="item-sub">${i+1} · CHU Renaissance</span></div>${badge(i%2?"Info":"Actif")}</div>`).join("")}</div>`;
}

function genericList(title, items, sub) {
  return `<div class="screen"><section class="card pad"><div class="card-title"><h3>${title}</h3><button class="btn primary">+ Ajouter</button></div>${list(items.map(i => `${i} · ${sub}`))}</section></div>`;
}

function empty(title, text) {
  return `<section class="card empty-state"><div class="big-icon">▦</div><h2>${title}</h2><p>${text}</p></section>`;
}

function accessDenied(title="Acces refuse", text="Vous n'avez pas les permissions necessaires pour consulter cette page.") {
  return `<section class="card denied"><div class="big-icon">⛔</div><h2>${title}</h2><p>${text}</p><button class="btn primary" data-route="dashboard">Retour au tableau de bord</button></section>`;
}

function modalView() {
  if (!state.modal) return "";
  const close = `<button class="btn icon" data-modal-close>×</button>`;
  const forms = {
    appointment: ["Programmer un rendez-vous", `<form class="simForm"><div class="form-row"><div class="field"><label>Patient</label><select>${state.patients.map(p=>`<option>${p.name}</option>`).join("")}</select></div><div class="field"><label>Medecin</label><select>${doctors.map(d=>`<option>${d[0]}</option>`).join("")}</select></div></div><div class="form-row"><div class="field"><label>Date</label><input type="date" value="2026-06-04"></div><div class="field"><label>Heure</label><input type="time" value="10:30"></div></div><div class="form-actions"><button class="btn" type="button" data-modal-close>Annuler</button><button class="btn primary" type="submit">Confirmer</button></div></form>`],
    user: ["Ajouter un utilisateur", `<form class="simForm"><div class="form-row"><div class="field"><label>Nom</label><input value="Nouvel utilisateur"></div><div class="field"><label>Email</label><input value="user@churenaissance.cd"></div></div><div class="form-row"><div class="field"><label>Role</label><select><option>Reception</option><option>Medecin</option><option>Administrateur</option></select></div><div class="field"><label>Departement</label><select>${departments.map(d=>`<option>${d}</option>`).join("")}</select></div></div><div class="form-actions"><button class="btn" type="button" data-modal-close>Annuler</button><button class="btn primary" type="submit">Creer utilisateur</button></div></form>`],
    consultation: ["Consultation medicale", `<form class="simForm"><div class="field"><label>Symptomes</label><textarea>Douleurs thoraciques, fatigue, essoufflement.</textarea></div><div class="field"><label>Diagnostic</label><textarea>Suspicion angor stable. ECG et troponine demandes.</textarea></div><div class="field"><label>Notes medicales</label><textarea>Patient conscient, TA 145/90, saturation 97%.</textarea></div><div class="form-row"><div class="field"><label>Plan de traitement</label><input value="Surveillance + bilan cardiologique"></div><div class="field"><label>Suivi</label><input type="date" value="2026-06-11"></div></div><div class="form-actions"><button class="btn" type="button" data-route="prescriptions">Ordonnance</button><button class="btn" type="button" data-route="lab-requests">Demande labo</button><button class="btn primary" type="submit">Marquer terminee</button></div></form>`]
  };
  const [title, content] = forms[state.modal] || ["Confirmation", `<p>Action confirmee.</p>`];
  return `<div class="modal-backdrop"><div class="modal"><div class="modal-head"><h2>${title}</h2>${close}</div>${content}</div></div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-route]").forEach(el => el.addEventListener("click", () => go(el.dataset.route)));
  document.querySelectorAll("[data-action='menu']").forEach(el => el.addEventListener("click", () => setState({ sidebarOpen: !state.sidebarOpen })));
  document.querySelectorAll("[data-action='dark']").forEach(el => el.addEventListener("click", () => setState({ dark: !state.dark })));
  document.querySelectorAll("[data-action='logout']").forEach(el => el.addEventListener("click", logout));
  document.querySelectorAll("[data-action='export']").forEach(el => el.addEventListener("click", () => toast("Rapport exporte au format CSV")));
  document.querySelectorAll("[data-action='checkin']").forEach(el => el.addEventListener("click", () => toast("Arrivee patient confirmee et carte generee")));
  document.querySelectorAll("[data-modal]").forEach(el => el.addEventListener("click", () => setState({ modal: el.dataset.modal })));
  document.querySelectorAll("[data-modal-close]").forEach(el => el.addEventListener("click", () => setState({ modal: null })));
  document.querySelectorAll("[data-tab]").forEach(el => el.addEventListener("click", () => setState({ patientTab: el.dataset.tab })));
  document.querySelectorAll("[data-patient]").forEach(el => el.addEventListener("click", () => { state.route = "records"; state.selectedPatient = el.dataset.patient; render(); }));
  document.querySelectorAll("[data-fill]").forEach(el => el.addEventListener("click", () => {
    const map = { admin:["admin@churenaissance.cd","Admin@123"], reception:["accueil@churenaissance.cd","Accueil@123"], doctor:["medecin@churenaissance.cd","Medecin@123"] };
    document.querySelector("[name=email]").value = map[el.dataset.fill][0];
    document.querySelector("[name=password]").value = map[el.dataset.fill][1];
  }));
  const loginEl = document.getElementById("loginForm");
  if (loginEl) loginEl.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(loginEl);
    if (!login(f.get("email"), f.get("password"), f.get("role"))) document.getElementById("loginError").textContent = "Identifiants ou role incorrects.";
  });
  const forgot = document.getElementById("forgotForm");
  if (forgot) forgot.addEventListener("submit", e => { e.preventDefault(); toast("Lien de reinitialisation envoye"); go("reset"); });
  const reset = document.getElementById("resetForm");
  if (reset) reset.addEventListener("submit", e => { e.preventDefault(); toast("Mot de passe reinitialise"); go("login"); });
  const patientForm = document.getElementById("patientForm");
  if (patientForm) patientForm.addEventListener("submit", e => {
    e.preventDefault();
    const f = new FormData(patientForm);
    state.patients.unshift({ id:f.get("id"), name:f.get("name"), gender:f.get("gender"), age:f.get("age"), phone:f.get("phone"), dept:f.get("dept"), doctor:f.get("doctor"), priority:f.get("priority"), status:"En attente", blood:f.get("blood"), reason:f.get("reason") });
    state.modal = "appointment";
    toast("Patient enregistre avec succes");
    render();
  });
  document.querySelectorAll(".simForm").forEach(form => form.addEventListener("submit", e => { e.preventDefault(); state.modal = null; toast("Action enregistree avec succes"); render(); }));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && state.modal) setState({ modal:null }); }, { once:true });
}

render();
