import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

function ContainerTwo() {
  return (
    <section className="bg-gray-50 py-8 px-2 sm:px-4">
      <div className="w-full mx-auto sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center bg-[rgba(237,237,237,1)] rounded-lg w-full h-full shadow-md p-4">
          <CardHeader className="flex flex-col items-center w-full">
            <CardTitle className="w-full text-2xl sm:text-3xl font-bold text-[rgba(255,0,0,1)] text-center">
              Өөрийн төрхөнд тохирсон шилээ олоорой
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4 flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              variant="outline"
              className="w-full sm:w-auto flex-1 h-12 border-2 border-[rgba(94,172,221,1)] text-[rgba(117,117,117,1)] hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium"
            >
              PD(Нүдний зай)
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto flex-1 h-12 border-2 border-[rgba(94,172,221,1)] text-[rgba(117,117,117,1)] hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium"
            >
              Нүүрний ерөнхий
            </Button>
            <Button 
              variant="outline"
              className="w-full sm:w-auto flex-1 h-12 border-2 border-[rgba(94,172,221,1)] text-[rgba(117,117,117,1)] hover:bg-blue-50 hover:text-[rgba(94,172,221,1)] text-base font-medium"
            >
              Шил олох
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default ContainerTwo;