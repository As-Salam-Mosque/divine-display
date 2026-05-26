import en from '../src/translations/en.ts';
import fr from '../src/translations/fr.ts';

type LangMap = Record<string, any>;

const languages: Record<string, LangMap> = { en, fr } as any;
const baseLang = 'en';
const baseKeys = Object.keys((languages as any)[baseLang]);

let hasError = false;

console.log(`Checking translations against base language: ${baseLang.toUpperCase()} (${baseKeys.length} keys)`);

Object.entries(languages).forEach(([lang, translations]) => {
  if (lang === baseLang) return;

  const currentKeys = Object.keys(translations);
  const missingKeys = baseKeys.filter(key => !currentKeys.includes(key));
  const extraKeys = currentKeys.filter(key => !baseKeys.includes(key));

  if (missingKeys.length > 0) {
    hasError = true;
    console.error(`\n [${lang.toUpperCase()}] Missing keys:`);
    missingKeys.forEach(key => console.error(`   - ${key}`));
  }

  if (extraKeys.length > 0) {
    hasError = true;
    console.warn(`\n [${lang.toUpperCase()}] Extra keys (not in base language):`);
    extraKeys.forEach(key => console.warn(`   - ${key}`));
  }

  if (missingKeys.length === 0 && extraKeys.length === 0) {
    console.log(` [${lang.toUpperCase()}] All keys match.`);
  }
});

if (hasError) {
  console.log('\n Translation check failed. Please ensure all language files have the same keys.');
  process.exit(1);
} else {
  console.log('\n All translation files are synchronized!');
  process.exit(0);
}
