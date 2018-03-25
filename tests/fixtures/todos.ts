export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
}

export function getTodos(): Todo[] {
  return [{
    id: '1',
    title: 'Do laundry',
    isCompleted: false
  },
  {
    id: '2',
    title: 'Write a todo app',
    isCompleted: false
  },
  {
    id: '3',
    title: 'Walk the cats',
    isCompleted: false
  }];
}
