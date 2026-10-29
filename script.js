/* =========================================
   ELEMENTS
========================================= */

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const themeToggle =
    document.getElementById("themeToggle");

const themeText =
    document.getElementById("themeText");

const buttons =
    document.querySelectorAll(".button");


/* =========================================
   CALCULATOR STATE
========================================= */

let expression = "";

let justCalculated = false;


/* =========================================
   INITIAL THEME
========================================= */

document.body.classList.add("light");


/* =========================================
   THEME TOGGLE
========================================= */

themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    themeText.textContent =
        darkMode
            ? "Switch to Light"
            : "Switch to Dark";

});


/* =========================================
   BUTTON EVENTS
========================================= */

buttons.forEach(button => {

    button.addEventListener("click", () => {

        const value =
            button.dataset.value;

        const action =
            button.dataset.action;


        if (action === "clear") {

            clearCalculator();

            return;
        }


        if (action === "backspace") {

            backspace();

            return;
        }


        if (action === "equals") {

            calculateFinal();

            return;
        }


        if (value !== undefined) {

            addToExpression(value);
        }

    });

});


/* =========================================
   ADD TO EXPRESSION
========================================= */

function addToExpression(value) {

    /*
       If an answer was just calculated:

       Number / decimal / opening bracket
       → start a completely new expression.

       Operator
       → continue from the previous result.
    */

    if (justCalculated) {

        if (
            isNumber(value) ||
            value === "." ||
            value === "("
        ) {

            expression = "";

            resultDisplay.textContent = "0";
        }

        else if (isOperator(value)) {

            expression = formatNumber(
                resultDisplay.textContent
            );
        }

        justCalculated = false;
    }


    /* =====================================
       DECIMAL POINT CONTROL
    ===================================== */

    if (value === ".") {

        /*
           Find the current number.

           Example:

           12+45.

           Current number = 45
        */

        const currentNumber =
            getCurrentNumber();


        /*
           Do not allow:

           12.5.6
        */

        if (currentNumber.includes(".")) {

            return;
        }


        /*
           If decimal starts a number:

           "." becomes "0."
        */

        if (
            currentNumber === "" ||
            isOperator(
                expression.charAt(expression.length - 1)
            )
        ) {

            expression += "0.";

        } else {

            expression += ".";
        }

        updateDisplay();

        return;
    }


    /* =====================================
       PERCENTAGE
    ===================================== */

    if (value === "%") {

        /*
           Percentage is represented as
           /100 during calculation.
        */

        if (expression === "") {

            return;
        }


        const currentNumber =
            getCurrentNumber();


        if (
            currentNumber === "" ||
            currentNumber.endsWith("%")
        ) {

            return;
        }


        expression += "%";

        updateDisplay();

        return;
    }


    /* =====================================
       OPERATORS
    ===================================== */

    if (isOperator(value)) {

        /*
           Do not put two operators together.

           Example:

           5++  → 5+
           8×÷  → 8÷
        */

        if (expression === "") {

            /*
               Allow negative numbers
            */

            if (value === "-") {

                expression = "-";

                updateDisplay();
            }

            return;
        }


        const lastCharacter =
            expression.charAt(
                expression.length - 1
            );


        if (isOperator(lastCharacter)) {

            /*
               Replace previous operator.
            */

            expression =
                expression.slice(0, -1) + value;

        } else {

            expression += value;
        }


        updateDisplay();

        return;
    }


    /* =====================================
       OPENING PARENTHESIS
    ===================================== */

    if (value === "(") {

        /*
           Automatically add multiplication.

           Example:

           4(5+4)

           becomes internally:

           4*(5+4)
        */

        if (
            expression !== "" &&
            (
                isNumber(expression.slice(-1)) ||
                expression.slice(-1) === ")" ||
                expression.slice(-1) === "%"
            )
        ) {

            expression += "×";
        }


        expression += "(";

        updateDisplay();

        return;
    }


    /* =====================================
       CLOSING PARENTHESIS
    ===================================== */

    if (value === ")") {

        const openCount =
            countCharacter(expression, "(");

        const closeCount =
            countCharacter(expression, ")");


        /*
           Do not allow more closing brackets
           than opening brackets.
        */

        if (openCount <= closeCount) {

            return;
        }


        /*
           Do not allow ) immediately after (
        */

        const lastCharacter =
            expression.slice(-1);

        if (
            lastCharacter === "(" ||
            isOperator(lastCharacter)
        ) {

            return;
        }


        expression += ")";

        updateDisplay();

        return;
    }


    /* =====================================
       NUMBERS
    ===================================== */

    if (isNumber(value)) {

        /*
           If a number is entered after ):

           4(5+4)6

           automatically becomes:

           4(5+4)×6
        */

        if (expression.endsWith(")")) {

            expression += "×";
        }


        expression += value;

        updateDisplay();

        return;
    }

}


/* =========================================
   UPDATE DISPLAY
========================================= */

function updateDisplay() {

    expressionDisplay.textContent =
        expression || "0";


    /*
       Calculate the expression live.
    */

    const liveResult =
        evaluateExpression(expression);


    if (liveResult !== null) {

        resultDisplay.textContent =
            formatNumber(liveResult);

    } else {

        /*
           Keep a useful temporary result
           instead of displaying "Error".
        */

        resultDisplay.textContent = "0";
    }


    /*
       Automatically scroll the long
       expression and result to the right.
    */

    expressionDisplay.scrollLeft =
        expressionDisplay.scrollWidth;

    resultDisplay.scrollLeft =
        resultDisplay.scrollWidth;
}


/* =========================================
   FINAL CALCULATION
========================================= */

function calculateFinal() {

    if (!expression) {

        return;
    }


    const answer =
        evaluateExpression(expression);


    if (answer === null) {

        resultDisplay.textContent = "Error";

        return;
    }


    resultDisplay.textContent =
        formatNumber(answer);


    /*
       Show:

       expression
       =
       answer

       temporarily through the display
       structure.
    */

    expressionDisplay.textContent =
        expression + " =";


    /*
       Important state:

       The next number starts a fresh
       expression.

       The next operator continues
       from the answer.
    */

    justCalculated = true;
}


/* =========================================
   CLEAR
========================================= */

function clearCalculator() {

    expression = "";

    resultDisplay.textContent = "0";

    expressionDisplay.textContent = "0";

    justCalculated = false;
}


/* =========================================
   BACKSPACE
========================================= */

function backspace() {

    if (justCalculated) {

        expression = "";

        resultDisplay.textContent = "0";

        expressionDisplay.textContent = "0";

        justCalculated = false;

        return;
    }


    expression =
        expression.slice(0, -1);


    updateDisplay();
}


/* =========================================
   GET CURRENT NUMBER
========================================= */

function getCurrentNumber() {

    /*
       Split at operators and parentheses.

       Example:

       12+45.6

       returns:

       45.6
    */

    const parts =
        expression.split(/[+\-×÷()]/);

    return parts[parts.length - 1];
}


/* =========================================
   EVALUATE EXPRESSION
========================================= */

function evaluateExpression(input) {

    if (!input) {

        return 0;
    }


    try {

        let exp = input;


        /* ---------------------------------
           Convert visual operators
        --------------------------------- */

        exp = exp.replaceAll("×", "*");

        exp = exp.replaceAll("÷", "/");


        /* ---------------------------------
           Convert percentages

           50% → (50/100)
           --------------------------------- */

        exp = exp.replace(
            /(\d+(?:\.\d+)?)%/g,
            "($1/100)"
        );


        /* ---------------------------------
           Implicit multiplication

           4(5+4)
           → 4*(5+4)

           )( → )*(

           2(3)
           → 2*(3)

           (2)3
           → (2)*3
        --------------------------------- */

        exp = exp.replace(
            /(\d|\))\(/g,
            "$1*("
        );

        exp = exp.replace(
            /\)(\d)/g,
            ")*$1"
        );


        /* ---------------------------------
           Only allow calculator characters
        --------------------------------- */

        if (
            !/^[0-9+\-*/().\s]+$/.test(exp)
        ) {

            return null;
        }


        /*
           Do not calculate incomplete
           expressions.

           Examples:

           5+
           5×
           (5+
        */

        if (
            /[+\-*/.]$/.test(exp) ||
            /[+\-*/.]$/.test(exp.trim())
        ) {

            return null;
        }


        /*
           Parentheses must balance.
        */

        let balance = 0;

        for (const char of exp) {

            if (char === "(") {

                balance++;
            }

            if (char === ")") {

                balance--;

                if (balance < 0) {

                    return null;
                }
            }
        }


        if (balance !== 0) {

            return null;
        }


        /* ---------------------------------
           Calculate
        --------------------------------- */

        const answer =
            Function(
                `"use strict"; return (${exp})`
            )();


        /* ---------------------------------
           Validate answer
        --------------------------------- */

        if (
            typeof answer !== "number" ||
            !Number.isFinite(answer)
        ) {

            return null;
        }


        return answer;

    } catch (error) {

        return null;
    }
}


/* =========================================
   NUMBER TEST
========================================= */

function isNumber(value) {

    return /^[0-9]$/.test(value);
}


/* =========================================
   OPERATOR TEST
========================================= */

function isOperator(value) {

    return ["+", "-", "×", "÷"].includes(value);
}


/* =========================================
   COUNT CHARACTER
========================================= */

function countCharacter(
    string,
    character
) {

    return (
        string.split(character).length - 1
    );
}


/* =========================================
   FORMAT NUMBER
========================================= */

function formatNumber(number) {

    if (!Number.isFinite(number)) {

        return "Error";
    }


    /*
       Prevent ugly floating-point results.

       Example:

       0.30000000000000004

       becomes:

       0.3
    */

    const rounded =
        Number(
            Number(number).toPrecision(12)
        );


    /*
       Use normal decimal notation for
       readable calculator output.
    */

    return rounded.toString();
}


/* =========================================
   KEYBOARD SUPPORT
========================================= */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        /* Numbers */

        if (/^[0-9]$/.test(key)) {

            addToExpression(key);

            return;
        }


        /* Decimal */

        if (key === ".") {

            addToExpression(".");

            return;
        }


        /* Operators */

        if (key === "+") {

            addToExpression("+");

            return;
        }


        if (key === "-") {

            addToExpression("-");

            return;
        }


        if (key === "*") {

            addToExpression("×");

            return;
        }


        if (key === "/") {

            event.preventDefault();

            addToExpression("÷");

            return;
        }


        /* Parentheses */

        if (key === "(") {

            addToExpression("(");

            return;
        }


        if (key === ")") {

            addToExpression(")");

            return;
        }


        /* Percentage */

        if (key === "%") {

            addToExpression("%");

            return;
        }


        /* Enter */

        if (
            key === "Enter" ||
            key === "="
        ) {

            calculateFinal();

            return;
        }


        /* Backspace */

        if (key === "Backspace") {

            backspace();

            return;
        }


        /* Escape */

        if (key === "Escape") {

            clearCalculator();
        }

    }
);