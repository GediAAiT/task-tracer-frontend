import { describe, expect, it } from 'vitest';
import {
  EMPTY_TASK_FORM,
  hasFieldErrors,
  listFieldErrors,
  clearFieldError,
  toTaskInput,
  toTaskUpdate,
  validateTaskForm,
  type TaskFormValues,
} from '../task';

function form(overrides: Partial<TaskFormValues> = {}): TaskFormValues {
  return {
    title: 'Renew the library cards',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    assignee: '',
    tags: '',
    ...overrides,
  };
}

describe('validateTaskForm', () => {
  it('accepts a filled in form', () => {
    const errors = validateTaskForm(form());

    expect(errors).toEqual({});
    expect(hasFieldErrors(errors)).toBe(false);
  });

  it('starts a new task on To do and Medium so only the title is left to fill in', () => {
    expect(EMPTY_TASK_FORM.status).toBe('TODO');
    expect(EMPTY_TASK_FORM.priority).toBe('MEDIUM');
    expect(validateTaskForm(EMPTY_TASK_FORM)).toEqual({ title: 'Title is required.' });
  });

  it('names every required field the author left empty', () => {
    const errors = validateTaskForm(form({ title: '', status: '', priority: '' }));

    expect(hasFieldErrors(errors)).toBe(true);
    expect(errors.title).toBe('Title is required.');
    expect(errors.status).toContain('Status is required.');
    expect(errors.priority).toContain('Priority is required.');
    expect(listFieldErrors(errors)).toHaveLength(3);
  });

  it('reports the fields in the order they are shown on the form', () => {
    const errors = validateTaskForm(form({ title: '', priority: '' }));

    expect(listFieldErrors(errors)).toEqual([
      'Title is required.',
      'Priority is required. Pick how urgent this task is.',
    ]);
  });

  it('rejects a title longer than the API allows', () => {
    const errors = validateTaskForm(form({ title: 'a'.repeat(201) }));

    expect(errors.title).toBe('Title must be 200 characters or fewer.');
  });

  it('treats a whitespace only title as missing', () => {
    expect(validateTaskForm(form({ title: '   ' })).title).toBe('Title is required.');
  });

  it('rejects an unparseable due date', () => {
    expect(validateTaskForm(form({ dueDate: 'next tuesday' })).dueDate).toBe(
      'Due date is not a valid date and time.',
    );
  });

  it('rejects an over long assignee and oversized tags', () => {
    expect(validateTaskForm(form({ assignee: 'a'.repeat(121) })).assignee).toBe(
      'Assignee must be 120 characters or fewer.',
    );
    expect(validateTaskForm(form({ tags: `${'a'.repeat(41)}, ok` })).tags).toBe(
      'Each tag must be 40 characters or fewer.',
    );
    expect(
      validateTaskForm(form({ tags: Array.from({ length: 21 }, (_, i) => `t${i}`).join(',') }))
        .tags,
    ).toBe('Use at most 20 tags.');
  });
});

describe('clearFieldError', () => {
  it('drops the message for one field and keeps the rest', () => {
    const errors = validateTaskForm(form({ title: '', status: '', priority: '' }));
    const remaining = clearFieldError(errors, 'title');

    expect(remaining.title).toBeUndefined();
    expect(remaining.status).toBeDefined();
    expect(hasFieldErrors(remaining)).toBe(true);
  });

  it('returns the same object when the field was already clean', () => {
    const errors = validateTaskForm(form({ title: '' }));

    expect(clearFieldError(errors, 'tags')).toBe(errors);
  });
});

describe('toTaskInput', () => {
  it('sends the status and priority the author picked', () => {
    expect(toTaskInput(form({ status: 'BLOCKED', priority: 'URGENT' }))).toEqual({
      title: 'Renew the library cards',
      status: 'BLOCKED',
      priority: 'URGENT',
    });
  });

  it('omits an unpicked status and priority instead of sending an empty string', () => {
    const input = toTaskInput(form({ status: '', priority: '' }));

    expect(input).toEqual({ title: 'Renew the library cards' });
    expect('status' in input).toBe(false);
    expect('priority' in input).toBe(false);
  });
});

describe('toTaskUpdate', () => {
  it('clears the optional fields the author emptied', () => {
    expect(toTaskUpdate(form({ description: '  ', assignee: '', tags: '' }))).toEqual({
      title: 'Renew the library cards',
      description: null,
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: null,
      assignee: null,
      tags: [],
    });
  });

  it('leaves an unpicked status and priority untouched on the server', () => {
    const update = toTaskUpdate(form({ status: '', priority: '' }));

    expect('status' in update).toBe(false);
    expect('priority' in update).toBe(false);
  });
});
