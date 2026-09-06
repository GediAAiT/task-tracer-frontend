export interface TabVm {
  key: string;
  label: string;
  count: number;
  active: boolean;
  onSelect: () => void;
}
