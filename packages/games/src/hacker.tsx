"use client";

import { useEffect, useRef, useState } from "react";

/* A minute+ of cinematic nonsense on a loop — the kind of "hacking" only a
 * 90s crime drama believes in. Pure DOM/CSS, no canvas. */

const LINES = [
  "> initialising NETWATCH intrusion suite v3.7",
  "> rerouting through 7 proxies ......... OK",
  "> spoofing MAC 00:1B:44:11:3A:B7",
  "BYPASSING FIREWALL [layer 3]",
  "BYPASSING FIREWALL [layer 4]",
  "compiling kernel exploit (ring0)",
  "injecting SQL payload -> ' OR 1=1 --",
  "DECRYPTING RSA-4096 :: 61% :: 74% :: 88%",
  "brute-force ssh :: attempt 4,182,551",
  "brute-force ssh :: attempt 4,182,552",
  "!! trace detected — deploying countermeasures",
  "ENHANCE. ENHANCE. ENHANCE.",
  "creating GUI interface using visual basic",
  "accessing mainframe /dev/core0",
  "downloading /root/.secrets/* (2,048 files)",
  "neural handshake established",
  "packet sniffer online — 12,904 pkt/s",
  "overriding security protocols [SUDO]",
  "uploading nanovirus.bin  [##########] 100%",
  "c:\\> nmap -sS -A -T5 10.0.0.0/8",
  "port 31337/tcp open  elite",
  "port 8080/tcp  open  http-proxy",
  "SHA-256 collision found in 0.4s (nice)",
  "recompiling reality.dll ...",
  "cross-referencing DMV + INTERPOL + LinkedIn",
  "isolating subject on grid J-14",
  "// he's using an IP masker",
  "// then i'll spoof his spoof",
  "AES key exfiltrated: 4f a1 9c ... 0e",
  "root@target:~# whoami\nroot",
];

const STATUS = [
  "LOCATING NODE",
  "TRIANGULATING",
  "TRACE ACTIVE",
  "SPLICING FIBRE",
  "DECRYPTING",
  "TUNNELLING",
  "ENUMERATING",
  "EXFILTRATING",
];

const BAR_DELAYS = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 0.98, 1.12];
const rnd = (n: number) => (Math.random() * n) | 0;
const pick = <T,>(a: readonly T[]): T => a[rnd(a.length)] as T;
const ip = () => `${rnd(255)}.${rnd(255)}.${rnd(255)}.${rnd(255)}`;
const hex = (n: number) =>
  Array.from({ length: n }, () => rnd(256).toString(16).padStart(2, "0")).join(" ");

export default function HackerConsole() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [log, setLog] = useState<string[]>(["> ready.", "> _"]);
  const [trace, setTrace] = useState(3);
  const [status, setStatus] = useState<string>(pick(STATUS));
  const [hexRow, setHexRow] = useState(hex(24));
  const [flash, setFlash] = useState<{ text: string; ok: boolean } | null>(null);
  const [nodes, setNodes] = useState<{ x: number; y: number; k: number }[]>([]);

  useEffect(() => {
    const visible = () => !document.hidden && rootRef.current?.offsetParent != null;

    const logId = setInterval(() => {
      if (!visible()) return;
      const add =
        Math.random() < 0.35
          ? `> conn ${ip()} :${1000 + rnd(64000)}  [${pick(STATUS)}]`
          : pick(LINES);
      setLog((l) => [...l.slice(-140), add]);
    }, 165);

    const traceId = setInterval(() => {
      if (!visible()) return;
      setTrace((t) => {
        const next = t + Math.random() * 4;
        if (next >= 100) {
          setStatus(pick(STATUS));
          return 2 + Math.random() * 6;
        }
        return next;
      });
      if (Math.random() < 0.12) setStatus(pick(STATUS));
    }, 90);

    const hexId = setInterval(() => {
      if (visible()) setHexRow(hex(24));
    }, 110);

    const nodeId = setInterval(() => {
      if (!visible()) return;
      setNodes(
        Array.from({ length: 4 + rnd(4) }, () => ({
          x: 8 + rnd(84),
          y: 12 + rnd(70),
          k: Math.random(),
        }))
      );
    }, 1300);

    let flashTimeout: ReturnType<typeof setTimeout>;
    const scheduleFlash = () => {
      flashTimeout = setTimeout(
        () => {
          if (visible()) {
            const ok = Math.random() > 0.35;
            setFlash({ text: ok ? "ACCESS GRANTED" : "ACCESS DENIED", ok });
            setTimeout(() => setFlash(null), 1600);
          }
          scheduleFlash();
        },
        12000 + Math.random() * 12000
      );
    };
    scheduleFlash();

    return () => {
      clearInterval(logId);
      clearInterval(traceId);
      clearInterval(hexId);
      clearInterval(nodeId);
      clearTimeout(flashTimeout);
    };
  }, []);

  const logRef = useRef<HTMLPreElement>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on every log change
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [log]);

  return (
    <div className="hx" ref={rootRef} role="img" aria-label="Simulated hacking console (parody)">
      <div className="hx__bar">
        <span className="hx__title">{"NETWATCH // INTRUSION SUITE"}</span>
        <span className="hx__blink">{status}</span>
      </div>

      <pre className="hx__log" ref={logRef}>
        {log.join("\n")}
        <span className="hx__caret">▋</span>
      </pre>

      <div className="hx__side">
        <div className="hx__trace">
          <span className="hx__label">TARGET TRACE — {status}</span>
          <div className="hx__meter">
            <div className="hx__meter-fill" style={{ width: `${trace}%` }} />
          </div>
          <span className="hx__ip">
            {ip()} → {ip()}
          </span>
        </div>

        <div className="hx__bars" aria-hidden="true">
          {BAR_DELAYS.map((d) => (
            <span key={d} style={{ animationDelay: `${d}s` }} />
          ))}
        </div>

        <svg className="hx__map" viewBox="0 0 100 90" aria-hidden="true">
          <title>trace map</title>
          <rect x="0" y="0" width="100" height="90" fill="none" />
          {[20, 40, 60].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} className="hx__grid" />
          ))}
          {[25, 50, 75].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="90" className="hx__grid" />
          ))}
          {nodes.map((n, i) => {
            const prev = nodes[i - 1];
            return (
              <g key={`${n.x}-${n.y}-${i}`}>
                {prev && <line x1={prev.x} y1={prev.y} x2={n.x} y2={n.y} className="hx__arc" />}
                <circle cx={n.x} cy={n.y} r={n.k > 0.7 ? 2.6 : 1.6} className="hx__node" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="hx__hex" aria-hidden="true">
        {hexRow}&nbsp;&nbsp;{hexRow}
      </div>

      {flash && (
        <div className={`hx__flash${flash.ok ? "" : " hx__flash--deny"}`}>{flash.text}</div>
      )}
    </div>
  );
}
