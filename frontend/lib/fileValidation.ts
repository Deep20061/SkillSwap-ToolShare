import { toast } from "@/components/ui/use-toast";

/**
 * Validates a single file against a size limit.
 * Shows a destructive toast and returns false if the file is too large.
 */
export function validateFileSize(file: File, maxMB: number): boolean {
  if (file.size > maxMB * 1024 * 1024) {
    toast({
      variant: "destructive",
      title: "File too large",
      description: `Maximum size is ${maxMB} MB.`,
    });
    return false;
  }
  return true;
}

/**
 * Filters a list of files against a size limit.
 * Shows a destructive toast listing any rejected files and returns only valid ones.
 */
export function filterFilesBySize(files: File[], maxMB: number): File[] {
  const valid = files.filter((f) => f.size <= maxMB * 1024 * 1024);
  const rejected = files.filter((f) => f.size > maxMB * 1024 * 1024);
  if (rejected.length > 0) {
    toast({
      variant: "destructive",
      title: rejected.length === 1 ? "Photo too large" : `${rejected.length} photos too large`,
      description: `Maximum size is ${maxMB} MB per file. ${rejected.map((f) => f.name).join(", ")} ${rejected.length === 1 ? "was" : "were"} skipped.`,
    });
  }
  return valid;
}
