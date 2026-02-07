'use client';

import { useEffect } from 'react';
import { useLanguageStore } from '@/stores/languageStore';

export function LanguageHandler() {
    const { language } = useLanguageStore();

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    return null;
}
