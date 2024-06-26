import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow
} from '@/components/ui/table'
import { Checkbox } from './components/ui/checkbox'
import { Label } from './components/ui/label'
import { Button } from './components/ui/button'
import { StarIcon, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Input } from './components/ui/input'
import type { App } from 'backend/src/index'
import { treaty } from '@elysiajs/eden'

const client = treaty<App>('localhost:3000')

function Delete({
  id,
  onDelete
}: {
  id: number
  onDelete: (id: number) => void
}) {
  return (
    <Button
      onClick={() => onDelete(id)}
      variant="ghost"
      size="icon"
      className="rounded-3xl"
    >
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  )
}

function Star({
  id,
  starred,
  toggleStar
}: {
  id: number
  starred: boolean
  toggleStar: (id: number) => void
}) {
  return (
    <Button
      onClick={() => toggleStar(id)}
      variant="ghost"
      size="icon"
      className="rounded-3xl"
    >
      {starred ? (
        <StarIcon className="h-4 w-4 text-yellow-300" fill="#fde047" />
      ) : (
        <StarIcon className="h-4 w-4 text-yellow-300" />
      )}
    </Button>
  )
}

type Todo = NonNullable<
  Awaited<ReturnType<typeof client.todos.get>>['data']
>[number]
function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    client.todos.get().then((res) => {
      if (res.error) {
        res.error
      }
      if (res.data) {
        setTodos(res.data)
      }
    })
  }, [])

  const handleDelete = (id: number) => {
    const todoToDelete = todos.find(todo => todo.id === id);

    setTodos(prevTodos => prevTodos.filter((todo) => todo.id !== id))

    client.todos({ id }).delete().then((res) => {
      if (res.error) {
        if (todoToDelete) {
          setTodos(prevTodos => [...prevTodos, { ...todoToDelete }])
        }
      }

    })


  }

  const toggleStar = (id: number) => {

    const currentStarredValue = todos.find(todo => todo.id === id)?.starred;
    setTodos(prevTodos => prevTodos.map(todo =>
      todo.id === id ? { ...todo, starred: !todo.starred } : todo
    ));

    if (currentStarredValue !== undefined) {

      client.todos({ id }).patch({ starred: !currentStarredValue })
        .then((res) => {
          if (res.error) {
            if (currentStarredValue) {
              setTodos(prevTodos => prevTodos.map(todo =>
                todo.id === id ? { ...todo, starred: currentStarredValue } : todo
              ));
            }
          }
        })
    }
  }

  const toggleChecked = (id: number) => {
    const currentCompletedValue = todos.find(todo => todo.id === id)?.completed;
    setTodos(prevTodos => prevTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));

    if (currentCompletedValue !== undefined) {

      client.todos({ id }).patch({ completed: !currentCompletedValue })
        .then((res) => {
          if (res.error) {
            if (currentCompletedValue) {
              setTodos(prevTodos => prevTodos.map(todo =>
                todo.id === id ? { ...todo, completed: currentCompletedValue } : todo
              ));
            }
          }
        })
    }
  }

  const addTodo = () => {

    let newTodo = {

      desc: inputRef.current!.value,
      starred: false,
      completed: false
    }
    setTodos(prevTodos => [
      ...prevTodos,
      {
        id: 420,
        ...newTodo
      }
    ]);

    client.todos.add.post(newTodo).then((res) => {
      if (res.error) {
        setTodos(prevTodos => prevTodos.filter((todo) => todo.id !== 420))

      }
      if (res.data) {
        const newTodoId = res.data.id;
        setTodos(prevTodos => prevTodos.map(todo =>
          todo.id === 420 ? { ...todo, id: newTodoId } : todo
        ));
        inputRef.current!.value = ''


      }
    })
  }

  return (
    <main className="mx-auto mt-8 max-w-prose">
      <h1 className="text-center text-xl">My todos</h1>
      <Table>
        <TableCaption>A list of your todos.</TableCaption>
        <TableBody>
          {[
            ...todos.filter(({ starred }) => starred),
            ...todos.filter(({ starred }) => !starred)
          ].map((todo) => (
            <TableRow key={todo.id}>
              <TableCell>
                <Checkbox
                  id={todo.id.toString()}
                  checked={todo.completed}
                  onCheckedChange={() => toggleChecked(todo.id)}
                />
              </TableCell>
              <TableCell>
                <Label htmlFor={todo.id.toString()}>{todo.desc}</Label>
              </TableCell>
              <TableCell className="text-right">
                <Star
                  id={todo.id}
                  starred={todo.starred}
                  toggleStar={toggleStar}
                />
                <Delete id={todo.id} onDelete={handleDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <form
        className="mt-8 flex space-x-2"
        onSubmit={(e) => {
          e.preventDefault()
          addTodo()
        }}
      >
        <Input ref={inputRef} type="text" placeholder="To do" />
        <Button type="submit">Add</Button>
      </form>
    </main>
  )
}

export default App
