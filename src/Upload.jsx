import { useState } from "react";
import { parseFiles } from "./parseData";

function Dropzone({ label, file, onFile, accept = ".csv" }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files[0];
        if (f) onFile(f);
      }}
      style={{
        display: "block",
        border: `2px dashed ${drag ? "#6366f1" : file ? "#10b981" : "#d1d5db"}`,
        background: drag ? "#eef2ff" : file ? "#ecfdf5" : "#fafafa",
        borderRadius: 14,
        padding: "32px 20px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all .15s",
      }}
    >
      <input
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files[0]) onFile(e.target.files[0]);
        }}
      />
      <div style={{ fontSize: 13, fontWeight: 700, color: file ? "#10b981" : "#555", marginBottom: 6 }}>
        {label}
      </div>
      {file ? (
        <div style={{ fontSize: 11, color: "#10b981" }}>
          ✓ {file.name} <span style={{ color: "#999" }}>({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: "#999" }}>
          Glisse un .csv ici, ou clique pour parcourir
        </div>
      )}
    </label>
  );
}

export default function Upload({ onData }) {
  const [nomenFile, setNomenFile] = useState(null);
  const [perfFile, setPerfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ready = nomenFile && perfFile;

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await parseFiles(nomenFile, perfFile);
      if (!data.ADS.length) throw new Error("Aucune créa parsée. Vérifie le format du CSV de perf.");
      // Persist
      try {
        localStorage.setItem("ornikar_data", JSON.stringify(data));
      } catch (e) {
        console.warn("localStorage failed, dataset too big?", e);
      }
      onData(data);
    } catch (e) {
      setError(e.message || "Erreur lors du parsing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter',-apple-system,system-ui,sans-serif",
        background: "#f6f6f7",
        minHeight: "100vh",
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: 640, width: "100%" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            margin: "0 0 6px",
            letterSpacing: "-.03em",
            color: "#111",
          }}
        >
          Scorecard Creative Paid Social
        </h1>
        <p style={{ color: "#888", fontSize: 13, margin: "0 0 32px" }}>
          Upload tes deux CSV TikTok pour générer le dashboard.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
          <Dropzone
            label="1. Nomenclature des créas"
            file={nomenFile}
            onFile={setNomenFile}
          />
          <Dropzone label="2. Perf par créa" file={perfFile} onFile={setPerfFile} />
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#b91c1c",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 12,
              marginBottom: 16,
            }}
          >
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!ready || loading}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: 10,
            border: "none",
            background: ready && !loading ? "#6366f1" : "#d1d5db",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: ready && !loading ? "pointer" : "not-allowed",
            transition: "background .15s",
          }}
        >
          {loading ? "Parsing en cours…" : "Générer le dashboard →"}
        </button>

        <div
          style={{
            marginTop: 28,
            padding: 16,
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #eee",
            fontSize: 11,
            color: "#666",
            lineHeight: 1.6,
          }}
        >
          <div style={{ fontWeight: 700, color: "#333", marginBottom: 6 }}>Format attendu</div>
          <div>
            <b>Nomenclature :</b> Ad name, Produit, Realisation, Format, Concept, Angle, Sous-angle,
            Version, URL Apercu
          </div>
          <div style={{ marginTop: 4 }}>
            <b>Perf :</b> Date, Ad Name, Date première diffusion, Date dernière diffusion, Durée
            (jour), SUM de Impr, SUM de Cost, SUM de Clic, Total 2-sec views, Total Install, Total
            Signup
          </div>
        </div>
      </div>
    </div>
  );
}
