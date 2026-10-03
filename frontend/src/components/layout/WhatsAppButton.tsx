export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/972598515777"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      title="تواصل معنا عبر واتساب"
      className="group fixed left-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[45] flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-[#128c4a] text-white shadow-[0_6px_24px_rgba(18,140,74,0.3)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-1 hover:bg-[#0d753c] hover:shadow-[0_10px_30px_rgba(18,140,74,0.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#128c4a] motion-reduce:transform-none lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] lg:left-6"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-8 w-8" aria-hidden="true" focusable="false">
        <path d="M16 2a14 14 0 0 0-12.13 21L2 30l7.16-1.88A14 14 0 1 0 16 2Zm0 2.5a11.5 11.5 0 1 1-5.91 21.36l-.45-.27-4.08 1.07 1.09-3.97-.3-.47A11.5 11.5 0 0 1 16 4.5Z" />
        <path d="M11.3 8.8c-.28-.66-.57-.67-.84-.68h-.71c-.24 0-.62.09-.95.45-.32.35-1.24 1.2-1.24 2.92s1.27 3.39 1.45 3.62c.17.24 2.46 3.77 5.96 5.28.83.36 1.48.57 1.98.73.83.26 1.59.22 2.19.14.67-.1 2.05-.84 2.34-1.65.29-.82.29-1.52.2-1.67-.09-.14-.33-.23-.68-.41-.35-.17-2.05-1.01-2.37-1.13-.32-.11-.56-.17-.79.18-.23.35-.91 1.13-1.12 1.37-.2.23-.41.26-.76.09-.35-.18-1.48-.55-2.82-1.75-1.04-.93-1.74-2.08-1.95-2.43-.2-.35-.02-.54.16-.71.15-.16.35-.41.52-.61.18-.21.24-.36.36-.59.11-.23.05-.44-.03-.61-.09-.18-.79-1.9-1.08-2.54Z" />
      </svg>
    </a>
  );
}
