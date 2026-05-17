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
      const headerCells = lines[i]
        .split("|")
        .slice(1, -1)
        .map((c) => c.trim());
      let tableHtml =
        '<table><thead><tr>' +
        headerCells.map((c) => `<th>${c}</th>`).join("") +
        "</tr></thead><tbody>";
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const cells = lines[i]
          .split("|")
          .slice(1, -1)
          .map((c) => c.trim());
        tableHtml +=
          "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
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
    const items = list
      .split("\n")
      .map((l) => l.replace(/^[-*♦◆]\s+/, "").trim())
      .filter(Boolean);
    return (
      pre + "<ul>" + items.map((it) => `<li>${it}</li>`).join("") + "</ul>"
    );
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
      setError(
        "Décris ton problème en au moins 30 caractères. Plus c'est précis, meilleur sera le résultat."
      );
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
        <meta
          name="description"
          content="Transforme ton idée en projet structuré : idée, cadre logique, budget et chronogramme. Bénin."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="container">
        <header>
          <div>
            <div className="brand">Hector DEGLA</div>
            <div className="brand-tag">
              Consultant — Montage de projets · Bénin
            </div>
          </div>
          <div className="header-meta">+229 01 62 91 71 91</div>
        </header>

        {!project && (
          <>
            <section className="hero">
              <span className="eyebrow">Du problème au projet — en 2 minutes</span>
              <h1>
                Décris ton problème.
                <br />
                Reçois ton <em>projet structuré.</em>
              </h1>
              <p className="lede">
                Une idée floue ne lève pas de financement. Un projet bien posé,
                si. Pose-moi ton problème réel — celui qui te tient debout la
                nuit — et l'IA te rendra une première version structurée : idée
                projet, cadre logique, budget estimatif et chronogramme.
              </p>
            </section>

            <section className="form-section">
              <label className="form-label" htmlFor="problem">
                Quel est le problème profond que tu veux résoudre ?
              </label>
              <p className="form-hint">
                Sois concret. Évite « le chômage des jeunes ». Préfère « les
                jeunes diplômés en agronomie à Parakou ne trouvent pas de stage
                rémunéré et abandonnent le secteur ». Plus c'est précis, plus le
                projet sera utile.
              </p>
              <textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                disabled={loading}
                placeholder="Exemple : Dans ma commune de Glazoué, les femmes transformatrices de soja perdent 30% de leur production faute d'équipement de séchage adapté à la saison des pluies..."
              />
              <button
                className="submit-btn"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? "L'IA structure ton projet..." : "Générer mon projet structuré"}
              </button>
              {error && <div className="error">{error}</div>}
            </section>
          </>
        )}

        {project && (
          <section className="results">
            <div className="results-header">
              <h2>Ton projet, première version</h2>
              <p>À retravailler, à affiner — mais tu as une base solide</p>
            </div>

            {[
              { num: "01", title: "Idée projet", content: project.idea },
              { num: "02", title: "Cadre logique", content: project.logframe },
              { num: "03", title: "Budget estimatif", content: project.budget },
              { num: "04", title: "Chronogramme", content: project.schedule },
            ].map((d) => (
              <div className="deliverable" key={d.num}>
                <div className="deliverable-header">
                  <span className="deliverable-number">{d.num}</span>
                  <span className="deliverable-title">{d.title}</span>
                </div>
                <div
                  className="deliverable-body"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdownLite(d.content),
                  }}
                />
              </div>
            ))}

            <div className="cta-block">
              <div className="cta-eyebrow">Aller plus loin</div>
              <h3>Tu veux une version bancable, prête pour les bailleurs ?</h3>
              <p>
                Un projet généré par IA, c'est une base. Pour le transformer en
                dossier finançable — avec étude de marché, analyse des risques,
                théorie du changement et budget détaillé — il faut un consultant
                qui connaît le terrain béninois.
              </p>
              <a
                href="https://wa.me/2290162917191?text=Bonjour%20Hector%2C%20j'ai%20utilis%C3%A9%20votre%20outil%20et%20je%20veux%20aller%20plus%20loin%20avec%20mon%20projet"
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
              >
                <svg className="whatsapp-icon" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Discuter avec Hector sur WhatsApp
              </a>
              <button className="reset-btn" onClick={handleReset}>
                Recommencer avec un autre problème
              </button>
            </div>
          </section>
        )}

        <footer>
          Hector DEGLA — Consultant en montage de projets · Bénin · +229 01 62
          91 71 91
        </footer>
      </div>

      <style jsx global>{`
        :root {
          --ink: #0a1a2f;
          --ink-soft: #1a3155;
          --accent: #d97706;
          --accent-soft: #fbbf24;
          --whatsapp: #25d366;
          --cream: #faf6ef;
          --cream-dark: #f0e8d8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: "Inter", sans-serif;
          background: var(--cream);
          color: var(--ink);
          line-height: 1.6;
          min-height: 100vh;
          background-image:
            radial-gradient(circle at 20% 10%, rgba(217, 119, 6, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 80% 90%, rgba(26, 49, 85, 0.05) 0%, transparent 40%);
        }
        .container { max-width: 880px; margin: 0 auto; padding: 32px 24px 80px; }
        header {
          border-bottom: 2px solid var(--ink);
          padding-bottom: 24px;
          margin-bottom: 48px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
        }
        .brand { font-family: "Fraunces", serif; font-weight: 800; font-size: 22px; letter-spacing: -0.02em; }
        .brand-tag { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: var(--ink-soft); font-weight: 500; margin-top: 4px; }
        .header-meta { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: var(--ink-soft); }
        .hero { margin-bottom: 56px; }
        .eyebrow {
          display: inline-block;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--accent);
        }
        h1 { font-family: "Fraunces", serif; font-weight: 800; font-size: clamp(36px, 6vw, 56px); line-height: 1.05; letter-spacing: -0.03em; margin-bottom: 20px; }
        h1 em { font-style: italic; color: var(--accent); font-weight: 600; }
        .lede { font-family: "Fraunces", serif; font-size: 19px; font-weight: 400; line-height: 1.5; max-width: 620px; color: var(--ink-soft); }
        .form-section { background: white; border: 2px solid var(--ink); padding: 40px; margin-bottom: 32px; position: relative; box-shadow: 10px 10px 0 var(--ink); }
        .form-label { display: block; font-family: "Fraunces", serif; font-size: 20px; font-weight: 600; margin-bottom: 8px; }
        .form-hint { font-size: 14px; color: var(--ink-soft); margin-bottom: 20px; }
        textarea {
          width: 100%; min-height: 140px; padding: 16px;
          font-family: "Inter", sans-serif; font-size: 16px; line-height: 1.5;
          border: 1px solid var(--ink); background: var(--cream); color: var(--ink);
          resize: vertical; transition: all 0.2s ease;
        }
        textarea:focus { outline: none; background: white; box-shadow: 4px 4px 0 var(--accent); }
        .submit-btn {
          margin-top: 24px; background: var(--ink); color: var(--cream);
          border: none; padding: 18px 32px; font-family: "Inter", sans-serif;
          font-size: 15px; font-weight: 600; letter-spacing: 0.05em;
          text-transform: uppercase; cursor: pointer; width: 100%; transition: all 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) { background: var(--accent); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { background: #fef2f2; border: 1px solid #dc2626; color: #991b1b; padding: 16px; margin-top: 16px; font-size: 14px; }
        .results-header { text-align: center; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px dashed var(--ink); }
        .results-header h2 { font-family: "Fraunces", serif; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }
        .results-header p { color: var(--ink-soft); font-style: italic; }
        .deliverable { background: white; border: 1px solid var(--ink); margin-bottom: 24px; overflow: hidden; }
        .deliverable-header { background: var(--ink); color: var(--cream); padding: 16px 24px; display: flex; align-items: center; gap: 16px; }
        .deliverable-number { font-family: "Fraunces", serif; font-size: 24px; font-weight: 800; color: var(--accent-soft); }
        .deliverable-title { font-family: "Fraunces", serif; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
        .deliverable-body { padding: 28px; font-size: 15px; line-height: 1.7; }
        .deliverable-body h4 { font-family: "Fraunces", serif; font-size: 17px; font-weight: 600; margin-top: 20px; margin-bottom: 8px; color: var(--ink); }
        .deliverable-body h4:first-child { margin-top: 0; }
        .deliverable-body p { margin-bottom: 12px; color: var(--ink-soft); }
        .deliverable-body ul { list-style: none; margin-bottom: 12px; }
        .deliverable-body ul li { padding-left: 22px; position: relative; margin-bottom: 8px; color: var(--ink-soft); }
        .deliverable-body ul li::before { content: "◆"; position: absolute; left: 0; color: var(--accent); font-size: 10px; top: 7px; }
        .deliverable-body strong { color: var(--ink); font-weight: 600; }
        .deliverable-body table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
        .deliverable-body th, .deliverable-body td { border: 1px solid var(--ink); padding: 10px 12px; text-align: left; }
        .deliverable-body th { background: var(--cream-dark); font-weight: 600; }
        .cta-block { margin-top: 48px; padding: 40px; background: var(--ink); color: var(--cream); text-align: center; position: relative; overflow: hidden; }
        .cta-block::before { content: ""; position: absolute; top: -50%; right: -20%; width: 400px; height: 400px; background: radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, transparent 60%); pointer-events: none; }
        .cta-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.3em; color: var(--accent-soft); margin-bottom: 16px; font-weight: 600; }
        .cta-block h3 { font-family: "Fraunces", serif; font-size: 28px; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em; line-height: 1.2; }
        .cta-block p { max-width: 480px; margin: 0 auto 28px; color: rgba(250, 246, 239, 0.8); font-size: 15px; }
        .whatsapp-btn { display: inline-flex; align-items: center; gap: 12px; background: var(--whatsapp); color: white; text-decoration: none; padding: 18px 32px; font-weight: 600; font-size: 15px; transition: all 0.2s ease; position: relative; z-index: 1; }
        .whatsapp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4); }
        .whatsapp-icon { width: 22px; height: 22px; fill: white; }
        .reset-btn { display: block; margin: 24px auto 0; background: transparent; color: var(--cream); border: 1px solid rgba(250, 246, 239, 0.3); padding: 12px 24px; font-family: "Inter", sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s ease; }
        .reset-btn:hover { border-color: var(--cream); background: rgba(250, 246, 239, 0.05); }
        footer { margin-top: 60px; padding-top: 24px; border-top: 1px solid rgba(26, 49, 85, 0.2); text-align: center; font-size: 12px; color: var(--ink-soft); letter-spacing: 0.05em; }
        @media (max-width: 600px) {
          .form-section { padding: 24px; box-shadow: 6px 6px 0 var(--ink); }
          .deliverable-body { padding: 20px; }
          .cta-block { padding: 28px 20px; }
          .cta-block h3 { font-size: 22px; }
        }
      `}</style>
    </>
  );
}
