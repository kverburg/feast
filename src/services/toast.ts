export interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<(toasts: Toast[]) => void>();

const emit = () => listeners.forEach((cb) => cb(toasts));

export function dismissToast(id: number): void {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function showToast(toast: Omit<Toast, 'id'> & { duration?: number }): void {
  const { duration, ...rest } = toast;
  const id = nextId++;
  toasts = [...toasts, { ...rest, id }].slice(-4);
  emit();
  window.setTimeout(() => dismissToast(id), duration ?? (toast.kind === 'error' ? 12000 : 6000));
}

export function subscribeToasts(cb: (toasts: Toast[]) => void): () => void {
  listeners.add(cb);
  cb(toasts);
  return () => listeners.delete(cb);
}
