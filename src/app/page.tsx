import MainInputForm from "@/components/forms/mainInputForm";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex flex-col gap-8">
        <h1 className="md:text-4xl text-center">NOCTURNE</h1>
        <MainInputForm></MainInputForm>
      </div>
    </main>
  );
}
