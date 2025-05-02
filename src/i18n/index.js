import { createI18n } from 'vue-i18n';
import en from './en.json';
import it from './it.json';
import fr from './fr.json';
import es from './es.json';
import de from './de.json';

const messages = {
  en,
  it,
  fr,
  es,
  de
};

const i18n = createI18n({
  locale: 'it', // lingua predefinita
  fallbackLocale: 'en',
  messages
});

export default i18n;
