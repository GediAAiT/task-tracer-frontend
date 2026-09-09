'use client';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';
import { cn } from 'cn';
import './toast.scss';

const toast = ToastPrimitive.createToastManager();

function ToastProvider(props: ToastPrimitive.Provider.Props) {
  return <ToastPrimitive.Provider {...props} />;
}

function ToastPortal(props: ToastPrimitive.Portal.Props) {
  return <ToastPrimitive.Portal {...props} />;
}

function ToastViewport({ className, ...props }: ToastPrimitive.Viewport.Props) {
  return <ToastPrimitive.Viewport className={cn('toast-viewport', className)} {...props} />;
}

function Toast({ className, ...props }: ToastPrimitive.Root.Props) {
  return <ToastPrimitive.Root className={cn('toast', className)} {...props} />;
}

function ToastContent({ className, ...props }: ToastPrimitive.Content.Props) {
  return <ToastPrimitive.Content className={cn('toast-content', className)} {...props} />;
}

function ToastTitle({ className, ...props }: ToastPrimitive.Title.Props) {
  return <ToastPrimitive.Title className={cn('toast-title', className)} {...props} />;
}

function ToastDescription({ className, ...props }: ToastPrimitive.Description.Props) {
  return (
    <ToastPrimitive.Description className={cn('toast-description', className)} {...props} />
  );
}

function ToastAction({ className, ...props }: ToastPrimitive.Action.Props) {
  return <ToastPrimitive.Action className={cn('toast-action', className)} {...props} />;
}

function ToastClose({ className, children, ...props }: ToastPrimitive.Close.Props) {
  return (
    <ToastPrimitive.Close
      aria-label="Close toast"
      className={cn('toast-close', className)}
      {...props}
    >
      {children ?? <XIcon aria-hidden />}
    </ToastPrimitive.Close>
  );
}

const TOAST_ICONS: Record<string, () => React.JSX.Element> = {
  success: () => <CircleCheckIcon aria-hidden />,
  info: () => <InfoIcon aria-hidden />,
  warning: () => <TriangleAlertIcon aria-hidden />,
  error: () => <OctagonXIcon aria-hidden />,
  loading: () => <Loader2Icon aria-hidden />,
};

function ToastIcon({ type }: { type: string | undefined }) {
  const Icon = type ? TOAST_ICONS[type] : undefined;
  if (!Icon) return null;

  return (
    <span className={`toast-icon ${type}`}>
      <Icon />
    </span>
  );
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastIcon type={item.type} />

        <div className="toast-text">
          <ToastTitle />
          <ToastDescription />
        </div>

        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({ children, toastManager = toast, ...props }: ToastPrimitive.Provider.Props) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}

      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  createToastManager,
  toast,
  useToastManager,
};
