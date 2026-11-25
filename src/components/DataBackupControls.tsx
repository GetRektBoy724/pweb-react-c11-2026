import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Application } from "../types";
import { isApplicationBackup, type ApplicationBackup } from "../utils/backup";

interface DataBackupControlsProps {
  applications: Application[];
  kaptenSkills: string[];
  onImport: (backup: ApplicationBackup) => void;
}

export function DataBackupControls({
  applications,
  kaptenSkills,
  onImport,
}: DataBackupControlsProps) {
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const exportBackup = () => {
    const backup: ApplicationBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      applications,
      kaptenSkills,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aku-mw-magang-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setHasError(false);
    setMessage("Backup JSON berhasil diunduh.");
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isApplicationBackup(parsed)) {
        setHasError(true);
        setMessage("Format backup tidak valid atau versinya tidak didukung.");
        return;
      }

      const shouldReplace = window.confirm(
        `Import ${parsed.applications.length} lamaran dan ${parsed.kaptenSkills.length} skill? Data lokal saat ini akan diganti.`,
      );
      if (!shouldReplace) return;

      onImport(parsed);
      setHasError(false);
      setMessage("Backup berhasil diimpor.");
    } catch {
      setHasError(true);
      setMessage("File tidak dapat dibaca sebagai JSON yang valid.");
    } finally {
      input.value = "";
    }
  };

  return (
    <section className="data-backup" aria-labelledby="data-backup-title">
      <div>
        <h2 id="data-backup-title">Backup Data</h2>
        <p>Ekspor atau pulihkan daftar lamaran dan skill Kapten dalam format JSON.</p>
      </div>
      <div className="data-backup-actions">
        <button type="button" onClick={exportBackup}>
          Ekspor JSON
        </button>
        <label className="data-backup-import">
          Impor JSON
          <input type="file" accept=".json,application/json" onChange={importBackup} />
        </label>
      </div>
      {message && (
        <p className={hasError ? "data-backup-message error" : "data-backup-message"} role="status">
          {message}
        </p>
      )}
    </section>
  );
}
