import { useState, useEffect } from "react";
import Upload from "./Upload";
import Dashboard from "./Dashboard";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ornikar_data");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.ADS?.length) setData(parsed);
      }
    } catch (e) {
      console.warn("Failed to restore data", e);
    }
  }, []);

  const handleReset = () => {
    localStorage.removeItem("ornikar_data");
    setData(null);
  };

  if (!data) return <Upload onData={setData} />;
  return <Dashboard DAILY={data.DAILY} ADS={data.ADS} TODAY={data.TODAY} onReset={handleReset} />;
}
