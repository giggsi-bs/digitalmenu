import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, ArrowUp, ArrowDown, Trash } from "lucide-react";

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export default function MenuScheduleList({ 
  schedules, 
  menuItems, 
  onEdit, 
  onDelete, 
  onToggleOverride, 
  onReorder 
}) {
  // Handlers for moving schedules up/down
  const handleMoveUp = (id, index) => {
    if (index > 0) {
      onReorder(id, index, index - 1);
    }
  };

  const handleMoveDown = (id, index) => {
    if (index < schedules.length - 1) {
      onReorder(id, index, index + 1);
    }
  };

  const getScheduleTimeDisplay = (schedule) => {
    return schedule.schedule.map((timeSlot, index) => (
      <div key={index} className="mb-2">
        <span className="font-medium">ימים: </span>
        {timeSlot.days.map(day => DAYS[day]).join(', ')}
        <br />
        <span className="font-medium">שעות: </span>
        {timeSlot.start_time} - {timeSlot.end_time}
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      {schedules.length === 0 ? (
        <p className="text-center py-8 text-gray-500">לא נמצאו תפריטים</p>
      ) : (
        <>
          {schedules.map((schedule, index) => (
            <Card key={schedule.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4" dir="rtl">
                  {/* Reordering buttons */}
                  <div className="flex flex-col space-y-1 mt-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveUp(schedule.id, index)}
                      disabled={index === 0}
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveDown(schedule.id, index)}
                      disabled={index === schedules.length - 1}
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-lg">{schedule.name_he}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <Switch
                            checked={schedule.is_override}
                            onCheckedChange={() => onToggleOverride(schedule)}
                          />
                          <span className="text-xs text-gray-500 mt-1">הפעלה ידנית</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onEdit(schedule)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => onDelete(schedule.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {getScheduleTimeDisplay(schedule)}
                    
                    <div className="mt-4">
                      <span className="font-medium">מנות בתפריט: </span>
                      <span className="text-gray-600">
                        {schedule.menu_items?.length || 0} מנות
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}