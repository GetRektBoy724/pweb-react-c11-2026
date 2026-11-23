import { useEffect, useState } from "react";
import "../styles/interview-timer.css";

const TIMER_DURATION_SECONDS = 2 * 60;

const INTERVIEW_QUESTIONS = [
  "Ceritakan tentang diri kamu dan alasan tertarik pada posisi magang ini.",
  "Ceritakan proyek yang pernah kamu kerjakan dan kontribusimu di dalamnya.",
  "Bagaimana kamu mempelajari teknologi baru yang belum pernah digunakan?",
  "Ceritakan masalah teknis yang pernah kamu hadapi dan cara menyelesaikannya.",
  "Bagaimana kamu menerima feedback dan bekerja sama dalam sebuah tim?",
];

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Timer latihan interview dua menit dengan cleanup saat panel dilepas. */
export function InterviewPrepTimer() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (secondsLeft === 0) setIsRunning(false);
  }, [secondsLeft]);

  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(TIMER_DURATION_SECONDS);
  };

  const nextQuestion = () => {
    setQuestionIndex((index) => (index + 1) % INTERVIEW_QUESTIONS.length);
    resetTimer();
  };

  return (
    <section className="interview-timer" aria-labelledby="interview-timer-title">
      <div className="interview-timer-heading">
        <div>
          <h3 id="interview-timer-title">Latihan Interview</h3>
          <p>
            Pertanyaan {questionIndex + 1} dari {INTERVIEW_QUESTIONS.length}
          </p>
        </div>
        <output className="interview-timer-clock" aria-live="off">
          {formatTime(secondsLeft)}
        </output>
      </div>

      <p className="interview-timer-question" aria-live="polite">
        {INTERVIEW_QUESTIONS[questionIndex]}
      </p>

      {secondsLeft === 0 && (
        <p className="interview-timer-finished" role="status">
          Waktu latihan selesai. Lanjutkan ke pertanyaan berikutnya atau reset timer.
        </p>
      )}

      <div className="interview-timer-actions">
        <button
          type="button"
          onClick={() => setIsRunning((running) => !running)}
          disabled={secondsLeft === 0}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button type="button" onClick={resetTimer}>
          Reset
        </button>
        <button type="button" onClick={nextQuestion}>
          Soal Berikutnya
        </button>
      </div>
    </section>
  );
}
