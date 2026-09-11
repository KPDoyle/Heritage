const projects = [
  { id: 1, code: "PC", name: "Pearl Coast Archive", client: "Gulf Heritage Foundation", market: "Bahrain", stage: "Client review", statusClass: "review", progress: 72, date: "18 Sep", lead: "PH", language: "English / Arabic", value: "£148,000", deliverables: "Illustrated bilingual book, digital archive and exhibition captions" },
  { id: 2, code: "AS", name: "Al Sadu: Living Craft", client: "Cultural Commission", market: "Saudi Arabia", stage: "In production", statusClass: "production", progress: 58, date: "02 Oct", lead: "ET", language: "English / Arabic", value: "£92,000", deliverables: "Research publication, artisan profiles and educational edition" },
  { id: 3, code: "RM", name: "Riyadh Civic Memory", client: "Urban Development Authority", market: "Saudi Arabia", stage: "Research", statusClass: "", progress: 34, date: "21 Nov", lead: "PH", language: "English / Arabic", value: "£215,000", deliverables: "City history, interactive timeline and limited presentation edition" },
  { id: 4, code: "SJ", name: "Seafarers of Jeddah", client: "Historic District Programme", market: "Saudi Arabia", stage: "Rights at risk", statusClass: "risk", progress: 46, date: "12 Dec", lead: "KM", language: "English / Arabic", value: "£126,000", deliverables: "Maritime history, oral histories and photography collection" }
];

const deadlines = [
  { day: "18", month: "Sep", title: "Pearl Coast bilingual proof", detail: "Client approval · Round 2" },
  { day: "24", month: "Sep", title: "Al Sadu image clearance", detail: "12 assets awaiting rights" },
  { day: "02", month: "Oct", title: "Production handover", detail: "Al Sadu: Living Craft" }
];

let currentView = "dashboard";
let activeFilter = "All";
let pendingApprovals = 6;

const appContent = document.getElementById("appContent");
const pageTitle = document.getElementById("pageTitle");
const toast = document.getElementById("toast");
const projectDialog = document.getElementById("projectDialog");
const detailDialog = document.getElementById("detailDialog");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function projectRows(list = projects) {
  if (!list.length) return `<div class="empty-state">No matching projects. Try a different search.</div>`;
  return `<div class="project-table">${list.map(project => `
    <article class="project-row" data-project-id="${project.id}">
      <div class="project-main"><span class="project-code">${project.code}</span><div><strong>${project.name}</strong><small>${project.client}</small></div></div>
      <div class="project-cell"><small>Stage</small><span class="status ${project.statusClass}">${project.stage}</span></div>
      <div class="project-cell hide-tablet"><small>Progress</small><strong>${project.progress}%</strong><div class="progress-track"><span style="width:${project.progress}%"></span></div></div>
      <div class="project-cell"><small>Next date</small><strong>${project.date}</strong></div>
      <button class="row-action" aria-label="Open ${project.name}">›</button>
    </article>`).join("")}</div>`;
}

function renderDashboard() {
  pageTitle.textContent = "Good morning";
  appContent.innerHTML = `
    <div class="hero-grid">
      <section class="feature-card">
        <span class="eyebrow">Portfolio pulse · September 2026</span>
        <h2>Six decisions need your attention.</h2>
        <p>Two bilingual proofs, three image permissions and one publication date are waiting for approval.</p>
        <div class="feature-actions"><button class="primary-button" data-view-jump="approvals">Review approvals</button><button class="secondary-button" data-view-jump="commissions">Open pipeline</button></div>
      </section>
      <aside class="deadline-card">
        <div class="card-title-row"><h3>Coming up</h3><button class="text-button" data-view-jump="commissions">View all</button></div>
        <div class="deadline-list">${deadlines.map(item => `<div class="deadline"><span class="date-box">${item.day}<small>${item.month}</small></span><div><strong>${item.title}</strong><span>${item.detail}</span></div></div>`).join("")}</div>
      </aside>
    </div>
    <section class="metrics">
      <div class="metric"><small>Active commissions</small><div class="metric-row"><strong>${projects.length}</strong><em>£581k value</em></div></div>
      <div class="metric"><small>Titles in production</small><div class="metric-row"><strong>7</strong><em>3 bilingual</em></div></div>
      <div class="metric"><small>Awaiting approval</small><div class="metric-row"><strong>${pendingApprovals}</strong><em>2 urgent</em></div></div>
      <div class="metric"><small>Rights requiring action</small><div class="metric-row"><strong>3</strong><em>30 days</em></div></div>
    </section>
    <div class="section-title-row"><h2>Active projects</h2><div class="filter-group">${["All","Saudi Arabia","Bahrain"].map(x => `<button class="filter-chip ${activeFilter === x ? "active" : ""}" data-filter="${x}">${x}</button>`).join("")}</div></div>
    <div id="projectRows">${projectRows(activeFilter === "All" ? projects : projects.filter(p => p.market === activeFilter))}</div>`;
  bindDynamicEvents();
}

function renderCommissions() {
  pageTitle.textContent = "Commissions";
  const columns = [
    { title: "Opportunity", items: [{name:"Oasis Architecture Collection",client:"Confidential destination partner",tag:"£180k potential"},{name:"Maritime Routes of Oman",client:"Museum consortium",tag:"Discovery"}] },
    { title: "Proposal", items: [{name:"Founding Families Archive",client:"Family office",tag:"Proposal due 26 Sep"},{name:"Crafts of the Peninsula",client:"Cultural foundation",tag:"Scope review"}] },
    { title: "Commissioned", items: projects.map(p => ({name:p.name,client:p.client,tag:p.stage})) }
  ];
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Commercial pipeline</span><h2>From opportunity to commissioned work.</h2><p>Qualify prospects, shape the brief and convert successful proposals into controlled publishing projects.</p></div><div class="board">${columns.map(c => `<section class="board-column"><div class="column-head"><strong>${c.title}</strong><span>${c.items.length}</span></div>${c.items.map(i => `<article class="board-card"><strong>${i.name}</strong><p>${i.client}</p><span class="tag">${i.tag}</span></article>`).join("")}</section>`).join("")}</div>`;
}

function renderPublications() {
  pageTitle.textContent = "Publications";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Publishing programme</span><h2>Every edition, one source of truth.</h2><p>Publication metadata, production milestones and commercial information synchronised with Consonance.</p></div>${projectRows(projects)} `;
  bindDynamicEvents();
}

function renderAssets() {
  pageTitle.textContent = "Assets & rights";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Rights intelligence</span><h2>Know what can be used, where and for how long.</h2><p>Track the provenance and permitted use of photography, maps, archive material and commissioned content.</p></div>
  <div class="panel-grid"><section class="panel"><h3>Rights requiring action</h3><div class="data-list">
    <div class="data-row"><div><strong>Jeddah harbour aerial, 1954</strong><small>Seafarers of Jeddah · Archive photograph</small></div><span class="tag">Expires 29 Sep</span></div>
    <div class="data-row"><div><strong>Pearling fleet collection</strong><small>Pearl Coast Archive · 18 images</small></div><span class="tag">Digital use missing</span></div>
    <div class="data-row"><div><strong>Al Sadu oral histories</strong><small>7 contributor releases</small></div><span class="tag">Signature required</span></div>
  </div></section><aside class="panel"><h3>Library health</h3><div class="metrics" style="grid-template-columns:1fr 1fr;margin:0 0 16px"><div class="metric"><small>Assets</small><div class="metric-row"><strong>2,418</strong></div></div><div class="metric"><small>Cleared</small><div class="metric-row"><strong>91%</strong></div></div></div><div class="alert">Three assets could delay publication unless their permissions are renewed this month.</div></aside></div>`;
}

function renderApprovals() {
  pageTitle.textContent = "Approvals";
  const approvals = [
    ["Pearl Coast Archive", "Arabic proof · Chapters 4–6", "Client review due today"],
    ["Al Sadu: Living Craft", "Image sequence · نسخة الصور", "Curatorial approval"],
    ["Riyadh Civic Memory", "Research synopsis", "Editorial approval"],
    ["Seafarers of Jeddah", "Photography permissions schedule", "Rights approval"]
  ];
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Decision queue</span><h2>Clear decisions, recorded once.</h2><p>Every response is attached to the correct version, reviewer and date.</p></div><div id="approvalList">${approvals.map((a,i) => `<article class="approval-card"><div><h3>${a[0]}</h3><p>${a[1]} · ${a[2]}</p></div><div class="approval-actions"><button class="secondary-button" data-request-change="${i}">Request change</button><button class="primary-button" data-approve="${i}">Approve</button></div></article>`).join("")}</div>`;
  document.querySelectorAll("[data-approve]").forEach(button => button.addEventListener("click", () => {
    const card = button.closest(".approval-card"); card.style.opacity = ".35"; button.disabled = true; pendingApprovals = Math.max(0, pendingApprovals - 1); document.getElementById("navApprovalCount").textContent = pendingApprovals; showToast("Approval recorded with version and timestamp");
  }));
  document.querySelectorAll("[data-request-change]").forEach(button => button.addEventListener("click", () => showToast("Change request opened for the review team")));
}

function renderIntegrations() {
  pageTitle.textContent = "Integrations";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Connected systems</span><h2>Publishing data without duplicate entry.</h2><p>The project workspace owns briefs and approvals. Consonance owns title metadata, contracts and royalties.</p></div>
    <section class="integration-card"><span class="integration-logo">C</span><div><strong>Consonance</strong><p>Titles, ISBNs, ONIX, contracts, rights, royalties and production dates</p></div><span class="connection">Connected</span></section>
    <div class="panel-grid" style="margin-top:16px"><section class="panel"><div class="card-title-row"><h3>Data exchange</h3><button id="runSync" class="primary-button">Run sync</button></div><div class="data-list"><div class="data-row"><div><strong>Projects → titles</strong><small>Approved commissions create publishing records</small></div><span class="status production">Active</span></div><div class="data-row"><div><strong>Production dates</strong><small>Publishing milestones return to project dashboards</small></div><span class="status production">Active</span></div><div class="data-row"><div><strong>Sales summaries</strong><small>Authorised commercial data for client reporting</small></div><span class="status production">Active</span></div></div></section><section class="panel"><h3>Last activity</h3><div class="sync-log" id="syncLog"><span>09:42:11</span> Sync completed<br>7 titles checked<br>2 records updated<br>0 conflicts detected</div></section></div>`;
  document.getElementById("runSync").addEventListener("click", runSync);
}

function runSync() {
  const button = document.getElementById("runSync");
  const log = document.getElementById("syncLog");
  if (button) { button.disabled = true; button.textContent = "Synchronising…"; }
  if (log) log.innerHTML = `<span>${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span> Connecting securely…<br>Checking title records…`;
  window.setTimeout(() => {
    if (log) log.innerHTML = `<span>${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span> Sync completed<br>7 titles checked<br>1 production date updated<br>0 conflicts detected`;
    if (button) { button.disabled = false; button.textContent = "Run sync"; }
    showToast("Consonance sync completed successfully");
  }, 1100);
}

function openProject(id) {
  const p = projects.find(item => item.id === Number(id));
  if (!p) return;
  document.getElementById("detailContent").innerHTML = `<div class="dialog-head"><div><span class="eyebrow">${p.market}</span><h2>${p.name}</h2><p style="color:var(--muted);margin:7px 0 0">${p.client}</p></div><button class="icon-button" data-detail-close aria-label="Close">×</button></div><div class="detail-meta"><div><small>Commission value</small><strong>${p.value}</strong></div><div><small>Language</small><strong>${p.language}</strong></div><div><small>Lead</small><strong>${p.lead}</strong></div></div><h3>Delivery</h3><p>${p.deliverables}</p><div class="milestone-list"><span class="milestone done">Brief approved</span><span class="milestone done">Research</span><span class="milestone current">${p.stage}</span><span class="milestone">Published</span></div><div class="dialog-actions"><button class="secondary-button" data-detail-close>Close</button><button class="primary-button" data-open-record>Open full record</button></div>`;
  detailDialog.showModal();
  document.querySelectorAll("[data-detail-close]").forEach(b => b.addEventListener("click", () => detailDialog.close()));
  document.querySelector("[data-open-record]").addEventListener("click", () => showToast("Full project workspace opened"));
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-project-id]").forEach(row => row.addEventListener("click", event => { if (!event.target.closest("button") || event.target.classList.contains("row-action")) openProject(row.dataset.projectId); }));
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => { activeFilter = button.dataset.filter; renderDashboard(); }));
  document.querySelectorAll("[data-view-jump]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.viewJump)));
}

function switchView(view) {
  currentView = view;
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === view));
  document.querySelector(".sidebar").classList.remove("open");
  const renderers = { dashboard: renderDashboard, commissions: renderCommissions, publications: renderPublications, assets: renderAssets, approvals: renderApprovals, integrations: renderIntegrations };
  (renderers[view] || renderDashboard)();
  window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => switchView(item.dataset.view)));
document.getElementById("mobileMenu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.getElementById("newProjectButton").addEventListener("click", () => projectDialog.showModal());
document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => projectDialog.close()));
document.getElementById("syncButton").addEventListener("click", () => { switchView("integrations"); window.setTimeout(runSync, 100); });

document.getElementById("projectForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = data.get("name").trim();
  const code = name.split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase();
  const rawDate = new Date(`${data.get("date")}T12:00:00`);
  projects.unshift({ id: Date.now(), code, name, client: data.get("client"), market: data.get("market"), stage: "Brief created", statusClass: "", progress: 8, date: rawDate.toLocaleDateString("en-GB", {day:"2-digit",month:"short"}), lead: data.get("lead"), language: "English / Arabic", value: "To scope", deliverables: data.get("deliverables") || "Deliverables to be agreed" });
  document.getElementById("navCommissionCount").textContent = projects.length;
  projectDialog.close(); event.currentTarget.reset(); showToast(`${name} created successfully`); switchView("commissions");
});

document.getElementById("globalSearch").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  if (!query) { if (currentView === "dashboard") renderDashboard(); return; }
  const matches = projects.filter(p => Object.values(p).some(value => String(value).toLowerCase().includes(query)));
  pageTitle.textContent = "Search";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">${matches.length} result${matches.length === 1 ? "" : "s"}</span><h2>Search results</h2><p>Matching projects, clients, markets and publication records.</p></div>${projectRows(matches)}`;
  bindDynamicEvents();
});

projectDialog.addEventListener("click", event => { if (event.target === projectDialog) projectDialog.close(); });
detailDialog.addEventListener("click", event => { if (event.target === detailDialog) detailDialog.close(); });

renderDashboard();
