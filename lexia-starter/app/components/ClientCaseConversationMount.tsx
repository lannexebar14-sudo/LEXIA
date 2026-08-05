"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "../../lib/supabase/client";
import CaseConversation from "./CaseConversation";

export default function ClientCaseConversationMount() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [caseData, setCaseData] = useState<{ id: string; user_id: string } | null>(null);

  const match = pathname.match(/^\/tableau-de-bord\/dossiers\/([0-9a-f-]{36})\/?$/i);
  const caseId = match?.[1] || "";

  useEffect(() => {
    setCaseData(null);
    setTarget(null);
    if (!caseId) return;

    let cancelled = false;
    let host: HTMLDivElement | null = null;
    let attempts = 0;

    async function prepare() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      const { data } = await supabase.from("legal_cases").select("id,user_id").eq("id", caseId).eq("user_id", user.id).maybeSingle();
      if (!data || cancelled) return;
      setCaseData(data as { id: string; user_id: string });

      const findContainer = () => {
        if (cancelled) return;
        const content = document.querySelector<HTMLElement>(".case-detail-page");
        if (content) {
          host = document.createElement("div");
          host.className = "client-case-conversation-mount";
          content.appendChild(host);
          setTarget(host);
          return;
        }
        attempts += 1;
        if (attempts < 30) window.setTimeout(findContainer, 100);
      };
      findContainer();
    }

    void prepare();
    return () => {
      cancelled = true;
      if (host?.parentNode) host.parentNode.removeChild(host);
    };
  }, [caseId, supabase]);

  if (!target || !caseData) return null;
  return createPortal(<CaseConversation caseId={caseData.id} clientUserId={caseData.user_id} role="client" />, target);
}
