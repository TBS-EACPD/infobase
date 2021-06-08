export interface StaticLegendItemType {
  id: string;
  label: string;
  color?: string;
}
export interface LegendItemType extends StaticLegendItemType {
  active: boolean;
}
