
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
}

interface CountryPhoneInputProps {
  value: string;
  onChange: (fullNumber: string) => void;
  placeholder?: string;
  className?: string;
}

const countries: Country[] = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', dialCode: '+55' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', dialCode: '+1' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴', dialCode: '+57' },
  { code: 'MX', name: 'México', flag: '🇲🇽', dialCode: '+52' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸', dialCode: '+34' },
];

const CountryPhoneInput = ({ value, onChange, placeholder = "Digite o número", className = "" }: CountryPhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Brasil como padrão
  const [localNumber, setLocalNumber] = useState('');

  // Inicializar com o DDI do Brasil quando o componente monta
  useEffect(() => {
    if (!value) {
      console.log('📱 Inicializando com DDI do Brasil:', selectedCountry.dialCode);
      onChange(selectedCountry.dialCode);
    }
  }, []);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      // Atualiza o número completo com o novo DDI + número local existente
      const fullNumber = country.dialCode + localNumber;
      console.log('🌍 País alterado para:', country.name, 'DDI:', country.dialCode, 'Número completo:', fullNumber);
      onChange(fullNumber);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    setLocalNumber(number);
    // Sempre concatena DDI + número local
    const fullNumber = selectedCountry.dialCode + number;
    console.log('📞 Número local alterado:', number, 'DDI:', selectedCountry.dialCode, 'Número completo:', fullNumber);
    onChange(fullNumber);
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-32">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
                <span className="text-sm text-gray-500">{country.dialCode}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Input
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
};

export default CountryPhoneInput;
