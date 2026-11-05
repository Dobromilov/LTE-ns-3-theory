const code=(label,text)=>`<div class="codebox"><div class="code-label">${label}</div><button class="copy" type="button">Копировать</button><pre><code>${esc(text)}</code></pre></div>`;
const callout=(title,text)=>`<div class="callout"><strong>${title}</strong>${text}</div>`;
const sources=(...paths)=>`<div class="sources"><strong>ГДЕ СМОТРЕТЬ В ПРОЕКТЕ</strong>${paths.map(p=>`<code>${esc(p)}</code>`).join('')}</div>`;
const table=(headers,rows)=>`<table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

// Простая схема без внешних библиотек. SVG можно вставить прямо в sections.
function flow(title, items, caption = '') {
  return `<figure class="flow-diagram"><figcaption>${esc(title)}</figcaption><ol>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ol>${caption ? `<p>${esc(caption)}</p>` : ''}</figure>`;
}
