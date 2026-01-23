import { signIn } from "@/lib/auth"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h1 className="text-4xl mb-4">Accèder a votre Dashboard</h1>
      <form
        action={async (formData: FormData) => {
          "use server"
          const email = formData.get("email") as string
          await signIn("resend", { email, redirectTo: "/dashboard" })
        }}
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
