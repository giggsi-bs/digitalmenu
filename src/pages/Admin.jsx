
import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { MenuItem } from "@/api/entities";
import { AddonGroup } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CategoryForm from "../components/admin/CategoryForm";
import AddonGroupForm from "../components/admin/AddonGroupForm";
import MenuItemForm from "../components/admin/MenuItemForm";
import CategoryList from "../components/admin/CategoryList";
import MenuItemList from "../components/admin/MenuItemList";
import AddonGroupList from "../components/admin/AddonGroupList";

export default function Admin() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [addonGroups, setAddonGroups] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(null); // 'category', 'item', 'addon'
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("categories");
  const navigate = useNavigate();
  
  // Add navigation handlers
  const goToHome = () => {
    navigate("/Home"); // שימוש בניווט ישיר
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, itemsData, groupsData] = await Promise.all([
        Category.list('display_order'),
        MenuItem.list('display_order'),
        AddonGroup.list()
      ]);
      setCategories(categoriesData);
      setMenuItems(itemsData);
      setAddonGroups(groupsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
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

  const handleCategoryReorder = async (id, direction) => {
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

  const handleMenuItemReorder = async (id, direction) => {
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

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20" dir="rtl">
      <header className="bg-red-600 text-white p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">ניהול תפריט</h1>
          <Button 
            variant="outline" 
            onClick={goToHome}
            className="text-white border-white hover:bg-red-700"
          >
            חזרה לאתר
          </Button>
        </div>
      </header>

      <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-end">
          <TabsTrigger value="categories" className="px-6">קטגוריות</TabsTrigger>
          <TabsTrigger value="items" className="px-6">פריטים</TabsTrigger>
          <TabsTrigger value="addons" className="px-6">תוספות</TabsTrigger>
        </TabsList>

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
                <h2 className="text-xl font-semibold">פריטים</h2>
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
              <MenuItemList
                items={menuItems}
                categories={categories}
                onEdit={(item) => {
                  handleEditMenuItem(item);
                }}
                onToggleActive={handleToggleActive}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="addons">
          {showForm === 'addon' ? (
            <>
              <h2 className="text-xl font-semibold mb-4 flex justify-between items-center">
                <span>{editingItem ? "עריכת קבוצת תוספות" : "הוספת קבוצת תוספות חדשה"}</span>
                <div className="flex gap-2">
                  {editingItem && (
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteAddonGroup(editingItem.id)}
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
              <AddonGroupForm
                initialData={editingItem}
                onSave={handleSaveAddonGroup}
                onCancel={() => {
                  setShowForm(null);
                  setEditingItem(null);
                }}
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
      </Tabs>
    </div>
  );
}
