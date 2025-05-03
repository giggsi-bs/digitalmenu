
import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { MenuItem } from "@/api/entities";
import { AddonGroup } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User } from "@/api/entities";

import CategoryForm from "../components/admin/CategoryForm";
import AddonGroupForm from "../components/admin/AddonGroupForm";
import MenuItemForm from "../components/admin/MenuItemForm";
import CategoryList from "../components/admin/CategoryList";
import MenuItemList from "../components/admin/MenuItemList";
import AddonGroupList from "../components/admin/AddonGroupList";
import MenuScheduleList from "../components/admin/MenuScheduleList";
import { MenuSchedule } from "@/api/entities";

export default function Admin() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [addonGroups, setAddonGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(null); // 'category', 'item', 'addon'
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Check if user has a valid session
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'giggsiAdmin2024') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "giggsi2024") {
      localStorage.setItem('adminAuth', 'giggsiAdmin2024');
      setIsAuthenticated(true);
      loadData();
    } else {
      setError("סיסמה שגויה");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  const loadData = async () => {
    try {
      const [categoriesData, itemsData, groupsData, schedulesData] = await Promise.all([
        Category.list('display_order'),
        MenuItem.list('display_order'),
        AddonGroup.list(),
        MenuSchedule.list()
      ]);
      setCategories(categoriesData);
      setMenuItems(itemsData);
      setAddonGroups(groupsData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Add handler for active schedule
  const handleToggleOverride = async (schedule) => {
    try {
      // First disable all other overrides
      if (!schedule.is_override) {
        await Promise.all(schedules
          .filter(s => s.id !== schedule.id && s.is_override)
          .map(s => MenuSchedule.update(s.id, { is_override: false }))
        );
      }

      // Then toggle this schedule
      await MenuSchedule.update(schedule.id, {
        ...schedule,
        is_override: !schedule.is_override
      });
      
      // Reload data
      loadData();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleEditSchedule = (schedule) => {
    navigate(createPageUrl(`MenuSchedules?id=${schedule.id}`));
  };

  // Category handlers
  const handleSaveCategory = async (data) => {
    try {
      if (editingItem) {
        await Category.update(editingItem.id, data);
      } else {
        await Category.create(data);
      }
      setShowForm(null);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק קטגוריה זו? כל הפריטים בקטגוריה זו יימחקו.")) {
      try {
        // Delete all items in category
        const itemsToDelete = menuItems.filter(item => item.category_id === id);
        await Promise.all(itemsToDelete.map(item => MenuItem.delete(item.id)));
        
        // Delete the category
        await Category.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  // Add reorder handlers
  const handleCategoryReorder = async (categoryId, oldIndex, newIndex) => {
    try {
      // Implement basic reordering without drag-and-drop
      const updatedCategories = [...categories];
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      // Update display order based on new index
      await Category.update(categoryId, { display_order: newIndex });
      
      // Refresh categories after reordering
      loadData();
    } catch (error) {
      console.error("Error reordering categories:", error);
    }
  };

  const handleMenuItemReorder = async (itemId, oldIndex, newIndex) => {
    try {
      // Basic reordering without drag-and-drop
      const item = menuItems.find(item => item.id === itemId);
      if (!item) return;
      
      // Update the item's display order
      await MenuItem.update(itemId, { display_order: newIndex });
      
      // Refresh items after reordering
      loadData();
    } catch (error) {
      console.error("Error reordering menu items:", error);
    }
  };

  const handleCategoryReorderOld = async (id, direction) => {
    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) return;
    
    const category = categories[categoryIndex];
    const adjacentIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;
    
    if (adjacentIndex < 0 || adjacentIndex >= categories.length) return;
    
    const adjacentCategory = categories[adjacentIndex];
    
    // Swap display orders
    await Promise.all([
      Category.update(category.id, { display_order: adjacentCategory.display_order }),
      Category.update(adjacentCategory.id, { display_order: category.display_order })
    ]);
    
    loadData();
  };

  // Menu item handlers
  const handleSaveMenuItem = async (data) => {
    try {
      if (editingItem) {
        await MenuItem.update(editingItem.id, data);
      } else {
        await MenuItem.create(data);
      }
      setShowForm(null);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק פריט זה?")) {
      try {
        await MenuItem.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting menu item:", error);
      }
    }
  };

  const handleMenuItemReorderOld = async (id, direction) => {
    const itemIndex = menuItems.findIndex(item => item.id === id);
    if (itemIndex === -1) return;
    
    const item = menuItems[itemIndex];
    const categoryItems = menuItems.filter(mi => mi.category_id === item.category_id)
      .sort((a, b) => a.display_order - b.display_order);
    
    const currentIndex = categoryItems.findIndex(ci => ci.id === id);
    const adjacentIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (adjacentIndex < 0 || adjacentIndex >= categoryItems.length) return;
    
    const adjacentItem = categoryItems[adjacentIndex];
    
    // Swap display orders
    await Promise.all([
      MenuItem.update(item.id, { display_order: adjacentItem.display_order }),
      MenuItem.update(adjacentItem.id, { display_order: item.display_order })
    ]);
    
    loadData();
  };

  const handleToggleActive = async (itemId, isActive) => {
    try {
      await MenuItem.update(itemId, { is_active: isActive });
      loadData();
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  // Addon group handlers
  const handleSaveAddonGroup = async (data) => {
    try {
      if (editingItem) {
        await AddonGroup.update(editingItem.id, data);
      } else {
        await AddonGroup.create(data);
      }
      setShowForm(null);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving addon group:", error);
    }
  };

  const handleDeleteAddonGroup = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק קבוצת תוספות זו?")) {
      try {
        // First, remove this addon group from any menu items that use it
        const itemsWithAddon = menuItems.filter(item => item.addon_groups?.includes(id));
        await Promise.all(itemsWithAddon.map(item => {
          const updatedGroups = item.addon_groups.filter(groupId => groupId !== id);
          return MenuItem.update(item.id, { addon_groups: updatedGroups });
        }));
        
        // Then delete the addon group itself
        await AddonGroup.delete(id);
        loadData();
      } catch (error) {
        console.error("Error deleting addon group:", error);
      }
    }
  };

  // Add better null checks for operations
  const handleEditCategory = (category) => {
    if (!category) return;
    setEditingItem(category);
    setShowForm('category');
  };

  const handleEditMenuItem = (item) => {
    if (!item) return;
    setEditingItem(item);
    setShowForm('item');
  };

  const handleEditAddonGroup = (group) => {
    if (!group) return;
    setEditingItem(group);
    setShowForm('addon');
  };

  // Add handler for reordering schedules
  const handleScheduleReorder = async (scheduleId, oldIndex, newIndex) => {
    try {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (!schedule) return;
      
      // Update the schedule's display order
      await MenuSchedule.update(scheduleId, { display_order: newIndex });
      
      // Refresh data after reordering
      loadData();
    } catch (error) {
      console.error("Error reordering schedules:", error);
    }
  };

  // Filter items by selected category
  const filteredItems = selectedCategoryFilter === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category_id === selectedCategoryFilter);

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">גיגסי - ממשק ניהול</h1>
            <p className="mt-2 text-sm text-gray-600">הזן סיסמה כדי להיכנס</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="סיסמה"
                className="text-right"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                כניסה
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20" dir="rtl">
      <header className="bg-red-600 text-white p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ניהול תפריט</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/Home")}
              className="border-white bg-white text-red-600 hover:bg-red-50"
            >
              חזרה לאתר
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white text-white hover:bg-red-700"
            >
              התנתק
            </Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full flex justify-end">
          <TabsTrigger value="schedules" className="px-6">זמני תפריט</TabsTrigger>
          <TabsTrigger value="addons" className="px-6">תוספות</TabsTrigger>
          <TabsTrigger value="items" className="px-6">פריטים</TabsTrigger>
          <TabsTrigger value="categories" className="px-6">קטגוריות</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules">
          <div className="flex justify-between items-center mb-6">
            <Button 
              onClick={() => navigate(createPageUrl("MenuSchedules"))}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              הוסף תפריט חדש
            </Button>
            <h2 className="text-xl font-semibold">ניהול זמני תפריט</h2>
          </div>
          
          {schedules.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center">
              <p className="mb-4">
                אין תפריטים מוגדרים במערכת
              </p>
              <p className="text-gray-600">
                הוסף תפריטים כדי להגדיר אילו מנות מוצגות בשעות שונות של היום
              </p>
            </div>
          ) : (
            <MenuScheduleList 
              schedules={schedules}
              menuItems={menuItems}
              onEdit={handleEditSchedule}
              onToggleOverride={handleToggleOverride}
              onReorder={handleScheduleReorder}
              onDelete={async (id) => {
                if (window.confirm("האם אתה בטוח שברצונך למחוק תפריט זה?")) {
                  try {
                    await MenuSchedule.delete(id);
                    loadData();
                  } catch (error) {
                    console.error("Error deleting schedule:", error);
                  }
                }
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="addons">
          {showForm === 'addon' ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-right">
                  {editingItem ? "עריכת קבוצת תוספות" : "הוספת קבוצת תוספות חדשה"}
                </h2>
              </div>
              <AddonGroupForm
                initialData={editingItem}
                onSave={handleSaveAddonGroup}
                onCancel={() => {
                  setShowForm(null);
                  setEditingItem(null);
                }}
                onDelete={handleDeleteAddonGroup}
              />
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">קבוצות תוספות</h2>
                <Button 
                  onClick={() => {
                    setShowForm('addon');
                    setEditingItem(null);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <PlusCircle className="w-4 h-4 ml-2" />
                  הוסף קבוצת תוספות
                </Button>
              </div>
              <AddonGroupList
                addonGroups={addonGroups}
                onEdit={(group) => {
                  handleEditAddonGroup(group);
                }}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {showForm === 'category' ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">
                  {editingItem ? "עריכת קטגוריה" : "הוספת קטגוריה חדשה"}
                </h2>
                <div className="flex gap-2">
                  {editingItem && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteCategory(editingItem.id)}
                    >
                      מחיקה
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => {
                    setShowForm(null);
                    setEditingItem(null);
                  }}>
                    חזרה לרשימה
                  </Button>
                </div>
              </div>
              <CategoryForm
                initialData={editingItem}
                onSave={handleSaveCategory}
                onCancel={() => {
                  setShowForm(null);
                  setEditingItem(null);
                }}
                onDelete={handleDeleteCategory}
              />
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">קטגוריות</h2>
                <Button 
                  onClick={() => {
                    setShowForm('category');
                    setEditingItem(null);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <PlusCircle className="w-4 h-4 ml-2" />
                  הוסף קטגוריה חדשה
                </Button>
              </div>
              <CategoryList
                categories={categories}
                onEdit={(category) => {
                  handleEditCategory(category);
                }}
                onReorder={handleCategoryReorder}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="items">
          {showForm === 'item' ? (
            <>
              <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                <span>{editingItem ? "עריכת פריט" : "הוספת פריט חדש"}</span>
                <div className="flex gap-2">
                  {editingItem && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteMenuItem(editingItem.id)}
                    >
                      מחיקה
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => {
                    setShowForm(null);
                    setEditingItem(null);
                  }}>
                    חזרה לרשימה
                  </Button>
                </div>
              </h2>
              <MenuItemForm
                initialData={editingItem}
                categories={categories}
                addonGroups={addonGroups}
                onSave={handleSaveMenuItem}
                onCancel={() => {
                  setShowForm(null);
                  setEditingItem(null);
                }}
              />
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <Select
                    value={selectedCategoryFilter}
                    onValueChange={setSelectedCategoryFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="כל הקטגוריות" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל הקטגוריות</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_he}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-gray-500">מציג {filteredItems.length} פריטים</span>
                </div>
                <div className="flex items-center">
                  <Button 
                    onClick={() => {
                      setShowForm('item');
                      setEditingItem(null);
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <PlusCircle className="w-4 h-4 ml-2" />
                    הוסף פריט חדש
                  </Button>
                </div>
              </div>
              <MenuItemList
                items={filteredItems}
                categories={categories}
                onEdit={(item) => {
                  handleEditMenuItem(item);
                }}
                onToggleActive={handleToggleActive}
                onReorder={handleMenuItemReorder}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
