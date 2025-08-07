import ContainerTwo from "@/components/second-container";
import Header from "../components/Header";
import ContainerOne from "../components/first-container";
import ContainerThree from "@/components/third-container";
import ProductGrid from "../components/ProductGrid";
import ContainerFour from "@/components/fourth-container";

export default function Home() {
  return (
    <>
      <Header />
      <ContainerOne />
      <ContainerTwo />
      <ContainerThree/>
      <ProductGrid />
      <ContainerFour/>
    </>
  );
}



