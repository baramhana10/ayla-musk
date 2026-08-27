/**
 * Server-rendered companion to <IntroLoader />.
 *
 * The React intro cannot exist until hydration, so on a cold load the visitor
 * would see a frame or two of the bare hero before the curtain appeared —
 * exactly the "flash" that makes an entrance sequence feel cheap. This renders
 * an inert veil into the initial HTML and switches it on with a synchronous
 * inline script, so the very first painted frame is already the curtain.
 *
 * The script is also the single source of truth for *whether the intro plays
 * at all*: it decides once, before hydration, and records the answer as a class
 * on <html>. IntroLoader then reads that class instead of re-deciding from
 * sessionStorage — which is what makes the sequence immune to React's
 * double-invoked effects in development.
 */
const ARM_SCRIPT = `(function(){try{
var reduced=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var seen=false;try{seen=sessionStorage.getItem("ayla-intro-v2")==="1"}catch(e){}
if(!reduced&&!seen){
document.documentElement.classList.add("intro-armed");
/* failsafe: the veil also locks scroll, so if hydration never happens the
   page must still let itself go rather than stranding the visitor. */
setTimeout(function(){document.documentElement.classList.remove("intro-armed")},6000);
}
}catch(e){}})();`;

export default function IntroVeil() {
  return (
    <>
      <div id="ayla-veil" aria-hidden="true" />
      <script dangerouslySetInnerHTML={{ __html: ARM_SCRIPT }} />
    </>
  );
}
