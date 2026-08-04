"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import "./admin-support.css";

type SupportRow = { id:string; session_id:string; sender_type:"visitor"|"client"|"admin"|"jurist"; visitor_name:string|null; visitor_email:string|null; message:string; is_read:boolean; created_at:string };
type ConversationMeta = { session_id:string; visitor_name:string|null; visitor_email:string|null; status:"active"|"resolved"; last_message_at:string; resolved_at:string|null };
type Conversation = { sessionId:string; name:string; email:string; status:"active"|"resolved"; unread:number; lastAt:string; resolvedAt:string|null; messages:SupportRow[] };

export default function AdminSupportInbox(){
 const supabase=createClient();
 const[rows,setRows]=useState<SupportRow[]>([]);
 const[metas,setMetas]=useState<ConversationMeta[]>([]);
 const[selectedSession,setSelectedSession]=useState("");
 const[tab,setTab]=useState<"active"|"resolved">("active");
 const[reply,setReply]=useState("");
 const[loading,setLoading]=useState(true);
 const[sending,setSending]=useState(false);
 const[error,setError]=useState("");

 async function loadMessages(){
  const[{data:messageRows,error:messageError},{data:conversationRows,error:conversationError}]=await Promise.all([
   supabase.from("support_chat_messages").select("id,session_id,sender_type,visitor_name,visitor_email,message,is_read,created_at").order("created_at",{ascending:true}),
   supabase.from("support_chat_conversations").select("session_id,visitor_name,visitor_email,status,last_message_at,resolved_at").order("last_message_at",{ascending:false})
  ]);
  if(messageError||conversationError){setError("Impossible de charger les conversations d’assistance.");setLoading(false);return}
  setRows((messageRows as SupportRow[])||[]);setMetas((conversationRows as ConversationMeta[])||[]);setLoading(false);
 }

 useEffect(()=>{loadMessages();const channel=supabase.channel("admin-support").on("postgres_changes",{event:"*",schema:"public",table:"support_chat_messages"},loadMessages).on("postgres_changes",{event:"*",schema:"public",table:"support_chat_conversations"},loadMessages).subscribe();return()=>{supabase.removeChannel(channel)}},[]);

 const conversations=useMemo<Conversation[]>(()=>metas.map(meta=>{
  const messages=rows.filter(row=>row.session_id===meta.session_id);
  const visitorMessage=[...messages].reverse().find(message=>message.sender_type!=="admin");
  return{sessionId:meta.session_id,name:meta.visitor_name||visitorMessage?.visitor_name||"Visiteur LEXIA",email:meta.visitor_email||visitorMessage?.visitor_email||"E-mail non renseigné",status:meta.status,unread:messages.filter(message=>message.sender_type!=="admin"&&!message.is_read).length,lastAt:meta.last_message_at,resolvedAt:meta.resolved_at,messages};
 }),[metas,rows]);
 const visible=conversations.filter(item=>item.status===tab);
 const active=visible.find(item=>item.sessionId===selectedSession)||visible[0];

 useEffect(()=>{if(visible.length&&!visible.some(item=>item.sessionId===selectedSession))setSelectedSession(visible[0].sessionId)},[tab,visible.length]);

 async function selectConversation(sessionId:string){setSelectedSession(sessionId);await supabase.from("support_chat_messages").update({is_read:true}).eq("session_id",sessionId).neq("sender_type","admin");setRows(current=>current.map(row=>row.session_id===sessionId&&row.sender_type!=="admin"?{...row,is_read:true}:row))}

 async function sendReply(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(!active||!reply.trim())return;setSending(true);setError("");
  const{data:{user}}=await supabase.auth.getUser();
  const{error:sendError}=await supabase.from("support_chat_messages").insert({session_id:active.sessionId,user_id:user?.id||null,sender_type:"admin",visitor_name:active.name,visitor_email:active.email,message:reply.trim(),is_read:true});
  if(sendError){setError("La réponse n’a pas pu être envoyée.");setSending(false);return}
  const now=new Date().toISOString();
  const{error:resolveError}=await supabase.from("support_chat_conversations").update({status:"resolved",resolved_at:now,resolved_by:user?.id||null,updated_at:now}).eq("session_id",active.sessionId);
  if(resolveError){setError("La réponse est envoyée, mais la conversation n’a pas pu être archivée.");setSending(false);return}
  setReply("");setSelectedSession("");setSending(false);await loadMessages();
 }

 async function reopen(sessionId:string){const now=new Date().toISOString();await supabase.from("support_chat_conversations").update({status:"active",resolved_at:null,resolved_by:null,updated_at:now}).eq("session_id",sessionId);setTab("active");setSelectedSession(sessionId);await loadMessages()}

 if(loading)return<section className="admin-card support-admin-loading">Chargement des conversations…</section>;
 return <section className="support-admin-wrap">
  <div className="support-tabs"><button className={tab==="active"?"active":""} onClick={()=>setTab("active")}>À traiter <span>{conversations.filter(x=>x.status==="active").length}</span></button><button className={tab==="resolved"?"active":""} onClick={()=>setTab("resolved")}>Historique <span>{conversations.filter(x=>x.status==="resolved").length}</span></button></div>
  {!visible.length?<section className="admin-card section-content"><div className="section-empty"><div>{tab==="active"?"✓":"✉"}</div><b>{tab==="active"?"Aucune demande en attente.":"Aucune conversation archivée."}</b><p>{tab==="active"?"Les nouvelles demandes apparaîtront ici.":"Les réponses envoyées resteront consultables dans cet historique."}</p></div></section>:
  <section className="support-admin-layout">
   <aside className="admin-card support-conversation-list"><div className="support-list-head"><div><small>{tab==="active"?"À TRAITER":"HISTORIQUE"}</small><h2>Conversations</h2></div><span>{visible.reduce((sum,item)=>sum+item.unread,0)}</span></div><div className="support-list-items">{visible.map(conversation=><button key={conversation.sessionId} className={active?.sessionId===conversation.sessionId?"active":""} onClick={()=>selectConversation(conversation.sessionId)}><div className="support-avatar">{conversation.name.slice(0,1).toUpperCase()}</div><div><b>{conversation.name}</b><small>{conversation.email}</small><span>{conversation.messages.at(-1)?.message}</span></div>{conversation.unread>0&&<em>{conversation.unread}</em>}</button>)}</div></aside>
   <section className="admin-card support-thread"><header><div><b>{active?.name}</b><small>{active?.email}</small></div><span className="support-online">{tab==="active"?"À traiter":"Archivée"}</span></header><div className="support-thread-messages">{active?.messages.map(message=><article key={message.id} className={message.sender_type==="admin"?"admin":"visitor"}><p>{message.message}</p><small>{new Date(message.created_at).toLocaleString("fr-FR")}</small></article>)}</div>{tab==="active"?<form onSubmit={sendReply}><textarea rows={4} value={reply} onChange={event=>setReply(event.target.value)} placeholder="Répondre au client ou au visiteur…"/>{error&&<p className="support-admin-error">{error}</p>}<button disabled={sending||!reply.trim()}>{sending?"Envoi…":"Envoyer et classer"}</button></form>:<div className="support-history-actions"><span>Conversation conservée dans l’historique.</span><button onClick={()=>active&&reopen(active.sessionId)}>Rouvrir la demande</button></div>}</section>
  </section>}
 </section>
}
