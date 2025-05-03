
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InvokeLLM } from "@/api/integrations";
import { Save, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploader from './ImageUploader';

export default function MenuItemForm({ initialData = null, categories = [], addonGroups = [], onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name_he: "",
    description_he: "",
    price: "",
    image_url: "",
    display_order: 0,
    name_en: "",
    name_ru: "",
    name_ar: "",
    description_en: "",
    description_ru: "",
    description_ar: "",
    category_id: categories[0]?.id || "",
    addon_groups: [],
    is_active: true,
    ...initialData
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState('he');

  // שמירת הערכים המקוריים בעברית
  const [originalHebrew, setOriginalHebrew] = useState({
    name_he: initialData?.name_he || "",
    description_he: initialData?.description_he || ""
  });

  useEffect(() => {
    if (initialData) {
      setOriginalHebrew({
        name_he: initialData.name_he || "",
        description_he: initialData.description_he || ""
      });
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddonGroupToggle = (groupId) => {
    setFormData(prev => {
      const currentGroups = prev.addon_groups || [];
      if (currentGroups.includes(groupId)) {
        return { ...prev, addon_groups: currentGroups.filter(id => id !== groupId) };
      } else {
        return { ...prev, addon_groups: [...currentGroups, groupId] };
      }
    });
  };

  const translateContent = async () => {
    if (!formData.name_he) return;
    
    setIsTranslating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Translate the following menu item details to English, Russian, and Arabic:
                Name: ${formData.name_he}
                Description: ${formData.description_he || ""}`,
        response_json_schema: {
          type: "object",
          properties: {
            english: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" }
              }
            },
            russian: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" }
              }
            },
            arabic: {
              type: "object",
              properties: {
                name: { type: "string" },
                description: { type: "string" }
              }
            }
          }
        }
      });

      if (response) {
        return {
          name_en: response.english.name || formData.name_en || "",
          name_ru: response.russian.name || formData.name_ru || "",
          name_ar: response.arabic.name || formData.name_ar || "",
          description_en: response.english.description || formData.description_en || "",
          description_ru: response.russian.description || formData.description_ru || "",
          description_ar: response.arabic.description || formData.description_ar || ""
        };
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name_he || !formData.price) {
        alert('נא למלא שם ומחיר');
        return;
    }
    
    // בדיקה האם העברית השתנתה
    const hebrewChanged = formData.name_he !== originalHebrew.name_he || 
                         formData.description_he !== originalHebrew.description_he;
    
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
      description_he: formData.description_he
    });
    
    onSave({
        ...dataToSave,
        price: Number(dataToSave.price),
        display_order: Number(dataToSave.display_order)
    });
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
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">פרטי הפריט</h3>
            
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
                  <Label>שם המנה</Label>
                  <Input
                    value={formData.name_he}
                    onChange={(e) => handleInputChange("name_he", e.target.value)}
                    required
                    className="text-right"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>תיאור המנה</Label>
                  <Textarea
                    value={formData.description_he}
                    onChange={(e) => handleInputChange("description_he", e.target.value)}
                    rows={3}
                    className="text-right"
                  />
                </div>
                
                <p className="text-sm text-gray-500 mt-2">
                  שינויים בעברית יתורגמו אוטומטית לשפות האחרות בעת השמירה
                </p>
              </TabsContent>
              
              {/* English Tab */}
              <TabsContent value="en" className="space-y-4">
                <div className="space-y-2">
                  <Label>שם המנה (אנגלית)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => handleInputChange("name_en", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>תיאור המנה (אנגלית)</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => handleInputChange("description_en", e.target.value)}
                    rows={3}
                    dir="ltr"
                  />
                </div>
              </TabsContent>
              
              {/* Russian Tab */}
              <TabsContent value="ru" className="space-y-4">
                <div className="space-y-2">
                  <Label>שם המנה (רוסית)</Label>
                  <Input
                    value={formData.name_ru}
                    onChange={(e) => handleInputChange("name_ru", e.target.value)}
                    dir="ltr"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>תיאור המנה (רוסית)</Label>
                  <Textarea
                    value={formData.description_ru}
                    onChange={(e) => handleInputChange("description_ru", e.target.value)}
                    rows={3}
                    dir="ltr"
                  />
                </div>
              </TabsContent>
              
              {/* Arabic Tab */}
              <TabsContent value="ar" className="space-y-4">
                <div className="space-y-2">
                  <Label>שם המנה (ערבית)</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => handleInputChange("name_ar", e.target.value)}
                    dir="rtl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>תיאור המנה (ערבית)</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={(e) => handleInputChange("description_ar", e.target.value)}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label>תמונת המנה</Label>
              <ImageUploader 
                value={formData.image_url} 
                onChange={(url) => handleInputChange("image_url", url)}
                isForm={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>מחיר</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              <div>
                <Label>סדר תצוגה</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange("display_order", Number(e.target.value))}
                  className="text-right"
                />
              </div>
            </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">קבוצות תוספות</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addonGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={`addon-${group.id}`}
                    checked={(formData.addon_groups || []).includes(group.id)}
                    onCheckedChange={() => handleAddonGroupToggle(group.id)}
                  />
                  <Label htmlFor={`addon-${group.id}`} className="cursor-pointer">
                    {group.name_he}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          </div>

          <div className="flex justify-start gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
            )}
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700"
              disabled={isTranslating}
            >
              {isTranslating ? 'מתרגם...' : 
                <>
                  <Save className="w-4 h-4 ml-2" />
                  שמור
                </>
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
