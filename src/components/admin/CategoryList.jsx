import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CategoryList({ categories, onEdit, onReorder }) {
  const navigate = useNavigate();
  
  // Handlers for moving categories up/down
  const handleMoveUp = (id, index) => {
    if (index > 0) {
      onReorder(id, index, index - 1);
    }
  };

  const handleMoveDown = (id, index) => {
    if (index < categories.length - 1) {
      onReorder(id, index, index + 1);
    }
  };

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <p className="text-center py-8 text-gray-500">לא נמצאו קטגוריות</p>
      ) : (
        <div className="space-y-2">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="overflow-hidden"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4" dir="rtl">
                  {/* Reordering buttons */}
                  <div className="flex flex-col space-y-1 mt-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveUp(category.id, index)}
                      disabled={index === 0}
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleMoveDown(category.id, index)}
                      disabled={index === categories.length - 1}
                      className="h-6 w-6 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div 
                    className="w-24 h-24 flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(createPageUrl(`CategoryItems?id=${category.id}`))}
                  >
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name_he}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        אין תמונה
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="flex-1 cursor-pointer" 
                    onClick={() => navigate(createPageUrl(`CategoryItems?id=${category.id}`))}
                  >
                    <h3 className="font-medium text-lg hover:text-red-600">{category.name_he}</h3>
                    {category.description_he && (
                      <p className="text-gray-600 text-sm">{category.description_he}</p>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEdit(category)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}