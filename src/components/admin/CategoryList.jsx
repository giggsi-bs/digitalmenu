import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, GripVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CategoryList({ 
  categories, 
  onEdit
}) {
  const navigate = useNavigate();
  
  // Navigate to category items page
  const goToCategoryItems = (categoryId) => {
    navigate(createPageUrl(`CategoryItems?id=${categoryId}`));
  };

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <p className="text-center py-8 text-gray-500">לא נמצאו קטגוריות</p>
      ) : (
        categories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-4" dir="rtl">
                {/* Drag Handle */}
                <div className="cursor-move text-gray-400 mt-2">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Image - clickable to go to category items */}
                <div 
                  className="w-24 h-24 flex-shrink-0 cursor-pointer"
                  onClick={() => goToCategoryItems(category.id)}
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
                
                {/* Name - clickable to go to category items */}
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => goToCategoryItems(category.id)}
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
        ))
      )}
    </div>
  );
}