"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";

export default function PdfViewerDialog({
  open,
  onOpenChange,
  pdfs,
  onDownloadPdf,
}) {
  const hasPdfs = pdfs && pdfs.length > 0;

  const handleDownload = async (pdf) => {
    try {
      const response = await fetch(`/api/pdfs/${pdf.fileId}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdf.filename.endsWith(".pdf")
        ? pdf.filename
        : `${pdf.filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-neutral-900 text-neutral-50 border border-neutral-700 shadow-lg rounded-lg">
        <DialogHeader className="border-b border-neutral-800 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-neutral-100">
            <FileText className="h-6 w-6 text-blue-400" /> Your Generated PDFs
            {hasPdfs ? ` (${pdfs.length})` : ""}
          </DialogTitle>
          <DialogDescription className="text-neutral-400 text-sm">
            {hasPdfs
              ? "Here are your generated PDF documents."
              : "No PDFs available for this session."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
          {hasPdfs ? (
            <div className="grid gap-3">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.id}
                  className="flex items-center justify-between p-3 rounded-md bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <span className="text-neutral-200 text-sm font-medium truncate">
                      {pdf.filename}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownload(pdf)}
                    className="text-neutral-400 hover:text-neutral-50 hover:bg-neutral-600 rounded-full"
                    aria-label={`Download ${pdf.filename}`}
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full p-4">
              <FileText className="h-20 w-20 text-neutral-700 mb-4" />
              <p className="text-lg font-medium text-neutral-300 mb-2">
                No PDFs Generated Yet
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Start a conversation with the agent to generate course materials
                and roadmaps.
              </p>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md"
              >
                Start Learning
              </Button>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 pt-4 border-t border-neutral-800">
          <Button
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-neutral-700 hover:bg-neutral-600 text-neutral-50 rounded-md"
          >
            Close PDFs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
