'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Plane, MapPin } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { filterCities, getCityDisplayName, type City } from '@/lib/cities';
import type { StepProps } from '../WizardContainer';

const POPULAR_ROUTES = [
  { id: 'ruh-jed', from: 'الرياض', fromEn: 'Riyadh', to: 'جدة', toEn: 'Jeddah' },
  { id: 'ruh-dxb', from: 'الرياض', fromEn: 'Riyadh', to: 'دبي', toEn: 'Dubai' },
  { id: 'jed-cai', from: 'جدة', fromEn: 'Jeddah', to: 'القاهرة', toEn: 'Cairo' },
  { id: 'ruh-amm', from: 'الرياض', fromEn: 'Riyadh', to: 'عمّان', toEn: 'Amman' },
];

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (city: City) => void;
  placeholder: string;
  lang: 'en' | 'ar';
  autoFocus?: boolean;
  dotColor: string;
  label: string;
}

function CityAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  lang,
  autoFocus,
  dotColor,
  label,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleInputChange = useCallback(
    (val: string) => {
      onChange(val);
      const results = filterCities(val, lang);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    },
    [onChange, lang]
  );

  const handleSelect = useCallback(
    (city: City) => {
      onSelect(city);
      setIsOpen(false);
      setSuggestions([]);
    },
    [onSelect]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="flex items-center gap-2 text-sm font-semibold text-v2-text mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (value.length >= 1) {
            const results = filterCities(value, lang);
            setSuggestions(results);
            setIsOpen(results.length > 0);
          }
        }}
        placeholder={placeholder}
        className="w-full px-5 py-3.5 rounded-2xl bg-white border border-v2-primary/10 text-v2-text placeholder:text-v2-text-muted focus:ring-2 focus:ring-v2-primary/30 focus:border-v2-primary/30 focus:outline-none transition-all shadow-bubble-xs text-base"
        autoFocus={autoFocus}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-2xl shadow-bubble-md border border-v2-primary/10 overflow-hidden">
          {suggestions.map((city) => (
            <button
              key={city.code}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-v2-primary/5 transition-colors text-start"
            >
              <MapPin className="w-4 h-4 text-v2-primary/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-v2-text truncate">
                  {getCityDisplayName(city, lang)}
                </p>
                <p className="text-xs text-v2-text-muted">
                  {city.code} {lang === 'ar' ? `· ${city.nameEn}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RouteStep({ data, updateData, goNext }: StepProps) {
  const { t, lang } = useLanguage();
  const departure = (data.departureCity as string) || '';
  const arrival = (data.arrivalCity as string) || '';
  const canContinue = departure.trim() && arrival.trim();

  function selectRoute(route: (typeof POPULAR_ROUTES)[0]) {
    updateData({
      departureCity: lang === 'ar' ? route.from : route.fromEn,
      arrivalCity: lang === 'ar' ? route.to : route.toEn,
    });
  }

  function handleCitySelect(field: 'departureCity' | 'arrivalCity') {
    return (city: City) => {
      updateData({ [field]: getCityDisplayName(city, lang) });
    };
  }

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="wizard-fade-in wizard-fade-in-1">
        <span className="text-4xl mb-3 block">✈️</span>
        <h2 className="text-2xl font-extrabold text-v2-text mb-1">{t('wizard.routeTitle')}</h2>
        <p className="text-v2-text-soft text-sm">{t('wizard.routeSubtitle')}</p>
      </div>

      {/* City inputs with autocomplete */}
      <div className="wizard-fade-in wizard-fade-in-2 space-y-4 relative z-10">
        <div className="relative z-20">
          <CityAutocomplete
            value={departure}
            onChange={(val) => updateData({ departureCity: val })}
            onSelect={handleCitySelect('departureCity')}
            placeholder={t('listing.placeholderRiyadh')}
            lang={lang as 'en' | 'ar'}
            autoFocus
            dotColor="bg-v2-primary"
            label={t('wp.departureCity')}
          />
        </div>

        <div className="relative z-10">
          <CityAutocomplete
            value={arrival}
            onChange={(val) => updateData({ arrivalCity: val })}
            onSelect={handleCitySelect('arrivalCity')}
            placeholder={t('listing.placeholderDubai')}
            lang={lang as 'en' | 'ar'}
            dotColor="bg-v2-secondary"
            label={t('wp.arrivalCity')}
          />
        </div>
      </div>

      {/* Popular Routes */}
      <div className="wizard-fade-in wizard-fade-in-3 relative z-0">
        <p className="text-xs font-semibold text-v2-text-muted mb-2.5 uppercase tracking-wide">
          {t('wizard.popularRoutes')}
        </p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROUTES.map((route) => {
            const fromLabel = lang === 'ar' ? route.from : route.fromEn;
            const toLabel = lang === 'ar' ? route.to : route.toEn;
            const isSelected = departure === fromLabel && arrival === toLabel;

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => selectRoute(route)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'v2-gradient-primary text-white shadow-bubble-xs'
                    : 'bg-white text-v2-text-soft border border-v2-primary/10 hover:border-v2-primary/30 shadow-bubble-xs hover:shadow-bubble-sm'
                }`}
              >
                {fromLabel}
                <Plane className="w-3 h-3 -rotate-90 rtl:rotate-90 opacity-50" />
                {toLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      {canContinue && (
        <div className="wizard-fade-in pt-2">
          <button
            type="button"
            onClick={goNext}
            className="w-full v2-gradient-primary text-white py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-bubble-sm text-base"
          >
            {t('wizard.next')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
