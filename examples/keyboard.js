export const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
    shift: false
};

export function setupKeyboard() {

    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();

        if (key === 'w') keys.w = true;
        if (key === 'a') keys.a = true;
        if (key === 's') keys.s = true;
        if (key === 'd') keys.d = true;
        if (key === "e") keys.e = true;

        if (event.shiftKey) {
            keys.shift = true;
             }
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();

        if (key === 'w') keys.w = false;
        if (key === 'a') keys.a = false;
        if (key === 's') keys.s = false;
        if (key === 'd') keys.d = false;
        if (key === "e") keys.e = false;

        keys.shift = false;
    });
}