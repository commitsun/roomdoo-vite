export type SchemaItemType =
  'text'
| 'number'
| 'boolean'
| 'date'
| 'money'
| 'avatar'
| 'textWithAvatar'
| 'textList'
| 'textBold'
| 'textBoldWithAvatar'
| 'moneyBold'
| 'tag'
| 'tagMoney'
| 'tagList'
| 'tagColor';

export interface SchemaInterface {
  label: string;
  secondaryLabel?: string;
  fieldType: SchemaItemType;
  fieldName: string;
  avatar?: string;
  avatarColor?: string;
  avatarImage?: string;
  align?: 'left' | 'right' | 'center';
  mobileAllowed?: boolean;
  columnWidth?: number;
  color?: string;
  isSortable?: boolean;
}
