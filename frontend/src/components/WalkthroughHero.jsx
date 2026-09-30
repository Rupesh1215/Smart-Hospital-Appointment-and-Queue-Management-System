import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdArrowForward, MdSearch, MdKeyboardArrowDown } from 'react-icons/md';
import departmentService from '../services/departmentService';
import doctorService from '../services/doctorService';
import useWebSocket from '../hooks/useWebSocket';
import './WalkthroughHero.css';

/* ────────────────────────────────────────────────────────────────────────────
   Scroll-driven walkthrough: 8 renders of ONE building, cross-faded as the
   visitor scrolls, with real HTML overlays on top (labels, live data, CTAs).

   The images contain no text on purpose — everything readable is HTML, so it
   stays sharp, translatable and wired to your live API/WebSocket data.
   ──────────────────────────────────────────────────────────────────────────── */

const ASPECT = 2752 / 1536; // native ratio of the renders
const IMG = '/walkthrough';

/* `focus` = the point of the image kept centred when the viewport is narrower
   than 16:9 (phones). `zoom` = slow push-in across that scene: [from, to]. */
const SCENES = [
  { key: '1-exterior',         label: 'Arrive',       focus: [0.50, 0.62], zoom: [1.0, 1.1],  alt: 'Hospital main entrance seen from the plaza, with a timber canopy and glass facade' },
  { key: '2-entrance',         label: 'Enter',        focus: [0.50, 0.62], zoom: [1.0, 1.1],  alt: 'Glass sliding doors opening onto a long lobby corridor' },
  { key: '3-reception',        label: 'Check in',     focus: [0.58, 0.60], zoom: [1.0, 1.1],  alt: 'Reception desk in a bright double-height lobby' },
  { key: '4-corridor',         label: 'Departments',  focus: [0.55, 0.58], zoom: [1.0, 1.1],  alt: 'Corridor lined with glass-fronted department areas' },
  { key: '5-consultation',     label: 'Doctors',      focus: [0.62, 0.62], zoom: [1.0, 1.1],  alt: 'Doctor consultation room with desk and examination bed' },
  { key: '6-appointment-desk', label: 'Book',         focus: [0.64, 0.62], zoom: [1.0, 1.1],  alt: 'Appointment desk with computers and a self-service kiosk' },
  { key: '7-waiting-area',     label: 'Wait',         focus: [0.66, 0.62], zoom: [1.0, 1.1],  alt: 'Calm waiting area with armchairs and a wall display' },
  // Last scene pushes in toward the queue screen; overlay is glued to the image.
  { key: '8-waiting-hall',     label: 'Live queue',   focus: [0.66, 0.48], zoom: [1.0, 1.45], zoomMobile: [1.0, 1.2], alt: 'Waiting hall with a large display wall showing the live queue' },
];
const N = SCENES.length;

/* Where the blank display sits inside the last render (fractions of the image). */
const SCREEN = { left: 56.17, top: 42.21, width: 17.62, height: 12.24 };

/* Fallbacks so the page is never empty (API down, or first paint). */
const FALLBACK_DEPTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'General Medicine', 'Pediatrics'];
const FALLBACK_DOCTORS = [
  { id: 'f1', name: 'Ananya Sharma', specialization: 'General Medicine', available: true },
  { id: 'f2', name: 'Ravi Kumar', specialization: 'Cardiology', available: true },
  { id: 'f3', name: 'Meera Iyer', specialization: 'Pediatrics', available: true },
];
const SAMPLE_QUEUE = [
  { name: 'Sharma', dept: 'General Medicine', current: 4, waiting: 3 },
  { name: 'Kumar', dept: 'Cardiology', current: 12, waiting: 5 },
  { name: 'Iyer', dept: 'Pediatrics', current: 7, waiting: 2 },
];

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, '0');

/* WebSocket → up to 3 rows for the public display. Patient names are
   deliberately NOT used: a waiting-hall screen should only show tokens. */
function buildQueueRows(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const byDoctor = new Map();
  for (const e of entries) {
    const k = e.doctorId || e.doctorName;
    if (!k) continue;
    const d = byDoctor.get(k) || { name: e.doctorName, dept: e.departmentName, current: null, waiting: 0 };
    if (e.status === 'IN_CONSULTATION' || e.status === 'CALLED') d.current = e.queueNumber;
    else if (e.status === 'WAITING') d.waiting += 1;
    byDoctor.set(k, d);
  }
  const rows = [...byDoctor.values()]
    .sort((a, b) => (b.current != null) - (a.current != null) || b.waiting - a.waiting)
    .slice(0, 3);
  return rows.length ? rows : null;
}

/* ── the queue display, rendered onto the blank screen of scene 8 ─────────── */
function QueueScreen({ rows, live }) {
  return (
    <div
      className="wt-qs"
      style={{ left: `${SCREEN.left}%`, top: `${SCREEN.top}%`, width: `${SCREEN.width}%`, height: `${SCREEN.height}%` }}
      role="img"
      aria-label={`Waiting hall display: ${live ? 'live' : 'sample'} queue status`}
    >
      <div className="wt-qs-head">
        <span>NOW SERVING</span>
        <span className={`wt-qs-live ${live ? 'on' : ''}`}>
          <i /> {live ? 'LIVE' : 'SAMPLE'}
        </span>
      </div>
      {rows.map((r, i) => (
        <div className="wt-qs-row" key={`${r.name}-${i}`}>
          <div className="wt-qs-doc">
            <b>Dr. {r.name}</b>
            <small>{r.dept || 'Consultation'} · {r.waiting} waiting</small>
          </div>
          <div className="wt-qs-token">{r.current != null ? `#${pad(r.current)}` : '—'}</div>
        </div>
      ))}
    </div>
  );
}

export default function WalkthroughHero() {
  const sectionRef = useRef(null);
  const sceneRefs = useRef([]);
  const capRefs = useRef([]);
  const hintRef = useRef(null);
  const barRef = useRef(null);
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  /* live data ------------------------------------------------------------- */
  const [departments, setDepartments] = useState(FALLBACK_DEPTS);
  const [doctors, setDoctors] = useState(FALLBACK_DOCTORS);

  useEffect(() => {
    let alive = true;
    departmentService.getAll()
      .then((res) => {
        const names = (res.data?.data || []).map((d) => d.name).filter(Boolean);
        if (alive && names.length) setDepartments(names);
      })
      .catch(() => {});
    doctorService.getAll()
      .then((res) => {
        const list = (res.data?.data || [])
          .filter((d) => d.available !== false)
          .slice(0, 3)
          .map((d) => ({
            id: d.id,
            name: d.doctorName || d.name,
            specialization: d.specialization || d.departmentName || 'Consultant',
            available: d.available !== false,
          }))
          .filter((d) => d.name);
        if (alive && list.length) setDoctors(list);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Only open the socket once the visitor is close to the queue scene.
  const { data: wsData, connected } = useWebSocket('/topic/queue/all', active >= N - 2);
  const liveRows = useMemo(() => buildQueueRows(wsData), [wsData]);
  const queueRows = liveRows || SAMPLE_QUEUE;
  const queueIsLive = Boolean(connected && liveRows);

  /* environment flags ------------------------------------------------------- */
  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 767px)');
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { setIsMobile(mqMobile.matches); setReduced(mqMotion.matches); };
    sync();
    mqMobile.addEventListener('change', sync);
    mqMotion.addEventListener('change', sync);
    return () => {
      mqMobile.removeEventListener('change', sync);
      mqMotion.removeEventListener('change', sync);
    };
  }, []);

  /* scroll → scene float `f` (0 … N-1).
     Scroll input (wheel notches, trackpad steps) is choppy, so we never apply it
     directly: `target` follows the scroll position and `current` eases toward it
     every frame (time-based, so it feels the same at 60 or 120 Hz). Direct DOM
     writes; React only re-renders when the *active* scene index changes. ------- */
  const HOLD = 0.92; // last 8% of the scroll distance holds on the final scene
  const TAU = 110;   // ms — smoothing time constant (lower = snappier)
  const lastActive = useRef(0);
  const target = useRef(0);
  const current = useRef(0);
  const rafId = useRef(0);
  const lastTs = useRef(0);

  const apply = useCallback((f) => {
    for (let i = 0; i < N; i += 1) {
      const t = f - i; // <0 arriving, 0 centred, >0 leaving
      const scene = sceneRefs.current[i];
      const cap = capRefs.current[i];
      if (scene) {
        // Incoming scene fades in over the outgoing one; outgoing stays opaque
        // until fully covered, so there is never a see-through dip.
        // (No visibility toggling: keeping every layer live avoids first-show
        // decode/raster hitches mid-scroll.)
        const op = t < 0 ? clamp((t + 0.75) / 0.5) : t <= 0.75 ? 1 : 0;
        const cfg = SCENES[i];
        const [z0, z1] = isMobile && cfg.zoomMobile ? cfg.zoomMobile : cfg.zoom;
        const start = i === 0 ? 0 : -0.75;
        const end = i === N - 1 ? 0 : 0.75;
        const k = reduced ? 0 : clamp((t - start) / (end - start));
        scene.style.opacity = op;
        scene.firstChild.style.transform = `scale(${(z0 + (z1 - z0) * k).toFixed(4)}) translateZ(0)`;
      }
      if (cap) {
        const a = clamp((0.42 - Math.abs(t)) / 0.14);
        cap.style.opacity = a;
        cap.style.transform = `translate3d(0, ${(-t * 48).toFixed(1)}px, 0)`;
        cap.style.visibility = a === 0 ? 'hidden' : 'visible';
      }
    }
    if (hintRef.current) hintRef.current.style.opacity = clamp(1 - f * 4);
    if (barRef.current) barRef.current.style.transform = `scaleY(${(f / (N - 1)).toFixed(4)})`;

    const idx = Math.round(f);
    if (idx !== lastActive.current) {
      lastActive.current = idx;
      setActive(idx);
    }
  }, [isMobile, reduced]);

  const readTarget = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const p = total > 0 ? clamp(-el.getBoundingClientRect().top / total) : 0;
    target.current = clamp(p / HOLD) * (N - 1);
  }, []);

  const tick = useCallback((ts) => {
    const dt = lastTs.current ? Math.min(ts - lastTs.current, 64) : 16;
    lastTs.current = ts;
    const diff = target.current - current.current;
    if (reduced || Math.abs(diff) < 0.0004) {
      current.current = target.current;
      apply(current.current);
      rafId.current = 0;
      lastTs.current = 0;
      return;
    }
    current.current += diff * (1 - Math.exp(-dt / TAU));
    apply(current.current);
    rafId.current = requestAnimationFrame(tick);
  }, [apply, reduced]);

  useEffect(() => {
    const kick = () => {
      readTarget();
      if (!rafId.current) rafId.current = requestAnimationFrame(tick);
    };
    // Start exactly where the page already is (reload mid-page, anchor links…).
    readTarget();
    current.current = target.current;
    apply(current.current);
    window.addEventListener('scroll', kick, { passive: true });
    window.addEventListener('resize', kick);
    return () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = 0;
      lastTs.current = 0;
      window.removeEventListener('scroll', kick);
      window.removeEventListener('resize', kick);
    };
  }, [apply, readTarget, tick]);

  // Decode every render up-front so no image is decoded for the first time
  // while the visitor is mid-scroll.
  useEffect(() => {
    document.querySelectorAll('.wt-box > img').forEach((img) => {
      if (img.decode) img.decode().catch(() => {});
    });
  }, []);

  const goTo = (i) => {
    const el = sectionRef.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + (i / (N - 1)) * HOLD * total;
    window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
  };

  /* per-scene captions ------------------------------------------------------ */
  const captions = [
    {
      title: <>Smart Care. <em>Seamless Queues.</em></>,
      body: 'Effortless appointment booking, real-time queue tracking and AI-powered coordination — step inside and see how a visit flows.',
      actions: (
        <>
          <Link to="/register" className="btn btn-primary">Book Appointment <MdArrowForward /></Link>
          <Link to="/doctors" className="btn btn-secondary"><MdSearch /> Find a Doctor</Link>
        </>
      ),
    },
    {
      title: 'Arrive without the paperwork rush',
      body: 'Digital check-in means your token is ready the moment you walk in — no clipboards, no crowded counters.',
    },
    {
      title: 'Reception, digitised',
      body: 'Receptionists check patients in and issue tokens in seconds, so lines never build up at the desk.',
      extra: (
        <div className="wt-chips">
          <span className="wt-chip">Instant check-in</span>
          <span className="wt-chip">Token on arrival</span>
        </div>
      ),
    },
    {
      title: 'Every department, one clear path',
      body: 'Find the right specialty in a couple of taps.',
      extra: (
        <div className="wt-chips">
          {departments.slice(0, 6).map((d) => <span className="wt-chip" key={d}>{d}</span>)}
        </div>
      ),
      actions: <Link to="/departments" className="wt-link">Explore departments <MdArrowForward /></Link>,
    },
    {
      title: 'Meet the right doctor',
      body: 'Browse specialists and see who is available today.',
      extra: (
        <ul className="wt-docs">
          {doctors.map((d) => (
            <li key={d.id}>
              <span className="wt-avatar">{d.name.charAt(0).toUpperCase()}</span>
              <span className="wt-doc-txt">
                <b>Dr. {d.name}</b>
                <small>{d.specialization}</small>
              </span>
              <span className="wt-avail">● Available</span>
            </li>
          ))}
        </ul>
      ),
      actions: <Link to="/doctors" className="wt-link">Find a doctor <MdArrowForward /></Link>,
    },
    {
      title: 'Book in three steps',
      body: 'Pick a doctor, choose a slot, confirm — you get a digital token instantly.',
      extra: (
        <ol className="wt-steps">
          <li><b>01</b> Find Doctor</li>
          <li><b>02</b> Select Time Slot</li>
          <li><b>03</b> Confirm Booking</li>
        </ol>
      ),
      actions: <Link to="/register" className="btn btn-primary">Book Appointment <MdArrowForward /></Link>,
    },
    {
      title: 'Wait anywhere. Know your turn.',
      body: 'Track your position and get notified when you are called — with an estimated wait, not a guess.',
      extra: (
        <div className="wt-chips">
          <span className="wt-chip">Live position</span>
          <span className="wt-chip">Instant notifications</span>
          <span className="wt-chip">Estimated wait</span>
        </div>
      ),
    },
    {
      title: 'Watch the queue move, live',
      body: 'One real-time queue powers this waiting-hall display, your phone, and the doctor’s dashboard.',
      actions: (
        <>
          <Link to="/register" className="btn btn-primary">Create Account <MdArrowForward /></Link>
          <Link to="/login" className="btn btn-secondary">Sign In</Link>
        </>
      ),
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="wt"
      aria-label="Hospital walkthrough"
      style={{ '--wt-n': N }}
    >
      <div className="wt-stage">
        {/* image layers */}
        {SCENES.map((s, i) => (
          <div
            key={s.key}
            className="wt-scene"
            ref={(el) => { sceneRefs.current[i] = el; }}
            style={{ zIndex: i + 1, opacity: i === 0 ? 1 : 0 }}
          >
            <div
              className="wt-box"
              style={{
                '--fx': s.focus[0],
                '--fy': s.focus[1],
                '--ar': ASPECT,
              }}
            >
              <img
                src={`${IMG}/${s.key}-2560.webp`}
                srcSet={`${IMG}/${s.key}-1600.webp 1600w, ${IMG}/${s.key}-2560.webp 2560w`}
                sizes="max(100vw, 179vh)"
                alt={s.alt}
                width="2560"
                height="1429"
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'auto'}
                draggable="false"
              />
              {i === N - 1 && <QueueScreen rows={queueRows} live={queueIsLive} />}
            </div>
          </div>
        ))}

        <div className="wt-scrim" aria-hidden="true" />

        {/* captions */}
        <div className="wt-caps">
          {captions.map((c, i) => {
            const Tag = i === 0 ? 'h1' : 'h2';
            return (
              <article
                key={i}
                ref={(el) => { capRefs.current[i] = el; }}
                className="wt-cap"
                data-active={active === i}
                aria-hidden={active !== i}
                style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}
              >
                <p className="wt-eyebrow">
                  <span className="wt-dot" /> {pad(i + 1)} / {pad(N)} · {SCENES[i].label}
                </p>
                <Tag className="wt-title">{c.title}</Tag>
                <p className="wt-body">{c.body}</p>
                {c.extra}
                {c.actions && <div className="wt-actions">{c.actions}</div>}
              </article>
            );
          })}
        </div>

        {/* progress rail */}
        <nav className="wt-rail" aria-label="Walkthrough scenes">
          <span className="wt-rail-track" aria-hidden="true"><span className="wt-rail-bar" ref={barRef} /></span>
          {SCENES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`wt-rail-dot ${active === i ? 'on' : ''}`}
              aria-label={`Go to scene ${i + 1}: ${s.label}`}
              aria-current={active === i}
              onClick={() => goTo(i)}
            />
          ))}
        </nav>

        <a className="wt-skip" href="#after-walkthrough">Skip tour</a>

        <div className="wt-hint" ref={hintRef} aria-hidden="true">
          <span>Scroll to walk in</span>
          <MdKeyboardArrowDown />
        </div>
      </div>
    </section>
  );
}
