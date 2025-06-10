"use client";
import { Button } from "@/components/ui/button"
import { Menu, FileText, User } from "lucide-react"

export default function Header({
  onOpenPdfViewer,
  pdfCount
}) {
  return (
    <header
      className="flex items-center justify-between h-16 px-4 border-b border-neutral-800 bg-neutral-900 text-neutral-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">SkillUp</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenPdfViewer}
          className="relative text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50"
          aria-label={`View Generated PDFs, ${pdfCount} available`}>
          <FileText className="h-6 w-6" />
          {pdfCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {pdfCount}
            </span>
          )}
          <span className="sr-only">View PDFs</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50">
          <User className="h-6 w-6" />
          <span className="sr-only">User profile</span>
        </Button>
      </div>
    </header>
  );
}
