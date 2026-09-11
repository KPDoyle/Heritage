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

const creatorTasks = [
  { id: 1, task: "Revise Chapter 6 after curator notes", project: "Pearl Coast Archive", due: "Today", done: false },
  { id: 2, task: "Upload interview transcript and consent", project: "Al Sadu: Living Craft", due: "16 Sep", done: false },
  { id: 3, task: "Confirm citations for harbour chronology", project: "Seafarers of Jeddah", due: "18 Sep", done: false },
  { id: 4, task: "Review Arabic terminology queries", project: "Pearl Coast Archive", due: "20 Sep", done: false },
  { id: 5, task: "Submit September expense record", project: "Riyadh Civic Memory", due: "25 Sep", done: false }
];

const chapters = [
  { name: "01 · The shore before oil", words: "6,840 words", status: "Approved", className: "production" },
  { name: "02 · Boats, banks and merchants", words: "8,210 words", status: "Editorial review", className: "review" },
  { name: "03 · The pearling season", words: "7,460 words", status: "Author revision", className: "risk" },
  { name: "04 · Memory and modernity", words: "4,120 words", status: "Drafting", className: "" }
];

const approvalQueue = [
  { project: "Pearl Coast Archive", item: "Arabic proof · Chapters 4–6", owner: "Client review", due: "Today" },
  { project: "Al Sadu: Living Craft", item: "Image sequence · نسخة الصور", owner: "Curatorial review", due: "Today" },
  { project: "Riyadh Civic Memory", item: "Research synopsis", owner: "Editorial review", due: "16 Sep" },
  { project: "Seafarers of Jeddah", item: "Photography permissions schedule", owner: "Rights review", due: "18 Sep" },
  { project: "Pearl Coast Archive", item: "Limited-edition materials", owner: "Client approval", due: "20 Sep" },
  { project: "Al Sadu: Living Craft", item: "Contributor biography set", owner: "Author approval", due: "22 Sep" }
];

let currentView = "dashboard";
let activeFilter = "All";
let workspaceMode = localStorage.getItem("heritage-role") || "publisher";
let actionHandler = null;

const appContent = document.getElementById("appContent");
const pageTitle = document.getElementById("pageTitle");
const toast = document.getElementById("toast");
const projectDialog = document.getElementById("projectDialog");
const detailDialog = document.getElementById("detailDialog");
const actionDialog = document.getElementById("actionDialog");

function esc(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function setNavCounts() {
  document.getElementById("navCommissionCount").textContent = projects.length;
  document.getElementById("navApprovalCount").textContent = approvalQueue.length;
  document.getElementById("navTaskCount").textContent = creatorTasks.filter(task => !task.done).length;
}

function openAction({ eyebrow = "Workspace action", title, submit = "Save", fields, onSubmit }) {
  document.getElementById("actionEyebrow").textContent = eyebrow;
  document.getElementById("actionTitle").textContent = title;
  document.getElementById("actionSubmit").textContent = submit;
  document.getElementById("actionFields").innerHTML = fields;
  actionHandler = onSubmit;
  actionDialog.showModal();
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
  pageTitle.textContent = workspaceMode === "publisher" ? "Good morning" : workspaceMode === "creator" ? "Creator overview" : "Customer overview";
  const roleCopy = {
    publisher: ["Portfolio control", "Six decisions need your attention.", "Move commissions from brief to publication while controlling rights, versions, budgets and bilingual approvals.", "Review approvals", "approvals", "Open pipeline", "commissions"],
    creator: ["Your working day", "One clear place to create and deliver.", "See the agreed brief, latest feedback, deadlines, rights and payment position without searching email chains.", "Open creator studio", "creator", "Upload latest draft", "creator"],
    client: ["Commission visibility", "Know exactly where every deliverable stands.", "Review progress, approve the correct version, control changes and see how completed content performs.", "Open client portal", "client", "Review approvals", "approvals"]
  }[workspaceMode];
  appContent.innerHTML = `
    <div class="hero-grid">
      <section class="feature-card">
        <span class="eyebrow">${roleCopy[0]} · September 2026</span>
        <h2>${roleCopy[1]}</h2><p>${roleCopy[2]}</p>
        <div class="feature-actions"><button class="primary-button" data-view-jump="${roleCopy[4]}">${roleCopy[3]}</button><button class="secondary-button" data-view-jump="${roleCopy[6]}">${roleCopy[5]}</button></div>
      </section>
      <aside class="deadline-card">
        <div class="card-title-row"><h3>Coming up</h3><button class="text-button" data-view-jump="commissions">View all</button></div>
        <div class="deadline-list">${deadlines.map(item => `<div class="deadline"><span class="date-box">${item.day}<small>${item.month}</small></span><div><strong>${item.title}</strong><span>${item.detail}</span></div></div>`).join("")}</div>
      </aside>
    </div>
    <section class="metrics">
      <div class="metric"><small>Active commissions</small><div class="metric-row"><strong>${projects.length}</strong><em>£581k value</em></div></div>
      <div class="metric"><small>Creator tasks open</small><div class="metric-row"><strong>${creatorTasks.filter(t => !t.done).length}</strong><em>1 due today</em></div></div>
      <div class="metric"><small>Awaiting approval</small><div class="metric-row"><strong>${approvalQueue.length}</strong><em>2 urgent</em></div></div>
      <div class="metric"><small>Rights requiring action</small><div class="metric-row"><strong>3</strong><em>30 days</em></div></div>
    </section>
    <div class="section-title-row"><h2>Active projects</h2><div class="filter-group">${["All","Saudi Arabia","Bahrain"].map(x => `<button class="filter-chip ${activeFilter === x ? "active" : ""}" data-filter="${x}">${x}</button>`).join("")}</div></div>
    <div id="projectRows">${projectRows(activeFilter === "All" ? projects : projects.filter(p => p.market === activeFilter))}</div>`;
  bindDynamicEvents();
}

function renderFeatures() {
  pageTitle.textContent = "Platform features";
  const capabilityGroups = [
    ["Commission management", ["Opportunities and proposals", "Structured customer briefs", "Costed scopes and schedules", "Contributor commissioning", "Budget and change control"]],
    ["Content production", ["Assignments and task tracking", "Chapter-level manuscript progress", "Versioned file delivery", "Research sources and citations", "Bilingual editorial workflow"]],
    ["Governance and approval", ["Version-specific review", "Formal approvals and timestamps", "Controlled reviewer access", "Rights and consent records", "Licence expiry alerts"]],
    ["Publishing operations", ["Edition and ISBN metadata", "Print, ebook and digital outputs", "Production milestones", "ONIX distribution", "Stock and fulfilment visibility"]],
    ["Commercial reporting", ["Customer billing and budgets", "Contributor fees and milestones", "Royalty statements", "Sales by channel and territory", "Licensing income"]],
    ["Connected systems", ["Consonance integration", "Digital asset libraries", "Translation platforms", "Finance and payments", "Webstores and distributors"]]
  ];
  appContent.innerHTML = `<section class="features-hero"><div><span class="eyebrow">Heritage Publishing OS</span><h2>One platform from commission to cultural impact.</h2><p>Heritage OS brings the customer, publisher and content team into one controlled workflow while connecting to specialist publishing systems.</p></div><div class="lifecycle"><span>Brief</span><i>→</i><span>Create</span><i>→</i><span>Approve</span><i>→</i><span>Publish</span><i>→</i><span>Measure</span></div></section>
    <div class="section-title-row feature-section-heading"><div><span class="eyebrow">Designed around every participant</span><h2>Three connected workspaces</h2></div></div>
    <section class="audience-grid">
      <article><span class="audience-icon">P</span><h3>For publishers</h3><p>Control the commercial pipeline, programme, contributors, versions, rights, production and reporting.</p><ul><li>Portfolio and deadline visibility</li><li>Fewer duplicated records</li><li>Earlier risk identification</li><li>Reliable project profitability</li></ul><button class="text-button" data-view-jump="dashboard">Open publisher view →</button></article>
      <article><span class="audience-icon creator">C</span><h3>For content providers</h3><p>Give authors, researchers, photographers, editors and translators one clear place to create and deliver.</p><ul><li>One accepted brief and deadline</li><li>Versioned content delivery</li><li>Consolidated feedback</li><li>Transparent fees and royalties</li></ul><button class="text-button" data-view-jump="creator">Open creator studio →</button></article>
      <article><span class="audience-icon client">O</span><h3>For customers</h3><p>Give commissioning organisations a live view of progress, cost, decisions, rights and completed outputs.</p><ul><li>Progress without status meetings</li><li>Controlled reviews and approvals</li><li>Visible scope and budget</li><li>Evidence of cultural impact</li></ul><button class="text-button" data-view-jump="client">Open customer portal →</button></article>
    </section>
    <div class="section-title-row feature-section-heading"><div><span class="eyebrow">Complete operating model</span><h2>Core platform capabilities</h2></div><span class="feature-count">30 capabilities</span></div>
    <section class="capability-grid">${capabilityGroups.map(group => `<article><h3>${group[0]}</h3><ul>${group[1].map(item => `<li>${item}</li>`).join("")}</ul></article>`).join("")}</section>
    <section class="outcome-panel"><div><span class="eyebrow">What the platform changes</span><h2>A traceable publishing process—not a collection of email threads.</h2></div><div class="outcome-grid"><span><strong>One source of truth</strong>for briefs, content, rights and decisions</span><span><strong>Faster delivery</strong>with clear owners, dates and approvals</span><span><strong>Lower risk</strong>through provenance and permission control</span><span><strong>Stronger relationships</strong>with transparent creator and customer portals</span></div></section>`;
  bindDynamicEvents();
}

function renderCommissions() {
  pageTitle.textContent = "Commissions";
  const columns = [
    { title: "Opportunity", items: [{name:"Oasis Architecture Collection",client:"Confidential destination partner",tag:"£180k potential"},{name:"Maritime Routes of Oman",client:"Museum consortium",tag:"Discovery"}] },
    { title: "Proposal", items: [{name:"Founding Families Archive",client:"Family office",tag:"Proposal due 26 Sep"},{name:"Crafts of the Peninsula",client:"Cultural foundation",tag:"Scope review"}] },
    { title: "Commissioned", items: projects.map(p => ({name:p.name,client:p.client,tag:p.stage})) }
  ];
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Commercial pipeline</span><h2>From opportunity to commissioned work.</h2><p>Capture the customer brief, build a costed scope, contract contributors and convert the winning proposal into a controlled delivery plan.</p></div><div class="board">${columns.map(c => `<section class="board-column"><div class="column-head"><strong>${c.title}</strong><span>${c.items.length}</span></div>${c.items.map(i => `<article class="board-card"><strong>${i.name}</strong><p>${i.client}</p><span class="tag">${i.tag}</span></article>`).join("")}</section>`).join("")}</div>
  <section class="benefit-strip"><div><span class="eyebrow">Customer benefit</span><strong>A documented scope and price before work begins</strong></div><div><span class="eyebrow">Creator benefit</span><strong>One accepted brief with deliverables, fees and dates</strong></div><div><span class="eyebrow">Publisher benefit</span><strong>A reliable pipeline and capacity forecast</strong></div></section>`;
}

function renderCreator() {
  pageTitle.textContent = "Creator studio";
  const openTasks = creatorTasks.filter(task => !task.done);
  appContent.innerHTML = `<div class="workspace-banner creator-banner"><div><span class="eyebrow">Content provider workspace</span><h2>Create, collaborate and get paid.</h2><p>For authors, researchers, photographers, illustrators, editors and translators.</p></div><div class="banner-actions"><button class="secondary-button" data-creator-action="message">Message editor</button><button class="primary-button" data-creator-action="upload">Upload new version</button></div></div>
    <section class="metrics compact-metrics">
      <div class="metric"><small>Active assignments</small><div class="metric-row"><strong>3</strong><em>2 commissioned</em></div></div>
      <div class="metric"><small>Words delivered</small><div class="metric-row"><strong>42.6k</strong><em>68% complete</em></div></div>
      <div class="metric"><small>Tasks open</small><div class="metric-row"><strong>${openTasks.length}</strong><em>1 due today</em></div></div>
      <div class="metric"><small>Approved fees</small><div class="metric-row"><strong>£18.4k</strong><em>£7.2k paid</em></div></div>
    </section>
    <div class="workspace-grid">
      <section class="panel feature-workspace"><div class="card-title-row"><div><span class="eyebrow">Current assignment</span><h3>Pearl Coast Archive</h3></div><span class="status review">Author revision</span></div>
        <div class="assignment-summary"><div class="progress-orbit"><strong>72%</strong><span>complete</span></div><div><strong>Next: Chapter 6 revision</strong><p>Editorial notes consolidated into one marked-up version. Due today at 17:00.</p><button class="primary-button" data-creator-action="upload">Upload revision</button></div></div>
        <div class="brief-facts"><div><small>Agreed scope</small><strong>55,000 words + captions</strong></div><div><small>Fee</small><strong>£14,500</strong></div><div><small>Next payment</small><strong>On manuscript approval</strong></div></div>
      </section>
      <aside class="panel"><div class="card-title-row"><h3>My tasks</h3><button class="text-button" data-creator-action="task">Add task</button></div><div class="task-list">${openTasks.map(task => `<label class="task-item"><input type="checkbox" data-complete-task="${task.id}"><span><strong>${task.task}</strong><small>${task.project} · ${task.due}</small></span></label>`).join("") || `<div class="empty-state small-empty">All caught up.</div>`}</div></aside>
    </div>
    <div class="section-title-row"><div><span class="eyebrow">Manuscript workspace</span><h2>Chapter progress</h2></div><button class="secondary-button" data-creator-action="source">＋ Add research source</button></div>
    <section class="chapter-table">${chapters.map(chapter => `<article><div><strong>${chapter.name}</strong><small>${chapter.words}</small></div><span class="status ${chapter.className}">${chapter.status}</span><button class="row-action" data-chapter="${chapter.name}" aria-label="Open ${chapter.name}">›</button></article>`).join("")}</section>
    <section class="tool-grid">
      ${creatorTool("⌁", "Brief & contract", "Scope, deliverables, fee, rights and deadlines agreed in one record.", "Open brief", "brief")}
      ${creatorTool("↥", "Versioned delivery", "Upload manuscripts and media without losing the approved version or feedback trail.", "Upload draft", "upload")}
      ${creatorTool("⌕", "Research & citations", "Store sources, interview consent, notes and citations beside the content they support.", "Add source", "source")}
      ${creatorTool("文", "Bilingual workflow", "Resolve translation queries and compare English and Arabic content side by side.", "Review queries", "translation")}
      ${creatorTool("✦", "Metadata assistant", "Prepare synopsis, contributor biography, keywords, captions and accessibility text.", "Generate metadata", "metadata")}
      ${creatorTool("£", "Fees & royalties", "See approved milestones, invoices, royalty statements and payment status.", "View earnings", "royalties")}
    </section>
    <section class="benefit-panel"><span class="eyebrow">Why creators use it</span><h2>Less administration. Fewer conflicting comments. Faster approval.</h2><div class="benefit-list"><span>One current brief and manuscript version</span><span>Feedback attached to the exact passage or asset</span><span>Rights and attribution recorded before publication</span><span>Transparent fees, milestones and royalties</span></div></section>`;
  bindCreatorEvents();
}

function creatorTool(icon, title, copy, action, key) {
  return `<article class="tool-card"><span class="tool-icon">${icon}</span><h3>${title}</h3><p>${copy}</p><button class="text-button" data-creator-action="${key}">${action} →</button></article>`;
}

function renderClient() {
  pageTitle.textContent = "Client portal";
  appContent.innerHTML = `<div class="workspace-banner client-banner"><div><span class="eyebrow">Customer workspace</span><h2>Pearl Coast Archive</h2><p>A live view of scope, progress, decisions, budget and completed deliverables.</p></div><div class="banner-actions"><button class="secondary-button" data-client-action="message">Message project team</button><button class="primary-button" data-view-jump="approvals">Review 2 decisions</button></div></div>
    <section class="metrics compact-metrics">
      <div class="metric"><small>Programme status</small><div class="metric-row"><strong>72%</strong><em>On schedule</em></div></div>
      <div class="metric"><small>Approved budget</small><div class="metric-row"><strong>£148k</strong><em>68% committed</em></div></div>
      <div class="metric"><small>Open decisions</small><div class="metric-row"><strong>2</strong><em>Due today</em></div></div>
      <div class="metric"><small>Rights cleared</small><div class="metric-row"><strong>94%</strong><em>126 assets</em></div></div>
    </section>
    <div class="workspace-grid client-grid">
      <section class="panel"><div class="card-title-row"><h3>Delivery timeline</h3><span class="tag">Launch 12 Dec</span></div><div class="timeline">
        <div class="timeline-item done"><span></span><div><strong>Brief and research plan</strong><small>Approved 14 May</small></div></div>
        <div class="timeline-item done"><span></span><div><strong>Research and content development</strong><small>Completed 29 Aug</small></div></div>
        <div class="timeline-item current"><span></span><div><strong>Bilingual editorial review</strong><small>In progress · 72%</small></div></div>
        <div class="timeline-item"><span></span><div><strong>Design and production</strong><small>Starts 23 Sep</small></div></div>
        <div class="timeline-item"><span></span><div><strong>Publication and digital launch</strong><small>Target 12 Dec</small></div></div>
      </div></section>
      <aside class="panel"><div class="card-title-row"><h3>Budget control</h3><button class="text-button" data-client-action="budget">View detail</button></div><div class="budget-bar"><span style="width:68%"></span></div><div class="budget-legend"><span><i class="used"></i>Committed £100.6k</span><span><i></i>Remaining £47.4k</span></div><div class="alert success-alert">No unapproved changes. Forecast remains within the agreed budget.</div><button class="secondary-button full-button" data-client-action="change">Request scope change</button></aside>
    </div>
    <div class="section-title-row"><div><span class="eyebrow">Delivery room</span><h2>Latest deliverables</h2></div><button class="secondary-button" data-client-action="share">Invite reviewer</button></div>
    <section class="deliverable-table">
      ${deliverable("Bilingual proof · Chapters 4–6", "PDF · Version 2.3", "Awaiting your approval", "review", "Review", "approvals")}
      ${deliverable("Curated image sequence", "126 assets · Version 4", "Approved 08 Sep", "production", "Download", "download")}
      ${deliverable("Exhibition narrative", "DOCX · Version 1.8", "Editorial review", "", "Preview", "preview")}
      ${deliverable("Digital archive structure", "Interactive prototype", "Customer testing", "review", "Open", "preview")}
    </section>
    <section class="client-capabilities">
      ${clientCapability("Decide with confidence", "Approvals always reference the correct version, owner and deadline.")}
      ${clientCapability("Control scope and cost", "Every change shows its budget, programme and deliverable impact before approval.")}
      ${clientCapability("Protect the institution", "Rights, consent, provenance, attribution and permitted use stay attached to every asset.")}
      ${clientCapability("Prove value after launch", "Receive sales, readership, engagement, education and exhibition impact reporting.")}
    </section>`;
  bindDynamicEvents();
  bindClientEvents();
}

function deliverable(name, meta, status, className, action, key) {
  return `<article><div><strong>${name}</strong><small>${meta}</small></div><span class="status ${className}">${status}</span><button class="secondary-button" data-client-action="${key}">${action}</button></article>`;
}

function clientCapability(title, copy) {
  return `<article><span>✓</span><div><strong>${title}</strong><p>${copy}</p></div></article>`;
}

function renderPublications() {
  pageTitle.textContent = "Publications";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Publishing programme</span><h2>Every edition, one source of truth.</h2><p>Track manuscript, design, metadata, ISBN, print, ebook, digital archive and exhibition outputs together.</p></div>
    <section class="publication-summary"><div><small>Titles in production</small><strong>7</strong></div><div><small>Formats managed</small><strong>Book · ebook · web · exhibition</strong></div><div><small>Metadata complete</small><strong>86%</strong></div><div><small>Territories</small><strong>GCC · UK · Global</strong></div></section>
    ${projectRows(projects)}
    <section class="feature-matrix"><h3>Publication record includes</h3><div><span>ISBN and edition metadata</span><span>Contributors and credits</span><span>Production schedule</span><span>Print specifications</span><span>ONIX distribution</span><span>Marketing assets</span><span>Stock and fulfilment</span><span>Digital deliverables</span></div></section>`;
  bindDynamicEvents();
}

function renderAssets() {
  pageTitle.textContent = "Assets & rights";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Rights intelligence</span><h2>Know what can be used, where and for how long.</h2><p>Track provenance, contributor consent, attribution and permitted use across print, digital, exhibition and marketing.</p></div>
  <div class="panel-grid"><section class="panel"><div class="card-title-row"><h3>Rights requiring action</h3><button class="text-button" data-rights-action="asset">Add asset</button></div><div class="data-list">
    <div class="data-row"><div><strong>Jeddah harbour aerial, 1954</strong><small>Archive photograph · Print and exhibition</small></div><button class="tag button-tag" data-rights-action="renew">Renew by 29 Sep</button></div>
    <div class="data-row"><div><strong>Pearling fleet collection</strong><small>18 images · Digital use not included</small></div><button class="tag button-tag" data-rights-action="extend">Extend licence</button></div>
    <div class="data-row"><div><strong>Al Sadu oral histories</strong><small>7 contributor releases · Signature required</small></div><button class="tag button-tag" data-rights-action="request">Request consent</button></div>
  </div></section><aside class="panel"><h3>Library health</h3><div class="metrics mini-metrics"><div class="metric"><small>Assets</small><div class="metric-row"><strong>2,418</strong></div></div><div class="metric"><small>Cleared</small><div class="metric-row"><strong>91%</strong></div></div></div><div class="asset-types"><span>Photography <strong>1,284</strong></span><span>Documents <strong>642</strong></span><span>Audio/video <strong>318</strong></span><span>Maps/artwork <strong>174</strong></span></div></aside></div>
  <section class="benefit-strip"><div><span class="eyebrow">For creators</span><strong>Credits and reuse rights stay visible</strong></div><div><span class="eyebrow">For customers</span><strong>Evidence that every published asset is cleared</strong></div><div><span class="eyebrow">For publishers</span><strong>Fewer rights delays and licensing risks</strong></div></section>`;
  document.querySelectorAll("[data-rights-action]").forEach(button => button.addEventListener("click", () => showToast(`${button.textContent.trim()} workflow opened`)));
}

function renderApprovals() {
  pageTitle.textContent = "Approvals";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Decision queue</span><h2>Clear decisions, recorded once.</h2><p>Comment, compare versions, request a change or approve. Every response is attached to the reviewer, record and timestamp.</p></div><div class="approval-toolbar"><div class="filter-group"><button class="filter-chip active">All ${approvalQueue.length}</button><button class="filter-chip">Customer 2</button><button class="filter-chip">Editorial 2</button><button class="filter-chip">Rights 1</button></div><button class="secondary-button" data-approval-action="invite">Invite reviewer</button></div><div id="approvalList">${approvalQueue.map((approval, index) => `<article class="approval-card"><div><span class="approval-due">${approval.due}</span><h3>${approval.project}</h3><p>${approval.item} · ${approval.owner}</p></div><div class="approval-actions"><button class="secondary-button" data-request-change="${index}">Request change</button><button class="primary-button" data-approve="${index}">Approve</button></div></article>`).join("")}</div>`;
  document.querySelectorAll("[data-approve]").forEach(button => button.addEventListener("click", () => {
    const index = Number(button.dataset.approve);
    approvalQueue.splice(index, 1);
    setNavCounts();
    showToast("Approval recorded with version, reviewer and timestamp");
    renderApprovals();
  }));
  document.querySelectorAll("[data-request-change]").forEach(button => button.addEventListener("click", () => openFeedbackForm()));
  document.querySelector("[data-approval-action='invite']").addEventListener("click", () => openInviteForm());
}

function renderRoyalties() {
  pageTitle.textContent = "Sales & royalties";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Commercial reporting</span><h2>Transparent earnings from every edition and territory.</h2><p>Bring distributor sales, direct orders, licensing income, contributor shares and payment statements into one view.</p></div>
    <section class="metrics"><div class="metric"><small>Net sales YTD</small><div class="metric-row"><strong>£184k</strong><em>+18%</em></div></div><div class="metric"><small>Contributor royalties</small><div class="metric-row"><strong>£21.6k</strong><em>£14.4k paid</em></div></div><div class="metric"><small>Direct editions sold</small><div class="metric-row"><strong>3,842</strong><em>42% direct</em></div></div><div class="metric"><small>Licensing income</small><div class="metric-row"><strong>£38k</strong><em>6 licences</em></div></div></section>
    <div class="panel-grid"><section class="panel"><div class="card-title-row"><h3>Contributor statements</h3><button class="secondary-button" data-royalty-action="export">Export report</button></div><div class="data-list">
      <div class="data-row"><div><strong>Peter Harrigan · Pearl Coast Archive</strong><small>Author royalty · H1 2026</small></div><button class="text-button" data-royalty-action="statement">£4,820 · View</button></div>
      <div class="data-row"><div><strong>Layla Al-Mansouri · Al Sadu</strong><small>Photography licence · Milestone 2</small></div><button class="text-button" data-royalty-action="statement">£2,400 · View</button></div>
      <div class="data-row"><div><strong>Research contributor pool</strong><small>Riyadh Civic Memory · Approved fees</small></div><button class="text-button" data-royalty-action="statement">£7,180 · View</button></div>
    </div></section><aside class="panel"><h3>Income by channel</h3><div class="bar-chart"><div><span>Commissioned editions</span><i style="--value:88%"></i><strong>£112k</strong></div><div><span>Direct sales</span><i style="--value:48%"></i><strong>£42k</strong></div><div><span>Licensing</span><i style="--value:42%"></i><strong>£38k</strong></div><div><span>Trade distribution</span><i style="--value:31%"></i><strong>£27k</strong></div></div></aside></div>`;
  document.querySelectorAll("[data-royalty-action]").forEach(button => button.addEventListener("click", () => showToast(button.dataset.royaltyAction === "export" ? "Royalty report prepared for export" : "Contributor statement opened")));
}

function renderIntegrations() {
  pageTitle.textContent = "Integrations";
  const systems = [
    ["C", "Consonance", "Titles, ISBN, ONIX, contracts, rights, royalties and production dates", "Connected"],
    ["D", "Digital asset library", "Master files, renditions, provenance, consent and expiry dates", "Ready"],
    ["T", "Translation workflow", "Bilingual segments, terminology, reviewer queries and approvals", "Ready"],
    ["F", "Finance & payments", "Purchase orders, contributor invoices, customer billing and royalty payments", "Configure"],
    ["W", "Webstore & distributors", "Orders, inventory, sales reporting and fulfilment status", "Configure"]
  ];
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">Connected publishing</span><h2>One workflow across the specialist tools you already use.</h2><p>Heritage OS coordinates people, decisions and project context while connected systems retain their specialist records.</p></div><div class="integration-list">${systems.map(system => `<section class="integration-card"><span class="integration-logo">${system[0]}</span><div><strong>${system[1]}</strong><p>${system[2]}</p></div><span class="connection ${system[3] === "Configure" ? "muted-connection" : ""}">${system[3]}</span></section>`).join("")}</div>
    <div class="panel-grid integration-panels"><section class="panel"><div class="card-title-row"><h3>Data exchange</h3><button id="runSync" class="primary-button">Run sync</button></div><div class="data-list"><div class="data-row"><div><strong>Projects → titles</strong><small>Approved commissions create publishing records</small></div><span class="status production">Active</span></div><div class="data-row"><div><strong>Production dates</strong><small>Publishing milestones return to project dashboards</small></div><span class="status production">Active</span></div><div class="data-row"><div><strong>Sales summaries</strong><small>Authorised commercial data powers client and creator reporting</small></div><span class="status production">Active</span></div></div></section><section class="panel"><h3>Last activity</h3><div class="sync-log" id="syncLog"><span>09:42:11</span> Sync completed<br>7 titles checked<br>2 records updated<br>0 conflicts detected</div></section></div>`;
  document.getElementById("runSync").addEventListener("click", runSync);
}

function runSync() {
  const button = document.getElementById("runSync");
  const log = document.getElementById("syncLog");
  if (button) { button.disabled = true; button.textContent = "Synchronising…"; }
  if (log) log.innerHTML = `<span>${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span> Connecting securely…<br>Checking title and asset records…`;
  window.setTimeout(() => {
    if (log) log.innerHTML = `<span>${new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span> Sync completed<br>7 titles checked<br>1 production date updated<br>0 conflicts detected`;
    if (button) { button.disabled = false; button.textContent = "Run sync"; }
    showToast("Connected records synchronised successfully");
  }, 1100);
}

function bindCreatorEvents() {
  document.querySelectorAll("[data-complete-task]").forEach(input => input.addEventListener("change", () => {
    const task = creatorTasks.find(item => item.id === Number(input.dataset.completeTask));
    if (task) task.done = true;
    setNavCounts(); showToast("Task completed and editor notified"); renderCreator();
  }));
  document.querySelectorAll("[data-creator-action]").forEach(button => button.addEventListener("click", () => handleCreatorAction(button.dataset.creatorAction)));
  document.querySelectorAll("[data-chapter]").forEach(button => button.addEventListener("click", () => showToast(`${button.dataset.chapter} workspace opened`)));
}

function handleCreatorAction(action) {
  if (action === "royalties") return switchView("royalties");
  if (action === "brief") return showToast("Accepted brief, contract and rights schedule opened");
  if (action === "translation") return showToast("12 bilingual terminology queries opened");
  if (action === "metadata") return showToast("Synopsis, keywords and contributor metadata drafted for review");
  if (action === "upload") return openAction({ eyebrow: "Versioned delivery", title: "Upload new content", submit: "Upload version", fields: `<label class="full">Project<select name="project"><option>Pearl Coast Archive</option><option>Al Sadu: Living Craft</option><option>Riyadh Civic Memory</option></select></label><label class="full">File<input required name="file" type="file" accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.tif,.tiff,.wav,.mp4"></label><label class="full">Version note<textarea name="note" rows="3" placeholder="What changed in this version?"></textarea></label>`, onSubmit: data => showToast(`${data.get("project")} version uploaded and editor notified`) });
  if (action === "source") return openAction({ eyebrow: "Research library", title: "Add research source", submit: "Add source", fields: `<label class="full">Source title<input required name="title" placeholder="Archive, interview, publication or URL"></label><label>Source type<select name="type"><option>Archive record</option><option>Interview</option><option>Publication</option><option>Website</option></select></label><label>Date accessed<input name="date" type="date"></label><label class="full">Citation or notes<textarea name="notes" rows="3"></textarea></label>`, onSubmit: data => showToast(`${data.get("title")} added to the shared research library`) });
  if (action === "message") return openMessageForm("editorial team");
  if (action === "task") return openAction({ title: "Add personal task", submit: "Add task", fields: `<label class="full">Task<input required name="task" placeholder="What needs to be done?"></label><label>Project<select name="project"><option>Pearl Coast Archive</option><option>Al Sadu: Living Craft</option></select></label><label>Due date<input required name="date" type="date"></label>`, onSubmit: data => { creatorTasks.push({ id: Date.now(), task: esc(data.get("task")), project: esc(data.get("project")), due: new Date(`${data.get("date")}T12:00:00`).toLocaleDateString("en-GB", {day:"2-digit",month:"short"}), done:false }); setNavCounts(); showToast("Task added to your workspace"); renderCreator(); } });
}

function bindClientEvents() {
  document.querySelectorAll("[data-client-action]").forEach(button => button.addEventListener("click", () => {
    const action = button.dataset.clientAction;
    if (action === "message") return openMessageForm("project team");
    if (action === "approvals") return switchView("approvals");
    if (action === "change") return openAction({ eyebrow: "Change control", title: "Request scope change", submit: "Submit request", fields: `<label class="full">Requested change<textarea required name="change" rows="4" placeholder="Describe the change and why it is needed"></textarea></label><label>Required by<input name="date" type="date"></label><label>Priority<select name="priority"><option>Standard</option><option>Time-critical</option></select></label>`, onSubmit: () => showToast("Change request submitted for cost and programme assessment") });
    if (action === "share") return openInviteForm();
    if (action === "download") return showToast("Approved image sequence download prepared");
    if (action === "preview") return showToast("Secure deliverable preview opened");
    if (action === "budget") return showToast("Budget detail and approved purchase orders opened");
  }));
}

function openMessageForm(recipient) {
  openAction({ eyebrow: "Project conversation", title: `Message ${recipient}`, submit: "Send message", fields: `<label class="full">Subject<input required name="subject" placeholder="Message subject"></label><label class="full">Message<textarea required name="message" rows="5" placeholder="Write your message"></textarea></label><label class="check-label full"><input type="checkbox" name="notify" checked> Send an email notification as well</label>`, onSubmit: () => showToast(`Message sent to ${recipient} and stored with the project`) });
}

function openFeedbackForm() {
  openAction({ eyebrow: "Version feedback", title: "Request a change", submit: "Send request", fields: `<label class="full">Change required<textarea required name="feedback" rows="5" placeholder="Describe the change and reference a page, passage or asset"></textarea></label><label>Priority<select name="priority"><option>Standard</option><option>Required before approval</option><option>Publication blocker</option></select></label><label>Assign to<select name="owner"><option>Author</option><option>Editor</option><option>Designer</option><option>Rights manager</option></select></label>`, onSubmit: () => showToast("Change request attached to this version") });
}

function openInviteForm() {
  openAction({ eyebrow: "Controlled access", title: "Invite a reviewer", submit: "Send invitation", fields: `<label class="full">Email address<input required name="email" type="email" placeholder="reviewer@organisation.com"></label><label>Access<select name="access"><option>Review and comment</option><option>Approve</option><option>View only</option></select></label><label>Expires<select name="expiry"><option>In 14 days</option><option>In 30 days</option><option>At project completion</option></select></label>`, onSubmit: data => showToast(`Secure invitation sent to ${data.get("email")}`) });
}

function openProject(id) {
  const project = projects.find(item => item.id === Number(id));
  if (!project) return;
  document.getElementById("detailContent").innerHTML = `<div class="dialog-head"><div><span class="eyebrow">${project.market}</span><h2>${project.name}</h2><p class="muted-copy">${project.client}</p></div><button class="icon-button" data-detail-close aria-label="Close">×</button></div><div class="detail-meta"><div><small>Commission value</small><strong>${project.value}</strong></div><div><small>Language</small><strong>${project.language}</strong></div><div><small>Lead</small><strong>${project.lead}</strong></div></div><h3>Delivery</h3><p>${project.deliverables}</p><div class="milestone-list"><span class="milestone done">Brief approved</span><span class="milestone done">Research</span><span class="milestone current">${project.stage}</span><span class="milestone">Published</span></div><div class="record-links"><button data-record-view="creator">Creator workspace</button><button data-record-view="client">Client portal</button><button data-record-view="assets">Rights record</button><button data-record-view="approvals">Approvals</button></div><div class="dialog-actions"><button class="secondary-button" data-detail-close>Close</button><button class="primary-button" data-open-record>Open full record</button></div>`;
  detailDialog.showModal();
  document.querySelectorAll("[data-detail-close]").forEach(button => button.addEventListener("click", () => detailDialog.close()));
  document.querySelector("[data-open-record]").addEventListener("click", () => showToast("Full project workspace opened"));
  document.querySelectorAll("[data-record-view]").forEach(button => button.addEventListener("click", () => { detailDialog.close(); switchView(button.dataset.recordView); }));
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
  const renderers = { dashboard: renderDashboard, features: renderFeatures, commissions: renderCommissions, creator: renderCreator, client: renderClient, publications: renderPublications, assets: renderAssets, approvals: renderApprovals, royalties: renderRoyalties, integrations: renderIntegrations };
  (renderers[view] || renderDashboard)();
  window.scrollTo({top:0, behavior:"smooth"});
}

document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => switchView(item.dataset.view)));
document.getElementById("mobileMenu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
document.getElementById("newProjectButton").addEventListener("click", () => projectDialog.showModal());
document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => projectDialog.close()));
document.querySelectorAll("[data-action-close]").forEach(button => button.addEventListener("click", () => actionDialog.close()));
document.getElementById("syncButton").addEventListener("click", () => { switchView("integrations"); window.setTimeout(runSync, 100); });

document.getElementById("workspaceMode").value = workspaceMode;
document.getElementById("workspaceMode").addEventListener("change", event => {
  workspaceMode = event.target.value;
  localStorage.setItem("heritage-role", workspaceMode);
  switchView(workspaceMode === "publisher" ? "dashboard" : workspaceMode);
  showToast(`${event.target.options[event.target.selectedIndex].text} workspace selected`);
});

document.getElementById("actionForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  if (actionHandler) actionHandler(data);
  actionDialog.close(); event.currentTarget.reset(); actionHandler = null;
});

document.getElementById("projectForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = esc(data.get("name").trim());
  const code = name.split(/\s+/).slice(0,2).map(word => word[0]).join("").toUpperCase();
  const rawDate = new Date(`${data.get("date")}T12:00:00`);
  projects.unshift({ id: Date.now(), code, name, client: esc(data.get("client")), market: esc(data.get("market")), stage: "Brief created", statusClass: "", progress: 8, date: rawDate.toLocaleDateString("en-GB", {day:"2-digit",month:"short"}), lead: esc(data.get("lead")), language: "English / Arabic", value: "To scope", deliverables: esc(data.get("deliverables") || "Deliverables to be agreed") });
  setNavCounts(); projectDialog.close(); event.currentTarget.reset(); showToast(`${name} created successfully`); switchView("commissions");
});

document.getElementById("globalSearch").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();
  if (!query) { switchView(currentView); return; }
  const matches = projects.filter(project => Object.values(project).some(value => String(value).toLowerCase().includes(query)));
  const taskMatches = creatorTasks.filter(task => Object.values(task).some(value => String(value).toLowerCase().includes(query)));
  pageTitle.textContent = "Search";
  appContent.innerHTML = `<div class="view-intro"><span class="eyebrow">${matches.length + taskMatches.length} result${matches.length + taskMatches.length === 1 ? "" : "s"}</span><h2>Search results</h2><p>Matching projects, customers, markets, contributor tasks and publication records.</p></div>${projectRows(matches)}${taskMatches.length ? `<section class="panel search-tasks"><h3>Creator tasks</h3>${taskMatches.map(task => `<div class="data-row"><div><strong>${task.task}</strong><small>${task.project} · ${task.due}</small></div><span class="tag">Task</span></div>`).join("")}</section>` : ""}`;
  bindDynamicEvents();
});

[projectDialog, detailDialog, actionDialog].forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }));

setNavCounts();
renderDashboard();
