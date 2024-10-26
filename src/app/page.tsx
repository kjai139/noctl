import MainInputForm from "@/components/forms/mainInputForm";
import TopNav from "@/components/nav/topNav";
import TopNavInfo from "@/components/nav/topNavInfo";
import ResultRender from "@/components/text/resultRender";


export default function Home() {
  return (
    <div className="flex flex-col w-full h-auto flex-1">
    <TopNav></TopNav>
    <TopNavInfo></TopNavInfo>
    <main className="flex main-p flex-col items-center w-full">
      <div className="flex flex-col gap-8 px-4 w-full mw">
        <MainInputForm></MainInputForm>
        <ResultRender></ResultRender>
      </div>
    </main>
    </div>
  );
}
