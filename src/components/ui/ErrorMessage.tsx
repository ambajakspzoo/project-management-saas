import { Button } from "@/components/ui/Button";

type ErrorMessageProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorMessage({
  title = "Unable to load projects",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="text-sm font-medium text-red-800">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-red-700">{message}</p>
      {onRetry ? (
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
