import { useState } from "react";

interface SkillProfileProps {
  skills: string[];
  onAdd: (skill: string) => void;
  onRemove: (skill: string) => void;
}

/** Profil skill Kapten: tambah/hapus skill, tolak duplikat, persist di localStorage (dari parent). */
export function SkillProfile({ skills, onAdd, onRemove }: SkillProfileProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (trimmed === "") {
      setError("Skill tidak boleh kosong.");
      return;
    }
    const isDuplicate = skills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase(),
    );
    if (isDuplicate) {
      setError(`Skill "${trimmed}" sudah ada di profil.`);
      return;
    }
    onAdd(trimmed);
    setInput("");
    setError("");
  }

  return (
    <section className="skill-profile">
      <h2>Skill Kapten</h2>
      <p className="hint">
        Skill dipakai untuk menghitung Match Score setiap lowongan.
      </p>
      <form onSubmit={handleSubmit} className="skill-form">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          placeholder="cth: Docker"
          aria-label="Skill baru"
        />
        <button type="submit">+ Tambah</button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <ul className="skill-list">
        {skills.map((skill) => (
          <li key={skill} className="skill-chip">
            <span>{skill}</span>
            <button
              type="button"
              onClick={() => onRemove(skill)}
              aria-label={`Hapus skill ${skill}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
