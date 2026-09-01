import { Suspense } from "react";
import GlobalNavigationProgressBar from "@/components/GlobalNavigationProgressBar";

export default function GlobalLoadingIndicator() {
  return (
    <Suspense fallback={null}>
      <GlobalNavigationProgressBar />
    </Suspense>
  );
}
