export const speakText = (text) => {
  if (!window.speechSynthesis) {
    alert('Ваш браузер не підтримує синтез мовлення');
    return;
  }

  const voices = window.speechSynthesis.getVoices();
  const germanVoices = voices.filter(voice => voice.lang.startsWith('de'));

  // Source - https://stackoverflow.com/a/5915122
  // Posted by Kelly, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-05-23, License - CC BY-SA 4.0
  const randomIndex = Math.floor(Math.random() * germanVoices.length);
  
  const germanVoice = germanVoices[randomIndex];
  
  if (!germanVoice) {
    alert('Не знайдено підходящого голосу для озвучування. Ймовірно, німецька мова не встановлена. Будь ласка, додайте німецький пакет у налаштуваннях мови вашого пристрою (Synthesis Speech), щоб почути вимову.');
    return;
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = germanVoice; 
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  
  window.speechSynthesis.speak(utterance);
};