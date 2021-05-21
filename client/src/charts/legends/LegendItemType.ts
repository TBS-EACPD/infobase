export interface StaticLegendItemType {
  id: string | number;
  label: string;
  color?: string;
}
export interface LegendItemType extends StaticLegendItemType {
  active: boolean;
}
