export const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    shift: false,
    p: false,
    x: false,
    f: false // 👈 AGREGA ESTO
};

export function setupKeyboard() {
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        if (key === 'w') keys.w = true;
        if (key === 's') keys.s = true;
        if (key === 'a') keys.a = true;
        if (key === 'd') keys.d = true;
        if (key === 'shift') keys.shift = true;
        if (key === 'p') keys.p = true;
        if (key === 'x') keys.x = true;
        if (key === 'f') keys.f = true; // 👈 NUEVO
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        if (key === 'w') keys.w = false;
        if (key === 's') keys.s = false;
        if (key === 'a') keys.a = false;
        if (key === 'd') keys.d = false;
        if (key === 'shift') keys.shift = false;
        if (key === 'p') keys.p = false;
        if (key === 'x') keys.x = false;
        if (key === 'f') keys.f = false; // 👈 NUEVO
    });
}