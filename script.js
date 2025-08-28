// Render simple per-collection lists of item links with small thumbnails
// Uses Internet Archive Advanced Search API and services/img for thumbs
// See: https://archive.org/advancedsearch.php (API) and IIIF docs at https://iiif.archive.org/iiif/documentation

const collContainer = document.getElementById('collections');
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  loadCollections();
});

async function loadCollections(){
  for (const c of SR_CONFIG.collections){
    const section = renderCollectionSkeleton(c);
    collContainer.appendChild(section);
    try{
      const docs = await fetchCollectionDocs(c.id, c.limit || 200);
      fillCollection(section, c, docs);
    }catch(e){
      section.querySelector('.item-list').innerHTML = `<li class="item">Error loading collection.</li>`;
      console.error('Collection load error', c.id, e);
    }
  }
}

function renderCollectionSkeleton(c){
  const section = document.createElement('section');
  section.className = 'collection-section';
  section.innerHTML = `
    <div class="collection-header">
      <h3>${escapeHtml(c.label || c.id)}</h3>
      <a href="https://archive.org/details/${encodeURIComponent(c.id)}" target="_blank" rel="noopener">View full collection →</a>
    </div>
    <ul class="item-list" aria-live="polite"><li class="item">Loading…</li></ul>
  `;
  return section;
}

async function fetchCollectionDocs(collectionId, limit){
  const rows = Math.min(limit, 1000); // IA API supports paging; we keep this simple
  const url = new URL('https://archive.org/advancedsearch.php');
  const q = `collection:${safe(collectionId)} AND mediatype:(texts)`;
  url.searchParams.set('q', q);
  ['identifier','title','date','creator'].forEach(f => url.searchParams.append('fl[]', f));
  url.searchParams.append('sort[]', 'date desc');
  url.searchParams.set('rows', rows);
  url.searchParams.set('page', '1');
  url.searchParams.set('output', 'json');
  const res = await fetch(url.toString());
  if(!res.ok) throw new Error('HTTP '+res.status);
  const data = await res.json();
  return (data?.response?.docs) || [];
}

function fillCollection(section, c, docs){
  const list = section.querySelector('.item-list');
  if (!docs.length){ list.innerHTML = '<li class="item">No items found.</li>'; return; }
  list.innerHTML = '';
  for (const d of docs){
    const li = document.createElement('li');
    li.className = 'item';
    const id = d.identifier;
    const href = `https://archive.org/details/${encodeURIComponent(id)}`;
    const thumb = `https://archive.org/services/img/${encodeURIComponent(id)}`; // simple, small image
    const title = d.title || id;
    const meta = formatMeta(d);
    li.innerHTML = `
      <a class="link" href="${href}" target="_blank" rel="noopener">
        <img class="thumb" src="${thumb}" alt="Thumbnail for ${escapeHtml(title)}" loading="lazy">
        <div class="text">
          <div class="title">${escapeHtml(title)}</div>
          <div class="meta">${escapeHtml(meta)}</div>
        </div>
      </a>`;
    list.appendChild(li);
  }
}

function formatMeta(d){
  const date = d.date ? String(d.date) : '';
  const creator = d.creator ? (Array.isArray(d.creator)? d.creator.join('; ') : d.creator) : '';
  return [date, creator].filter(Boolean).join(' • ');
}

function safe(s){ return /[^\w-]/.test(s) ? `"${s}"` : s; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m])); }
