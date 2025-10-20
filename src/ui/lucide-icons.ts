import {
  X as IconClose,
  ChevronDown as IconChevronDown,
  ChevronUp as IconChevronUp,
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  Search as IconSearch,
  Calendar as IconCalendar,
  Check as IconCheck,
  AlertTriangle as IconWarning,
  AlertCircle as IconError,
  Info as IconInfo,
  CheckCircle as IconSuccess,
  Download as IconDownload,
  Upload as IconUpload,
  Plus as IconPlus,
  Minus as IconMinus,
  Loader2 as IconSpinner,
} from 'lucide-vue-next';

export const LucideIconMap = {
  // common / global
  close: IconClose,
  spinner: IconSpinner,

  // navigation
  chevronDown: IconChevronDown,
  chevronUp: IconChevronUp,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,

  // actions
  search: IconSearch,
  calendar: IconCalendar,
  check: IconCheck,
  warning: IconWarning,
  error: IconError,
  info: IconInfo,
  success: IconSuccess,
  download: IconDownload,
  upload: IconUpload,
  plus: IconPlus,
  minus: IconMinus,
} as const;

export type LucideIconName = keyof typeof LucideIconMap;
