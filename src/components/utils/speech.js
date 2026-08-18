import { tr } from './translate';
import { DEFAULT_SOURCE_LOCALE, normalizeSourceLocale } from './locales';

const SPEECH_LANG_TAGS = {
  de: 'de-DE',
  uk: 'uk-UA',
  ru: 'ru-RU',
  en: 'en-US',
  ar: 'ar-SA',
  hi: 'hi-IN',
  ml: 'ml-IN',
  tr: 'tr-TR',
  el: 'el-GR',
  zh: 'zh-CN',
  ku: 'ku',
  pl: 'pl-PL',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  pt: 'pt-PT',
  bn: 'bn-IN',
  id: 'id-ID',
  ja: 'ja-JP',
  vi: 'vi-VN',
};

const SPEECH_NOTICE_KEY = 'mtw-speech-notice-shown';

let speakGeneration = 0;
let notifyHandler = null;

export function registerSpeechNotifier(handler) {
  notifyHandler = handler;
}

export function initSpeechVoices() {
  if (!window.speechSynthesis) {
    return;
  }

  const loadVoices = () => {
    window.speechSynthesis.getVoices();
  };

  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

function notifySpeechIssueOnce(message) {
  try {
    if (sessionStorage.getItem(SPEECH_NOTICE_KEY)) {
      return;
    }
    sessionStorage.setItem(SPEECH_NOTICE_KEY, '1');
  } catch {
    // Private browsing may block sessionStorage.
  }

  notifyHandler?.({ message, severity: 'warning' });
}

const cancelSpeechNow = () => {
  if (!window.speechSynthesis) {
    return;
  }

  window.speechSynthesis.cancel();
};

export const stopSpeech = () => {
  speakGeneration += 1;
  cancelSpeechNow();
};

function pickVoice(voices, localeCode) {
  const code = localeCode.toLowerCase();
  const matching = voices.filter((voice) => {
    const lang = voice.lang.toLowerCase();
    return lang === code || lang.startsWith(`${code}-`);
  });

  if (matching.length === 0) {
    return null;
  }

  return matching.find((voice) => voice.default)
    ?? matching.find((voice) => voice.localService)
    ?? matching[0];
}

function isBenignSpeechError(errorName) {
  return errorName === 'interrupted' || errorName === 'canceled';
}

function resumeSpeechSynth(synth) {
  if (synth.paused) {
    synth.resume();
  }
}

function speakUtterance(synth, utterance) {
  resumeSpeechSynth(synth);
  synth.speak(utterance);
}

function runSpeechAttempt({
  synth,
  text,
  langTag,
  voice,
  generation,
  allowVoiceFallback,
}) {
  if (generation !== speakGeneration) {
    return false;
  }

  let settled = false;
  let iosKeepAlive = null;

  const finish = () => {
    if (iosKeepAlive) {
      clearInterval(iosKeepAlive);
      iosKeepAlive = null;
    }
  };

  const start = (useVoice) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langTag;
    utterance.rate = 1;
    if (useVoice && voice) {
      utterance.voice = voice;
    }

    utterance.onend = finish;
    utterance.onerror = (event) => {
      if (isBenignSpeechError(event.error)) {
        finish();
        return;
      }

      if (allowVoiceFallback && useVoice && voice) {
        start(false);
        return;
      }

      notifySpeechIssueOnce(tr('common.speechFailed'));
      finish();
    };

    iosKeepAlive = window.setInterval(() => {
      if (!synth.speaking) {
        finish();
        return;
      }
      synth.pause();
      synth.resume();
    }, 12000);

    speakUtterance(synth, utterance);
  };

  start(Boolean(voice));
  return true;
}

export function speakText(text, localeCode = DEFAULT_SOURCE_LOCALE) {
  const trimmed = text?.trim();
  if (!trimmed) {
    return false;
  }

  const synth = window.speechSynthesis;
  if (!synth) {
    notifySpeechIssueOnce(tr('common.speechNotSupported'));
    return false;
  }

  stopSpeech();
  const generation = speakGeneration;
  const code = normalizeSourceLocale(localeCode);
  const langTag = SPEECH_LANG_TAGS[code] ?? code;
  const voice = pickVoice(synth.getVoices(), code);

  if (generation !== speakGeneration) {
    return false;
  }

  if (synth.speaking) {
    cancelSpeechNow();
  }

  return runSpeechAttempt({
    synth,
    text: trimmed,
    langTag,
    voice,
    generation,
    allowVoiceFallback: true,
  });
}
