export const speakText = (text) => {
  if (!window.speechSynthesis) {
    return alert('Ваш браузер не підтримує синтез мовлення');
  }

  const voices = window.speechSynthesis.getVoices();
  const germanVoices = voices.filter(voice => voice.lang.startsWith('de'));

  // Source - https://stackoverflow.com/a/5915122
  // Posted by Kelly, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-05-23, License - CC BY-SA 4.0
  const randomIndex = Math.floor(Math.random() * germanVoices.length);
  
  const germanVoice = germanVoices[randomIndex];
  
  if (!germanVoice) {
    return alert('Не знайдено підходящого голосу для озвучування. Ймовірно, німецька мова не встановлена. Будь ласка, додайте німецький пакет у налаштуваннях мови вашого пристрою (Synthesis Speech), щоб почути вимову.');
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = germanVoice; 
  utterance.lang = 'de-DE';
  utterance.rate = 1;
  
  window.speechSynthesis.speak(utterance);
};

export const correctNounCase = (number, one, few, many) => {
  const ukCardinalRules = new Intl.PluralRules('uk-UK');
  if (ukCardinalRules.select(number) == 'one') return one;
  else if (ukCardinalRules.select(number) == 'few') return few;
  else if (ukCardinalRules.select(number) == 'many') return many;
  else return many;
};

// the new string is not empty and different from the previous string
// or
// the previous string was not empty and the new one is different ("empty" is possible in this case)
export const isStateUpdateNeeded = (newStr, previousStr) => {
  return (
    (newStr != null && newStr.trim() != '' && newStr.trim().toLowerCase() != previousStr.trim().toLowerCase())
    ||
    (previousStr != null && previousStr.trim() != '' && newStr.trim().toLowerCase() != previousStr.trim().toLowerCase())
  );
};