# @caf/i18n

Framework-agnostic internationalization interfaces and adapters for CAF. Works with i18next, vue-i18n, ngx-translate, or any i18n library.

## Installation

```bash
npm install @caf/i18n
```

For i18next integration:
```bash
npm install @caf/i18n i18next
```

For vue-i18n integration:
```bash
npm install @caf/i18n vue-i18n
```

For ngx-translate integration:
```bash
npm install @caf/i18n @ngx-translate/core
```

For react-intl integration:
```bash
npm install @caf/i18n react-intl
```

For next-intl integration:
```bash
npm install @caf/i18n next-intl
```

Note: The Intl API adapter doesn't require any additional dependencies as it uses native browser APIs.

## Usage

### Core Interfaces

The package provides framework-agnostic interfaces that work with any i18n library:

```typescript
import { ITranslator, TranslationOptions, TranslationManager } from '@caf/i18n';

// ITranslator interface can be implemented by any i18n library adapter
interface ITranslator {
  translate(key: string, options?: TranslationOptions): string;
  getCurrentLanguage(): string;
  changeLanguage(language: string): Promise<void> | void;
  exists(key: string): boolean;
}
```

### Translation Manager

Use `TranslationManager` to provide convenient methods for translation:

```typescript
import { TranslationManager, ITranslator } from '@caf/i18n';

// Create a translator implementation
class MyTranslator implements ITranslator {
  translate(key: string, options?: TranslationOptions): string {
    // Your translation logic
  }
  getCurrentLanguage(): string { return 'en'; }
  changeLanguage(language: string): Promise<void> { /* ... */ }
  exists(key: string): boolean { return true; }
}

// Use TranslationManager
const translator = new MyTranslator();
const translationManager = new TranslationManager(translator);

// Simple translation
const greeting = translationManager.t('common.greeting');

// Translation with interpolation
const welcome = translationManager.translateWithValues('user.welcome', {
  name: 'John',
});

// Translation with pluralization
const items = translationManager.translatePlural('cart.items', 5);

// Change language
await translationManager.changeLanguage('fa');
```

## Integration with i18next

```typescript
import i18n from 'i18next';
import { I18nextTranslator } from '@caf/i18n/i18next';
import { TranslationManager } from '@caf/i18n';

// Initialize i18next
await i18n.init({
  resources: {
    en: { translation: { greeting: 'Hello' } },
    fa: { translation: { greeting: 'سلام' } },
  },
  lng: 'en',
});

// Create translator adapter
const translator = new I18nextTranslator(i18n);
const translationManager = new TranslationManager(translator);

// Use in your application
const greeting = translationManager.t('greeting');
await translationManager.changeLanguage('fa');
```

## Integration with vue-i18n

```typescript
import { createI18n } from 'vue-i18n';
import { VueI18nTranslator } from '@caf/i18n/vue-i18n';
import { TranslationManager } from '@caf/i18n';

// Initialize vue-i18n
const i18n = createI18n({
  locale: 'en',
  messages: {
    en: { greeting: 'Hello' },
    fa: { greeting: 'سلام' },
  },
});

// Create translator adapter
const translator = new VueI18nTranslator(i18n.global);
const translationManager = new TranslationManager(translator);

// Use in your application
const greeting = translationManager.t('greeting');
await translationManager.changeLanguage('fa');
```

## Integration with ngx-translate

```typescript
import { TranslateService } from '@ngx-translate/core';
import { NgxTranslateTranslator } from '@caf/i18n/ngx-translate';
import { TranslationManager } from '@caf/i18n';

// In Angular service/component
export class MyComponent {
  private translationManager: TranslationManager;

  constructor(private translate: TranslateService) {
    // Create translator adapter
    const translator = new NgxTranslateTranslator(translate);
    this.translationManager = new TranslationManager(translator);
  }

  ngOnInit() {
    // Use in your application
    const greeting = this.translationManager.t('greeting');
    this.translationManager.changeLanguage('fa');
  }
}
```

## Integration with react-intl

```typescript
import { IntlProvider, useIntl } from 'react-intl';
import { ReactIntlTranslator } from '@caf/i18n/react-intl';
import { TranslationManager } from '@caf/i18n';

// In your React component
function MyComponent() {
  const intl = useIntl();
  const translator = new ReactIntlTranslator(intl);
  const translationManager = new TranslationManager(translator);

  // Use in your application
  const greeting = translationManager.t('common.greeting');
  const welcome = translationManager.translateWithValues('common.welcome', {
    name: 'John',
  });

  return <div>{greeting}</div>;
}

// Wrap your app with IntlProvider
function App() {
  return (
    <IntlProvider locale="en" messages={messages}>
      <MyComponent />
    </IntlProvider>
  );
}
```

## Integration with next-intl

```typescript
import { useTranslations } from 'next-intl';
import { NextIntlTranslator } from '@caf/i18n/next-intl';
import { TranslationManager } from '@caf/i18n';

// In your Next.js component
export default function MyComponent() {
  const t = useTranslations();
  const locale = useLocale(); // from next-intl
  const translator = new NextIntlTranslator(t, locale);
  const translationManager = new TranslationManager(translator);

  // Use in your application
  const greeting = translationManager.t('common.greeting');
  const welcome = translationManager.translateWithValues('common.welcome', {
    name: 'John',
  });

  return <div>{greeting}</div>;
}
```

## Integration with Native Intl API

```typescript
import { IntlApiTranslator, TranslationsMap } from '@caf/i18n/intl-api';
import { TranslationManager } from '@caf/i18n';

// Define translations map
const translations: TranslationsMap = {
  en: {
    'common.greeting': 'Hello',
    'common.welcome': 'Welcome {{name}}',
    'cart.items': '{{count}} items',
  },
  fa: {
    'common.greeting': 'سلام',
    'common.welcome': 'خوش آمدید {{name}}',
    'cart.items': '{{count}} مورد',
  },
};

// Create translator
const translator = new IntlApiTranslator('en', translations);
const translationManager = new TranslationManager(translator);

// Use in your application
const greeting = translationManager.t('common.greeting');
const welcome = translationManager.translateWithValues('common.welcome', {
  name: 'John',
});

// Change language
await translationManager.changeLanguage('fa');

// Add translations dynamically
translator.addTranslations('fr', {
  'common.greeting': 'Bonjour',
});

// Get available languages
const languages = translator.getAvailableLanguages(); // ['en', 'fa', 'fr']
```

## Custom Translator Implementation

You can implement `ITranslator` for any i18n library:

```typescript
import { ITranslator, TranslationOptions, TranslationManager } from '@caf/i18n';

class CustomTranslator implements ITranslator {
  private currentLanguage = 'en';
  private translations: Record<string, Record<string, string>> = {
    en: { greeting: 'Hello', welcome: 'Welcome {{name}}' },
    fa: { greeting: 'سلام', welcome: 'خوش آمدید {{name}}' },
  };

  translate(key: string, options?: TranslationOptions): string {
    let text = this.translations[this.currentLanguage]?.[key] || key;
    
    // Simple interpolation
    if (options) {
      Object.keys(options).forEach((k) => {
        if (k !== 'ns' && k !== 'defaultValue' && k !== 'count' && k !== 'returnObjects') {
          text = text.replace(`{{${k}}}`, String(options[k]));
        }
      });
    }
    
    return text;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  async changeLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
  }

  exists(key: string): boolean {
    return !!this.translations[this.currentLanguage]?.[key];
  }
}

// Use with TranslationManager
const translator = new CustomTranslator();
const translationManager = new TranslationManager(translator);
const greeting = translationManager.t('greeting');
```

## Usage in Use Cases and Plocs

```typescript
import { UseCase, RequestResult, pulse } from '@caf/core';
import { TranslationManager, ITranslator } from '@caf/i18n';

class LoginUser implements UseCase<[{ username: string; password: string }], { token: string }> {
  constructor(
    private loginService: LoginService,
    private translationManager: TranslationManager
  ) {}

  async execute(args: { username: string; password: string }): Promise<RequestResult<{ token: string }>> {
    try {
      const result = await this.loginService.login(args);
      
      // Use translation in use case
      const successMessage = this.translationManager.t('login.success');
      console.log(successMessage);
      
      return {
        loading: pulse(false),
        data: pulse(result),
        error: pulse(null! as Error),
      };
    } catch (error) {
      const errorMessage = this.translationManager.t('login.error');
      return {
        loading: pulse(false),
        data: pulse(null! as { token: string }),
        error: pulse(new Error(errorMessage)),
      };
    }
  }
}
```

## Exports

- `ITranslator` — Interface for translation implementations
- `TranslationOptions` — Interface for translation options (interpolation, pluralization, etc.)
- `TranslationManager` — Utility class for translation
- `I18nextTranslator` — Adapter for i18next (from `@caf/i18n/i18next`)
- `VueI18nTranslator` — Adapter for vue-i18n (from `@caf/i18n/vue-i18n`)
- `NgxTranslateTranslator` — Adapter for ngx-translate (from `@caf/i18n/ngx-translate`)
- `ReactIntlTranslator` — Adapter for react-intl (from `@caf/i18n/react-intl`)
- `NextIntlTranslator` — Adapter for next-intl (from `@caf/i18n/next-intl`)
- `IntlApiTranslator` — Adapter for native Intl API (from `@caf/i18n/intl-api`)
- `TranslationsMap` — Type for translations map structure

## Dependencies

- `@caf/core` — Core primitives

## Peer Dependencies (Optional)

- `i18next` — For i18next integration
- `vue-i18n` — For vue-i18n integration
- `@ngx-translate/core` — For ngx-translate integration
- `react-intl` — For react-intl integration
- `next-intl` — For next-intl integration

## License

MIT
