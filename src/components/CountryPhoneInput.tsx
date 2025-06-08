import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { normalizarNumero } from '@/utils/phoneUtils';

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
  disabled?: boolean; // Added disabled prop
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

const CountryPhoneInput = ({ 
  value, 
  onChange, 
  placeholder = "Digite o número", 
  className = "",
  disabled = false // Default value for disabled
}: CountryPhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [localNumber, setLocalNumber] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para limpar número de telefone removendo + duplicados
  const cleanPhoneNumber = (phoneNumber: string) => {
    // Remove espaços extras e múltiplos sinais de +
    let cleaned = phoneNumber.trim().replace(/\+{2,}/g, '+');
    
    // Se não começar com +, adiciona
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    console.log('📞 PHONE INPUT: Número limpo:', cleaned);
    return cleaned;
  };

  // Função para detectar país pelo número completo
  const detectCountryFromNumber = (fullNumber: string) => {
    const cleanedNumber = cleanPhoneNumber(fullNumber);
    
    if (!cleanedNumber || !cleanedNumber.startsWith('+')) return null;
    
    // Ordenar países por tamanho do código (maior primeiro para evitar conflitos)
    const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
    
    for (const country of sortedCountries) {
      if (cleanedNumber.startsWith(country.dialCode)) {
        return country;
      }
    }
    return null;
  };

  // Parse do valor inicial
  useEffect(() => {
    console.log('🔍 PHONE INPUT: Processando valor:', value);
    
    if (value && value.includes('+') && !isInitialized) {
      const cleanedValue = cleanPhoneNumber(value);
      const detectedCountry = detectCountryFromNumber(cleanedValue);
      
      if (detectedCountry) {
        console.log('🌍 PHONE INPUT: País detectado:', detectedCountry.name);
        setSelectedCountry(detectedCountry);
        
        const local = cleanedValue.substring(detectedCountry.dialCode.length);
        const normalizedLocal = normalizarNumero(local);
        console.log('📞 PHONE INPUT: Número local extraído:', normalizedLocal);
        setLocalNumber(normalizedLocal);
      } else {
        console.log('⚠️ PHONE INPUT: País não detectado, usando padrão');
        const normalizedLocal = normalizarNumero(cleanedValue.substring(1));
        setLocalNumber(normalizedLocal);
      }
      setIsInitialized(true);
    } else if (!value && !isInitialized) {
      console.log('📱 PHONE INPUT: Inicializando vazio');
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  const handleCountryChange = (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      console.log('🌍 PHONE INPUT: País alterado para:', country.name);
      setSelectedCountry(country);
      
      const fullNumber = country.dialCode + localNumber;
      const cleanedNumber = cleanPhoneNumber(fullNumber);
      console.log('📞 PHONE INPUT: Novo número completo:', cleanedNumber);
      onChange(cleanedNumber);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const normalized = normalizarNumero(inputValue);
    
    console.log('📞 PHONE INPUT: Input original:', inputValue, 'Normalizado:', normalized);
    setLocalNumber(normalized);
    
    const fullNumber = selectedCountry.dialCode + normalized;
    const cleanedNumber = cleanPhoneNumber(fullNumber);
    console.log('📞 PHONE INPUT: Número completo final:', cleanedNumber);
    onChange(cleanedNumber);
  };

  // Formatação para exibição
  const formatForDisplay = (num: string) => {
    if (!num) return '';
    
    const digits = normalizarNumero(num);
    
    if (selectedCountry.code === 'PT') {
      // Portugal: 9XX XXX XXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
    } else if (selectedCountry.code === 'BR') {
      // Brasil: (XX) 9XXXX-XXXX
      if (digits.length <= 2) return digits;
      if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
      if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
    
    // Formatação padrão: espaço a cada 3 dígitos
    return digits.replace(/(\d{3})(?=\d)/g, '$1 ');
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Select value={selectedCountry.code} onValueChange={handleCountryChange} disabled={disabled}>
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
        value={formatForDisplay(localNumber)}
        onChange={handleNumberChange}
        placeholder={placeholder}
        className="flex-1"
        autoComplete="tel"
        disabled={disabled}
      />
    </div>
  );
};

export default CountryPhoneInput;
