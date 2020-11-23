import { preprocess } from '.';

test('if', () => {
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #endif */
`,
      {
        A: 1,
      },
    ),
  ).toBe(`
/************/
a = 1;
/*************/
`);
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #endif */
`,
      {
        A: 2,
      },
    ),
  ).toBe(`
/*************
******
**************/
`);
});

test('if-else', () => {
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #else
a = 2;
*/ /* #endif */
`,
      {
        A: 1,
      },
    ),
  ).toBe(`
/************/
a = 1;
/**********
******
**************/
`);
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #else
a = 2;
*/ /* #endif */
`,
      {
        A: 2,
      },
    ),
  ).toBe(`
/*************
******
**********/
a = 2;
/*************/
`);
  expect(
    preprocess(
      `
// #if A === 1
a = 1;
// #else
a = 2;
// #endif
`,
      {
        A: 1,
      },
    ),
  ).toBe(`
/************/
a = 1;
/*******
******
********/
`);
  expect(
    preprocess(
      `
// #if A === 1
a = 1;
// #else
a = 2;
// #endif
`,
      {
        A: 2,
      },
    ),
  ).toBe(`
/*************
******
*******/
a = 2;
/*******/
`);
});

test('if-elif-else', () => {
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #elif A === 2
a = 2;
*/ /* #else
a = 3;
*/ /* #endif */
`,
      {
        A: 1,
      },
    ),
  ).toBe(`
/************/
a = 1;
/******************
******
***********
******
**************/
`);
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #elif A === 2
a = 2;
*/ /* #else
a = 3;
*/ /* #endif */
`,
      {
        A: 2,
      },
    ),
  ).toBe(`
/*************
******
******************/
a = 2;
/**********
******
**************/
`);
  expect(
    preprocess(
      `
/* #if A === 1
a = 1;
*/ /* #elif A === 2
a = 2;
*/ /* #else
a = 3;
*/ /* #endif */
`,
      {
        A: 3,
      },
    ),
  ).toBe(`
/*************
******
*******************
******
**********/
a = 3;
/*************/
`);
  expect(
    preprocess(
      `
// #if A === 1
a = 1;
// #elif A === 2
a = 2;
// #elif A === 3
a = 3;
// #else
a = 4;
// #endif
`,
      {
        A: 1,
      },
    ),
  ).toBe(`
/************/
a = 1;
/***************
******
****************
******
********
******
********/
`);
  expect(
    preprocess(
      `
// #if A === 1
a = 1;
// #elif A === 2
a = 2;
// #elif A === 3
a = 3;
// #else
a = 4;
// #endif
`,
      {
        A: 2,
      },
    ),
  ).toBe(`
/*************
******
***************/
a = 2;
/***************
******
********
******
********/
`);
  expect(
    preprocess(
      `
// #if A === 1
a = 1;
// #elif A === 2
a = 2;
// #elif A === 3
a = 3;
// #else
a = 4;
// #endif
`,
      {
        A: 3,
      },
    ),
  ).toBe(`
/*************
******
****************
******
***************/
a = 3;
/*******
******
********/
`);
  expect(
    preprocess(
      `
// #if A === 1
a = 1;
// #elif A === 2
a = 2;
// #elif A === 3
a = 3;
// #else
a = 4;
// #endif
`,
      {
        A: 4,
      },
    ),
  ).toBe(`
/*************
******
****************
******
****************
******
*******/
a = 4;
/*******/
`);
});

test('nested', () => {
  expect(
    preprocess(
      `
// #if A
  /* #if B
  ab = 1;
  */ /* #else
  a = 1;
  */ /* #endif */
/* #else
  // #if B
  b = 1;
  // #endif
*/
// #endif
`,
      {
        A: true,
        B: false,
      },
    ),
  ).toBe(`
/******/
  /*******
*********
************/
  a = 1;
  /*************/
/*******
**********
********
***********
**
********/
`);
  expect(
    preprocess(
      `
// #if A
/* #if C
ac = 1;
*/ /* #else
a = 1;
*/ /* #endif */
/* #elif B
// #if C
bc = 1;
// #else
b = 1;
// #endif
*/
// #endif
`,
      {
        A: false,
        B: true,
        C: false,
      },
    ),
  ).toBe(`
/*******
********
*******
***********
******
***************
*********/
/*******
*******
*******/
b = 1;
/*******/
/*
********/
`);
});

// https://github.com/nippur72/ifdef-loader/blob/master/README.md
test('ifdef-loader', () => {
  expect(
    preprocess(
      `
/// #if DEBUG
console.log("there's a bug!");
/// #endif
`,
      {
        DEBUG: true,
      },
    ),
  ).toBe(`
/***********/
console.log("there's a bug!");
/********/
`);
  expect(
    preprocess(
      `
/// #if PRODUCTION && version.charAt(0)=='X'
console.log("Ho!");
/// #endif
`,
      {
        PRODUCTION: true,
        version: 'Y',
      },
    ),
  ).toBe(`
/*******************************************
*******************
*********/
`);
  expect(
    preprocess(
      `
/// #if env == 'PRODUCTION'
console.log('Production!');
/// #elif env == 'DEBUG'
console.log('Debug!');
/// #else
console.log('Something else!');
/// #endif
`,
      {
        env: 'DEBUG',
      },
    ),
  ).toBe(`
/**************************
***************************
***********************/
console.log('Debug!');
/********
*******************************
*********/
`);
  expect(
    preprocess(
      `
/// #if PRODUCTION
      /// #if OS=="android"
      android_code();
      /// #elif OS=="ios"
      ios_code();
      /// #endif
/// #endif
`,
      {
        PRODUCTION: true,
        OS: 'android',
      },
    ),
  ).toBe(`
/****************/
      /*******************/
      android_code();
      /******************
*****************
***************/
/********/
`);
});

test('special-comment', () => {
  expect(
    preprocess(
      `
/// #if DEBUG
f();
/// #elif RELEASE
g();
/// #else
h();
/// #endif
`,
      {
        DEBUG: false,
        RELEASE: false,
      },
    ),
  ).toBe(
    `
/************
****
*****************
****
********/
h();
/********/
`,
  );
});

test('space-pre', () => {
  expect(
    preprocess(
      `
//#if-1===A
a = -1;
//  #  endif  
`,
      {
        A: -1,
      },
    ),
  ).toBe(`
/*********/
a = -1;
/************/
`);
  expect(
    preprocess(
      `
//#if(A===1)
a = 1;
// # elifA === 2
//  #  endif  
`,
      {
        A: 1,
      },
    ),
  ).toBe(`
/**********/
a = 1;
// # elifA === 2
/************/
`);
});

test('non-if-comment', () => {
  expect(
    preprocess(
      `
/* #non-if-comment
// #if DEBUG
debug;
// #endif
*/
`,
      {},
    ),
  ).toBe(`
/* #non-if-comment
// #if DEBUG
debug;
// #endif
*/
`);
  expect(
    preprocess(
      `
// /* #if DEBUG
debug;
// */ /* #endif */
`,
      {},
    ),
  ).toBe(`
// /* #if DEBUG
debug;
// */ /* #endif */
`);
  expect(
    preprocess(
      `
// #if DEBUG
debug;
// #elsex
typo;
// #endif
`,
      {
        DEBUG: 1,
      },
    ),
  ).toBe(`
/**********/
debug;
// #elsex
typo;
/*******/
`);
});

test('bad-if', () => {
  expect(() =>
    preprocess(
      `
/* #if
hello();
*/ /* #endif */
`,
      {},
    ),
  ).toThrow('No cond for #if: /* #if');
  expect(() =>
    preprocess(
      `
/* #if */
hello();
/* #endif */
`,
      {},
    ),
  ).toThrow('No cond for #if: /* #if */');
  expect(() =>
    preprocess(
      `
// #if
hello();
// #endif`,
      {},
    ),
  ).toThrow('No cond for #if: // #if');
  expect(() =>
    preprocess(
      `
/* #if true
hello();
*/ /* #if 42 */ /* #endif */  // #endif
`,
      {},
    ),
  ).toThrow('#elif or #else or #endif expected: /* #if 42 */');
  expect(() =>
    preprocess(
      `
/* #if true
hello();
*/ world // #endif
`,
      {},
    ),
  ).toThrow('#elif or #else or #endif expected:  world ');
  expect(() =>
    preprocess(
      `
/* #if true
f();
*/
// #else
g();
`,
      {},
    ),
  ).toThrow('Unclosed #if: /* #if true');
});

test('bad-elif', () => {
  expect(() =>
    preprocess(
      `
// #if false
f();
/* #elif
g();
*/ // #endif
`,
      {},
    ),
  ).toThrow('No cond for #elif: /* #elif');
  expect(() =>
    preprocess(
      `
/* #if false */
f();
/* #elif */
g();
/* #endif */
`,
      {},
    ),
  ).toThrow('No cond for #elif: /* #elif */');
  expect(() =>
    preprocess(
      `
// #if false
f();
// #elif
g();
// #endif`,
      {},
    ),
  ).toThrow('No cond for #elif: // #elif');
  expect(() =>
    preprocess(
      `
// #if false
f();
/* #elif true
g();
*/ /* #if 23 */ /* #endif */ // #endif
`,
      {},
    ),
  ).toThrow('#elif or #else or #endif expected: /* #if 23 */');
  expect(() =>
    preprocess(
      `
// #if false
f();
/* #elif true
g();
*/ foo // #endif
`,
      {},
    ),
  ).toThrow('#elif or #else or #endif expected:  foo ');
  expect(() =>
    preprocess(
      `
/* #elif true
f();
*/
// #endif
`,
      {},
    ),
  ).toThrow('#elif not preceded by #if: /* #elif true');
  expect(() =>
    preprocess(
      `
// #elif true
f();
// #endif
`,
      {},
    ),
  ).toThrow('#elif not preceded by #if: // #elif true');
  expect(() =>
    preprocess(
      `
// #if true
f();
// #else
g();
/* #elif true
h();
*/
// #endif
`,
      {},
    ),
  ).toThrow('#elif following #else: /* #elif true');
  expect(() =>
    preprocess(
      `
// #if true
f();
// #else
g();
// #elif true
h();
// #endif
`,
      {},
    ),
  ).toThrow('#elif following #else: // #elif true');
});

test('bad-else', () => {
  expect(() =>
    preprocess(
      `
// #if false
f();
/* #else true
g();
*/ // #endif
`,
      {},
    ),
  ).toThrow('Cond for #else: /* #else true');
  expect(() =>
    preprocess(
      `
/* #if false */
f();
/* #else true */
g();
/* #endif */
`,
      {},
    ),
  ).toThrow('Cond for #else: /* #else true */');
  expect(() =>
    preprocess(
      `
// #if false
f();
// #else DEBUG
g();
// #endif`,
      {},
    ),
  ).toThrow('Cond for #else: // #else DEBUG');
  expect(() =>
    preprocess(
      `
// #if false
f();
/* #else
g();
*/ /* #if 23 */ /* #endif */ // #endif
`,
      {},
    ),
  ).toThrow('#endif expected: /* #if 23 */');
  expect(() =>
    preprocess(
      `
// #if false
f();
/* #else
g();
*/ foo // #endif
`,
      {},
    ),
  ).toThrow('#endif expected:  foo ');
  expect(() =>
    preprocess(
      `
/* #else
f();
*/
// #endif
`,
      {},
    ),
  ).toThrow('#else not preceded by #if: /* #else');
  expect(() =>
    preprocess(
      `
// #else
f();
// #endif
`,
      {},
    ),
  ).toThrow('#else not preceded by #if: // #else');
  expect(() =>
    preprocess(
      `
// #if true
f();
// #else
g();
/* #else
h();
*/
// #endif
`,
      {},
    ),
  ).toThrow('#else following #else: /* #else');
  expect(() =>
    preprocess(
      `
// #if true
f();
// #else
g();
// #else
h();
// #endif
`,
      {},
    ),
  ).toThrow('#else following #else: // #else');
});

test('bad-endif', () => {
  expect(() =>
    preprocess(
      `
// #if true
f();
/* #endif true
g();
*/
`,
      {},
    ),
  ).toThrow('Cond for #endif: /* #endif true');
  expect(() =>
    preprocess(
      `
/* #if true */
f();
/* #endif true */
`,
      {},
    ),
  ).toThrow('Cond for #endif: /* #endif true */');
  expect(() =>
    preprocess(
      `
// #if false
f();
// #endif true`,
      {},
    ),
  ).toThrow('Cond for #endif: // #endif true');
  expect(() =>
    preprocess(
      `
// #if true
f();
/* #endif
g();
*/
`,
      {},
    ),
  ).toThrow(`Body for #endif: 
g();
`);
  expect(() => preprocess(`/* #endif */`, {})).toThrow('#endif not preceded by #if: /* #endif */');
  expect(() => preprocess(`// #endif `, {})).toThrow('#endif not preceded by #if: // #endif');
});

test('bad-cond', () => {
  expect(() => preprocess('/* #if A */ /* #endif */', { B: 1 })).toThrow();
  expect(() => preprocess('/* #if B B */ /* #endif */', { B: 1 })).toThrow();
});

test('windows', () => {
  expect(
    preprocess(
      `\r
/* #if A === 1\r
a = 1;\r
*/ /* #endif */\r
`,
      {
        A: 1,
      },
    ),
  ).toBe(`\r
/************/\r
a = 1;\r
/*************/\r
`);
});
