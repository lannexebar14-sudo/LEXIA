"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

const DRAFT_KEY = "lexia_case_draft_v2";
const RESTORE_KEY = "lexia_case_draft_restored_v1";

type LocalDraft = {
  form?: Record<string, unknown>;
  selectedServiceIds?: string[];
  step?: number;
};

type StoredDraft = {
  form_data?: Record<string, unknown> | null;
  selected_service_ids?: string[] | null;
  current_step?: number | null;
};

export default function CaseDraftSync() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const lastSent = useRef("");
  const saving = useRef(false);

  useEffect(() => {
    if (pathname !== "/nouveau-dossier") return;
    let cancelled = false;

    async function restoreDraft() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled || window.localStorage.getItem(DRAFT_KEY)) return;

      const { data } = await supabase
        .from("legal_case_drafts")
        .select("form_data, selected_service_ids, current_step")
        .eq("user_id", user.id)
        .maybeSingle<StoredDraft>();

      if (!data?.form_data || cancelled) return;

      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({
        form: data.form_data,
        selectedServiceIds: data.selected_service_ids || [],
        step: data.current_step || 1,
      }));

      if (!window.sessionStorage.getItem(RESTORE_KEY)) {
        window.sessionStorage.setItem(RESTORE_KEY, "1");
        window.location.reload();
      }
    }

    void restoreDraft();

    const interval = window.setInterval(async () => {
      if (saving.current) return;
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw || raw === lastSent.current) return;

      let draft: LocalDraft;
      try {
        draft = JSON.parse(raw) as LocalDraft;
      } catch {
        return;
      }

      const hasStarted = Boolean(draft.form?.category) || Number(draft.step || 1) > 1;
      if (!hasStarted) return;

      saving.current = true;
      const { error } = await supabase.functions.invoke("save-case-draft", {
        body: {
          form: draft.form || {},
          selectedServiceIds: Array.isArray(draft.selectedServiceIds) ? draft.selectedServiceIds : [],
          step: Math.min(5, Math.max(1, Number(draft.step) || 1)),
        },
      });
      saving.current = false;

      if (!error) lastSent.current = raw;
    }, 1800);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [pathname, supabase]);

  return null;
}
