import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InvokeLLM } from "@/api/integrations";
import { Save, Languages, Trash } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuSchedule } from "@/api/entities";
import ImageUploader from './ImageUploader';

export default function CategoryForm({ initialData = null, onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({
    name_he: "",
    name_en: "",
    name_ru: "",
    name_ar: "",
    image_url: "",
    display_order: 0,
    menu_schedules: [],
    ...initialData
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState('he');
  const [menuSchedules, setMenuSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // שמירת הערכים המקוריים בעברית
  const [originalHebrew, setOriginalHebrew] = useState({
    name_he: initialData?.name_he || ""
  });

  useEffect(() => {
    loadMenuSchedules();
    if (initialData) {
      setOriginalHebrew({
        name_he: initialData.name_he || ""
      });
    }
  }, [initialData]);

  const loadMenuSchedules = async () => {
    try {
      const schedules = await MenuSchedule.list();
      setMenuSchedules(schedules);
    } catch (error) {
      console.error("Error loading menu schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const translateContent = async () => {
    if (!formData.name_he) return;
    
    setIsTranslating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Translate the following category name to English, Russian, and Arabic:
                Name: ${formData.name_he}`,
        response_json_schema: {
          type: "object",
          properties: {
            english: { type: "string" },
            russian: { type: "string" },
            arabic: { type: "string" }
          }
        }
      });

      if (response) {
        return {
          name_en: response.english || formData.name_en || "",
          name_ru: response.russian || formData.name_ru || "",
          name_ar: response.arabic || formData.name_ar || ""
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
    
    // בדיקה האם העברית השתנתה
    const hebrewChanged = formData.name_he !== originalHebrew.name_he;
    
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
      name_he: formData.name_he
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
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
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

              <TabsContent value="he">
                <div className="space-y-2">
                  <Label>שם הקטגוריה</Label>
                  <Input
                    value={formData.name_he}
                    onChange={(e) => handleInputChange("name_he", e.target.value)}
                    className="text-right"
                  />
                </div>
              </TabsContent>

              <TabsContent value="en">
                <div className="space-y-2">
                  <Label>שם הקטגוריה (אנגלית)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => handleInputChange("name_en", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ru">
                <div className="space-y-2">
                  <Label>שם הקטגוריה (רוסית)</Label>
                  <Input
                    value={formData.name_ru}
                    onChange={(e) => handleInputChange("name_ru", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ar">
                <div className="space-y-2">
                  <Label>שם הקטגוריה (ערבית)</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => handleInputChange("name_ar", e.target.value)}
                    dir="rtl"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div>
              <Label>תמונת הקטגוריה</Label>
              <ImageUploader 
                value={formData.image_url} 
                onChange={(url) => handleInputChange("image_url", url)}
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

            <div className="space-y-2">
              <Label>תפריטים בהם הקטגוריה תוצג</Label>
              <div className="grid grid-cols-2 gap-2">
                {menuSchedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`schedule-${schedule.id}`}
                      checked={formData.menu_schedules?.includes(schedule.id)}
                      onCheckedChange={(checked) => {
                        const newSchedules = checked
                          ? [...(formData.menu_schedules || []), schedule.id]
                          : formData.menu_schedules?.filter(id => id !== schedule.id);
                        handleInputChange('menu_schedules', newSchedules);
                      }}
                    />
                    <Label htmlFor={`schedule-${schedule.id}`}>{schedule.name_he}</Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                אם לא נבחר אף תפריט, הקטגוריה תוצג תמיד (כאשר אין תפריט פעיל)
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) {
                  onDelete(formData.id);
                }
              }}
              className="ml-2"
            >
              מחק
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                ביטול
              </Button>
              <Button 
                type="submit" 
                className="bg-red-600 hover:bg-red-700"
                disabled={isTranslating}
              >
                {isTranslating ? 'מתרגם...' : 'שמור'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}