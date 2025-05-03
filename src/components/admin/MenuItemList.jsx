
import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, ArrowUp, ArrowDown } from "lucide-react";

export default function MenuItemList({ items, categories, onEdit, onToggleActive, onReorder }) {
  // Handlers for moving items up/down
  const handleMoveUp = (id, index) => {
    if (index > 0) {
      onReorder(id, index, index - 1);
    }
  };

  const handleMoveDown = (id, index) => {
    if (index < items.length - 1) {
      onReorder(id, index, index + 1);
    }
  };
  
  // Helper function to get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name_he : "קטגוריה לא ידועה";
  };
  
  return (
    <div className="space-y-1">
      {items.length === 0 ? (
        <p className="text-center py-8 text-gray-500">לא נמצאו פריטים</p>
      ) : (
        <>
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="bg-white p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors mb-1 border border-gray-100"
              dir="rtl"
            >
              {/* Reordering buttons */}
              <div className="flex flex-col space-y-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleMoveUp(item.id, index)}
                  disabled={index === 0}
                  className="h-6 w-6 text-gray-500 hover:text-gray-700"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleMoveDown(item.id, index)}
                  disabled={index === items.length - 1}
                  className="h-6 w-6 text-gray-500 hover:text-gray-700"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {getCategoryName(item.category_id)}
                  </span>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {item.description_he || ""}
                  </p>
                </div>
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

              {/* Edit Button */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onEdit(item)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
