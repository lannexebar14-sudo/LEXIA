import Link from "next/link";

export default function StaffCasesLayout({children}:{children:React.ReactNode}){
  return <>{children}<Link href="/administration/mes-dossiers/courriers" style={{position:"fixed",right:18,bottom:18,zIndex:60,background:"#0c2340",color:"white",padding:"12px 16px",borderRadius:999,boxShadow:"0 10px 30px rgba(12,35,64,.22)",fontWeight:800,fontSize:13}}>✎ Courriers amiables</Link></>;
}