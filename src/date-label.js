// Etiqueta española de mes y año. Solo inicial en mayúscula: "Noviembre de 2026".
export function spanishMonthYear(date){
 const value=new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(date);
 return value.charAt(0).toLocaleUpperCase('es-ES')+value.slice(1);
}
