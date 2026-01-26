import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getUsers } from "@/actions/users/action"

export default async function Users() {

    const data = await getUsers()

  return (
    <Table>
      <TableCaption>Liste des utilisateurs.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Prénom</TableHead>
          <TableHead>Adresse mail</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell><Button className="bg-red-400 cursor-pointer">Supprimer l&apos;utilisateur</Button></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
