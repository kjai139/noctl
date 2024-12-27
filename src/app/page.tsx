import MainInputForm from "@/components/forms/mainInputForm";
import TopNav from "@/components/nav/topNav";
import TopNavInfo from "@/components/nav/topNavInfo";
import ResultRender from "@/components/text/resultRender";
import { BgExpandBtn, SidebarExpandBtn } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar/appSidebar";
import stripeInstance from "@/lib/stripe";
import { auth } from "../../auth";
import { Suspense } from "react";
import Loading from "./loading.";

async function getProductList () {
  try {
      const products = await stripeInstance.products.list({
          expand:['data.default_price']
      })

      if (products) {
          return products
      } else {
          return null
      }
  } catch (err) {
      console.error('Error getting products', err)
      return null
  }
}

async function Home() {
  const products = await getProductList()
      console.log('Products from stripe:', products)
      let plainProducts
      if (products && products.data) {
          plainProducts = products.data.map((node) => {
              return {
                  id:node.id,
                  defaultPrice: node.default_price,
                  images: node.images,
                  name:node.name,
                  description: node.description
              }
  
          })
      }
      console.log('plainproducts', plainProducts)
      const session = await auth()
  return (
    <>
    <AppSidebar></AppSidebar>
    <div className="flex flex-col w-full h-auto flex-1">
      <TopNav products={plainProducts} session={session}></TopNav>
      <TopNavInfo></TopNavInfo>
      <main className="flex main-p flex-col items-center w-full">
        <div className="flex flex-col gap-8 px-4 w-full mw">
          <MainInputForm></MainInputForm>
          <ResultRender></ResultRender>
        </div>
      </main>
      <div>
        <SidebarExpandBtn className="rounded-full h-auto w-auto p-4"></SidebarExpandBtn>
      </div>
    </div>
    </>
  );
}


export default function Page() {
  return (
    <>
      <Suspense fallback={<Loading></Loading>}>
        <Home>

        </Home>
      </Suspense>
    </>
  )
}
