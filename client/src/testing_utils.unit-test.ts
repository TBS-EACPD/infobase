import { with_console_error_silenced } from "./testing_utils";

describe("with_console_error_silenced", () => {
  it("Executes passed function with console.error temporarily blackholed", () => {
    const original_console_error = console.error;
    const mock_console_error = jest.fn();
    console.error = mock_console_error;

    with_console_error_silenced(() => {
      console.error();
    });

    expect(console.error).toBe(mock_console_error);
    expect(mock_console_error).toBeCalledTimes(0);

    console.error = original_console_error;
  });
});
