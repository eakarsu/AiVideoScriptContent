import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

type Variant = 'danger' | 'warning' | 'default';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

const variantStyles: Record<Variant, { button: string; icon: string; iconBg: string }> = {
  danger: {
    button: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
    icon: 'text-red-500',
    iconBg: 'bg-red-50',
  },
  warning: {
    button: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
    icon: 'text-amber-500',
    iconBg: 'bg-amber-50',
  },
  default: {
    button: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white',
    icon: 'text-primary-500',
    iconBg: 'bg-primary-50',
  },
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setOptions(null);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setOptions(null);
  };

  const variant = options?.variant || 'default';
  const styles = variantStyles[variant];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 modal-backdrop" onClick={handleCancel} />
          <div className="relative bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in" style={{ boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
                {variant === 'danger' ? (
                  <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{options.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{options.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleCancel} className="btn-secondary text-sm">
                {options.cancelLabel || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${styles.button}`}
                style={{ boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}
              >
                {options.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}
