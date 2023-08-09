<div align="center">

![ArgParser 🔍](https://github.com/Exponential-Workload/argparser/blob/master/social.png?raw=true)

  [![🧪 Tests](https://img.shields.io/github/actions/workflow/status/Exponential-Workload/argparser/test.yml?branch=master&label=🧪%20Tests)](https://github.com/Exponential-Workload/argparser/actions/workflows/test.yml)
  [![📝 Documentation](https://img.shields.io/badge/📝-Docs-blue)](https://gh.expo.moe/argparser)
  [![📦 NPM](https://img.shields.io/npm/v/%403xpo/argparser?label=📦%20NPM)](https://npmjs.com/package/@3xpo/argparser)
  <br/>
  [![📦 Bundle Size](https://img.shields.io/bundlephobia/min/%403xpo/argparser?label=📦%20Bundle%20Size)](https://bundlephobia.com/package/@3xpo/argparser) 
  [![📁 Source Size](https://img.shields.io/github/languages/code-size/Exponential-Workload/argparser?label=📁%20Source%20Size)](https://github.com/Exponential-Workload/argparser)<br/>
Parse NodeJS CLI arguments with ease.

</div>

# 📦 Table of Contents
- [📦 Table of Contents](#-table-of-contents)
- [🚀 Setup](#-setup)
- [🛠️ Usage](#️-usage)
- [📜 License](#-license)
- [🔗 See Also](#-see-also)

# 🚀 Setup

```sh
pnpm i @3xpo/argparser
```

# 🛠️ Usage

```ts
import ArgParser from '@3xpo/argparser';

const argParser = new ArgParser();
argParser.defineArgument({
  type: 'string',
  name: 'arg1',
  aliases: ['a', 'b'],
  default: 'default value',
  description: 'This is a description of the argument',
});
argParser.defineArgument({
  type: 'boolean',
  name: 'arg2',
  aliases: ['c'],
  default: 'default value',
  description: 'This is a description of the argument',
});

// generic is optional, however necessary for typesafety
const args = argParser.parse<{
  arg1: string;
}>(['--arg1' 'value1', '-c', 'hi']); // => { arg1: 'value1', arg2: true, _: ['hi'] }
const args2 = argParser.parse<{
  arg1: string;
}>(['--arg1' 'value1', '-c', 'false', 'hi']); // => { arg1: 'value1', arg2: false, _: ['hi'] }
```

For more detailed examples, see the [🧪 Tests](https://github.com/Exponential-Workload/argparser/blob/master/src/main.test.ts).<br/>
For technical reference, see the [📝 Documentation](https://gh.expo.moe/argparser).

# 📜 License

This project is licensed under the [📄 MIT License](https://gh.expo.moe/argparser/LICENSE.txt)

# 🔗 See Also

- [📦](https://npm.im/posixparser) [📁](https://github.com/Exponential-Workload/posixparser) [posixparser](https://gh.expo.moe/posixparser/) — Parse a POSIX-CLI-Styled string into a string[]
- [📦](https://npm.im/yargs) [📁](https://github.dev/yargs/yargs/) [yargs](https://yargs.js.org/) — The project that heavily inspired this one