import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { messagesApi } from "@/lib/api";
import { countWords, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Messages() {
  const { messageThreads, fetchThreads, user } = useApp();
  const [activeId,  setActiveId]  = useState(messageThreads[0]?.id ?? "");
  const [fullThread,setFullThread]= useState<any[]>([]);
  const [draft,     setDraft]     = useState("");
  const [sending,   setSending]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const wordCount = countWords(draft);
  const overLimit = wordCount > 50;

  // Load full thread when active changes
  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    messagesApi.getThread(activeId)
      .then(d => setFullThread(d.messages ?? []))
      .catch(() => setFullThread([]))
      .finally(() => setLoading(false));
  }, [activeId]);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [fullThread.length]);

  const sendMsg = async () => {
    if (!draft.trim() || overLimit || sending) return;
    setSending(true);
    try {
      await messagesApi.send(activeId, draft.trim());
      setDraft("");
      // Refresh full thread
      const d = await messagesApi.getThread(activeId);
      setFullThread(d.messages ?? []);
      await fetchThreads();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to send.");
    } finally { setSending(false); }
  };

  const active = messageThreads.find(t => t.id === activeId);

  return (
    <>
      <section className="bg-muted/30 border-b border-border py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">Communicate with lab assistants and faculty. Messages limited to <strong>50 words</strong>.</p>
        </div>
      </section>

      <div className="container py-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden flex" style={{ height: "calc(100vh - 280px)", minHeight: "480px" }}>
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 border-r border-border flex flex-col">
            <div className="px-4 py-3.5 border-b border-border"><p className="font-semibold text-sm text-foreground">Conversations</p></div>
            <div className="flex-1 overflow-y-auto">
              {messageThreads.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet.</div>
              )}
              {messageThreads.map(t => (
                <button key={t.id} onClick={() => setActiveId(t.id)}
                  className={cn("w-full text-left px-4 py-3.5 border-b border-border/60 hover:bg-muted/50 transition-colors",
                    activeId === t.id && "bg-primary/8 border-l-2 border-l-primary")}>
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-semibold text-foreground truncate">{t.participantName}</p>
                    <p className="text-[10px] text-muted-foreground font-mono flex-shrink-0 ml-2">{t.messages.at(-1)?.time ?? ""}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.messages.at(-1)?.text ?? "No messages yet"}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          {active ? (
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                  {active.participantName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{active.participantName}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{active.participantRole}</p>
                </div>
              </div>

              <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                {loading && <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…</div>}
                {!loading && fullThread.length === 0 && <div className="text-center text-muted-foreground text-sm py-12">No messages yet. Start the conversation.</div>}
                {!loading && fullThread.map((m: any, i: number) => {
                  const isMe = m.senderId === user?.id;
                  return (
                    <div key={i} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                      <div className={isMe ? "msg-bubble-sent" : "msg-bubble-recv"}>
                        {m.text}
                        <div className={cn("text-[10px] mt-1 font-mono", isMe ? "text-white/60" : "text-muted-foreground")}>
                          {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={cn("text-right text-xs px-5 pb-1 font-mono", overLimit ? "text-status-fault" : "text-muted-foreground")}>
                {wordCount} / 50 words {overLimit && "— over limit"}
              </div>

              <div className="px-4 py-3 border-t border-border flex gap-2 items-end">
                <textarea value={draft} onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }}}
                  placeholder="Type a message (max 50 words)..." rows={2}
                  className={cn("flex-1 resize-none rounded-xl border px-3.5 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors",
                    overLimit ? "border-status-fault/60" : "border-border")} />
                <button onClick={sendMsg} disabled={!draft.trim() || overLimit || sending}
                  className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
