
import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { MenuItem } from "@/api/entities";
import { AddonGroup } from "@/api/entities";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Plus, Globe, ArrowRight } from "lucide-react"; // כפתור חזרה עם חץ
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from "@/utils";

export default function Menu() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const categoryId = urlParams.get('category');
  
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState('he');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState(null);
  const [addonGroups, setAddonGroups] = useState([]);

  useEffect(() => {
    loadAllCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      loadData();
    } else if (categories.length > 0) {
      // If no category ID is specified but we have categories, redirect to the first one
      navigate(createPageUrl(`Menu?category=${categories[0].id}`));
    }
  }, [categoryId, categories, navigate]);

  const loadAllCategories = async () => {
    try {
      const allCategories = await Category.list('display_order');
      setCategories(allCategories);
      
      // If we don't have a category ID but have categories, use the first one
      if (!categoryId && allCategories.length > 0) {
        navigate(createPageUrl(`Menu?category=${allCategories[0].id}`));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadData = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      const [categoryData, menuItems] = await Promise.all([
        Category.get(categoryId),
        MenuItem.filter({ category_id: categoryId }, 'display_order')
      ]);
      setCategory(categoryData);
      setItems(menuItems);

      // Load all addon groups for this category's items
      const groupIds = [...new Set(menuItems.flatMap(item => item.addon_groups || []))];
      if (groupIds.length) {
        const groups = await Promise.all(groupIds.map(id => AddonGroup.get(id)));
        setAddonGroups(groups);
      }
    } catch (error) {
      console.error("Error loading menu data:", error);
    }
    setLoading(false);
  };

  const getName = (item) => {
    if (!item) return '';
    return item[`name_${currentLang}`] || item.name_he || '';
  };

  const getDescription = (item) => {
    if (!item) return '';
    return item[`description_${currentLang}`] || item.description_he || '';
  };

  const switchCategory = (newCategoryId) => {
    navigate(createPageUrl(`Menu?category=${newCategoryId}`));
  };

  const getItemAddons = (item) => {
    if (!item?.addon_groups) return [];
    return addonGroups.filter(group => item.addon_groups.includes(group.id));
  };

  const calculateTotalPrice = () => {
    if (!selectedItem) return 0;
    let total = selectedItem.price;
    
    Object.entries(selectedAddons).forEach(([groupId, selections]) => {
      const group = addonGroups.find(g => g.id === groupId);
      if (group) {
        selections.forEach(addonIndex => {
          total += group.addons[addonIndex].price;
        });
      }
    });
    
    return total;
  };

  const toggleAddon = (groupId, addonIndex) => {
    setSelectedAddons(prev => {
      const group = addonGroups.find(g => g.id === groupId);
      const currentSelections = prev[groupId] || [];
      
      if (currentSelections.includes(addonIndex)) {
        return {
          ...prev,
          [groupId]: currentSelections.filter(i => i !== addonIndex)
        };
      } else {
        if (currentSelections.length >= group.max_selections) {
          return {
            ...prev,
            [groupId]: [...currentSelections.slice(1), addonIndex]
          };
        }
        return {
          ...prev,
          [groupId]: [...currentSelections, addonIndex]
        };
      }
    });
  };

  const languageNames = {
    he: "עברית",
    en: "English",
    ru: "Русский",
    ar: "العربية"
  };

  // תיקון הניווט לדף הבית
  const goToHome = () => {
    window.location.href = '/Home';  // ניווט ישיר לדף הבית
  };

  const goToAdmin = () => {
    navigate(createPageUrl("Admin"));
  };

  if (loading && !category) {
    return (
      <div className="max-w-md mx-auto pb-20">
        <header className="bg-red-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={goToHome}
              className="text-white hover:bg-red-700"
            >
              חזרה לקטגוריות
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-red-700">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(languageNames).map(([lang, name]) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={currentLang === lang ? "bg-red-100 text-red-600 font-medium" : ""}
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <div className="p-4">
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-24 w-full mb-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pb-20">
      <header className="bg-red-600 text-white p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={goToHome}
          className="text-white hover:bg-red-700"
          title="חזרה לקטגוריות"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-medium" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
          {category ? getName(category) : <Skeleton className="h-6 w-24" />}
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-red-700">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(languageNames).map(([lang, name]) => (
              <DropdownMenuItem
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={currentLang === lang ? "bg-red-100 text-red-600 font-medium" : ""}
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                {name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="p-4 space-y-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            לא נמצאו פריטים בקטגוריה זו
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItem(item)}
              dir="rtl"
            >
              {/* תמונה בצד ימין */}
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={getName(item)}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              {/* תוכן באמצע */}
              <div className="flex-1 text-right">
                <h3 className="font-medium text-lg">{getName(item)}</h3>
                {getDescription(item) && (
                  <p className="text-gray-600 text-sm mt-1">{getDescription(item)}</p>
                )}
                {item.addon_groups?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.addon_groups.map((groupId) => {
                      const group = addonGroups.find(g => g.id === groupId);
                      return group ? (
                        <Button
                          key={groupId}
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAddons({ groupId, addons: group.addons });
                          }}
                        >
                          {group.name_he}
                        </Button>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* מחיר בצד שמאל - בשחור במקום אדום */}
              <div className="text-lg font-medium">
                ₪{item.price}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog for item details - fix X position */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle dir="rtl">
              {selectedItem && getName(selectedItem)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem?.image_url && (
            <img 
              src={selectedItem.image_url} 
              alt={selectedItem && getName(selectedItem)}
              className="w-full h-48 object-cover rounded-lg"
            />
          )}

          <div className="space-y-4 text-right" dir="rtl">
            {getDescription(selectedItem) && (
              <p className="text-gray-600">{getDescription(selectedItem)}</p>
            )}
            <p className="text-lg font-medium">₪{selectedItem?.price}</p>
            
            {/* הצגת קבוצות תוספות בפופאפ של המנה */}
            {selectedItem?.addon_groups?.length > 0 && (
              <div className="space-y-4 mt-4">
                {selectedItem.addon_groups.map((groupId) => {
                  const group = addonGroups.find(g => g.id === groupId);
                  if (!group) return null;
                  
                  return (
                    <div key={groupId} className="border rounded-md p-3">
                      <h4 className="font-medium mb-2">{group.name_he}</h4>
                      <div className="space-y-2">
                        {group.addons.map((addon, idx) => (
                          <div key={idx} className="flex justify-between">
                            {/* החלפת המחיר לשמאל והשם לימין */}
                            <span>{addon.name_he}</span>
                            <span className="text-gray-600">
                              {addon.price > 0 ? `₪${addon.price}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog for addon group details - fix layout */}
      <Dialog 
        open={!!selectedAddons} 
        onOpenChange={() => setSelectedAddons(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="text-right">
            <DialogTitle dir="rtl">
              {addonGroups.find(g => g.id === selectedAddons?.groupId)?.name_he}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {selectedAddons?.addons.map((addon, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
                dir="rtl"
              >
                <span>{addon.name_he}</span>
                {addon.price > 0 && (
                  <span className="text-gray-600">₪{addon.price}</span>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
