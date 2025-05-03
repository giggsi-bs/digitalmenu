
import React, { useState, useEffect } from "react";
import { MenuSchedule } from "@/api/entities";
import { MenuItem } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import MenuScheduleForm from "../components/admin/MenuScheduleForm";
import { useLocation, useNavigate } from "react-router-dom";
import AdminProtection from "../components/admin/AdminProtection";

export default function MenuSchedules() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const scheduleId = urlParams.get('id');

  const [menuItems, setMenuItems] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadData();
  }, [scheduleId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load menu items
      const itemsData = await MenuItem.list('display_order');
      setMenuItems(itemsData);
      
      // If we have a schedule ID, load that specific schedule
      if (scheduleId) {
        const schedule = await MenuSchedule.get(scheduleId);
        setEditingSchedule(schedule);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSave = async (data) => {
    try {
      if (editingSchedule) {
        await MenuSchedule.update(editingSchedule.id, data);
      } else {
        await MenuSchedule.create(data);
      }
      navigate("/Admin?tab=schedules");
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק תפריט זה?")) {
      try {
        await MenuSchedule.delete(id);
        navigate("/Admin?tab=schedules");
      } catch (error) {
        console.error("Error deleting schedule:", error);
      }
    }
  };

  return (
    <AdminProtection onAuthenticated={setIsAuthenticated}>
      <div className="max-w-4xl mx-auto p-4 pb-20" dir="rtl">
        <header className="bg-red-600 text-white p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {editingSchedule ? `עריכת תפריט: ${editingSchedule.name_he}` : "תפריט חדש"}
            </h1>
            <Button 
              variant="outline" 
              onClick={() => navigate("/Admin?tab=schedules")}
              className="border-white bg-white text-red-600 hover:bg-red-50"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה לרשימת התפריטים
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-8">טוען...</div>
        ) : (
          <MenuScheduleForm
            initialData={editingSchedule}
            menuItems={menuItems}
            onSave={handleSave}
            onCancel={() => navigate("/Admin?tab=schedules")}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AdminProtection>
  );
}
