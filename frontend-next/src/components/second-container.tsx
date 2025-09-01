"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { useUserPreferencesStore } from "@/lib/userPreferencesStore";
import { useCatalogStore } from "@/lib/catalogStore";

type Category = { id: string; name: string };

function ContainerTwo() {
  const { pdCm, setPdCm } = useUserPreferencesStore();
  const { selectedCategoryId, setSelectedCategoryId } = useCatalogStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [pdInput, setPdInput] = useState<string>(pdCm ? String(pdCm) : "");
  const [categoryId, setCategoryId] = useState<string>(selectedCategoryId ?? "");
  const [loadingCategories, setLoadingCategories] = useState<boolean>(false);

  useEffect(() => {
    setLoadingCategories(true);
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setCategories([]))
      .finally(() => setLoadingCategories(false));
  }, []);

  useEffect(() => {
    // Sync external changes
    if (selectedCategoryId && selectedCategoryId !== categoryId) {
      setCategoryId(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  const onSearch = () => {
    const value = parseFloat(pdInput);
    if (!Number.isNaN(value)) {
      // Accept PD in cm range 5.0 - 8.0
      if (value >= 5 && value <= 8) {
        setPdCm(value);
      } else {
        alert("PD утга 5.0 - 8.0 см хооронд байх ёстой");
        return;
      }
    }

    if (categoryId) {
      setSelectedCategoryId(categoryId);
    }

    const el = document.getElementById("products");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const categoryOptions = useMemo(() => {
    return [{ id: "all", name: "Бүгд" }, ...categories];
  }, [categories]);

  return (
    <section id="second" className="bg-gray-200 py-8 px-2 sm:px-4">
      <div className="w-full mx-auto sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center bg-[rgba(237,237,237,1)] rounded-lg w-full h-full shadow-md p-4">
          <CardHeader className="flex flex-col items-center w-full">
            <CardTitle className="w-full text-2xl sm:text-3xl font-bold text-[rgba(255,0,0,1)] text-center">
              Өөрийн PD болон ангиллыг сонгоорой
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 flex flex-col sm:flex-row gap-4 w-full">
            <input
              type="number"
              step="0.1"
              placeholder="PD (см) ж: 6.5"
              value={pdInput}
              onChange={(e) => setPdInput(e.target.value)}
              className="w-full sm:w-[30%] cursor-pointer flex-1 h-12 border-2 p-3 rounded-2xl bg-white border-[rgba(94,172,221,1)] text-gray-700 hover:bg-blue-50 hover:text-black text-base font-medium px-5"
            />

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full sm:w-auto flex-1 h-12 border-2 p-3 rounded-2xl text-gray-700 bg-white border-[rgba(94,172,221,1)] hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium px-4"
            >
              <option value="" disabled>
                {loadingCategories ? "Ангиллуудыг уншиж байна..." : "Ангилал сонгох"}
              </option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id} className="text-black">
                  {c.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={onSearch}
              className="w-full sm:w-auto cursor-pointer flex-1 h-12 border-2 rounded-2xl border-[rgba(94,172,221,1)] hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium"
            >
              Шил хайх
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default ContainerTwo;