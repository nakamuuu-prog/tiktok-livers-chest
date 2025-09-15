import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner = ({ className, size = 24 }: SpinnerProps) => {
  return (
    <Loader
      className={cn("animate-spin text-primary", className)}
      size={size}
    />
  );
};
