import MainInputForm from "@/components/forms/mainInputForm";
import TopNav from "@/components/nav/topNav";
import TopNavInfo from "@/components/nav/topNavInfo";
import ResultRender from "@/components/text/resultRender";
import { BgExpandBtn } from "@/components/ui/sidebar";


export default function Home() {
  return (
    <div className="flex flex-col w-full h-auto flex-1 order-1 md:order-2">
    <TopNav></TopNav>
    <TopNavInfo></TopNavInfo>
    <main className="flex main-p flex-col items-center w-full">
      <div className="flex flex-col gap-8 px-4 w-full mw">
        <MainInputForm></MainInputForm>
        <ResultRender></ResultRender>
      </div>
    </main>
    <div className="flex justify-end p-2 bottom-0 right-0">
      <BgExpandBtn className="expand-btn"></BgExpandBtn>
    </div>
    </div>
  );
}
