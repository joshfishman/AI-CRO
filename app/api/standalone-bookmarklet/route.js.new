
// Create a simplified version of the bookmarklet that loads the full script from the server
javascript:(function(){
  const script = document.createElement('script');
  script.src = "https://ai-cro-three.vercel.app/api/selector-module";
  script.onload = () => console.log('AI CRO selector module loaded');
  script.onerror = (e) => console.error('Error loading AI CRO selector module', e);
  document.head.appendChild(script);
})();
