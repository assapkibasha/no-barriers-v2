"use client";

import { useEffect, useRef, useState } from "react";
import SignStage, { type SignStageHandle } from "@/components/SignStage";
import { loadTopic, signTopics } from "@/lib/signing/signs";
import type { SignDef } from "@/lib/signing/types";
import styles from "./studio.module.css";

/** Preview every sign and free-form sequences. Also exposes a test hook for automated pose checks. */
export default function SignStudio() {
  const stage = useRef<SignStageHandle>(null);
  const [topic, setTopic] = useState(signTopics[0]);
  const [signs, setSigns] = useState<SignDef[]>([]);
  const [sequence, setSequence] = useState("greet.hello");
  const [items, setItems] = useState<string[]>(["greet.hello"]);
  const [mirror, setMirror] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadTopic(topic).then(setSigns).catch(e => setError(String(e))); }, [topic]);
  useEffect(() => {
    (window as unknown as { __studio: unknown }).__studio = {
      play: (list: string[]) => { setItems(list); return stage.current?.play(list); },
      player: () => stage.current?.player(),
    };
  }, []);

  const run = (list: string[]) => { setError(""); setItems(list); void stage.current?.play(list); };

  return <main className={styles.studio}>
    <header><h1>Sign studio</h1><p>Preview the signing avatar. Sequences accept sign ids, <code>spell:WORD</code> and numbers like <code>num.7</code>.</p></header>
    <div className={styles.layout}>
      <section>
        <SignStage ref={stage} items={items} captions={items.map(i => i.replace(/^.*[.:]/, ""))} autoPlay={false} mirror={mirror} className={styles.stage} />
        <form className={styles.sequence} onSubmit={e => { e.preventDefault(); run(sequence.split(/\s+/).filter(Boolean)); }}>
          <label>Sequence<input value={sequence} onChange={e => setSequence(e.target.value)} /></label>
          <button>Play sequence</button>
          <label className={styles.check}><input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)} />Left-handed</label>
        </form>
        {error && <p role="alert">{error}</p>}
      </section>
      <aside>
        <div className={styles.topics}>{signTopics.map(t => <button key={t} aria-pressed={t === topic} onClick={() => setTopic(t)}>{t}</button>)}</div>
        <ul className={styles.list}>{signs.map(s => <li key={s.id}><button onClick={() => run([s.id])}><strong>{s.gloss}</strong><small>{s.id}{s.review ? " · needs review" : ""}</small></button></li>)}</ul>
      </aside>
    </div>
  </main>;
}
