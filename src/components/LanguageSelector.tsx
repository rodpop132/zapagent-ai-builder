
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Se não há idioma salvo ou detectado, usar espanhol como padrão
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (!savedLanguage) {
      return languages.find(lang => lang.code === 'es') || languages[1]; // Espanhol por padrão
    }
    return languages.find(lang => lang.code === i18n.language) || languages.find(lang => lang.code === 'es') || languages[1];
  });

  const handleLanguageChange = (language: Language) => {
    i18n.changeLanguage(language.code);
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language.code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <span className="text-lg mr-1">{currentLanguage.flag}</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language)}
            className="cursor-pointer"
          >
            <span className="text-lg mr-2">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
