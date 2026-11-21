const { Plugin, PluginSettingTab, Setting, Notice, TFile, prepareFuzzySearch, prepareSimpleSearch, setIcon } = require("obsidian");

const STRINGS = {
  en: {
    "common.language": "Language",
    "set.uiLangDesc": "Plugin interface language. Auto follows Obsidian's language.",
    "set.uiLangAuto": "Auto (follow Obsidian)",
    "set.uiLangEn": "English",
    "set.uiLangTr": "Türkçe",
    "notice.langChanged": "Language changed. Reload Obsidian to apply it everywhere.",
    "day.0": "Sunday",
    "day.1": "Monday",
    "day.2": "Tuesday",
    "day.3": "Wednesday",
    "day.4": "Thursday",
    "day.5": "Friday",
    "day.6": "Saturday",
    "month.0": "January",
    "month.1": "February",
    "month.2": "March",
    "month.3": "April",
    "month.4": "May",
    "month.5": "June",
    "month.6": "July",
    "month.7": "August",
    "month.8": "September",
    "month.9": "October",
    "month.10": "November",
    "month.11": "December",
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
    "action.terminal": "Terminal Panel",
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
    "notice.codekitOff": "ecu-codekit is off: command copied to clipboard.",
    "notice.createFailed": "Couldn't create note: {error}",
    "results.content": "Found in content",
    "results.create": "Create new note “{name}”",
    "newNote.untitled": "Untitled",
    "cmd.open": "Open new tab",
    "set.showClock": "Clock and date",
    "set.showActions": "Quick actions",
    "set.showActionsDesc": "New note, today's note, Terminal Panel, random note.",
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
    "day.0": "Pazar",
    "day.1": "Pazartesi",
    "day.2": "Salı",
    "day.3": "Çarşamba",
    "day.4": "Perşembe",
    "day.5": "Cuma",
    "day.6": "Cumartesi",
    "month.0": "Ocak",
    "month.1": "Şubat",
    "month.2": "Mart",
    "month.3": "Nisan",
    "month.4": "Mayıs",
    "month.5": "Haziran",
    "month.6": "Temmuz",
    "month.7": "Ağustos",
    "month.8": "Eylül",
    "month.9": "Ekim",
    "month.10": "Kasım",
    "month.11": "Aralık",
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
    "action.terminal": "Terminal Paneli",
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
    "notice.codekitOff": "ecu-codekit kapalı: komut panoya kopyalandı.",
    "notice.createFailed": "Not oluşturulamadı: {error}",
    "results.content": "İçerikte geçenler",
    "results.create": "“{name}” adında yeni not oluştur",
    "newNote.untitled": "Adsız",
    "cmd.open": "Yeni sekme aç",
    "set.showClock": "Saat ve tarih",
    "set.showActions": "Hızlı işlemler",
    "set.showActionsDesc": "Yeni not, bugünün notu, Terminal Paneli, rastgele not.",
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

function icon(parent, name, cls) {
  const el = parent.createSpan({ cls: "ent-icon" + (cls ? " " + cls : "") });
  setIcon(el, name);
  return el;
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
    this.build();
  }

  get settings() {
    return this.plugin.settings;
  }

  alive() {
    return this.root.isConnected && this.leaf.view && this.leaf.view.getViewType() === "empty";
  }

  destroy() {
    this.root.remove();
    this.host.removeClass(HOST);
  }

  build() {
    const r = this.root;
    r.empty();
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
    this.input.addEventListener("input", () => this.onQuery());
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

  tick() {
    if (!this.clockEl) return;
    const now = new Date();
    this.clockEl.setText(String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0"));
    this.dateEl.setText(`${t("day." + now.getDay())}, ${now.getDate()} ${t("month." + now.getMonth())}`);
  }

  focus() {
    if (this.input && document.activeElement !== this.input) this.input.focus();
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
    if (this.app.internalPlugins.getEnabledPluginById && this.app.internalPlugins.getEnabledPluginById("daily-notes")) {
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

  fileRow(list, file, right) {
    const row = list.createDiv({ cls: "ent-row" });
    const main = row.createDiv({ cls: "ent-row-main" });
    main.createSpan({ cls: "ent-row-title", text: file.basename });
    const dir = file.parent && file.parent.path !== "/" ? file.parent.path : "";
    if (dir) main.createSpan({ cls: "ent-row-sub", text: dir });
    if (right) row.createSpan({ cls: "ent-row-right", text: right });
    row.addEventListener("click", (e) => this.openFile(file, e.metaKey || e.ctrlKey || e.button === 1));
    row.addEventListener("auxclick", (e) => e.button === 1 && this.openFile(file, true));
    return row;
  }

  renderRecent() {
    if (!this.recentEl) return;
    const list = this.card(this.recentEl, "clock", t("card.recent"));
    const files = this.app.vault
      .getMarkdownFiles()
      .sort((a, b) => b.stat.mtime - a.stat.mtime)
      .slice(0, this.settings.recentCount);
    if (!files.length) list.createDiv({ cls: "ent-empty", text: t("card.recentEmpty") });
    for (const f of files) this.fileRow(list, f, ago(f.stat.mtime));
  }

  bookmarkFiles() {
    const bp = this.app.internalPlugins.getEnabledPluginById && this.app.internalPlugins.getEnabledPluginById("bookmarks");
    const out = [];
    const walk = (items) => {
      for (const it of items || []) {
        if (it.type === "group") walk(it.items);
        else if (it.type === "file") {
          const f = this.app.vault.getAbstractFileByPath(it.path);
          if (f instanceof TFile) out.push({ file: f, title: it.title });
        }
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
    for (const m of marks.slice(0, 12)) {
      const row = this.fileRow(list, m.file);
      if (m.title) row.querySelector(".ent-row-title").setText(m.title);
    }
  }

  renderCommands() {
    if (!this.commandsEl) return;
    const term = this.terminal();
    const cmds = term && term.recentCommands ? term.recentCommands().slice(0, this.settings.commandCount) : [];
    const list = this.card(this.commandsEl, "terminal", t("card.commands"), (head) => {
      if (!cmds.length) return;
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
        navigator.clipboard.writeText(c.cmd);
        new Notice(t("notice.copied"));
      });
      const run = tools.createEl("button", {
        cls: "clickable-icon ent-run",
        attr: { "aria-label": c.host ? t("cmdRow.typeInto", { host: c.host }) : t("cmdRow.run") },
      });
      setIcon(run, c.host ? "corner-down-left" : "play");
      const go = (e) => {
        e.stopPropagation();
        this.runCommand(c);
      };
      run.addEventListener("click", go);
      row.addEventListener("click", go);
    }
  }

  async runCommand(c) {
    const cl = this.codekit();
    if (!c.host && cl && cl.runInTerminal) return cl.runInTerminal(c.cmd);
    if (cl && cl.sendToTerminal) return cl.sendToTerminal(c.cmd, !c.host);
    navigator.clipboard.writeText(c.cmd);
    new Notice(t("notice.codekitOff"));
  }

  onQuery() {
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
    byName.sort((a, b) => b.score - a.score || b.file.stat.mtime - a.file.stat.mtime);
    this.results = byName.slice(0, 8).map((r) => ({ kind: "file", file: r.file }));
    this.results.push({ kind: "create", name: q });
    this.renderResults();
    if (q.length >= 3) this.searchContent(q);
  }

  async searchContent(q) {
    const token = ++this.searchToken;
    await new Promise((r) => setTimeout(r, 180));
    if (token !== this.searchToken) return;
    const simple = prepareSimpleSearch(q);
    const seen = new Set(this.results.filter((r) => r.kind === "file").map((r) => r.file.path));
    const hits = [];
    const files = this.app.vault.getMarkdownFiles().sort((a, b) => b.stat.mtime - a.stat.mtime);
    for (const f of files) {
      if (hits.length >= 8 || token !== this.searchToken) break;
      if (seen.has(f.path)) continue;
      const text = await this.app.vault.cachedRead(f);
      const m = simple(text);
      if (!m) continue;
      let at = -1;
      let start = 0;
      let line = "";
      for (const [from] of m.matches) {
        start = Math.max(0, text.lastIndexOf("\n", from) + 1);
        let end = text.indexOf("\n", from);
        if (end < 0) end = text.length;
        const l = text.slice(start, end).trim();
        if (!JUNK_RE.test(l)) {
          at = from;
          line = l;
          break;
        }
      }
      if (at < 0) continue;
      if (line.length > 140) {
        const from = Math.max(0, at - start - 50);
        line = (from ? "…" : "") + line.slice(from, from + 130) + "…";
      }
      hits.push({ kind: "content", file: f, snippet: line });
    }
    if (token !== this.searchToken || !this.alive()) return;
    const create = this.results.pop();
    this.results = this.results.concat(hits);
    this.results.push(create);
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
    const n = this.results.length;
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
      this.onQuery();
    }
  }

  scrollSel() {
    const el = this.resultsEl.querySelectorAll(".ent-result")[this.sel];
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  pick(i, newTab) {
    const r = this.results[i];
    if (!r) return;
    if (r.kind === "create") return this.newNote(r.name);
    this.openFile(r.file, newTab);
  }

  openFile(file, newTab) {
    const leaf = newTab ? this.app.workspace.getLeaf("tab") : this.leaf;
    leaf.openFile(file);
  }

  async newNote(name) {
    try {
      const parent = this.app.fileManager.getNewFileParent("");
      const clean = (name || "").replace(/[\\/:*?"<>|#^[\]]/g, " ").trim() || t("newNote.untitled");
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
    this.registerEvent(this.app.workspace.on("layout-change", scan));
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        this.scan();
        const t = this.tabFor(leaf);
        if (t) {
          t.refresh();
          setTimeout(() => t.focus(), 30);
        }
      })
    );
    this.registerEvent(this.app.workspace.on("ecu-terminal:history", () => this.each((t) => t.refresh("commands"))));

    let timer = null;
    const recent = () => {
      clearTimeout(timer);
      timer = setTimeout(() => this.each((t) => t.refresh("recent")), 600);
    };
    for (const ev of ["modify", "create", "delete", "rename"]) this.registerEvent(this.app.vault.on(ev, recent));
    this.registerInterval(window.setInterval(() => this.each((t) => t.tick()), 15000));
    this.registerInterval(window.setInterval(() => this.each((t) => t.refresh()), 60000));

    this.addCommand({
      id: "open",
      name: t("cmd.open"),
      callback: () => {
        const leaf = this.app.workspace.getLeaf("tab");
        leaf.setViewState({ type: "empty", active: true });
      },
    });
  }

  each(fn) {
    for (const t of [...this.tabs]) {
      if (t.alive()) fn(t);
      else this.tabs.delete(t);
    }
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
    for (const t of this.tabs) t.destroy();
    this.tabs.clear();
    document.querySelectorAll("." + ROOT).forEach((el) => el.remove());
    document.querySelectorAll("." + HOST).forEach((el) => el.classList.remove(HOST));
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
          .onChange(async (v) => ((p.settings[key] = v), await save()))
      );
    num("recentCount", t("set.recentCount"));
    num("commandCount", t("set.commandCount"));
  }
}
