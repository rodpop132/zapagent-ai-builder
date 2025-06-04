
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

  // Parse the initial value to extract country and local number
  useEffect(() => {
    if (value && value.startsWith('+')) {
      console.log('🔍 PHONE INPUT: Parseando valor inicial:', value);
      
      // Find matching country by dial code
      const matchingCountry = countries.find(country => value.startsWith(country.dialCode));
      if (matchingCountry) {
        console.log('🌍 PHONE INPUT: País detectado:', matchingCountry.name);
        setSelectedCountry(matchingCountry);
        
        // Extract local number (remove the dial code)
        const local = value.substring(matchingCountry.dialCode.length);
        console.log('📞 PHONE INPUT: Número local extraído:', local);
        setLocalNumber(local);
      } else {
        console.log('⚠️ PHONE INPUT: País não encontrado para:', value);
        // If no matching country, use default and set the whole value as local
        setLocalNumber(value.substring(1)); // Remove just the +
      }
    } else if (!value) {
      // Initialize with default country dial code when empty
      console.log('📱 PHONE INPUT: Inicializando com DDI padrão:', selectedCountry.dialCode);
      onChange(selectedCountry.dialCode);
    }
  }, [value]);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      console.log('🌍 PHONE INPUT: País alterado para:', country.name, 'DDI:', country.dialCode);
      setSelectedCountry(country);
      
      // Update the full number with new dial code + existing local number
      const fullNumber = country.dialCode + localNumber;
      console.log('📞 PHONE INPUT: Número completo atualizado:', fullNumber);
      onChange(fullNumber);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    console.log('📞 PHONE INPUT: Número local digitado:', number);
    setLocalNumber(number);
    
    // Always concatenate dial code + local number (no extra +)
    const fullNumber = selectedCountry.dialCode + number;
    console.log('📞 PHONE INPUT: Número completo final:', fullNumber);
    onChange(fullNumber);
  };

  // Format local number for display (add spaces for better readability)
  const formatLocalNumber = (num: string) => {
    if (!num) return '';
    
    // Different formatting based on country
    if (selectedCountry.code === 'PT') {
      // Portugal: 9XX XXX XXX
      if (num.length <= 3) return num;
      if (num.length <= 6) return `${num.slice(0, 3)} ${num.slice(3)}`;
      return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6, 9)}`;
    } else if (selectedCountry.code === 'BR') {
      // Brasil: (XX) 9XXXX-XXXX
      if (num.length <= 2) return num;
      if (num.length <= 7) return `(${num.slice(0, 2)}) ${num.slice(2)}`;
      if (num.length <= 11) return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
      return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7, 11)}`;
    }
    
    // Default formatting: add space every 3 digits
    return num.replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Select value={selectedCountry.code} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-32 flex-shrink-0">
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
        value={formatLocalNumber(localNumber)}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1"
      />
    </div>
  );
};

export default CountryPhoneInput;
