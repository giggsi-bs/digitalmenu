import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InvokeLLM } from "@/api/integrations";
import { Plus, Trash, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = [
  { value: 0, label: 'ראשון' },
  { value: 1, label: 'שני' },
  { value: 2, label: 'שלישי' },
  { value: 3, label: 'רביעי' },
  { value: 4, label: 'חמישי' },
  { value: 5, label: 'שישי' },
  { value: 6, label: 'שבת' }
];

export default function MenuScheduleForm({ initialData = null, menuItems = [], onSave, onCancel, onDelete }) {
  const [formData, setFormData] = useState({
    name_he: "",
    name_en: "",
    name_ru: "",
    name_ar: "",
    schedule: [{ days: [], start_time: "00:00", end_time: "23:59" }],
    menu_items: [],
    is_active: true,
    is_override: false,
    display_order: 0,
    ...initialData
  });
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeTab, setActiveTab] = useState('he');

  // שמירת הערכים המקוריים בעברית
  const [originalHebrew, setOriginalHebrew] = useState({
    name_he: initialData?.name_he || ""
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const addScheduleTime = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { days: [], start_time: "00:00", end_time: "23:59" }]
    }));
  };

  const removeScheduleTime = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleDayToggle = (scheduleIndex, day) => {
    const currentDays = formData.schedule[scheduleIndex].days;
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    handleScheduleChange(scheduleIndex, 'days', newDays);
  };

  const translateContent = async () => {
    if (!formData.name_he) return;
    
    setIsTranslating(true);
    try {
      const response = await InvokeLLM({
        prompt: `Translate the following menu schedule name to English, Russian, and Arabic:
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
    
    if (!formData.name_he) {
      alert('נא למלא שם לתפריט');
      return;
    }

    if (formData.schedule.some(s => s.days.length === 0)) {
      alert('נא לבחור לפחות יום אחד לכל משבצת זמן');
      return;
    }
    
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
    
    onSave(dataToSave);
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }
    acc[item.category_id].push(item);
    return acc;
  }, {});

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="he">עברית</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="ru">Русский</TabsTrigger>
                <TabsTrigger value="ar">العربية</TabsTrigger>
              </TabsList>

              <TabsContent value="he">
                <div className="space-y-2">
                  <Label>שם התפריט</Label>
                  <Input
                    value={formData.name_he}
                    onChange={(e) => handleInputChange("name_he", e.target.value)}
                    className="text-right"
                  />
                </div>
              </TabsContent>

              <TabsContent value="en">
                <div className="space-y-2">
                  <Label>שם התפריט (אנגלית)</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => handleInputChange("name_en", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ru">
                <div className="space-y-2">
                  <Label>שם התפריט (רוסית)</Label>
                  <Input
                    value={formData.name_ru}
                    onChange={(e) => handleInputChange("name_ru", e.target.value)}
                    dir="ltr"
                  />
                </div>
              </TabsContent>

              <TabsContent value="ar">
                <div className="space-y-2">
                  <Label>שם התפריט (ערבית)</Label>
                  <Input
                    value={formData.name_ar}
                    onChange={(e) => handleInputChange("name_ar", e.target.value)}
                    dir="rtl"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Button type="button" onClick={addScheduleTime} variant="outline">
                  <Plus className="w-4 h-4 ml-2" />
                  הוסף זמן
                </Button>
                <h3 className="text-lg font-medium">זמני פעילות</h3>
              </div>

              {formData.schedule.map((timeSlot, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeScheduleTime(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                        <div className="flex gap-4">
                          <div>
                            <Label>שעת סיום</Label>
                            <Input
                              type="time"
                              value={timeSlot.end_time}
                              onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>שעת התחלה</Label>
                            <Input
                              type="time"
                              value={timeSlot.start_time}
                              onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>ימים</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {DAYS.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2 space-x-reverse">
                              <Checkbox
                                id={`day-${index}-${day.value}`}
                                checked={timeSlot.days.includes(day.value)}
                                onCheckedChange={() => handleDayToggle(index, day.value)}
                              />
                              <Label htmlFor={`day-${index}-${day.value}`}>{day.label}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="is_override"
                  checked={formData.is_override}
                  onCheckedChange={(checked) => handleInputChange("is_override", checked)}
                />
                <Label htmlFor="is_override">הפעל תפריט זה תמיד (עקיפת זמנים)</Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
                <Label htmlFor="is_active">תפריט פעיל</Label>
              </div>
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

          <div className="flex justify-between items-center">
            <Button 
              type="button" 
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm('האם אתה בטוח שברצונך למחוק תפריט זה?')) {
                  onDelete(formData.id);
                }
              }}
              className="ml-2"
              disabled={!initialData}
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