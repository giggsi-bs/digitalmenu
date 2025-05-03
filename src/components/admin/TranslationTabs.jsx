import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TranslationTabs({ 
  formData, 
  onChange,
  fields = ['name', 'description'], // Default fields to translate
  languages = ['he', 'en', 'ru', 'ar'] // Default languages
}) {
  const [activeTab, setActiveTab] = useState('he');
  
  const languageLabels = {
    he: 'עברית',
    en: 'English',
    ru: 'Русский',
    ar: 'العربية'
  };

  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [`${field}_${activeTab}`]: value
    });
  };
  
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="w-full mb-4">
        {languages.map(lang => (
          <TabsTrigger 
            key={lang} 
            value={lang}
            className="flex-1"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {languageLabels[lang]}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {languages.map(lang => (
        <TabsContent key={lang} value={lang} className="pt-2">
          {fields.map(field => (
            <div key={field} className="space-y-2 mb-4">
              {/* Render children's render props with current language */}
              {children => children({ 
                field, 
                lang,
                value: formData[`${field}_${lang}`] || '',
                onChange: (e) => handleInputChange(field, e.target.value)  
              })}
            </div>
          ))}
        </TabsContent>  
      ))}
    </Tabs>
  );
}