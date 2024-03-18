import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/restrict-template-expressions';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('restrict-template-expressions', rule, {
  valid: [
    // Base case
    `
      const msg = \`arg = \${'foo'}\`;
    `,
    `
      const arg = 'foo';
      const msg = \`arg = \${arg}\`;
    `,
    `
      const arg = 'foo';
      const msg = \`arg = \${arg || 'default'}\`;
    `,
    `
      function test<T extends string>(arg: T) {
        return \`arg = \${arg}\`;
      }
    `,
    // Base case - intersection type
    `
      function test<T extends string & { _kind: 'MyBrandedString' }>(arg: T) {
        return \`arg = \${arg}\`;
      }
    `,
    // Base case - don't check tagged templates
    `
      tag\`arg = \${null}\`;
    `,
    `
      const arg = {};
      tag\`arg = \${arg}\`;
    `,
    // allowNumber
    {
      options: [{ allowNumber: true }],
      code: `
        const arg = 123;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        const arg = 123;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        const arg = 123n;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends number>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends number & { _kind: 'MyBrandedNumber' }>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends bigint>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNumber: true }],
      code: `
        function test<T extends string | number>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowBoolean
    {
      options: [{ allowBoolean: true }],
      code: `
        const arg = true;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowBoolean: true }],
      code: `
        const arg = true;
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowBoolean: true }],
      code: `
        function test<T extends boolean>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowBoolean: true }],
      code: `
        function test<T extends string | boolean>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowArray
    {
      options: [{ allowArray: true }],
      code: `
        const arg = [];
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowArray: true }],
      code: `
        const arg = [];
        const msg = \`arg = \${arg || 'default'}\`;
      `,
    },
    {
      options: [{ allowArray: true }],
      code: `
        const arg = [];
        function test<T extends string[]>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowAny
    {
      options: [{ allowAny: true }],
      code: `
        const arg: any = 123;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowAny: true }],
      code: `
        const arg: any = undefined;
        const msg = \`arg = \${arg || 'some-default'}\`;
      `,
    },
    {
      options: [{ allowAny: true }],
      code: `
        const user = JSON.parse('{ "name": "foo" }');
        const msg = \`arg = \${user.name}\`;
      `,
    },
    {
      options: [{ allowAny: true }],
      code: `
        const user = JSON.parse('{ "name": "foo" }');
        const msg = \`arg = \${user.name || 'the user with no name'}\`;
      `,
    },
    // allowNullish
    {
      options: [{ allowNullish: true }],
      code: `
        const arg = null;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNullish: true }],
      code: `
        declare const arg: string | null | undefined;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNullish: true }],
      code: `
        function test<T extends null | undefined>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowNullish: true }],
      code: `
        function test<T extends string | null>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowRegExp
    {
      options: [{ allowRegExp: true }],
      code: `
        const arg = new RegExp('foo');
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowRegExp: true }],
      code: `
        const arg = /foo/;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowRegExp: true }],
      code: `
        declare const arg: string | RegExp;
        const msg = \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowRegExp: true }],
      code: `
        function test<T extends RegExp>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    {
      options: [{ allowRegExp: true }],
      code: `
        function test<T extends string | RegExp>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    // allowNever
    {
      options: [{ allowNever: true }],
      code: `
        declare const value: never;
        const stringy = \`\${value}\`;
      `,
    },
    {
      options: [{ allowNever: true }],
      code: `
        const arg = 'hello';
        const msg = typeof arg === 'string' ? arg : \`arg = \${arg}\`;
      `,
    },
    {
      options: [{ allowNever: true }],
      code: `
        function test(arg: 'one' | 'two') {
          switch (arg) {
            case 'one':
              return 1;
            case 'two':
              return 2;
            default:
              throw new Error(\`Unrecognised arg: \${arg}\`);
          }
        }
      `,
    },
    {
      options: [{ allowNever: true }],
      code: `
        // more variants may be added to Foo in the future
        type Foo = { type: 'a'; value: number };

        function checkFoosAreMatching(foo1: Foo, foo2: Foo) {
          if (foo1.type !== foo2.type) {
            // since Foo currently only has one variant, this code is never run, and \`foo1.type\` has type \`never\`.
            throw new Error(\`expected \${foo1.type}, found \${foo2.type}\`);
          }
        }
      `,
    },
    // allow ALL
    {
      options: [
        {
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
          allowRegExp: true,
          allowNever: true,
        },
      ],
      code: `
        type All = string | number | boolean | null | undefined | RegExp | never;
        function test<T extends All>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
    },
    'const msg = `arg = ${false}`;',
    'const msg = `arg = ${null}`;',
    'const msg = `arg = ${undefined}`;',
    'const msg = `arg = ${123}`;',
    "const msg = `arg = ${'abc'}`;",
  ],

  invalid: [
    {
      code: `
        const msg = \`arg = \${123}\`;
      `,
      options: [{ allowNumber: false }],
      errors: [
        {
          messageId: 'invalidType',
          data: { type: '123' },
          line: 2,
          column: 30,
        },
      ],
    },
    {
      code: `
        const msg = \`arg = \${false}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'false' },
          line: 2,
          column: 30,
        },
      ],
      options: [{ allowBoolean: false }],
    },
    {
      code: `
        const msg = \`arg = \${null}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'null' },
          line: 2,
          column: 30,
        },
      ],
      options: [{ allowNullish: false }],
    },
    {
      code: `
        const msg = \`arg = \${[, 2]}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: '(number | undefined)[]' },
          line: 2,
          column: 30,
        },
      ],
      options: [{ allowNullish: false, allowArray: true }],
    },
    {
      code: `
        declare const arg: number;
        const msg = \`arg = \${arg}\`;
      `,
      options: [{ allowNumber: false }],
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'number' },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      code: `
        declare const arg: boolean;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'boolean' },
          line: 3,
          column: 30,
        },
      ],
      options: [{ allowBoolean: false }],
    },
    {
      options: [{ allowNumber: true, allowBoolean: true, allowNullish: true }],
      code: `
        const arg = {};
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        { messageId: 'invalidType', data: { type: '{}' }, line: 3, column: 30 },
      ],
    },
    {
      code: `
        declare const arg: { a: string } & { b: string };
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: '{ a: string; } & { b: string; }' },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      options: [{ allowNumber: true, allowBoolean: true, allowNullish: true }],
      code: `
        function test<T extends {}>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        { messageId: 'invalidType', data: { type: '{}' }, line: 3, column: 27 },
      ],
    },
    {
      options: [
        {
          allowAny: false,
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
        },
      ],
      code: `
        function test<TWithNoConstraint>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'T' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      options: [
        {
          allowAny: false,
          allowNumber: true,
          allowBoolean: true,
          allowNullish: true,
        },
      ],
      code: `
        function test(arg: any) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'any' },
          line: 3,
          column: 27,
        },
      ],
    },
    {
      options: [{ allowRegExp: false }],
      code: `
        const arg = new RegExp('foo');
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'RegExp' },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      options: [{ allowRegExp: false }],
      code: `
        const arg = /foo/;
        const msg = \`arg = \${arg}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'RegExp' },
          line: 3,
          column: 30,
        },
      ],
    },
    {
      options: [{ allowNever: false }],
      code: `
        declare const value: never;
        const stringy = \`\${value}\`;
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'never' },
          line: 3,
          column: 28,
        },
      ],
    },
    // TS 3.9 change
    {
      options: [{ allowAny: true }],
      code: `
        function test<T extends any>(arg: T) {
          return \`arg = \${arg}\`;
        }
      `,
      errors: [
        {
          messageId: 'invalidType',
          data: { type: 'unknown' },
          line: 3,
          column: 27,
        },
      ],
    },
  ],
});
