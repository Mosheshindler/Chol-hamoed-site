export default function Icon({name,size=58}){
  const common={width:size,height:size,viewBox:'0 0 64 64',fill:'none',stroke:'currentColor',strokeWidth:'2.8',strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true}
  const paths={
    play:<><circle cx="32" cy="32" r="22"/><path d="M27 22l17 10-17 10z" fill="currentColor" stroke="none"/></>,
    documentary:<><rect x="12" y="26" width="31" height="23" rx="3"/><circle cx="22" cy="19" r="8"/><circle cx="37" cy="17" r="9"/><path d="M43 31l12-7v27l-12-7z"/></>,
    entertainment:<><path d="M18 23h28l-4 30H22z"/><path d="M18 23l-5-12m12 12-3-15m13 15 3-15m8 15 5-12"/><path d="M20 13c3-5 8-4 8 2 3-6 9-5 9 1 3-5 8-4 8 2"/></>,
    music:<><path d="M32 44V20l14-4v21"/><circle cx="25" cy="45" r="6"/><circle cx="40" cy="38" r="6"/><path d="M19 22l-5-5m37 4 5-6M16 32H9"/></>,
    qa:<><path d="M8 16h32a7 7 0 017 7v11a7 7 0 01-7 7H25l-11 8v-8H8z"/><path d="M39 25h10a7 7 0 017 7v8a7 7 0 01-7 7h-4v7l-8-7"/></>,
    bts:<><path d="M20 25h24v6H20zM24 31v21m16-21v21M20 52h24"/><path d="M25 25V13m14 12V13M17 17h30"/><path d="M22 36l20 16m0-16L22 52"/></>,
    events:<><path d="M13 22l7-13 7 13m10 0 7-13 7 13"/><path d="M18 18l8 10m20-10-8 10"/><circle cx="24" cy="39" r="4"/><circle cx="40" cy="39" r="4"/><circle cx="32" cy="35" r="4"/><path d="M10 54c3-9 13-12 22-12s19 3 22 12"/></>,
    premium:<><path d="M14 22l9-10h18l9 10-18 30z"/><path d="M14 22h36M23 12l9 10 9-10M23 22l9 30 9-30"/></>,
    shorts:<><rect x="20" y="8" width="24" height="48" rx="7"/><path d="M29 24l11 8-11 8z" fill="currentColor" stroke="none"/></>
  }
  return <svg {...common}>{paths[name]||paths.play}</svg>
}
