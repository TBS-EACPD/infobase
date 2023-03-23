import { fireEvent, render, screen } from "@testing-library/react";

import _ from "lodash";

import React from "react";

import { TM } from "../TextMaker";

import { trivial_text_maker } from "src/models/text";

import { KeyConceptList } from "./KeyConceptList";

jest.mock("src/models/text");
const mocked_trivial_text_maker = trivial_text_maker as jest.MockedFunction<
  typeof trivial_text_maker
>;
mocked_trivial_text_maker.mockImplementation((key: string) => key);

describe("KeyConceptList", () => {
  it("Initially renders KeyConceptList questions, but not answers (compact preset to true if not defined)", async () => {
    const q1 = "TEST1";
    const a1 = "TEST12";
    const q2 = "TEST2";
    const a2 = "TEST23";
    const q3 = "TEST3";
    const a3 = "TEST34";

    render(
      <KeyConceptList
        question_answer_pairs={_.map(
          [
            [q1, a1],
            [q2, a2],
            [q3, a3],
          ],
          ([q_key, a_key]) => [
            <TM key={q_key} k={q_key} />,
            <TM key={a_key} k={a_key} />,
          ]
        )}
      />
    );

    expect(screen.getByText("TEST1")).toBeInTheDocument();
    expect(screen.getByText("TEST2")).toBeInTheDocument();
    expect(screen.getByText("TEST3")).toBeInTheDocument();
    expect(screen.queryByText("TEST12")).toBeNull();
    expect(screen.queryByText("TEST23")).toBeNull();
    expect(screen.queryByText("TEST34")).toBeNull();
  });

  it("Initially renders KeyConceptList questions, as well as answers when compact is false", async () => {
    const q1 = "TEST1";
    const a1 = "TEST12";
    const q2 = "TEST2";
    const a2 = "TEST23";
    const q3 = "TEST3";
    const a3 = "TEST34";

    render(
      <KeyConceptList
        question_answer_pairs={_.map(
          [
            [q1, a1],
            [q2, a2],
            [q3, a3],
          ],
          ([q_key, a_key]) => [
            <TM key={q_key} k={q_key} />,
            <TM key={a_key} k={a_key} />,
          ]
        )}
        compact={false}
      />
    );

    expect(screen.getByText("TEST1")).toBeInTheDocument();
    expect(screen.getByText("TEST2")).toBeInTheDocument();
    expect(screen.getByText("TEST3")).toBeInTheDocument();
    expect(screen.queryByText("TEST12")).toBeInTheDocument();
    expect(screen.queryByText("TEST23")).toBeInTheDocument();
    expect(screen.queryByText("TEST34")).toBeInTheDocument();
  });

  it("Hides answers until it's corresponding question is clicked and tests setting compact to true manually.", async () => {
    const q1 = "TEST1";
    const a1 = "TEST12";
    const q2 = "TEST2";
    const a2 = "TEST23";
    const q3 = "TEST3";
    const a3 = "TEST34";

    render(
      <KeyConceptList
        question_answer_pairs={_.map(
          [
            [q1, a1],
            [q2, a2],
            [q3, a3],
          ],
          ([q_key, a_key]) => [
            <TM key={q_key} k={q_key} />,
            <TM key={a_key} k={a_key} />,
          ]
        )}
        compact={true}
      />
    );

    expect(screen.queryByText("TEST12")).toBeNull();
    expect(screen.queryByText("TEST23")).toBeNull();
    expect(screen.queryByText("TEST34")).toBeNull();
    fireEvent.click(screen.queryByText("TEST1") as HTMLButtonElement);
    fireEvent.click(screen.queryByText("TEST2") as HTMLButtonElement);
    fireEvent.click(screen.queryByText("TEST3") as HTMLButtonElement);
    expect(screen.queryByText("TEST12")).toBeInTheDocument();
    expect(screen.queryByText("TEST23")).toBeInTheDocument();
    expect(screen.queryByText("TEST34")).toBeInTheDocument();
  });
});
