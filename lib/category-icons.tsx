import {
  Cpu, Laptop, Camera, Gamepad2, Watch, Car,
  Guitar, Shirt, BookOpen, Dumbbell, Sofa, Puzzle,
  Smartphone, Package,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Electronics':  Cpu,
  'Laptops':      Laptop,
  'Phones':       Smartphone,
  'Cameras':      Camera,
  'Gaming':       Gamepad2,
  'Smartwatches': Watch,
  'Cars':         Car,
  'Instruments':  Guitar,
  'Fashion':      Shirt,
  'Books':        BookOpen,
  'Sports':       Dumbbell,
  'Furniture':    Sofa,
  'Toys':         Puzzle,
  'Other':        Package,
};

export type { LucideIcon };
