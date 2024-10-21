import MainInputForm from "@/components/forms/mainInputForm";
import TopNav from "@/components/nav/topNav";
import TopNavInfo from "@/components/nav/topNavInfo";
import ResultRender from "@/components/text/resultRender";


export default function Home() {
  return (
    <>
    <TopNav></TopNav>
    <TopNavInfo></TopNavInfo>
    <main className="flex main-p flex-col items-center w-full">
      <div className="flex flex-col gap-8 pt-12 px-4 w-full mw">
        {/* <h1 className="md:text-4xl text-center">What would you like to translate?</h1> */}
        <MainInputForm></MainInputForm>
        <ResultRender></ResultRender>
      </div>
    </main>
    </>
  );
}
