const buttonsEl = document.querySelectorAll("button");
const inputFieldEl = document.getElementById("result");

// for (let i = 0; i < buttonsEl.length; i++) {
//   buttonsEl[i].addEventListener("click", () => {
//     const buttonValue = buttonsEl[i].textContent;

//     if (buttonValue === "C") {
//         clearResult();
//     } else if (buttonValue === "=") {
//         calculateResult();
//     } else if (buttonValue === "⌫") {
//         deleteLastCharacter();
//     }
//     else {
//         appendValue(buttonValue);
//     }
//   });
// }

buttonsEl.forEach((button) => {
  button.addEventListener("click", () => {
    const buttonValue = button.textContent;
    if (buttonValue === "C") {
      clearResult();
    } else if (buttonValue === "=") {
      calculateResult();
    } else if (buttonValue === "⌫") {
      deleteLastCharacter();
    } else {
      appendValue(buttonValue);
    }
  });
});

function clearResult() {
  inputFieldEl.value = "";
}

function deleteLastCharacter() {
  inputFieldEl.value = inputFieldEl.value.slice(0, -1);
}

function calculateResult() {
  inputFieldEl.value = eval(inputFieldEl.value);
}

function appendValue(buttonValue) {
  inputFieldEl.value += buttonValue;
}
