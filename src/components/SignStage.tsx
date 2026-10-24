"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { IconPlayerPlay, IconRefresh, IconRotate360, IconGauge } from "@tabler/icons-react";
import type { PlayItem, SignAvatarPlayer } from "@/lib/signing/player";
import styles from "./SignStage.module.css";

export type SignStageHandle = { play: (items?: PlayItem[]) => Promise<boolean>; player: () => SignAvatarPlayer | null };

type Props = {
  /** What to sign. Changing it plays the new sequence when `autoPlay` is set. */
  items: PlayItem[];
  /** Words shown under the avatar, one per item; the current one is highlighted. */
  captions?: string[];
  autoPlay?: boolean;
  mirror?: boolean;
  /** Hide the caption, e.g. during a recognition question. */
  hideCaption?: boolean;
  onPlayed?: () => void;
  className?: string;
  label?: string;
};

/** The 3D signer: replay, slow motion, and a limited front-facing orbit. */
const SignStage = forwardRef<SignStageHandle, Props>(function SignStage({ items, captions, autoPlay = true, mirror = false, hideCaption, onPlayed, className, label = "Sign language animation" }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<SignAvatarPlayer | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [current, setCurrent] = useState(-1);
  const [slow, setSlow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const itemsKey = JSON.stringify(items);
  const latest = useRef({ items, onPlayed });
  useEffect(() => { latest.current = { items, onPlayed }; });

  const play = async (list = latest.current.items) => {
    const p = player.current;
    if (!p || !list.length) return false;
    setPlaying(true);
    try {
      const done = await p.play(list);
      if (done) latest.current.onPlayed?.();
      return done;
    } catch (error) {
      console.error(error);
      setStatus("error");
      return false;
    } finally {
      if (!p.playing) setPlaying(false);
    }
  };

  useImperativeHandle(ref, () => ({ play, player: () => player.current }));

  useEffect(() => {
    let disposed = false;
    import("@/lib/signing/player")
      .then(({ SignAvatarPlayer }) => SignAvatarPlayer.create(host.current!, { mirror, onSign: setCurrent }))
      .then(p => { if (disposed) p.dispose(); else { player.current = p; setStatus("ready"); } })
      .catch(error => { console.error(error); if (!disposed) setStatus("error"); });
    return () => { disposed = true; player.current?.dispose(); player.current = null; };
    // The player is created once; mirror changes are applied below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { player.current?.setMirror(mirror); }, [mirror, status]);
  useEffect(() => { player.current?.setSpeed(slow ? 0.5 : 1); }, [slow, status]);
  useEffect(() => {
    if (status === "ready" && autoPlay) void play();
  }, [status, itemsKey, autoPlay]);

  return <figure className={`${styles.stage} ${className ?? ""}`} aria-label={label}>
    <div ref={host} className={styles.canvas} />
    {status === "loading" && <div className={styles.overlay} role="status"><span className={styles.spinner} />Preparing the signer…</div>}
    {status === "error" && <div className={styles.overlay} role="alert">The signer could not load. Check your connection and try again.<button onClick={() => location.reload()}>Reload</button></div>}
    {!hideCaption && captions && captions.length > 0 && <figcaption className={styles.caption} aria-live="polite">
      {captions.map((word, i) => <span key={`${word}-${i}`} className={i === current ? styles.active : ""}>{word}</span>)}
    </figcaption>}
    <div className={styles.controls}>
      <button type="button" onClick={() => void play()} disabled={status !== "ready"} aria-label={playing ? "Replay from the start" : "Play the sign"}>{playing ? <IconRefresh size={20} /> : <IconPlayerPlay size={20} />}<span>{playing ? "Replay" : "Play"}</span></button>
      <button type="button" onClick={() => setSlow(s => !s)} aria-pressed={slow} disabled={status !== "ready"} aria-label="Slow motion"><IconGauge size={20} /><span>{slow ? "0.5×" : "1×"}</span></button>
      <button type="button" onClick={() => player.current?.resetView()} disabled={status !== "ready"} aria-label="Face the signer"><IconRotate360 size={20} /></button>
    </div>
    <p className={styles.hint}>Drag to turn the signer</p>
  </figure>;
});

export default SignStage;
