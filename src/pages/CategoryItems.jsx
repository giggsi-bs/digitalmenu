
import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { MenuItem } from "@/api/entities";
import { AddonGroup } from "@/api/entities";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, PlusCircle, ArrowUp, ArrowDown, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { createPageUrl } from "@/utils";
import MenuItemForm from "../components/admin/MenuItemForm";
import AdminProtection from "../components/admin/AdminProtection";

export default function CategoryItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const categoryId = urlParams.get('id');
  
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [addonGroups, setAddonGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      navigate(createPageUrl("Admin"));
      return;
    }
    
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryData, menuItems, allCategories, allGroups] = await Promise.all([
        Category.get(categoryId),
        MenuItem.filter({ category_id: categoryId }, 'display_order'),
        Category.list('display_order'),
        AddonGroup.list()
      ]);
      
      setCategory(categoryData);
      setItems(menuItems);
      setCategories(allCategories);
      setAddonGroups(allGroups);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (itemId, isActive) => {
    try {
      await MenuItem.update(itemId, { is_active: isActive });
      loadData();
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  const handleSaveMenuItem = async (data) => {
    try {
      // Ensure the item is associated with the current category
      const itemData = {
        ...data,
        category_id: categoryId
      };
      
      if (editingItem) {
        await MenuItem.update(editingItem.id, itemData);
      } else {
        await MenuItem.create(itemData);
      }
      setShowForm(false);
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

  const goToAdmin = () => {
    navigate("/Admin");
  };

  const handleEditItem = (item) => {
    if (!item) return;
    setEditingItem(item);
    setShowForm(true);
  };

  // Simple reorder implementation
  const handleMoveUp = async (item, index) => {
    if (index === 0) return;
    
    try {
      const prevItem = items[index - 1];
      // Swap display orders
      await MenuItem.update(item.id, { display_order: index - 1 });
      await MenuItem.update(prevItem.id, { display_order: index });
      
      // Reload data
      loadData();
    } catch (error) {
      console.error("Error moving item up:", error);
    }
  };

  const handleMoveDown = async (item, index) => {
    if (index === items.length - 1) return;
    
    try {
      const nextItem = items[index + 1];
      // Swap display orders
      await MenuItem.update(item.id, { display_order: index + 1 });
      await MenuItem.update(nextItem.id, { display_order: index });
      
      // Reload data
      loadData();
    } catch (error) {
      console.error("Error moving item down:", error);
    }
  };

  if (loading && !category) {
    return (
      <div className="max-w-4xl mx-auto p-4 pb-20 text-center" dir="rtl">
        טוען...
      </div>
    );
  }

  return (
    <AdminProtection onAuthenticated={setIsAuthenticated}>
      <div className="max-w-4xl mx-auto p-4 pb-20" dir="rtl">
        <header className="bg-red-600 text-white p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">פריטים בקטגוריה: {category?.name_he}</h1>
            <Button 
              variant="outline" 
              onClick={goToAdmin}
              className="text-white border-white hover:bg-red-700"
            >
              חזרה לניהול
            </Button>
          </div>
        </header>

        {showForm ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">
                  {editingItem ? "עריכת פריט" : "הוספת פריט חדש"}
                </h2>
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
                    setShowForm(false);
                    setEditingItem(null);
                  }}>
                    חזרה לרשימה
                  </Button>
                </div>
              </div>
              
              <MenuItemForm
                initialData={editingItem}
                categories={categories}
                addonGroups={addonGroups}
                onSave={handleSaveMenuItem}
                onCancel={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">פריטים</h2>
              <Button 
                onClick={() => {
                  setShowForm(true);
                  setEditingItem(null);
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <PlusCircle className="w-4 h-4 ml-2" />
                הוסף פריט חדש
              </Button>
            </div>

            <div className="space-y-1">
              {items.length === 0 ? (
                <p className="text-center py-8 text-gray-500">לא נמצאו פריטים בקטגוריה זו</p>
              ) : (
                items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="bg-white p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    dir="rtl"
                  >
                    {/* Reordering buttons */}
                    <div className="flex flex-col space-y-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMoveUp(item, index)}
                        disabled={index === 0}
                        className="h-6 w-6 text-gray-500 hover:text-gray-700"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleMoveDown(item, index)}
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
                        onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                      />
                      <span className="text-xs text-gray-500">הצגת מנה</span>
                    </div>

                    {/* Actions */}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        handleEditItem(item);
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </AdminProtection>
  );
}
