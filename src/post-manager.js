// MarketHub AI · herramientas puras para publicaciones locales.
// No publica ni programa acciones en plataformas externas.
export const draftLimit = plan => plan === 'pro' ? 500 : 20;

export function findPost(posts, id) {
  if (!Array.isArray(posts) || id == null) return null;
  return posts.find(post => post && typeof post === 'object' && String(post.id) === String(id)) ?? null;
}

export function validatePost({ title, platform, date, status }) {
  const text = String(title ?? '').trim().slice(0, 240);
  const when = String(date ?? '').trim();
  const network = String(platform ?? 'Instagram').trim().slice(0, 40);
  if (!text) return { error: 'Escribe el texto o título de la publicación.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(when) ||
      Number.isNaN(new Date(when + 'T12:00:00Z').valueOf()) ||
      new Date(when + 'T12:00:00Z').toISOString().slice(0, 10) !== when) {
    return { error: 'Selecciona una fecha válida.' };
  }
  if (!['Instagram', 'TikTok', 'YouTube', 'Facebook', 'LinkedIn', 'X'].includes(network)) {
    return { error: 'Selecciona una plataforma válida.' };
  }
  return { value: { title: text, platform: network, date: when,
    status: status === 'Borrador' ? 'Borrador' : 'Programada' } };
}

function csvCell(value) {
  // Protege Excel y otras hojas de cálculo frente a fórmulas en textos introducidos por el usuario.
  const raw = String(value ?? '').replace(/\0/g, '');
  const neutral = /^\s*[=+\-@]/.test(raw) ? "'" + raw : raw;
  return '"' + neutral.replace(/"/g, '""') + '"';
}
export function postsToCSV(posts) {
  const header = ['Título', 'Plataforma', 'Fecha', 'Estado'];
  const rows = (Array.isArray(posts) ? posts : [])
    .filter(p => p && typeof p === 'object')
    .map(p => [p.title, p.platform, p.date, p.status]);
  return '\uFEFF' + [header, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
