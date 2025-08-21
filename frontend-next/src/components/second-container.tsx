"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

function ContainerTwo() {
  const [faceShape, setFaceShape] = useState("");

  return (
    <section id="second" className="bg-gray-200 py-8 px-2 sm:px-4">
      <div className="w-full mx-auto sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center bg-[rgba(237,237,237,1)] rounded-lg w-full h-full shadow-md p-4">
          <CardHeader className="flex flex-col items-center w-full">
            <CardTitle className="w-full text-2xl sm:text-3xl font-bold text-[rgba(255,0,0,1)] text-center">
              Өөрийн царайнд тохирсон шилээ олоорой
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 flex flex-col sm:flex-row gap-4 w-full">
            <input 
              type="number"
              placeholder="PD(Нүдний зай) см"
              className="w-full sm:w-[30%] cursor-pointer flex-1 h-12 border-2 p-3 rounded-2xl bg-white border-[rgba(94,172,221,1)] text-gray-500 hover:bg-blue-50 hover:text-black text-base font-medium px-5"
            />
            <select
              value={faceShape}
              onChange={(e) => setFaceShape(e.target.value)}
              className="w-full sm:w-auto flex-1 h-12 text-black0 border-2 p-3 rounded-2xl text-gray-500 bg-white border-[rgba(94,172,221,1)] hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium px-4"
            >
              <option value="" disabled selected>Ерөнхий хэлбэр</option>
              <option value="derveljakin"
              className="text-black">Дөрвөлжин</option>
              <option value="dugui"
              className="text-black">Дугуй</option>
              <option value="narny"
              className="text-black">Нарны</option>
              <option value="haraany"
              className="text-black">Харааны</option>
              <option value="huuhain"
              className="text-black">Хүүхдийн</option>
            </select>
            <Button 
              variant="outline"
              className="w-full sm:w-auto cursor-pointer flex-1 h-12 border-2 rounded-2xl border-[rgba(94,172,221,1)]  hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium"
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