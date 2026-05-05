import { useEffect, useRef, useState } from 'react';

export default function UserExperiencedModal({ open, onClose }) {
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const emailRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const id = setTimeout(() => emailRef.current?.focus(), 120);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(id);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setStatus('idle');
      setErrorMessage('');
    }
  }, [open]);

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;
    const data = new FormData(e.currentTarget);
    const email = data.get('email');
    const website = data.get('website');
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      if (res.ok) {
        setStatus('ok');
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'uxd_subscribe', {
            event_category: 'newsletter',
            event_label: 'modal',
          });
        }
        return;
      }
      const body = await res.json().catch(() => ({}));
      setErrorMessage(body?.error || 'Something went wrong. Please try again.');
      setStatus('error');
    } catch {
      setErrorMessage('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="User Experienced newsletter"
    >
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      <div
        className="relative min-h-full flex items-center justify-center p-3 sm:p-6 lg:p-8"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-6xl bg-black border border-outline rounded-3xl overflow-hidden flex flex-col animate-[fadeInUp_280ms_cubic-bezier(0.2,0.8,0.2,1)]"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 inline-flex items-center justify-center size-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-on-surface duration-200 active:opacity-50"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3L13 13M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Visual / display */}
          <div className="lg:col-span-3 relative bg-black border-b lg:border-b-0 lg:border-r border-outline overflow-hidden flex lg:items-center">
            <img
              src="/images/projects/uxd.svg"
              alt=""
              aria-hidden="true"
              draggable={false}
              className="absolute -bottom-12 -right-12 size-96 opacity-30 select-none pointer-events-none"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 20% 50%, rgba(92, 174, 255, 0.10), transparent 55%)',
              }}
            />

            <div className="relative z-10 px-8 sm:px-12 lg:px-14 py-12 lg:py-16 flex flex-col w-full">
              <div className="text-on-surface-darker text-[10px] sm:text-xs uppercase tracking-[0.25em] mb-4 sm:mb-6 pt-10 lg:pt-0">
                Newsletter
              </div>
              <h2 className="text-5xl sm:text-6xl lg:text-7xl font-medium leading-[0.95] tracking-tight">
                Apps.
                <br />
                Websites.
                <br />
                Software.
                <br />
                <span className="font-serif italic">Logos.</span>
              </h2>
              <div className="mt-6 sm:mt-8 text-on-surface-dark max-w-sm text-sm sm:text-base leading-relaxed">
                Picked weekly. By people who notice the details, not by an
                algorithm.
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-2 p-8 sm:p-12 lg:p-12 flex flex-col justify-center gap-7 bg-surface-1 backdrop-blur-xl backdrop-saturate-200">
            <div>
              <h3 className="text-2xl sm:text-3xl font-medium leading-tight">
                Stay experienced.
              </h3>
              <p className="mt-3 text-sm text-on-surface-dark leading-relaxed">
                User Experienced is a weekly list of apps, websites, software,
                and logos worth paying attention to. Some come from submissions,
                some we find ourselves.
              </p>
            </div>

            {status === 'ok' ? (
              <div className="rounded-2xl border border-outline bg-white/5 p-5">
                <div className="text-base font-medium">Thanks - you're in.</div>
                <div className="text-sm text-on-surface-dark mt-1.5 leading-relaxed">
                  Check your inbox to confirm your subscription. The first list
                  lands in your inbox this week.
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <label className="text-xs uppercase tracking-[0.18em] text-on-surface-darker">
                  Your email
                </label>
                <input
                  ref={emailRef}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={status === 'loading'}
                  className="h-12 px-4 rounded-full bg-black/40 border border-outline text-sm text-on-surface placeholder:text-on-surface-darker focus:outline-none focus:border-primary duration-200 disabled:opacity-50"
                />
                <input
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: 1,
                    height: 1,
                    opacity: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="h-12 rounded-full bg-primary text-black font-medium text-sm hover:opacity-90 active:opacity-70 duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
                {status === 'error' && (
                  <div className="text-xs text-orange">{errorMessage}</div>
                )}
                <p className="text-xs text-on-surface-darker mt-1">
                  Free. Weekly. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-outline bg-black px-5 sm:px-8 py-4 flex items-center justify-between gap-4 text-xs sm:text-sm">
          <a
            href="https://www.userexperienced.com/"
            target="_blank"
            rel="noopener"
            className="group inline-flex items-center gap-2.5 !text-on-surface !no-underline hover:!text-primary duration-200 min-w-0"
          >
            <img
              src="/images/projects/uxd.svg"
              alt=""
              className="size-6 rounded shrink-0"
            />
            <span className="font-medium">User Experienced</span>
            <span className="hidden sm:inline text-on-surface-darker truncate group-hover:text-primary duration-200">
              userexperienced.com
            </span>
            <span className="text-on-surface-darker group-hover:text-primary duration-200">
              ↗
            </span>
          </a>
          <div className="hidden sm:flex items-center gap-2 text-on-surface-darker shrink-0">
            <span>co-curated by</span>
            <img
              src="/images/swiper-logo.svg"
              alt="Swiper"
              className="size-5"
            />
            <span className="text-on-surface-dark">Swiper authors</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
