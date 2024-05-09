import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export function AlertError({
  message,
  title,
  simple,
}: {
  message: string;
  title?: string;
  simple?: boolean;
}) {
  return (
    <Alert
      variant="destructive"
      className={cn("text-left", {
        "border-0": simple,
      })}
    >
      <ExclamationTriangleIcon className="h-4 w-4" />
      {title && <AlertTitle>Error</AlertTitle>}
      <AlertDescription className="relative top-[3px]">
        {message}
      </AlertDescription>
    </Alert>
  );
}
