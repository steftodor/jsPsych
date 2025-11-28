import { pressKey, simulateTimeline, startTimeline } from "@jspsych/test-utils";

import htmlKeyboardResponse from ".";

jest.useFakeTimers();

describe("html-keyboard-response", () => {
  test("displays html stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
      },
    ]);

    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    await pressKey("a");
    await expectFinished();
  });

  test("display clears after key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
      },
    ]);
    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    await pressKey("f");
    expect(getHTML()).toBe("");
    await expectFinished();
  });

  test("prompt should append html below stimulus", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        prompt: '<div id="foo">this is a prompt</div>',
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div><div id="foo">this is a prompt</div>'
    );

    await pressKey("f");
    await expectFinished();
  });

  test("should hide stimulus if stimulus-duration is set", async () => {
    const { displayElement, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        stimulus_duration: 500,
      },
    ]);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-keyboard-response-stimulus").style
        .visibility
    ).toMatch("");

    jest.advanceTimersByTime(500);

    expect(
      displayElement.querySelector<HTMLElement>("#jspsych-html-keyboard-response-stimulus").style
        .visibility
    ).toBe("hidden");

    await pressKey("f");
    await expectFinished();
  });

  test("should end trial when trial duration is reached", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        trial_duration: 500,
      },
    ]);

    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    jest.advanceTimersByTime(500);
    await expectFinished();
  });

  test("should end trial when key press", async () => {
    const { getHTML, expectFinished } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        response_ends_trial: true,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    await pressKey("f");
    await expectFinished();
  });

  test("class should say responded when key is pressed", async () => {
    const { getHTML, expectRunning, displayElement } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        choices: ["f", "j"],
        response_ends_trial: false,
      },
    ]);

    expect(getHTML()).toContain(
      '<div id="jspsych-html-keyboard-response-stimulus">this is html</div>'
    );

    await pressKey("f");

    expect(displayElement.querySelector("#jspsych-html-keyboard-response-stimulus").className).toBe(
      " responded"
    );

    await expectRunning();
  });
});

describe("html-keyboard-response simulation", () => {
  test("data mode works", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ];

    const { expectFinished, getData } = await simulateTimeline(timeline);

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  test("visual mode works", async () => {
    const timeline = [
      {
        type: htmlKeyboardResponse,
        stimulus: "foo",
      },
    ];

    const { expectFinished, expectRunning, getHTML, getData } = await simulateTimeline(
      timeline,
      "visual"
    );

    await expectRunning();

    expect(getHTML()).toContain("foo");

    jest.runAllTimers();

    await expectFinished();

    expect(getData().values()[0].rt).toBeGreaterThan(0);
    expect(typeof getData().values()[0].response).toBe("string");
  });

  test("should respect response_start_time parameter", async () => {
    const { getHTML, expectFinished, getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        response_start_time: 1000,
        choices: ["a"],
      },
    ]);
    // insure stimulus is displayed
    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    // await pressKey("a");
    // response should not be registered before response_start_time
    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    jest.advanceTimersByTime(500);
    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    jest.advanceTimersByTime(600);
    await pressKey("a");

    const data = getData().values()[0];
    console.log(data);
    expect(data.response).toBe("a");
    expect(data.rt).toBeGreaterThanOrEqual(100);

    await expectFinished();
  });

  test("should respect response_end_time parameter", async () => {
    const { getHTML, expectRunning } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "this is html",
        response_end_time: 1000,
        choices: ["a"],
      },
    ]);
    // insure stimulus is displayed
    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    jest.advanceTimersByTime(1100);
    // response should not be registered after response_end_time
    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    await pressKey("a");
    expect(getHTML()).toBe('<div id="jspsych-html-keyboard-response-stimulus">this is html</div>');
    await expectRunning();
  });
});
