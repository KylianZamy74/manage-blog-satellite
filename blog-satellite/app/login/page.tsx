import { signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {


const params =  await searchParams
const error = params?.error


  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-4xl mb-4">Accèder a votre Dashboard</h1>
    {error === "AccessDenied" && (
            <p className="text-red-500">Email non autorisé</p>
        )}
      <form
        action={async (formData: FormData) => {
          "use server"
          const email = formData.get("email") as string
          try {
            await signIn("resend", { email, redirectTo: "/dashboard" })
          } catch (error) {
             if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
            throw error
          }
          redirect("/login/?error=AccessDenied")
          
        }}}
        className="flex flex-col gap-2"
      >
        <input
          type="email"
          name="email"
          placeholder="Rentrez votre email"
          required
          className="p-4"
        />
        <button type="submit" className="p-4 bg-orange-300 cursor-pointer text-white" >Recevez le lien magique !</button>
        
      </form>
    </div>
  )
}
