import { expect } from 'chai';

import { Empty } from '../shared';
import { createPath } from './pathBuilder';

describe('shared/pathBuilder', () => {
  describe('createPath', () => {
    interface ById {
      id: string;
    }

    it('should generate an empty path by default', () => {
      const result = createPath(path => path);
      expect(result).to.equal('/');
    });

    it('should generate a path with a literal', () => {
      const result = createPath<Empty>(path => path
        .literal('todos')
      );

      expect(result).to.equal('/todos');
    });

    it('should generate a path with a param', () => {
      const result = createPath<ById>(path => path
        .param('id')
      );

      expect(result).to.equal('/:id');
    });

    it('should generate a path with a literal and param', () => {
      const result = createPath<ById>(path => path
        .literal('todos')
        .param('id')
      );

      expect(result).to.equal('/todos/:id');
    });

    it('should generate a path with a literal, param and literal', () => {
      const result = createPath<ById>(path => path
        .literal('todos')
        .param('id')
        .literal('tags')
      );

      expect(result).to.equal('/todos/:id/tags');
    });

    it('should generate a path with a literal, param, literal and param', () => {
      interface ByTodoIdAndTagId {
        todoId: string;
        tagId: number;
      }

      const result = createPath<ByTodoIdAndTagId>(path => path
        .literal('todos')
        .param('todoId')
        .literal('tags')
        .param('tagId')
      );

      expect(result).to.equal('/todos/:todoId/tags/:tagId');
    });
  });
});
