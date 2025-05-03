import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, GripVertical } from "lucide-react";

export default function MenuItemList({ 
  items, 
  categories,
  onEdit,
  onToggleActive
}) {
  return (
    <div className="space-y-1">
      {items.length === 0 ? (
        <p className="text-center py-8 text-gray-500">לא נמצאו פריטים</p>
      ) : (
        items.map((item) => (
          <div 
            key={item.id} 
            className="bg-white p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            dir="rtl"
          >
            {/* Drag Handle */}
            <div className="cursor-move text-gray-400">
              <GripVertical className="w-5 h-5" />
            </div>
            
            {/* Image */}
            <div className="w-16 h-16 flex-shrink-0">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name_he}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-md" />
              )}
            </div>
            
            {/* Item Details */}
            <div className="flex-1">
              <h3 className="font-medium">{item.name_he}</h3>
              <p className="text-sm text-gray-600">{item.description_he?.substring(0, 60)}{item.description_he?.length > 60 ? '...' : ''}</p>
            </div>

            {/* Price */}
            <div className="text-center px-4">
              <div className="text-lg font-medium">₪{item.price}</div>
            </div>
            
            {/* Toggle */}
            <div className="flex flex-col items-center gap-1">
              <Switch
                checked={item.is_active}
                onCheckedChange={(checked) => onToggleActive(item.id, checked)}
              />
              <span className="text-xs text-gray-500">הצגת מנה</span>
            </div>

            {/* Actions */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(item)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
}