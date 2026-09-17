export const formatDate=(iso?:string|null)=>iso?new Date(iso).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}):'-';
export const formatTime=(iso?:string|null)=>iso?new Date(iso).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}):'-';
export const formatDateTime=(iso?:string|null)=>iso?`${formatDate(iso)} ${formatTime(iso)}`:'-';
export const todayFile=()=>new Date().toISOString().slice(0,10);
