/* Capa de datos de TortillaLand: todo vive en data/site.json dentro del repositorio de GitHub.
   - La página pública lo LEE (GitHub Pages lo sirve como archivo estático).
   - El panel admin lo ESCRIBE con la API de GitHub y un token personal que solo se guarda en tu navegador.
   - Con el buzón de Google (config.js › buzon.url) los visitantes envían mensajes SIN registrarse
     y las velas se cuentan entre todos. Sin buzón, se guardan solo en su navegador. */
(function () {
  const cfg = (window.TL_CONFIG && window.TL_CONFIG.github) || {};
  const SLOT_IDS = ["episodios", "participantes", "pie"];
  const API = "https://api.github.com";

  const ls = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v } catch (e) { return d } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} },
    del(k) { try { localStorage.removeItem(k) } catch (e) {} }
  };

  /* ---------- formato y limpieza de los datos ---------- */
  function normAds(a) {
    const out = { enabled: !(a && a.enabled === false), slots: {} };
    SLOT_IDS.forEach(id => {
      const src = (a && a.slots && a.slots[id]) || {};
      const def = id === "participantes" ? { hd: 250, hm: 250 } : { hd: 90, hm: 50 };
      out.slots[id] = {
        on: !!src.on, compat: !!src.compat,
        desk: String(src.desk || ""), mob: String(src.mob || ""),
        hd: Math.max(30, Math.min(800, +src.hd || def.hd)), hm: Math.max(30, Math.min(800, +src.hm || def.hm))
      };
    });
    return out;
  }
  function normMsg(m) {
    if (!m || typeof m.t !== "string" || !m.t.trim()) return null;
    return { id: String(m.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7))).slice(0, 40), t: m.t.trim().slice(0, 140), n: String(m.n || "").trim().slice(0, 30), at: +m.at || 0 };
  }
  /* ---------- videos de YouTube ---------- */
  const CREATORS = Array.from(new Set(['HeberonYT', 'JaviDMr10'].concat(['AuronPlay','Perxitaa','Karchez','Genesis','Lolito','Axozer','Carola','Deqiuv','Jagger','JuanSGuarnizo','Biyin','Paracetamor','Luzu','Betra','Nia Lakshart','Tanizen','Ibai','Pato de Aqualand','MomonKun','Zorman','Mayichi','Focus','Jacky (CooLifeGame)','AriGameplays','Laura Escanes','Folagor','TheGrefg','Violeta G','Gemita','Polispol','Fargan','Cristinini','Ampeterby','Menos Trece'], ['8cho','Ampeterby','AriGameplays','Aroyitt','AuronPlay','Axozer','Barbeq','Barcagamer','Betra','Biyin','Carola','Carrera','Cristinini','Danirep','Deqiuv','Desst3','DJMariio','ElMariana','Focus','Genesis','Ibai','Imantado','Jabu','Jacky (CooLifeGame)','JuanSGuarnizo','Karchez','Komanche','Mayichi','Pato de Aqualand','Perxitaa','Polispol','Reborn','Spreen','Tanizen','Violeta G','Zorman']))).sort((a, b) => a.localeCompare(b, 'es'));
  function ytId(u) {
    u = String(u || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(u)) return u;
    const m = u.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/);
    return m ? m[1] : '';
  }
  function ytStart(u) {
    const m = String(u || '').match(/[?&#](?:t|start)=([0-9hms]+)/); if (!m) return 0;
    const v = m[1]; if (/^\d+$/.test(v)) return +v;
    const h = +(v.match(/(\d+)h/) || [0, 0])[1], mi = +(v.match(/(\d+)m/) || [0, 0])[1], s = +(v.match(/(\d+)s/) || [0, 0])[1];
    return h * 3600 + mi * 60 + s;
  }
  function normVideo(v) {
    if (!v) return null;
    const yt = ytId(v.yt || v.url); if (!yt) return null;
    return {
      id: String(v.id || ('v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6))).slice(0, 40),
      yt, t: String(v.t || '').trim().slice(0, 120) || 'Video de TortillaLand',
      c: String(v.c || '').trim().slice(0, 40), tag: String(v.tag || '').trim().slice(0, 40),
      start: Math.max(0, Math.min(86400, Math.floor(+v.start || 0))), at: +v.at || 0
    };
  }

  function normSite(s) {
    s = s || {};
    return {
      version: 1,
      ads: normAds(s.ads),
      velas: Math.max(0, Math.floor(+s.velas || 0)),
      mensajes: (Array.isArray(s.mensajes) ? s.mensajes : []).map(normMsg).filter(Boolean).sort((a, b) => b.at - a.at).slice(0, 500),
      videos: (Array.isArray(s.videos) ? s.videos : []).map(normVideo).filter(Boolean).slice(0, 300),
      actualizado: String(s.actualizado || "")
    };
  }

  /* ---------- repositorio (detectado en GitHub Pages) ---------- */
  function repoInfo() {
    let owner = cfg.owner || "", repo = cfg.repo || "";
    const h = location.hostname;
    if ((!owner || !repo) && /\.github\.io$/i.test(h)) {
      owner = owner || h.split(".")[0];
      const seg = location.pathname.split("/").filter(Boolean)[0];
      repo = repo || (seg && !/\.html?$/i.test(seg) ? seg : h);
    }
    return { owner, repo, branch: cfg.branch || "main", path: cfg.path || "data/site.json" };
  }

  /* ---------- lectura pública ---------- */
  const isDemoView = () => location.protocol === "file:" || /[?&]demo\b/.test(location.search);
  async function loadSite() {
    if (isDemoView()) { const d = ls.get("tl-site-demo", null); if (d) return { site: normSite(d), source: "demo" } }
    try {
      const r = await fetch((cfg.path || "data/site.json") + "?v=" + Date.now(), { cache: "no-store" });
      if (!r.ok) throw new Error(r.status);
      return { site: normSite(await r.json()), source: "json" };
    } catch (e) {
      return { site: normSite(ls.get("tl-site-demo", null)), source: "vacío" };
    }
  }

  /* ---------- datos del visitante (su navegador) ---------- */
  const visitor = {
    velas: () => +ls.get("tl-candles", 0) || 0,
    addVela() { const n = visitor.velas() + 1; ls.set("tl-candles", n); return n },
    msgs: () => (ls.get("tl-msgs2", []) || []).map(x => { const m = normMsg(x); if (m && x.rid) m.rid = String(x.rid); return m }).filter(Boolean),
    addMsg(t, n, rid) { const m = normMsg({ t, n, at: Date.now() }); if (rid) m.rid = String(rid).slice(0, 40); const l = ls.get("tl-msgs2", []) || []; l.push(m); ls.set("tl-msgs2", l.slice(-30)); return m },
    delMsg(id) { ls.set("tl-msgs2", (ls.get("tl-msgs2", []) || []).filter(m => m && m.id !== id)) },
    pendingVelas: () => +ls.get("tl-candles-pend", 0) || 0,
    setPendingVelas: n => ls.set("tl-candles-pend", Math.max(0, n | 0))
  };

  /* ---------- buzón de Google Apps Script (mensajes sin registro + velas compartidas) ---------- */
  const buzonUrl = String(((window.TL_CONFIG || {}).buzon || {}).url || "").trim();
  const remote = {
    enabled: /^https:\/\/script\.google(usercontent)?\.com\//.test(buzonUrl),
    async get(params) {
      const r = await fetch(buzonUrl + "?" + new URLSearchParams(params || {}), { cache: "no-store" });
      const d = await r.json(); if (!d || d.ok === false) throw new Error((d && d.error) || "error"); return d;
    },
    async post(body) {   // text/plain: petición simple, sin preflight CORS
      const r = await fetch(buzonUrl, { method: "POST", body: JSON.stringify(body), redirect: "follow" });
      const d = await r.json(); if (!d || d.ok === false) throw new Error((d && d.error) || "error"); return d;
    },
    velas: async () => +(await remote.get({ action: "velas" })).velas || 0,
    addVela: async () => +(await remote.post({ action: "vela" })).velas || 0,
    sendMsg: async (t, n) => (await remote.post({ action: "mensaje", t, n })).id,
    pending: async key => { const d = await remote.get({ action: "pendientes", key }); return { list: (d.pendientes || []).map(normMsg).filter(Boolean), velas: +d.velas || 0 } },
    mark: async (key, estados) => remote.post({ action: "marcar", key, estados }),
    setVelas: async (key, n) => +(await remote.post({ action: "velas-set", key, n })).velas || 0
  };

  /* ---------- cliente de GitHub para el panel ---------- */
  const b64enc = str => { const bytes = new TextEncoder().encode(str); let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(bin) };
  const b64dec = b64 => { const bin = atob(String(b64).replace(/\s/g, "")); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes) };

  function githubClient({ owner, repo, branch, path, token }) {
    const enc = encodeURIComponent;
    const base = API + "/repos/" + enc(owner) + "/" + enc(repo);
    const filePath = String(path).split("/").map(enc).join("/");
    async function gh(url, opt) {
      const r = await fetch(url, Object.assign({ cache: "no-store" }, opt, { headers: Object.assign({ "Accept": "application/vnd.github+json", "Authorization": "Bearer " + token, "X-GitHub-Api-Version": "2022-11-28" }, opt && opt.body ? { "Content-Type": "application/json" } : {}) }));
      let data = null; try { data = await r.json() } catch (e) {}
      if (!r.ok) { const err = new Error((data && data.message) || ("HTTP " + r.status)); err.status = r.status; throw err }
      return data;
    }
    return {
      mode: "github", owner, repo, branch, path,
      async check() {
        const me = await gh(API + "/user");
        const rp = await gh(base);
        const canPush = !rp.permissions || rp.permissions.push !== false;
        return { login: me.login, canPush, defaultBranch: rp.default_branch };
      },
      async load() {
        try {
          const f = await gh(base + "/contents/" + filePath + "?ref=" + enc(branch));
          return { site: normSite(JSON.parse(b64dec(f.content))), sha: f.sha };
        } catch (e) { if (e.status === 404) return { site: normSite(null), sha: null }; throw e }
      },
      async save(site, sha, message) {
        const clean = normSite(site); clean.actualizado = new Date().toISOString();
        const body = { message: message || "Actualizar datos del sitio desde el panel", content: b64enc(JSON.stringify(clean, null, 2) + "\n"), branch };
        if (sha) body.sha = sha;
        const res = await gh(base + "/contents/" + filePath, { method: "PUT", body: JSON.stringify(body) });
        return { site: clean, sha: res.content.sha };
      }
    };
  }

  function demoClient() {
    return {
      mode: "demo", owner: "demo", repo: "local", branch: "-", path: "localStorage",
      async check() { return { login: "demo", canPush: true } },
      async load() { return { site: normSite(ls.get("tl-site-demo", null)), sha: "demo" } },
      async save(site) { const clean = normSite(site); clean.actualizado = new Date().toISOString(); ls.set("tl-site-demo", clean); return { site: clean, sha: "demo" } }
    };
  }

  window.TLStore = { slotIds: SLOT_IDS, normAds, normSite, normMsg, normVideo, ytId, ytStart, creators: CREATORS, repoInfo, loadSite, visitor, remote, githubClient, demoClient, ls };
})();
