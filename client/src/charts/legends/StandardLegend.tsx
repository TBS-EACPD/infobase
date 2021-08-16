import React from "react";

import { LegendContainer } from "./LegendContainer";

import { LegendList, LegendListProps } from "./LegendList";

import "./StandardLegend.scss";

interface StandardLegendProps {
  title: string;
  Controls: React.ReactNode;
  legendListProps: LegendListProps;
}

export const StandardLegend = ({
  title,
  Controls,
  legendListProps: { items, isHorizontal, onClick, checkBoxProps },
}: StandardLegendProps) => (
  <LegendContainer title={title} legend_footer={Controls}>
    <LegendList
      {...{
        items,
        isHorizontal,
        onClick,
        checkBoxProps,
      }}
    />
  </LegendContainer>
);
