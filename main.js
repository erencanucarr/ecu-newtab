const { Plugin, PluginSettingTab, Setting, Notice, TFile, Platform, debounce, moment, prepareFuzzySearch, prepareSimpleSearch, setIcon } = require("obsidian");

const STRINGS = {
  en: {
    "common.language": "Language",
    "set.uiLangDesc": "Plugin interface language. Auto follows Obsidian's language.",
    "set.uiLangAuto": "Auto (follow Obsidian)",
    "set.uiLangEn": "English",
    "set.uiLangTr": "Türkçe",
    "notice.langChanged": "Language changed. Reload Obsidian to apply it everywhere.",
    "date.format": "dddd, MMMM D",
    "ago.now": "just now",
    "ago.min": "{n} min ago",
    "ago.hour": "{n} h ago",
    "ago.yesterday": "yesterday",
    "ago.day": "{n} days ago",
    "ago.month": "{n} mo ago",
    "ago.year": "{n} y ago",
    "search.placeholder": "Search notes…",
    "action.newNote": "New note",
    "action.daily": "Today's note",
    "action.terminal": "Terminal panel",
    "action.random": "Random note",
    "card.recent": "Recently edited",
    "card.recentEmpty": "No notes yet.",
    "card.bookmarks": "Bookmarks",
    "card.bookmarksEmpty": "No bookmarks. Pick “Bookmark…” from the ⋯ menu of a note you open often and it will show up here.",
    "card.commands": "Recent commands",
    "card.clear": "Clear",
    "card.terminalOutdated": "ecu-terminal is out of date.",
    "card.commandsEmpty": "Commands you run in the terminal are listed here.",
    "cmdRow.copy": "Copy",
    "cmdRow.typeInto": "Type into terminal (without Enter, for {host})",
    "cmdRow.run": "Run in terminal",
    "notice.copied": "Command copied",
    "notice.copyFailed": "Couldn't copy to the clipboard.",
    "card.more": "+{n} more in the Bookmarks panel",
    "notice.codekitOff": "ecu-codekit is off: command copied to clipboard.",
    "notice.createFailed": "Couldn't create note: {error}",
    "results.content": "Found in content",
    "results.create": "Create new note “{name}”",
    "newNote.untitled": "Untitled",
    "cmd.open": "Open new tab",
    "set.showClock": "Clock and date",
    "set.showActions": "Quick actions",
    "set.showActionsDesc": "New note, today's note, Terminal panel, random note.",
    "set.showRecent": "Recently edited notes",
    "set.showBookmarks": "Bookmarks",
    "set.showCommands": "Recent commands",
    "set.showCommandsDesc": "The last commands you ran in ecu-terminal. Commands containing passwords/tokens are not saved.",
    "set.recentCount": "Number of recent notes to show",
    "set.commandCount": "Number of recent commands to show",
  },
  tr: {
    "common.language": "Dil",
    "set.uiLangDesc": "Eklentinin arayüz dili. Otomatik, Obsidian'ın diline uyar.",
    "set.uiLangAuto": "Otomatik (Obsidian'a göre)",
    "set.uiLangEn": "English",
    "set.uiLangTr": "Türkçe",
    "notice.langChanged": "Dil değişti. Her yerde uygulanması için Obsidian'ı yeniden yükle.",
    "date.format": "D MMMM dddd",
    "ago.now": "az önce",
    "ago.min": "{n} dk önce",
    "ago.hour": "{n} saat önce",
    "ago.yesterday": "dün",
    "ago.day": "{n} gün önce",
    "ago.month": "{n} ay önce",
    "ago.year": "{n} yıl önce",
    "search.placeholder": "Not ara…",
    "action.newNote": "Yeni not",
    "action.daily": "Bugünün notu",
    "action.terminal": "Terminal paneli",
    "action.random": "Rastgele not",
    "card.recent": "Son düzenlenen",
    "card.recentEmpty": "Henüz not yok.",
    "card.bookmarks": "Yer imleri",
    "card.bookmarksEmpty": "Yer imi yok. Sık açtığın bir notta ⋯ menüsünden “Yer imi ekle” dersen burada görünür.",
    "card.commands": "Son komutlar",
    "card.clear": "Temizle",
    "card.terminalOutdated": "ecu-terminal güncel değil.",
    "card.commandsEmpty": "Terminalde çalıştırdığın komutlar burada listelenir.",
    "cmdRow.copy": "Kopyala",
    "cmdRow.typeInto": "Terminale yaz (Enter'sız, {host} için)",
    "cmdRow.run": "Terminalde çalıştır",
    "notice.copied": "Komut kopyalandı",
    "notice.copyFailed": "Panoya kopyalanamadı.",
    "card.more": "Yer imleri panelinde {n} tane daha",
    "notice.codekitOff": "ecu-codekit kapalı: komut panoya kopyalandı.",
    "notice.createFailed": "Not oluşturulamadı: {error}",
    "results.content": "İçerikte geçenler",
    "results.create": "“{name}” adında yeni not oluştur",
    "newNote.untitled": "Adsız",
    "cmd.open": "Yeni sekme aç",
    "set.showClock": "Saat ve tarih",
    "set.showActions": "Hızlı işlemler",
    "set.showActionsDesc": "Yeni not, bugünün notu, Terminal paneli, rastgele not.",
    "set.showRecent": "Son düzenlenen notlar",
    "set.showBookmarks": "Yer imleri",
    "set.showCommands": "Son komutlar",
    "set.showCommandsDesc": "ecu-terminal'de çalıştırdığın son komutlar. Şifre/token içeren komutlar kaydedilmez.",
    "set.recentCount": "Kaç son not gösterilsin",
    "set.commandCount": "Kaç son komut gösterilsin",
  },
};
let uiLang = "en";
function t(key, vars) {
  const s = (STRINGS[uiLang] && STRINGS[uiLang][key]) || STRINGS.en[key] || key;
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m)) : s;
}
function resolveUiLang(pref) {
  if (pref === "en" || pref === "tr") return pref;
  let code = "";
  try {
    const obs = require("obsidian");
    code = typeof obs.getLanguage === "function" ? obs.getLanguage() : obs.moment.locale();
  } catch (e) {
    code = "";
  }
  return /^tr/i.test(code) ? "tr" : "en";
}
function setUiLang(pref) {
  uiLang = resolveUiLang(pref);
  return uiLang;
}

const ROOT = "ecu-newtab";
const HOST = "ecu-newtab-host";

const DEFAULTS = {
  uiLang: "auto",
  showClock: true,
  showActions: true,
  showRecent: true,
  showBookmarks: true,
  showCommands: true,
  recentCount: 8,
  commandCount: 8,
};

const BOOKMARK_LIMIT = 12;
const BIG_VAULT = 5000;
const SCAN = Platform.isMobile ? { files: 800, chunk: 16, budget: 1500 } : { files: 3000, chunk: 48, budget: 2500 };

function ago(ts) {
  const s = Math.max(0, (Date.now() - ts) / 1000);
  const m = s / 60;
  const h = m / 60;
  const d = h / 24;
  if (s < 45) return t("ago.now");
  if (m < 45) return t("ago.min", { n: Math.max(1, Math.round(m)) });
  if (h < 22) return t("ago.hour", { n: Math.max(1, Math.round(h)) });
  if (h < 36) return t("ago.yesterday");
  if (d < 26) return t("ago.day", { n: Math.round(d) });
  if (d < 320) return t("ago.month", { n: Math.max(1, Math.round(d / 30)) });
  return t("ago.year", { n: Math.max(1, Math.round(d / 365)) });
}

const JUNK_RE = /data:[\w/+.-]+;base64|[A-Za-z0-9+/=]{80,}/;

const SAFE_CMD_RE = /\b(?:(?:kubectl|oc)\s+(?:get|describe|delete)\s+secrets?\b|(?:gh|docker)\s+secret\s+(?:list|ls)\b)/gi;
const SECRET_RES = [
  /passw(?:or)?d|passwd|passphrase|secret|token|api[-_]?key|bearer|credential|private[-_]?key|access[-_]?key|authorization\s*:/i,
  /(?:^|[\s_-])pass(?:wd|in|out)?(?=$|[^\w])/i,
  /\w+_(?:pass|pwd|key|pat)\w*\s*=/i,
  /\bBasic\s+[A-Za-z0-9+/]{8,}={0,2}/,
  /\b(?:mysql\w*|mariadb\w*)\b[^|;&]*\s(?:-p\S|--password)/i,
  /\b(?:mongo\w*)\b[^|;&]*\s-p\s*\S/i,
  /\bsshpass\b[^|;&]*\s-p\s*\S/i,
  /\bdocker\s+login\b[^|;&]*\s-p\s*\S/i,
  /\bredis-cli\b[^|;&]*\s-a\s*\S/i,
  /\becho\b[^|]*\|\s*sudo\b[^|;&]*\s-\w*S/,
  /\s(?:-u|--user)[\s=]+[^\s:]+:(?!\d+(?:\s|$))\S/,
  /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:@]+:[^\s/@]+@/i,
  /\bgh[pousr]_[A-Za-z0-9]|github_pat_|\bsk-[A-Za-z0-9]|\bxox[abprs]-|\bAKIA[0-9A-Z]{16}\b|\bglpat-|\bnpm_[A-Za-z0-9]{16,}/,
  /\bvault\s+login\b/i,
];

function looksSecret(cmd) {
  const s = String(cmd || "").replace(SAFE_CMD_RE, " ");
  return SECRET_RES.some((re) => re.test(s));
}

function topK(items, k, cmp) {
  const out = [];
  if (k <= 0) return out;
  for (const it of items) {
    if (out.length >= k && cmp(it, out[out.length - 1]) >= 0) continue;
    let lo = 0;
    let hi = out.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cmp(it, out[mid]) < 0) hi = mid;
      else lo = mid + 1;
    }
    out.splice(lo, 0, it);
    if (out.length > k) out.pop();
  }
  return out;
}

const byMtime = (a, b) => b.stat.mtime - a.stat.mtime;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function snippet(text, m) {
  for (const [from] of m.matches) {
    const start = Math.max(0, text.lastIndexOf("\n", from) + 1);
    let end = text.indexOf("\n", from);
    if (end < 0) end = text.length;
    let line = text.slice(start, end).trim();
    if (JUNK_RE.test(line)) continue;
    if (line.length > 140) {
      const at = Math.max(0, from - start - 50);
      line = (at ? "…" : "") + line.slice(at, at + 130) + "…";
    }
    return line;
  }
  return null;
}

function icon(parent, name, cls) {
  const el = parent.createSpan({ cls: "ent-icon" + (cls ? " " + cls : "") });
  setIcon(el, name);
  return el;
}

function bookmarksPlugin(app) {
  const ip = app.internalPlugins;
  return (ip && ip.getEnabledPluginById && ip.getEnabledPluginById("bookmarks")) || null;
}

class NewTab {
  constructor(plugin, leaf) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.leaf = leaf;
    this.host = leaf.view.contentEl;
    this.host.addClass(HOST);
    this.root = this.host.createDiv({ cls: ROOT });
    this.sel = 0;
    this.results = [];
    this.searchToken = 0;
    this.queryTimer = null;
    this.dirty = new Set();
    this.build();
  }

  get settings() {
    return this.plugin.settings;
  }

  alive() {
    return this.root.isConnected && this.leaf.view && this.leaf.view.getViewType() === "empty";
  }

  visible() {
    const doc = this.root.ownerDocument;
    if (doc && doc.hidden) return false;
    return typeof this.root.isShown === "function" ? this.root.isShown() : true;
  }

  destroy() {
    this.searchToken++;
    clearTimeout(this.queryTimer);
    this.root.remove();
    this.host.removeClass(HOST);
  }

  build() {
    const r = this.root;
    r.empty();
    this.dirty.clear();
    this.clockEl = null;
    this.recentEl = null;
    this.bookmarksEl = null;
    this.commandsEl = null;
    if (this.settings.showClock) {
      const head = r.createDiv({ cls: "ent-head" });
      this.clockEl = head.createDiv({ cls: "ent-clock" });
      this.dateEl = head.createDiv({ cls: "ent-date" });
      this.tick();
    }

    const search = r.createDiv({ cls: "ent-search" });
    icon(search, "search", "ent-search-icon");
    this.input = search.createEl("input", {
      type: "text",
      attr: { placeholder: t("search.placeholder"), spellcheck: "false" },
    });
    this.input.addEventListener("input", () => this.onInput());
    this.input.addEventListener("keydown", (e) => this.onKey(e));
    this.resultsEl = r.createDiv({ cls: "ent-results" });

    this.body = r.createDiv({ cls: "ent-body" });
    if (this.settings.showActions) this.buildActions(this.body);
    const grid = this.body.createDiv({ cls: "ent-grid" });
    if (this.settings.showRecent) this.recentEl = grid.createDiv({ cls: "ent-card" });
    if (this.settings.showBookmarks) this.bookmarksEl = grid.createDiv({ cls: "ent-card" });
    if (this.settings.showCommands && this.terminal()) this.commandsEl = this.body.createDiv({ cls: "ent-card ent-wide" });
    this.refresh();
  }

  refresh(part) {
    if (!part || part === "recent") this.renderRecent();
    if (!part || part === "bookmarks") this.renderBookmarks();
    if (!part || part === "commands") this.renderCommands();
  }

  request(part) {
    if (this.visible()) this.refresh(part);
    else this.dirty.add(part || "all");
  }

  flush() {
    if (!this.dirty.size) return;
    const parts = [...this.dirty];
    this.dirty.clear();
    if (parts.includes("all")) this.refresh();
    else for (const p of parts) this.refresh(p);
  }

  tick() {
    if (!this.clockEl) return;
    const now = moment().locale(uiLang);
    this.clockEl.setText(now.format("LT"));
    this.dateEl.setText(now.format(t("date.format")));
  }

  focus() {
    if (Platform.isMobile || !this.input) return;
    const doc = this.input.ownerDocument;
    if (!doc || doc.activeElement !== this.input) this.input.focus();
  }

  terminal() {
    const p = this.app.plugins && this.app.plugins.plugins;
    return (p && p["ecu-terminal"]) || null;
  }

  codekit() {
    const p = this.app.plugins && this.app.plugins.plugins;
    return (p && (p["ecu-codekit"] || p["ecu-codelight"])) || null;
  }

  buildActions(parent) {
    const row = parent.createDiv({ cls: "ent-actions" });
    const add = (ic, label, fn, hint) => {
      const b = row.createEl("button", { cls: "ent-action" });
      icon(b, ic);
      b.createSpan({ text: label });
      if (hint) b.setAttr("aria-label", hint);
      b.addEventListener("click", fn);
    };
    add("file-plus", t("action.newNote"), () => this.newNote());
    if (this.app.internalPlugins?.getEnabledPluginById?.("daily-notes")) {
      add("calendar", t("action.daily"), () => this.runHere("daily-notes"));
    }
    if (this.terminal()) add("square-terminal", t("action.terminal"), () => this.openTerminalPanel());
    add("shuffle", t("action.random"), () => this.randomNote());
  }

  card(el, ic, title, extra) {
    el.empty();
    const head = el.createDiv({ cls: "ent-card-head" });
    icon(head, ic);
    head.createSpan({ text: title });
    if (extra) extra(head);
    return el.createDiv({ cls: "ent-list" });
  }

  fileRow(list, file, right, subpath) {
    const row = list.createDiv({ cls: "ent-row" });
    const main = row.createDiv({ cls: "ent-row-main" });
    main.createSpan({ cls: "ent-row-title", text: file.basename });
    const dir = file.parent && file.parent.path !== "/" ? file.parent.path : "";
    if (dir) main.createSpan({ cls: "ent-row-sub", text: dir });
    if (right) row.createSpan({ cls: "ent-row-right", text: right });
    row.addEventListener("click", (e) => this.openFile(file, e.metaKey || e.ctrlKey || e.button === 1, subpath));
    row.addEventListener("auxclick", (e) => e.button === 1 && this.openFile(file, true, subpath));
    return row;
  }

  renderRecent() {
    if (!this.recentEl) return;
    const list = this.card(this.recentEl, "clock", t("card.recent"));
    const files = topK(this.app.vault.getMarkdownFiles(), this.settings.recentCount, byMtime);
    if (!files.length) list.createDiv({ cls: "ent-empty", text: t("card.recentEmpty") });
    for (const f of files) this.fileRow(list, f, ago(f.stat.mtime));
  }

  bookmarkFiles() {
    const bp = bookmarksPlugin(this.app);
    const out = [];
    const walk = (items) => {
      for (const it of items || []) {
        if (!it) continue;
        if (it.type === "group") {
          walk(it.items);
          continue;
        }
        if (it.type !== "file") continue;
        const f = this.app.vault.getAbstractFileByPath(it.path);
        if (f instanceof TFile) out.push({ file: f, title: it.title, subpath: it.subpath || "" });
      }
    };
    if (bp) walk(bp.items);
    return out;
  }

  renderBookmarks() {
    if (!this.bookmarksEl) return;
    const list = this.card(this.bookmarksEl, "bookmark", t("card.bookmarks"));
    const marks = this.bookmarkFiles();
    if (!marks.length) {
      list.createDiv({
        cls: "ent-empty",
        text: t("card.bookmarksEmpty"),
      });
      return;
    }
    for (const m of marks.slice(0, BOOKMARK_LIMIT)) {
      const row = this.fileRow(list, m.file, "", m.subpath);
      const title = m.title || (m.subpath ? m.file.basename + m.subpath : "");
      if (title) row.querySelector(".ent-row-title").setText(title);
    }
    if (marks.length > BOOKMARK_LIMIT) list.createDiv({ cls: "ent-empty ent-more", text: t("card.more", { n: marks.length - BOOKMARK_LIMIT }) });
  }

  renderCommands() {
    if (!this.commandsEl) return;
    const term = this.terminal();
    const all = term && term.recentCommands ? term.recentCommands() : [];
    const cmds = all.filter((c) => c && typeof c.cmd === "string" && !looksSecret(c.cmd)).slice(0, this.settings.commandCount);
    const list = this.card(this.commandsEl, "terminal", t("card.commands"), (head) => {
      if (!all.length) return;
      const clear = head.createEl("button", { cls: "ent-link", text: t("card.clear") });
      clear.addEventListener("click", async () => {
        await term.clearHistory();
      });
    });
    if (!term || !term.recentCommands) {
      list.createDiv({ cls: "ent-empty", text: t("card.terminalOutdated") });
      return;
    }
    if (!cmds.length) {
      list.createDiv({ cls: "ent-empty", text: t("card.commandsEmpty") });
      return;
    }
    for (const c of cmds) {
      const row = list.createDiv({ cls: "ent-row ent-cmd" });
      const main = row.createDiv({ cls: "ent-row-main" });
      main.createEl("code", { cls: "ent-cmd-text", text: c.cmd });
      if (c.host) main.createSpan({ cls: "ent-chip", text: c.host });
      row.createSpan({ cls: "ent-row-right", text: ago(c.t) });
      const tools = row.createDiv({ cls: "ent-row-tools" });
      const copy = tools.createEl("button", { cls: "clickable-icon", attr: { "aria-label": t("cmdRow.copy") } });
      setIcon(copy, "copy");
      copy.addEventListener("click", (e) => {
        e.stopPropagation();
        this.copy(c.cmd, t("notice.copied"));
      });
      const run = tools.createEl("button", {
        cls: "clickable-icon ent-run",
        attr: { "aria-label": c.host ? t("cmdRow.typeInto", { host: c.host }) : t("cmdRow.run") },
      });
      setIcon(run, c.host ? "corner-down-left" : "play");
      run.addEventListener("click", (e) => {
        e.stopPropagation();
        this.runCommand(c);
      });
      row.addEventListener("click", () => this.typeCommand(c));
    }
  }

  async copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
      new Notice(message);
      return true;
    } catch (e) {
      new Notice(t("notice.copyFailed"));
      return false;
    }
  }

  async typeCommand(c) {
    const cl = this.codekit();
    if (cl && cl.sendToTerminal) return cl.sendToTerminal(c.cmd, false);
    return this.copy(c.cmd, t("notice.codekitOff"));
  }

  async runCommand(c) {
    const cl = this.codekit();
    if (!c.host && cl && cl.runInTerminal) return cl.runInTerminal(c.cmd);
    if (cl && cl.sendToTerminal) return cl.sendToTerminal(c.cmd, !c.host);
    return this.copy(c.cmd, t("notice.codekitOff"));
  }

  onInput() {
    clearTimeout(this.queryTimer);
    this.queryTimer = null;
    this.searchToken++;
    if (this.input.value.trim() && this.app.vault.getFiles().length > BIG_VAULT) {
      this.queryTimer = setTimeout(() => {
        this.queryTimer = null;
        this.onQuery();
      }, 50);
    } else this.onQuery();
  }

  onQuery() {
    this.searchToken++;
    const q = this.input.value.trim();
    this.sel = 0;
    if (!q) {
      this.results = [];
      this.resultsEl.empty();
      this.root.removeClass("is-searching");
      return;
    }
    this.root.addClass("is-searching");
    const fuzzy = prepareFuzzySearch(q);
    const byName = [];
    for (const f of this.app.vault.getFiles()) {
      const m = fuzzy(f.extension === "md" ? f.basename : f.name);
      const p = m ? null : fuzzy(f.path);
      const score = m ? m.score + 1 : p ? p.score : null;
      if (score != null) byName.push({ file: f, score });
    }
    const best = topK(byName, 8, (a, b) => b.score - a.score || b.file.stat.mtime - a.file.stat.mtime);
    this.results = best.map((r) => ({ kind: "file", file: r.file }));
    this.results.push({ kind: "create", name: q });
    this.renderResults();
    if (q.length >= 3) this.searchContent(q);
  }

  current(token, q) {
    return token === this.searchToken && this.alive() && this.input.value.trim() === q;
  }

  async searchContent(q) {
    const token = this.searchToken;
    await sleep(180);
    if (!this.current(token, q)) return;
    const simple = prepareSimpleSearch(q);
    const seen = new Set(this.results.filter((r) => r.kind === "file").map((r) => r.file.path));
    const files = topK(this.app.vault.getMarkdownFiles(), SCAN.files, byMtime).filter((f) => !seen.has(f.path));
    const deadline = Date.now() + SCAN.budget;
    const hits = [];
    for (let i = 0; i < files.length && hits.length < 8 && Date.now() < deadline; i += SCAN.chunk) {
      if (i) await sleep(0);
      if (!this.current(token, q)) return;
      const part = files.slice(i, i + SCAN.chunk);
      const texts = await Promise.all(part.map((f) => this.app.vault.cachedRead(f).catch(() => "")));
      if (!this.current(token, q)) return;
      for (let k = 0; k < part.length && hits.length < 8; k++) {
        const text = texts[k];
        const m = text ? simple(text) : null;
        const line = m ? snippet(text, m) : null;
        if (line != null) hits.push({ kind: "content", file: part[k], snippet: line });
      }
    }
    if (!this.current(token, q) || !hits.length) return;
    const create = this.results.filter((r) => r && r.kind === "create");
    this.results = this.results.filter((r) => r && r.kind === "file").concat(hits, create);
    this.renderResults();
  }

  renderResults() {
    const el = this.resultsEl;
    el.empty();
    let lastKind = "";
    this.results.forEach((r, i) => {
      if (r.kind === "content" && lastKind !== "content") el.createDiv({ cls: "ent-results-label", text: t("results.content") });
      lastKind = r.kind;
      const row = el.createDiv({ cls: "ent-row ent-result" + (i === this.sel ? " is-selected" : "") });
      if (r.kind === "create") {
        icon(row, "file-plus");
        row.createSpan({ cls: "ent-row-title", text: t("results.create", { name: r.name }) });
      } else {
        icon(row, r.kind === "content" ? "text" : r.file.extension === "md" ? "file-text" : "file");
        const main = row.createDiv({ cls: "ent-row-main" });
        main.createSpan({ cls: "ent-row-title", text: r.file.extension === "md" ? r.file.basename : r.file.name });
        const dir = r.file.parent && r.file.parent.path !== "/" ? r.file.parent.path : "";
        if (r.kind === "content") main.createDiv({ cls: "ent-snippet", text: r.snippet });
        else if (dir) main.createSpan({ cls: "ent-row-sub", text: dir });
      }
      row.addEventListener("mouseenter", () => this.select(i));
      row.addEventListener("click", (e) => this.pick(i, e.metaKey || e.ctrlKey));
    });
  }

  select(i) {
    this.sel = i;
    this.resultsEl.querySelectorAll(".ent-result").forEach((el, j) => el.toggleClass("is-selected", j === i));
  }

  onKey(e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (this.queryTimer && (e.key === "Enter" || e.key === "ArrowDown" || e.key === "ArrowUp")) {
      clearTimeout(this.queryTimer);
      this.queryTimer = null;
      this.onQuery();
    }
    const n = this.input.value.trim() ? this.results.length : 0;
    if (e.key === "ArrowDown" && n) {
      e.preventDefault();
      this.select((this.sel + 1) % n);
      this.scrollSel();
    } else if (e.key === "ArrowUp" && n) {
      e.preventDefault();
      this.select((this.sel - 1 + n) % n);
      this.scrollSel();
    } else if (e.key === "Enter" && n) {
      e.preventDefault();
      this.pick(this.sel, e.metaKey || e.ctrlKey);
    } else if (e.key === "Escape" && this.input.value) {
      e.preventDefault();
      e.stopPropagation();
      this.input.value = "";
      this.onInput();
    }
  }

  scrollSel() {
    const el = this.resultsEl.querySelectorAll(".ent-result")[this.sel];
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  pick(i, newTab) {
    if (!this.input.value.trim()) return;
    const r = this.results[i];
    if (!r) return;
    if (r.kind === "create") return this.newNote(r.name);
    this.openFile(r.file, newTab);
  }

  openFile(file, newTab, subpath) {
    if (subpath) return this.app.workspace.openLinkText(file.path + subpath, "", newTab ? "tab" : false);
    const leaf = newTab ? this.app.workspace.getLeaf("tab") : this.leaf;
    leaf.openFile(file);
  }

  async newNote(name) {
    try {
      const parent = this.app.fileManager.getNewFileParent("");
      const clean =
        (name || "")
          .replace(/[\\/:*?"<>|#^[\]]/g, " ")
          .replace(/^[\s.]+/, "")
          .slice(0, 120)
          .replace(/[\s.]+$/, "") || t("newNote.untitled");
      const base = parent.path === "/" ? "" : parent.path + "/";
      let p = `${base}${clean}.md`;
      for (let k = 1; this.app.vault.getAbstractFileByPath(p); k++) p = `${base}${clean} ${k}.md`;
      const file = await this.app.vault.create(p, "");
      await this.leaf.openFile(file, { state: { mode: "source" }, eState: { rename: name ? undefined : "all" } });
    } catch (e) {
      new Notice(t("notice.createFailed", { error: e && e.message ? e.message : e }));
    }
  }

  runHere(commandId) {
    this.app.workspace.setActiveLeaf(this.leaf, { focus: true });
    this.app.commands.executeCommandById(commandId);
  }

  async openTerminalPanel() {
    const t = this.terminal();
    if (!t || !t.openPanel) return;
    const leaf = this.leaf;
    await t.openPanel();
    if (leaf.view && leaf.view.getViewType() === "empty") leaf.detach();
  }

  randomNote() {
    const files = this.app.vault.getMarkdownFiles();
    if (files.length) this.openFile(files[Math.floor(Math.random() * files.length)]);
  }
}

module.exports = class EcuNewTab extends Plugin {
  async onload() {
    this.settings = Object.assign({}, DEFAULTS, await this.loadData());
    setUiLang(this.settings.uiLang);
    this.tabs = new Set();
    this.addSettingTab(new EcuNewTabSettings(this.app, this));

    const scan = () => this.scan();
    this.app.workspace.onLayoutReady(scan);
    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.scan();
        this.flushShown();
      })
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.scan();
        this.each((t) => t.tick());
        this.flushShown();
        const t = this.tabFor(leaf);
        if (t) {
          t.flush();
          t.refresh("bookmarks");
          setTimeout(() => t.focus(), 30);
        }
      })
    );
    this.registerEvent(this.app.workspace.on("ecu-terminal:history", () => this.each((t) => t.request("commands"))));
    this.registerDomEvent(document, "visibilitychange", () => {
      if (document.hidden) return;
      this.each((t) => t.tick());
      this.flushShown();
    });

    this.pending = new Set();
    this.vaultTimer = null;
    const queue = (...parts) => {
      for (const p of parts) this.pending.add(p);
      clearTimeout(this.vaultTimer);
      this.vaultTimer = setTimeout(() => {
        const ps = [...this.pending];
        this.pending.clear();
        this.each((t) => ps.forEach((p) => t.request(p)));
      }, 600);
    };
    for (const ev of ["modify", "create"]) this.registerEvent(this.app.vault.on(ev, () => queue("recent")));
    for (const ev of ["delete", "rename"]) this.registerEvent(this.app.vault.on(ev, () => queue("recent", "bookmarks")));
    this.scheduleTick();
    this.registerInterval(window.setInterval(() => this.each((t) => t.request()), 60000));

    this.addCommand({
      id: "open",
      name: t("cmd.open"),
      callback: () => {
        const leaf = this.app.workspace.getLeaf("tab");
        leaf.setViewState({ type: "empty", active: true });
      },
    });
  }

  scheduleTick() {
    clearTimeout(this.tickTimer);
    this.tickTimer = setTimeout(() => {
      this.each((t) => t.tick());
      this.scheduleTick();
    }, 60000 - (Date.now() % 60000) + 50);
  }

  each(fn) {
    for (const t of [...this.tabs]) {
      if (t.alive()) fn(t);
      else {
        t.searchToken++;
        this.tabs.delete(t);
      }
    }
  }

  flushShown() {
    this.each((t) => t.visible() && t.flush());
  }

  tabFor(leaf) {
    for (const t of this.tabs) if (t.leaf === leaf && t.alive()) return t;
    return null;
  }

  scan() {
    this.each(() => {});
    this.app.workspace.iterateRootLeaves((leaf) => {
      if (!leaf.view || leaf.view.getViewType() !== "empty") return;
      if (this.tabFor(leaf)) return;
      const t = new NewTab(this, leaf);
      this.tabs.add(t);
      if (this.app.workspace.getMostRecentLeaf() === leaf) setTimeout(() => t.focus(), 30);
    });
  }

  rebuild() {
    this.each((t) => t.build());
  }

  onunload() {
    clearTimeout(this.tickTimer);
    clearTimeout(this.vaultTimer);
    for (const t of this.tabs) t.destroy();
    this.tabs.clear();
    this.app.workspace.iterateAllLeaves((leaf) => {
      const el = leaf.view && leaf.view.contentEl;
      if (!el) return;
      el.querySelectorAll(":scope > ." + ROOT).forEach((c) => c.remove());
      el.removeClass(HOST);
    });
  }
};

class EcuNewTabSettings extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    const p = this.plugin;
    containerEl.empty();
    const save = async () => {
      await p.saveData(p.settings);
      p.rebuild();
    };
    const saveLater = debounce(save, 400, true);

    new Setting(containerEl)
      .setName(t("common.language"))
      .setDesc(t("set.uiLangDesc"))
      .addDropdown((d) =>
        d
          .addOption("auto", t("set.uiLangAuto"))
          .addOption("en", t("set.uiLangEn"))
          .addOption("tr", t("set.uiLangTr"))
          .setValue(p.settings.uiLang || "auto")
          .onChange(async (v) => {
            p.settings.uiLang = v;
            setUiLang(v);
            await save();
            new Notice(t("notice.langChanged"));
            this.display();
          })
      );

    const toggle = (key, name, desc) =>
      new Setting(containerEl)
        .setName(name)
        .setDesc(desc || "")
        .addToggle((t) => t.setValue(p.settings[key]).onChange(async (v) => ((p.settings[key] = v), await save())));
    toggle("showClock", t("set.showClock"));
    toggle("showActions", t("set.showActions"), t("set.showActionsDesc"));
    toggle("showRecent", t("set.showRecent"));
    toggle("showBookmarks", t("set.showBookmarks"));
    toggle("showCommands", t("set.showCommands"), t("set.showCommandsDesc"));
    const num = (key, name) =>
      new Setting(containerEl).setName(name).addSlider((s) =>
        s
          .setLimits(3, 20, 1)
          .setValue(p.settings[key])
          .setDynamicTooltip()
          .onChange((v) => {
            p.settings[key] = v;
            saveLater();
          })
      );
    num("recentCount", t("set.recentCount"));
    num("commandCount", t("set.commandCount"));
  }
}
