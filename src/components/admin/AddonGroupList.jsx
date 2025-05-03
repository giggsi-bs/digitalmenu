
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AddonGroupList({ 
  addonGroups, 
  onEdit
}) {
  return (
    <div className="space-y-4">
      {addonGroups.length === 0 ? (
        <p className="text-center py-8 text-gray-500">לא נמצאו קבוצות תוספות</p>
      ) : (
        addonGroups.map((group) => (
          <Card key={group.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 text-right">
                  <h3 className="font-medium text-lg">{group.name_he}</h3>
                  <Badge variant="outline">
                    {`${group.addons.length} תוספות`}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => onEdit(group)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 mt-4" dir="rtl">
                {group.addons.map((addon, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                  >
                    <span>{addon.name_he}</span>
                    {addon.price > 0 && (
                      <Badge variant="outline">₪{addon.price}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
