
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InvokeLLM } from "@/api/integrations";
import { Plus, Trash, Save, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddonGroupForm({ initialData = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name_he: "",
    name_en: "",
    name_ru: "",
    name_ar: "",
    addons: [],
    ...initialData
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState('he');

  // שמירת הערכים המקוריים בעברית
  const [originalHebrew, setOriginalHebrew] = useState({
    name_he: initialData?.name_he || "",
    addons: initialData?.addons?.map(a => a.name_he) || []
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddonChange = (index, field, value) => {
    const newAddons = [...formData.addons];
    newAddons[index] = {
      ...newAddons[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      addons: newAddons
    }));
  };

  const addNewAddon = () => {
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, { name_he: "", price: 0 }]
    }));
  };

  const removeAddon = (index) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index)
    }));
  };

  const translateContent = async () => {
    if (!formData.name_he) return;
    
    setIsTranslating(true);
    try {
      // תרגום שם הקבוצה
      const groupResponse = await InvokeLLM({
        prompt: `Translate the following add-on group name to English, Russian, and Arabic:
                ${formData.name_he}`,
        response_json_schema: {
          type: "object",
          properties: {
            english: { type: "string" },
            russian: { type: "string" },
            arabic: { type: "string" }
          }
        }
      });

      let translations = {
        name_en: "",
        name_ru: "",
        name_ar: "",
        addons: [...formData.addons]
      };

      if (groupResponse) {
        translations = {
          ...translations,
          name_en: groupResponse.english || formData.name_en || "",
          name_ru: groupResponse.russian || formData.name_ru || "",
          name_ar: groupResponse.arabic || formData.name_ar || ""
        };
      }

      // תרגום התוספות
      if (formData.addons && formData.addons.length > 0) {
        const addonPrompt = `Translate the following addon names to English, Russian, and Arabic:
                ${formData.addons.map(addon => addon.name_he).join("\n")}`;
                
        const addonsResponse = await InvokeLLM({
          prompt: addonPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              translations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    english: { type: "string" },
                    russian: { type: "string" },
                    arabic: { type: "string" }
                  }
                }
              }
            }
          }
        });

        if (addonsResponse?.translations) {
          translations.addons = formData.addons.map((addon, index) => {
            const translation = addonsResponse.translations[index] || {};
            return {
              ...addon,
              name_en: translation.english || addon.name_en || "",
              name_ru: translation.russian || addon.name_ru || "",
              name_ar: translation.arabic || addon.name_ar || ""
            };
          });
        }
      }

      return translations;
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // בדיקה האם העברית השתנתה
    const hebrewChanged = 
      formData.name_he !== originalHebrew.name_he || 
      formData.addons.length !== originalHebrew.addons.length ||
      formData.addons.some((addon, i) => 
        !originalHebrew.addons[i] || addon.name_he !== originalHebrew.addons[i]
      );
    
    let dataToSave = { ...formData };
    
    // אם העברית השתנתה - נתרגם את כל השפות
    if (hebrewChanged) {
      setIsTranslating(true);
      const translations = await translateContent();
      if (translations) {
        dataToSave = {
          ...dataToSave,
          ...translations
        };
      }
      setIsTranslating(false);
    }
    
    // עדכון הערכים המקוריים בעברית
    setOriginalHebrew({
      name_he: formData.name_he,
      addons: formData.addons.map(a => a.name_he)
    });
    
    onSave(dataToSave);
  };

  const languageLabels = {
    he: 'עברית',
    en: 'English',
    ru: 'Русский',
    ar: 'العربية'
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6 text-right" dir="rtl">
          <div className="space-y-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full mb-4">
                {['he', 'en', 'ru', 'ar'].map(lang => (
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
              
              {/* Hebrew Tab */}
              <TabsContent value="he" className="space-y-4">
                <div className="space-y-2">
                  <Label>שם הקבוצה</Label>
                  <Input
                    value={formData.name_he}
                    onChange={(e) => handleInputChange("name_he", e.target.value)}
                    required
                    className="text-right"
                  />
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  שינויים בעברית יתורגמו אוטומטית לשפות האחרות בעת השמירה
                </p>
              </TabsContent>
              
              {/* English Tab */}
              <TabsContent value="en">
                <div className="space-y-2">
                  <Label>שם הקבוצה (אנגלית)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => handleInputChange("name_en", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </TabsContent>
              
              {/* Russian Tab */}
              <TabsContent value="ru">
                <div className="space-y-2">
                  <Label>שם הקבוצה (רוסית)</Label>
                  <Input
                    value={formData.name_ru}
                    onChange={(e) => handleInputChange("name_ru", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </TabsContent>
              
              {/* Arabic Tab */}
              <TabsContent value="ar">
                <div className="space-y-2">
                  <Label>שם הקבוצה (ערבית)</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => handleInputChange("name_ar", e.target.value)}
                    dir="rtl"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">תוספות</h3>
              <Button type="button" onClick={addNewAddon}>
                <Plus className="w-4 h-4 ml-2" />
                הוסף תוספת
              </Button>
            </div>

            <div className="space-y-4">
              {formData.addons.map((addon, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4">
                      <Tabs defaultValue="he" className="w-full">
                        <TabsList className="w-full mb-4">
                          {['he', 'en', 'ru', 'ar'].map(lang => (
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
                        
                        {/* Hebrew Tab */}
                        <TabsContent value="he" className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>שם התוספת</Label>
                              <Input
                                value={addon.name_he}
                                onChange={(e) => handleAddonChange(index, "name_he", e.target.value)}
                                required
                                className="text-right"
                              />
                            </div>
                            <div>
                              <Label>מחיר</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                value={addon.price}
                                onChange={(e) => handleAddonChange(index, "price", Number(e.target.value))}
                                required
                                className="text-right"
                              />
                            </div>
                          </div>
                        </TabsContent>
                        
                        {/* English Tab */}
                        <TabsContent value="en">
                          <Label>שם התוספת (אנגלית)</Label>
                          <Input
                            value={addon.name_en || ""}
                            onChange={(e) => handleAddonChange(index, "name_en", e.target.value)}
                            dir="ltr"
                          />
                        </TabsContent>
                        
                        {/* Russian Tab */}
                        <TabsContent value="ru">
                          <Label>שם התוספת (רוסית)</Label>
                          <Input
                            value={addon.name_ru || ""}
                            onChange={(e) => handleAddonChange(index, "name_ru", e.target.value)}
                            dir="ltr"
                          />
                        </TabsContent>
                        
                        {/* Arabic Tab */}
                        <TabsContent value="ar">
                          <Label>שם התוספת (ערבית)</Label>
                          <Input
                            value={addon.name_ar || ""}
                            onChange={(e) => handleAddonChange(index, "name_ar", e.target.value)}
                            dir="rtl"
                          />
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex justify-start">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeAddon(index)}
                        >
                          <Trash className="w-4 h-4 ml-2" />
                          הסר תוספת
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-start gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
            )}
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              <Save className="w-4 h-4 ml-2" />
              שמור
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
