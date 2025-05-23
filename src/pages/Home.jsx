
import React, { useState, useEffect } from "react";
import { Category } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Globe } from "lucide-react";
import BypassAuth from "@/components/BypassAuth"; // Import the bypass component
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState('he');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Try to load categories, with error handling
      const items = await Category.list('display_order').catch(() => []);
      if (items.length === 0) {
        // If no items, set empty array and stop loading
        setCategories([]);
        setLoading(false);
        return;
      }
      
      // Use demo items if that's all we have
      const nonDemoItems = items.filter(item => !item.is_demo);
      setCategories(nonDemoItems.length > 0 ? nonDemoItems : items);
    } catch (error) {
      console.error("Error loading categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const getName = (category) => {
    return category[`name_${currentLang}`] || category.name_he;
  };

  const getDescription = (category) => {
    return category[`description_${currentLang}`] || category.description_he;
  };

  const languageNames = {
    he: "עברית",
    en: "English",
    ru: "Русский",
    ar: "العربية"
  };

  return (
    <div className="max-w-md mx-auto pb-20">
      <BypassAuth /> {/* Add the bypass component */}
      
      <header className="bg-red-600 text-white p-4 flex justify-between items-center">
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold">גיגסי ספורט בר</h1>
          <div className="text-sm opacity-75">Giggsi Sport's Bar</div>
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

      <div className="grid grid-cols-2 gap-4 p-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">
            לא נמצאו קטגוריות. אנא נסה לרענן את הדף או צור קשר עם מנהל המערכת.
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              to={createPageUrl(`Menu?category=${category.id}`)}
              className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={category.image_url}
                alt={getName(category)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3">
                <h3 className="text-white font-medium text-center" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
                  {getName(category)}
                </h3>
                {getDescription(category) && (
                  <p className="text-white/80 text-sm mt-1 text-center" dir={currentLang === 'ar' ? 'rtl' : 'ltr'}>
                    {getDescription(category)}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
