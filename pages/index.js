import { useState } from "react";
import Head from "next/head";

function renderMarkdownLite(text) {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = html.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (
      lines[i].trim().startsWith("|") &&
      i + 1 < lines.length &&
      lines[i + 1].trim().match(/^\|[\s\-\|:]+\|$/)
    ) {
      const headerCells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
      let tableHtml = '<table><thead><tr>' + headerCells.map((c) => `<th>${c}</th>`).join("") + "</tr></thead><tbody>";
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i].split("|").slice(1, -1).map((c) => c.trim());
        tableHtml += "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
        i++;
      }
      tableHtml += "</tbody></table>";
      out.push(tableHtml);
    } else {
      out.push(lines[i]);
      i++;
    }
  }
  html = out.join("\n");
  html = html.replace(/^### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|\n)([-*♦◆] .+(\n[-*♦◆] .+)*)/g, (m, pre, list) => {
    const items = list.split("\n").map((l) => l.replace(/^[-*♦◆]\s+/, "").trim()).filter(Boolean);
    return pre + "<ul>" + items.map((it) => `<li>${it}</li>`).join("") + "</ul>";
  });
  const blocks = html.split(/\n\n+/).map((b) => {
    const trimmed = b.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("<")) return trimmed;
    return "<p>" + trimmed.replace(/\n/g, "<br>") + "</p>";
  });
  return blocks.join("\n");
}

export default function Home() {
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState(null);

  async function handleGenerate() {
    setError("");
    if (problem.trim().length < 30) {
      setError("Décris ton problème en au moins 30 caractères. Plus c'est précis, meilleur sera le résultat.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      setProject(data.project);
    } catch (err) {
      setError("Erreur de connexion. Réessaie dans un instant.");
    }
    setLoading(false);
  }

  function handleReset() {
    setProblem("");
    setProject(null);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <Head>
        <title>Du problème au projet — Hector DEGLA</title>
        <meta name="description" content="Transforme ton idée en projet structuré : idée, cadre logique, budget et chronogramme. Bénin." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <header>
          <div className="brand-line">
            <span className="brand-name">HECTOR DEGLA</span>
            <span className="brand-sep">/</span>
            <span className="brand-role">CONSULTANT PROJETS · BÉNIN</span>
          </div>
          <div className="brand-phone">+229 01 62 91 71 91</div>
        </header>

        {!project && (
          <>
            <section className="hero">
              <div className="eyebrow">
                <span className="dot"></span>
                DU PROBLÈME AU PROJET — EN 2 MINUTES
              </div>
              <h1>
                PERSONNE<br />
                NE <span className="red">FINANCE</span><br />
                TES <span className="strike">IDÉES</span>.
              </h1>
              <p className="lede">
                Un projet bien posé, si. Décris ton problème réel — celui qui te tient debout la nuit — et reçois ton projet structuré.
              </p>
              <div className="deliverables-list">
                <span>01 IDÉE PROJET</span>
                <span>02 CADRE LOGIQUE</span>
                <span>03 BUDGET</span>
                <span>04 CHRONOGRAMME</span>
              </div>
            </section>

            <section className="form-section">
              <div className="form-number">→ COMMENCE ICI</div>
              <label className="form-label" htmlFor="problem">QUEL EST TON PROBLÈME&nbsp;?</label>
              <p className="form-hint">
                Sois CONCRET. Pas « le chômage des jeunes ». Plutôt « les diplômés en agronomie à Parakou ne trouvent pas de stage rémunéré et abandonnent le secteur ».
              </p>
              <textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                disabled={loading}
                placeholder="Dans ma commune de Glazoué, les femmes transformatrices de soja perdent 30% de leur production faute d'équipement de séchage adapté à la saison des pluies..."
              />
              <button className="submit-btn" onClick={handleGenerate} disabled={loading}>
                {loading ? "GÉNÉRATION EN COURS..." : "GÉNÉRER MON PROJET →"}
              </button>
              {error && <div className="error">{error}</div>}
            </section>
          </>
        )}

        {project && (
          <section className="results">
            <div className="results-header">
              <div className="eyebrow">
                <span className="dot"></span>
                TON PROJET — PREMIÈRE VERSION
              </div>
              <h2>VOILÀ.<br />MAINTENANT,<br /><span className="red">TRAVAILLE-LE.</span></h2>
            </div>

            {[
              { num: "01", title: "IDÉE PROJET", content: project.idea },
              { num: "02", title: "CADRE LOGIQUE", content: project.logframe },
              { num: "03", title: "BUDGET ESTIMATIF", content: project.budget },
              { num: "04", title: "CHRONOGRAMME", content: project.schedule },
            ].map((d) => (
              <div className="deliverable" key={d.num}>
                <div className="deliverable-header">
                  <span className="deliverable-number">{d.num}</span>
                  <span className="deliverable-title">{d.title}</span>
                </div>
                <div className="deliverable-body" dangerouslySetInnerHTML={{ __html: renderMarkdownLite(d.content) }} />
              </div>
            ))}

            <div className="cta-block">
              <div className="cta-eyebrow">→ ALLER PLUS LOIN</div>
              <h3>UNE VERSION<br /><span className="red">BANCABLE</span>&nbsp;?</h3>
              <p>
                Un projet IA, c'est une base. Pour le rendre finançable — étude de marché, analyse des risques, théorie du changement, budget détaillé — il faut un consultant qui connaît le terrain béninois.
              </p>
              <a
                href="https://wa.me/2290162917191?text=Bonjour%20Hector%2C%20j'ai%20utilis%C3%A9%20votre%20outil%20et%20je%20veux%20aller%20plus%20loin%20avec%20mon%20projet"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
              >
                CONTACTER HECTOR SUR WHATSAPP →
              </a>
              <button className="reset-btn" onClick={handleReset}>← RECOMMENCER</button>
            </div>
          </section>
        )}

        <footer>
          <span>HECTOR DEGLA · BÉNIN</span>
          <span>+229 01 62 91 71 91</span>
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --black: #0a0a0a;
          --white: #ffffff;
          --red: #e30613;
          --gray-line: #e5e5e5;
          --gray-text: #6b6b6b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body {
          font-family: "Inter", sans-serif;
          background: var(--white);
          color: var(--black);
          line-height: 1.5;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .page { max-width: 1100px; margin: 0 auto; padding: 24px 32px 60px; }

        header {
          display: flex; justify-content: space-between; align-items: center;
          padding-bottom: 24px; border-bottom: 2px solid var(--black);
          margin-bottom: 80px; gap: 24px; flex-wrap: wrap;
        }
        .brand-line { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; }
        .brand-sep { color: var(--red); }
        .brand-role { color: var(--gray-text); }
        .brand-phone { font-size: 12px; font-weight: 600; letter-spacing: 0.05em; }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
          color: var(--black); margin-bottom: 40px; text-transform: uppercase;
        }
        .dot { display: inline-block; width: 10px; height: 10px; background: var(--red); border-radius: 50%; animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.85); } }

        .hero { margin-bottom: 100px; }
        h1 {
          font-family: "Anton", sans-serif; font-weight: 400;
          font-size: clamp(56px, 12vw, 140px); line-height: 0.9;
          letter-spacing: -0.02em; margin-bottom: 40px; text-transform: uppercase;
        }
        .red { color: var(--red); }
        .strike { position: relative; display: inline-block; }
        .strike::after {
          content: ""; position: absolute; top: 50%; left: -4%; right: -4%;
          height: 8px; background: var(--red); transform: rotate(-3deg);
        }
        .lede { font-size: 22px; line-height: 1.4; max-width: 640px; color: var(--gray-text); margin-bottom: 48px; }
        .deliverables-list {
          display: flex; gap: 32px; flex-wrap: wrap;
          padding-top: 24px; border-top: 1px solid var(--gray-line);
          font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
        }
        .deliverables-list span { white-space: nowrap; }

        .form-section { background: var(--white); border: 2px solid var(--black); padding: 56px 48px; margin-bottom: 32px; position: relative; }
        .form-number { position: absolute; top: -2px; left: -2px; background: var(--red); color: var(--white); padding: 8px 16px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; }
        .form-label {
          display: block; font-family: "Anton", sans-serif; font-weight: 400;
          font-size: clamp(32px, 5vw, 56px); line-height: 1; letter-spacing: -0.01em;
          margin-top: 16px; margin-bottom: 16px; text-transform: uppercase;
        }
        .form-hint { font-size: 15px; color: var(--gray-text); margin-bottom: 32px; max-width: 560px; }
        textarea {
          width: 100%; min-height: 160px; padding: 20px;
          font-family: "Inter", sans-serif; font-size: 16px; line-height: 1.6;
          border: 2px solid var(--black); background: var(--white); color: var(--black);
          resize: vertical; transition: all 0.15s ease;
        }
        textarea:focus { outline: none; box-shadow: 6px 6px 0 var(--red); }
        textarea::placeholder { color: #bbb; }
        .submit-btn {
          margin-top: 24px; background: var(--black); color: var(--white);
          border: 2px solid var(--black); padding: 24px 40px;
          font-family: "Inter", sans-serif; font-size: 14px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer;
          width: 100%; transition: all 0.15s ease;
        }
        .submit-btn:hover:not(:disabled) { background: var(--red); border-color: var(--red); transform: translate(-4px, -4px); box-shadow: 8px 8px 0 var(--black); }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: var(--white); border: 2px solid var(--red); color: var(--red); padding: 16px 20px; margin-top: 16px; font-size: 14px; font-weight: 500; }

        .results-header { margin-bottom: 64px; }
        .results-header h2 {
          font-family: "Anton", sans-serif; font-weight: 400;
          font-size: clamp(48px, 9vw, 120px); line-height: 0.9;
          letter-spacing: -0.02em; text-transform: uppercase;
        }
        .deliverable { border: 2px solid var(--black); margin-bottom: 24px; background: var(--white); }
        .deliverable-header { background: var(--black); color: var(--white); padding: 20px 32px; display: flex; align-items: center; gap: 24px; }
        .deliverable-number { font-family: "Anton", sans-serif; font-size: 36px; color: var(--red); line-height: 1; }
        .deliverable-title { font-family: "Anton", sans-serif; font-size: 24px; letter-spacing: 0.02em; line-height: 1; }
        .deliverable-body { padding: 40px 32px; font-size: 15px; line-height: 1.7; color: var(--gray-text); }
        .deliverable-body h4 {
          font-family: "Inter", sans-serif; font-size: 16px; font-weight: 700;
          margin-top: 24px; margin-bottom: 10px; color: var(--black);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .deliverable-body h4:first-child { margin-top: 0; }
        .deliverable-body p { margin-bottom: 14px; }
        .deliverable-body ul { list-style: none; margin-bottom: 14px; }
        .deliverable-body ul li { padding-left: 24px; position: relative; margin-bottom: 10px; }
        .deliverable-body ul li::before { content: "▸"; position: absolute; left: 0; color: var(--red); font-weight: 700; }
        .deliverable-body strong { color: var(--black); font-weight: 600; }
        .deliverable-body table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
        .deliverable-body th, .deliverable-body td { border: 1px solid var(--black); padding: 12px 14px; text-align: left; }
        .deliverable-body th { background: var(--black); color: var(--white); font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.06em; }

        .cta-block { margin-top: 64px; padding: 64px 48px; background: var(--black); color: var(--white); position: relative; overflow: hidden; }
        .cta-eyebrow { font-size: 11px; letter-spacing: 0.2em; color: var(--red); margin-bottom: 32px; font-weight: 700; }
        .cta-block h3 {
          font-family: "Anton", sans-serif; font-weight: 400;
          font-size: clamp(48px, 9vw, 110px); line-height: 0.9;
          letter-spacing: -0.02em; margin-bottom: 32px; text-transform: uppercase;
        }
        .cta-block p { max-width: 520px; color: rgba(255, 255, 255, 0.7); font-size: 17px; line-height: 1.5; margin-bottom: 40px; }
        .whatsapp-btn {
          display: inline-block; background: var(--red); color: var(--white);
          text-decoration: none; padding: 24px 40px; font-weight: 700;
          font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase;
          border: 2px solid var(--red); transition: all 0.15s ease;
        }
        .whatsapp-btn:hover { background: var(--white); color: var(--black); border-color: var(--white); transform: translate(-4px, -4px); box-shadow: 8px 8px 0 var(--red); }
        .reset-btn {
          display: block; margin: 32px 0 0; background: transparent;
          color: rgba(255, 255, 255, 0.6); border: none; padding: 8px 0;
          font-family: "Inter", sans-serif; font-size: 12px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em; cursor: pointer;
        }
        .reset-btn:hover { color: var(--white); }

        footer { margin-top: 80px; padding-top: 24px; border-top: 2px solid var(--black); display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; }

        @media (max-width: 700px) {
          .page { padding: 20px 20px 40px; }
          .form-section { padding: 40px 24px; }
          .cta-block { padding: 48px 24px; }
          .deliverable-body { padding: 28px 20px; }
          .deliverable-header { padding: 16px 20px; gap: 16px; }
          .deliverable-number { font-size: 28px; }
          .deliverable-title { font-size: 18px; }
          footer { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>
    </>
  );
}
