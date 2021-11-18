export const with_console_error_silenced = (
  test_code_that_throws: () => void
) => {
  const console_error = console.error;
  try {
    console.error = () => undefined;

    test_code_that_throws();
  } finally {
    console.error = console_error;
  }
};
