'use client';

import React, { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';

interface ShareSummaryProps {
  title: string;
  analysis: string;
  deadline?: string;
  deadlineLabel?: string;
}

// Minimal markdown → printable HTML (headings, bullets, bold, quotes).
function toHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return md
    .split('\n')
    .map((line) => {
      const l = line.trim();
      if (!l) return '';
      if (l.startsWith('## ')) return `<h2>${esc(l.slice(3))}</h2>`;
      if (l.startsWith('### ')) return `<h3>${esc(l.slice(4))}</h3>`;
      if (l.startsWith('> ') || l.startsWith('"'))
        return `<blockquote>${esc(l.replace(/^>\s?/, '').replace(/^"|"$/g, ''))}</blockquote>`;
      if (l.startsWith('- ') || l.startsWith('• ')) return `<li>${esc(l.slice(2))}</li>`;
      return `<p>${esc(l).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</p>`;
    })
    .join('\n')
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
}

export default function ShareSummary({ title, analysis, deadline, deadlineLabel }: ShareSummaryProps) {
  const [busy, setBusy] = useState(false);

  const open = async () => {
    setBusy(true);
    try {
      const QRCode = (await import('qrcode')).default;
      const url = typeof window !== 'undefined' ? window.location.origin : 'https://envis.app';
      const qr = await QRCode.toDataURL(url, { margin: 1, width: 160, color: { dark: '#2E4F4A', light: '#FFFFFF' } });

      const deadlineHtml =
        deadline
          ? `<div class="deadline"><strong>Key date:</strong> ${new Date(deadline + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${deadlineLabel ? ` — ${deadlineLabel}` : ''}</div>`
          : '';

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title || 'ENVIS summary'}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #33403D; line-height: 1.55; max-width: 720px; margin: 0 auto; padding: 24px; }
  .brand { display:flex; align-items:center; gap:10px; border-bottom:2px solid #7FA99B; padding-bottom:12px; margin-bottom:16px; }
  .logo { width:34px; height:34px; border-radius:50%; background:#7FA99B; color:#2E4F4A; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:18px; }
  .brand h1 { font-size:22px; margin:0; color:#2E4F4A; }
  .brand span { font-size:12px; color:#5F5E5A; font-family:Arial,sans-serif; }
  h2 { font-size:16px; color:#2E4F4A; margin:18px 0 4px; }
  h3 { font-size:14px; color:#2E4F4A; margin:14px 0 2px; }
  p, li { font-size:13px; }
  blockquote { border-left:3px solid #7FA99B; margin:8px 0; padding:6px 12px; background:#F1EFE8; font-style:italic; font-size:13px; }
  ul { margin:4px 0; padding-left:20px; }
  .deadline { background:#FAEEDA; border:1px solid #E0B25C; border-radius:8px; padding:10px 14px; margin:12px 0; font-size:13px; }
  .footer { margin-top:28px; border-top:1px solid #C9D2CE; padding-top:14px; display:flex; gap:16px; align-items:center; }
  .footer img { width:96px; height:96px; }
  .footer .note { font-family:Arial,sans-serif; font-size:11px; color:#5F5E5A; }
</style></head>
<body>
  <div class="brand"><div class="logo">E</div><div><h1>${title || 'Your document, explained'}</h1><span>ENVIS · Crisis-to-Action Translator</span></div></div>
  ${deadlineHtml}
  ${toHtml(analysis)}
  <div class="footer">
    <img src="${qr}" alt="QR code" />
    <div class="note">
      <strong>Scan to open ENVIS on your phone</strong><br/>
      ENVIS explains and suggests — it does not make legal, medical, or financial decisions. Confirm important details with the official source. You stay in control.
    </div>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`;

      const w = window.open('', '_blank');
      if (w) {
        w.document.write(html);
        w.document.close();
      }
    } catch (e) {
      console.error('Share failed', e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={open}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 bg-surface/70 dark:bg-surface/60 backdrop-blur rounded-3xl shadow-calm hover:shadow-calm-hover active:scale-[0.99] transition-all duration-300 py-4 text-sm font-semibold text-deep-pine dark:text-calm-sage font-sans disabled:opacity-60"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
      Save / share as a one-pager
    </button>
  );
}
