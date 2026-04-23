import { useStore } from '../store';
import { FieldBox } from './FieldBox';
import { cn } from '../lib/utils';
import {
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown, Minus,
  BookOpen, FlaskConical, CalendarCheck, Package, FileText, Stethoscope,
  MapPin, User, Calendar
} from 'lucide-react';

function SentimentBadge({ sentiment }) {
  if (!sentiment) return <span className="text-muted italic text-sm">—</span>;
  const config = {
    positive: { icon: TrendingUp, color: 'text-positive', bg: 'bg-positive/10 border-positive/25', label: 'Positive' },
    negative: { icon: TrendingDown, color: 'text-negative', bg: 'bg-negative/10 border-negative/25', label: 'Negative' },
    neutral: { icon: Minus, color: 'text-warning', bg: 'bg-warning/10 border-warning/25', label: 'Neutral' },
  };
  const c = config[sentiment.toLowerCase()] || config.neutral;
  const Icon = c.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium', c.color, c.bg)}>
      <Icon size={11} /> {c.label}
    </span>
  );
}

function BoolChip({ active, icon: Icon, label }) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium transition-all duration-300',
      active
        ? 'border-positive/30 bg-positive/10 text-positive'
        : 'border-white/[0.06] bg-surface text-muted'
    )}>
      <div className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-positive' : 'bg-muted')} />
      {label}
    </div>
  );
}

export function LeftPanel() {
  const { form, updatedFields, validationResult, summaryText } = useStore();

  const u = (key) => updatedFields.has(key);

  const hasData = form.hcp_name || form.date;
  const isComplete = form.hcp_name && form.date && form.sentiment;

  return (
    <div className="w-[44%] min-w-[400px] flex flex-col h-full border-r border-white/[0.07] bg-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="pulse-dot w-2 h-2 rounded-full bg-positive" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted2">
            Interaction Details
          </span>
        </div>
        <span className={cn(
          'text-[10px] font-mono px-2.5 py-1 rounded-full border',
          !hasData ? 'text-muted border-white/[0.08]' :
          isComplete ? 'text-positive border-positive/30 bg-positive/8' :
          'text-warning border-warning/30 bg-warning/8'
        )}>
          {!hasData ? 'No Data' : isComplete ? 'Complete' : 'In Progress'}
        </span>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* HCP Info */}
        <section>
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted mb-3 flex items-center gap-2">
            <User size={9} /> HCP Information
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <FieldBox label="HCP Name" value={form.hcp_name} updated={u('hcp_name')} />
            <FieldBox label="Date" value={form.date} updated={u('date')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FieldBox label="Specialty" value={form.specialty} updated={u('specialty')} />
            <FieldBox label="Location" value={form.location} updated={u('location')} />
          </div>
        </section>

        {/* Sentiment */}
        <section>
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted mb-3">
            Sentiment
          </div>
          <FieldBox label="Overall Sentiment" value={form.sentiment} updated={u('sentiment')}>
            <SentimentBadge sentiment={form.sentiment} />
          </FieldBox>
        </section>

        {/* Materials */}
        <section>
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted mb-3">
            Materials & Actions
          </div>
          <div className={cn(
            'rounded-lg border p-3',
            (form.brochure_shared || form.samples_provided || form.follow_up_required)
              ? 'border-accent/18 bg-accent/[0.03]' : 'border-white/[0.06] bg-surface',
            (u('brochure_shared') || u('samples_provided') || u('follow_up_required')) ? 'field-updated' : ''
          )}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.1em] text-muted mb-2">Status</div>
            <div className="flex flex-wrap gap-1.5">
              <BoolChip active={form.brochure_shared} label="Brochures Shared" />
              <BoolChip active={form.samples_provided} label="Samples Provided" />
              <BoolChip active={form.follow_up_required} label="Follow-up Required" />
            </div>
          </div>
        </section>

        {/* Products */}
        <section>
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted mb-3">
            Products Discussed
          </div>
          <FieldBox label="Products" value={null} updated={u('products_discussed')}>
            {(form.products_discussed || []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                {form.products_discussed.map((p, i) => (
                  <span key={i} className="font-mono text-[11px] px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-accent">
                    {p}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-muted italic text-sm">—</span>
            )}
          </FieldBox>
        </section>

        {/* Notes */}
        <section>
          <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted mb-3">
            Notes
          </div>
          <FieldBox label="Key Notes" value={form.notes} updated={u('notes')}>
            {form.notes ? (
              <p className="text-sm text-muted2 leading-relaxed">{form.notes}</p>
            ) : (
              <span className="text-muted italic text-sm">—</span>
            )}
          </FieldBox>
        </section>

        {/* Validation Result */}
        {validationResult && (
          <section className={cn(
            'rounded-lg border p-3 animate-[slideUp_0.2s_ease-out]',
            validationResult.is_complete
              ? 'border-positive/30 bg-positive/[0.06]'
              : 'border-negative/30 bg-negative/[0.06]'
          )}>
            <div className={cn(
              'flex items-center gap-2 text-xs font-semibold mb-2',
              validationResult.is_complete ? 'text-positive' : 'text-negative'
            )}>
              {validationResult.is_complete
                ? <><CheckCircle2 size={13} /> Form complete</>
                : <><AlertCircle size={13} /> Incomplete — missing fields</>
              }
            </div>
            {validationResult.missing_required?.map((f, i) => (
              <div key={i} className="text-[11px] text-negative/80 pl-1">· {f.replace(/_/g, ' ')}</div>
            ))}
            {validationResult.warnings?.slice(0, 3).map((w, i) => (
              <div key={i} className="text-[11px] text-warning/70 pl-1">· {w}</div>
            ))}
          </section>
        )}

        {/* Summary */}
        {summaryText && (
          <section className="rounded-lg border border-accent/20 bg-accent/[0.04] p-3 animate-[slideUp_0.2s_ease-out]">
            <div className="text-[10px] font-semibold text-accent mb-2 flex items-center gap-1.5">
              <FileText size={10} /> Interaction Summary
            </div>
            <p className="text-[12px] text-muted2 leading-relaxed italic">{summaryText}</p>
          </section>
        )}
      </div>
    </div>
  );
}
