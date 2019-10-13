import { Empty } from '.';
import { createPath } from './pathBuilder';

describe('shared/pathBuilder', () => {
  describe('createPath', () => {
    interface ById {
      id: string;
    }

    it('should generate an empty path by default', () => {
      const result = createPath((path) => path);
      expect(result).toBe('/');
    });

    it('should generate a path with a literal', () => {
      const result = createPath<Empty>((path) => path
        .literal('todos'));

      expect(result).toBe('/todos');
    });

    it('should generate a path with a param', () => {
      const result = createPath<ById>((path) => path
        .param('id'));

      expect(result).toBe('/:id');
    });

    it('should generate a path with a literal and param', () => {
      const result = createPath<ById>((path) => path
        .literal('todos')
        .param('id'));

      expect(result).toBe('/todos/:id');
    });

    it('should generate a path with a literal, param and literal', () => {
      const result = createPath<ById>((path) => path
        .literal('todos')
        .param('id')
        .literal('tags'));

      expect(result).toBe('/todos/:id/tags');
    });

    it('should generate a path with a literal, param, literal and param', () => {
      interface ByTodoIdAndTagId {
        todoId: string;
        tagId: number;
      }

      const result = createPath<ByTodoIdAndTagId>((path) => path
        .literal('todos')
        .param('todoId')
        .literal('tags')
        .param('tagId'));

      expect(result).toBe('/todos/:todoId/tags/:tagId');
    });
  });
});
