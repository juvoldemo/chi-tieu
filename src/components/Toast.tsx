import { CheckCircle2, CircleAlert } from 'lucide-react';
import type { ToastState } from '../hooks/useToast';

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  const Icon = toast.type === 'success' ? CheckCircle2 : CircleAlert;

  return (
    <div className="fixed left-4 right-4 top-[calc(env(safe-area-inset-top)+18px)] z-50 mx-auto max-w-sm">
      <div className="glass-strong flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium text-ink">
        <Icon size={20} className={toast.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
