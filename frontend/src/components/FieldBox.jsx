import { useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export function FieldBox({ label, value, updated, children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    if (updated && ref.current) {
      ref.current.classList.remove('field-updated');
      void ref.current.offsetWidth;
      ref.current.classList.add('field-updated');
      const t = setTimeout(() => ref.current?.classList.remove('field-updated'), 1500);
      return () => clearTimeout(t);
    }
  }, [updated, value]);

  const filled = !!value || children;

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border p-3 transition-all duration-300',
        filled
          ? 'border-accent/20 bg-accent/[0.03]'
          : 'border-white/[0.06] bg-surface',
        className
      )}
    >
      <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted mb-1.5">
        {label}
      </div>
      {children || (
        <div className={cn('text-sm leading-snug', filled ? 'text-white' : 'text-muted italic')}>
          {value || '—'}
        </div>
      )}
    </div>
  );
}
