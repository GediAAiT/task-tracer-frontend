import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { FieldVm } from '@/app/model/task/view/field.vm';
import type { TaskFormVm } from '@/app/model/task/view/task-form.vm';
import { TaskFormFields } from '../task-form.html';

function field(value: string, error: string | null = null): FieldVm {
  return { value, error, onChange: vi.fn() };
}

function form(overrides: Partial<TaskFormVm> = {}): TaskFormVm {
  return {
    title: field(''),
    description: field(''),
    status: field(''),
    priority: field(''),
    dueDate: field(''),
    assignee: field(''),
    tags: field(''),
    statusOptions: [
      { value: 'TODO', label: 'To do' },
      { value: 'IN_PROGRESS', label: 'In progress' },
    ],
    priorityOptions: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
    ],
    ...overrides,
  };
}

describe('TaskFormFields', () => {
  it('offers a disabled placeholder while a select has no value', () => {
    render(<TaskFormFields form={form()} />);

    expect(screen.getByRole('combobox', { name: /status/i })).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Select a status' })).toBeDisabled();
    expect(screen.getByRole('option', { name: 'Select a priority' })).toBeDisabled();
  });

  it('drops the placeholder once a value is in place', () => {
    render(
      <TaskFormFields form={form({ status: field('TODO'), priority: field('MEDIUM') })} />,
    );

    expect(screen.getByRole('combobox', { name: /status/i })).toHaveValue('TODO');
    expect(screen.getByRole('combobox', { name: /priority/i })).toHaveValue('MEDIUM');
    expect(screen.queryByRole('option', { name: 'Select a status' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Select a priority' })).not.toBeInTheDocument();
  });

  it('shows the hint while a field is still clean', () => {
    render(<TaskFormFields form={form()} />);

    expect(screen.getByText('Required, up to 200 characters.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explains why each required field was rejected', () => {
    render(
      <TaskFormFields
        form={form({
          title: field('', 'Title is required.'),
          status: field('', 'Status is required. Pick where this task stands.'),
          priority: field('', 'Priority is required. Pick how urgent this task is.'),
        })}
      />,
    );

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(
      screen.getByText('Status is required. Pick where this task stands.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Priority is required. Pick how urgent this task is.'),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(3);
  });

  it('marks the rejected control as invalid and replaces its hint', () => {
    render(<TaskFormFields form={form({ title: field('', 'Title is required.') })} />);

    expect(screen.getByRole('textbox', { name: /title/i })).toBeInvalid();
    expect(screen.queryByText('Required, up to 200 characters.')).not.toBeInTheDocument();
  });
});
