import MainInputForm from "@/components/forms/mainInputForm";
import TopNav from "@/components/nav/topNav";
import ResultRender from "@/components/text/resultRender";


export default function Home() {
  return (
    <>
    <TopNav></TopNav>
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col gap-8 mw pt-12 px-4">
        {/* <h1 className="md:text-4xl text-center">What would you like to translate?</h1> */}
        <MainInputForm></MainInputForm>
        <ResultRender></ResultRender>
      </div>
    </main>
    </>
  );
}
