import { Suspense } from "react";
import DocumentEditor from "./editor";

export default function DocumentEditorPage() {
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-6xl animate-pulse rounded-3xl bg-surface-container-low" />}>
      <DocumentEditor />
    </Suspense>
  );
}
