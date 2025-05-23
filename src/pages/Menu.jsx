
import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { MenuItem } from "@/api/entities";
import { AddonGroup } from "@/api/entities";
import { useLocation, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Plus, Globe, ArrowRight } from "lucide-react";
import BypassAuth from "@/components/BypassAuth"; // Import the bypass component
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";
import { createPageUrl } from "@/utils";
import { MenuSchedule } from "@/api/entities";

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
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    loadAllCategories();
    loadMenuSchedules();
  }, []);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      loadData();
    } else if (categories.length > 0) {
      // If no category ID is specified but we have categories, redirect to the first one
      navigate(createPageUrl(`Menu?category=${categories[0].id}`));
    }
  }, [categoryId, categories, navigate]);

  const loadMenuSchedules = async () => {
    try {
      // Try to load actual schedules, but load demo ones if that fails
      const allSchedules = await MenuSchedule.list();
      
      // If we have non-demo schedules, use those
      const nonDemoSchedules = allSchedules.filter(s => !s.is_demo);
      const schedulesToUse = nonDemoSchedules.length > 0 ? nonDemoSchedules : allSchedules.filter(s => s.is_demo);
      
      setSchedules(schedulesToUse);
      
      // Processing logic stays the same
      const overrideSchedule = schedulesToUse.find(s => s.is_active && s.is_override);
      if (overrideSchedule) {
        setActiveSchedule(overrideSchedule);
        return;
      }
      
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const matchingSchedule = schedulesToUse.find(schedule => 
        schedule.is_active &&
        schedule.schedule.some(timeSlot => {
          const dayMatches = timeSlot.days.includes(currentDay);
          if (!dayMatches) return false;
          return currentTime >= timeSlot.start_time && currentTime <= timeSlot.end_time;
        })
      );
      
      if (matchingSchedule) {
        setActiveSchedule(matchingSchedule);
      }
    } catch (error) {
      console.error("Error loading menu schedules:", error);
    }
  };

  const loadAllCategories = async () => {
    try {
      const allCategories = await Category.list('display_order');
      
      // Filter out demo categories if we have real ones
      const nonDemoCategories = allCategories.filter(c => !c.is_demo);
      const categoriesToUse = nonDemoCategories.length > 0 ? nonDemoCategories : allCategories.filter(c => c.is_demo);
      
      setCategories(categoriesToUse);
      
      // If we don't have a category ID but have categories, use the first one
      if (!categoryId && categoriesToUse.length > 0) {
        navigate(createPageUrl(`Menu?category=${categoriesToUse[0].id}`));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadData = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    try {
      // Get category data and menu items
      const categoryData = await Category.get(categoryId).catch(() => null);
      
      // If we couldn't get the category, try to get a demo one
      const useDemoData = !categoryData || categoryData.is_demo;
      
      let menuItems = [];
      try {
        menuItems = await MenuItem.filter({ category_id: categoryId }, 'display_order');
      } catch (error) {
        console.error("Error loading menu items, trying demo data:", error);
      }
      
      // If we need to use demo data or have no items, try to get demo items
      if (useDemoData || menuItems.length === 0) {
        try {
          const demoItems = await MenuItem.filter({ is_demo: true }, 'display_order');
          if (demoItems.length > 0) {
            menuItems = demoItems.filter(item => item.category_id === categoryId);
          }
        } catch (error) {
          console.error("Error loading demo items:", error);
        }
      }

      if (categoryData) {
        setCategory(categoryData);
        
        // Filter the items based on the active schedule
        let filteredItems = [...menuItems];
        
        if (activeSchedule) {
          filteredItems = menuItems.filter(item => 
            item.is_active && (
              !item.menu_schedules || 
              item.menu_schedules.length === 0 || 
              item.menu_schedules.includes(activeSchedule.id)
            )
          );
        } else {
          filteredItems = menuItems.filter(item => item.is_active);
        }
        
        setItems(filteredItems);

        // Load addon groups for items
        const groupIds = [...new Set(filteredItems.flatMap(item => item.addon_groups || []))];
        if (groupIds.length) {
          let groups = [];
          try {
            groups = await Promise.all(
              groupIds.map(id => AddonGroup.get(id).catch(() => null))
            );
          } catch (error) {
            console.error("Error loading addon groups, trying demo groups:", error);
            
            // Try to get demo addon groups
            try {
              const demoGroups = await AddonGroup.filter({ is_demo: true });
              if (demoGroups.length > 0) {
                groups = demoGroups.filter(group => groupIds.includes(group.id));
              }
            } catch (error) {
              console.error("Error loading demo addon groups:", error);
            }
          }
          
          setAddonGroups(groups.filter(Boolean));
        }
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

  // Helper function to get addon group name in current language
  const getAddonGroupName = (groupId) => {
    const group = addonGroups.find(g => g.id === groupId);
    if (!group) return '';
    return group[`name_${currentLang}`] || group.name_he;
  };

  // Helper function to get addon name in current language
  const getAddonName = (addon) => {
    if (!addon) return '';
    return addon[`name_${currentLang}`] || addon.name_he || '';
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
    
    Object.entries(selectedAddons || {}).forEach(([groupId, selections]) => {
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
      const currentSelections = prev?.[groupId] || [];
      
      if (currentSelections.includes(addonIndex)) {
        return {
          ...prev,
          [groupId]: currentSelections.filter(i => i !== addonIndex)
        };
      } else {
        if (group?.max_selections && currentSelections.length >= group.max_selections) {
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
    window.location.href = '/Home';
  };

  const goToAdmin = () => {
    navigate(createPageUrl("Admin"));
  };

  if (loading && !category) {
    return (
      <div className="max-w-md mx-auto pb-20">
        <BypassAuth /> {/* Add the bypass component */}
        <header className="bg-red-600 text-white p-4 flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={goToHome}
            className="text-white hover:bg-red-700"
          >
            חזרה לקטגוריות
          </Button>
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
      <BypassAuth /> {/* Add the bypass component */}
      
      <header className="bg-red-600 text-white p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={goToHome}
          className="text-white hover:bg-red-700"
          title="חזרה לקטגוריות"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-medium" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
            {category ? getName(category) : <Skeleton className="h-6 w-24" />}
          </h1>
          {activeSchedule && (
            <div className="text-xs opacity-80 bg-red-700 px-2 py-0.5 rounded-full mt-1">
              {activeSchedule[`name_${currentLang}`] || activeSchedule.name_he}
            </div>
          )}
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
              className="grid grid-cols-[auto,1fr,auto] gap-4 bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedItem(item)}
              dir="rtl"
            >
              {/* תמונה בצד ימין */}
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={getName(item)}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              
              {/* תוכן באמצע */}
              <div className="flex flex-col min-w-0">
                <h3 className="font-medium text-lg truncate">{getName(item)}</h3>
                {getDescription(item) && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{getDescription(item)}</p>
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
                          className="max-w-full truncate"
                        >
                          {getAddonGroupName(groupId)}
                        </Button>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* מחיר בצד שמאל */}
              <div className="text-lg font-medium whitespace-nowrap">
                ₪{item.price}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog for item details */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md" onClose={() => setSelectedItem(null)}>
          <DialogHeader className="text-right">
            <DialogTitle dir="rtl" className="break-words">
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
              <p className="text-gray-600 break-words">{getDescription(selectedItem)}</p>
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
                      <h4 className="font-medium mb-2 break-words">{getAddonGroupName(groupId)}</h4>
                      <div className="space-y-2">
                        {group.addons.map((addon, idx) => (
                          <div key={idx} className="grid grid-cols-[1fr,auto] gap-2">
                            <span className="break-words text-right">{getAddonName(addon)}</span>
                            <span className="text-gray-600 whitespace-nowrap">
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

      {/* Dialog for addon group details */}
      <Dialog 
        open={!!selectedAddons} 
        onOpenChange={() => setSelectedAddons(null)}
      >
        <DialogContent className="max-w-md" onClose={() => setSelectedAddons(null)}>
          <DialogHeader className="text-right">
            <DialogTitle dir="rtl" className="break-words">
              {selectedAddons && getAddonGroupName(selectedAddons.groupId)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {selectedAddons?.addons.map((addon, index) => (
              <div 
                key={index}
                className="grid grid-cols-[1fr,auto] gap-4 items-center p-2 rounded hover:bg-gray-50"
                dir="rtl"
              >
                <span className="break-words text-right">{getAddonName(addon)}</span>
                <span className="text-gray-600 whitespace-nowrap">
                  {addon.price > 0 ? `₪${addon.price}` : ''}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
