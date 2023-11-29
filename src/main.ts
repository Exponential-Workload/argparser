import { hideBin } from './hideBin';

/** Parsable Types */
export type ArgumentType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'string[]'
  | 'number[]'
  | 'boolean[]'
  | 'json';

/** Argument Value Type */
export type ArgumentValue<T extends ArgumentType = ArgumentType> =
  T extends 'string'
    ? string
    : T extends 'number'
    ? number
    : T extends 'boolean'
    ? boolean
    : T extends 'string[]'
    ? string[]
    : T extends 'number[]'
    ? number[]
    : T extends 'boolean[]'
    ? boolean[]
    : T extends 'json'
    ? any
    : never;

/** @internal Generic for ParsedArgs */
export type ParsedArgsAnyGeneric = Record<string, ArgumentValue>;

/** Parsed Argument Type */
export type ParsedArgs<T extends ParsedArgsAnyGeneric = ParsedArgsAnyGeneric> =
  {
    [argName: string]: ArgumentValue;
    _: string[];
  } & T;

export type ArgumentDefinition<
  Type extends ArgumentType = ArgumentType,
  Name extends string = string,
> = {
  type: Type;
  name: Name;
  aliases: string[];
  usageVariableName?: string;
  default?: ArgumentValue<Type>;
  description: string;
};
export type ArgDefToArgObj<ArgDef extends ArgumentDefinition> = {
  [key in ArgDef['name']]: ArgumentValue<ArgDef['type']>;
};

/** Argument Parser */
export default class ArgParser<
  ObjParseType extends Record<string, ArgumentValue> = {},
> {
  /**
   * Strip the binary name from the command-line arguments.
   * Refactored variant of yargs hideBin.
   */
  public static hideBin(argv = process.argv) {
    return hideBin(argv);
  }

  /**
   * A class for parsing command-line arguments and generating help messages.
   */
  public arguments: ArgumentDefinition[] = [];

  /**
   * Define an argument for the parser.
   * @param {ArgumentDefinition} argDef - The argument definition.
   * @returns {ArgParser} - Returns the ArgParser instance for method chaining.
   */
  public defineArgument<
    ArgType extends ArgumentType,
    Name extends string,
    Def extends ArgumentDefinition<ArgType, Name>,
  >(
    argDef: Def,
  ): ArgParser<
    ObjParseType & {
      [key in Def['name']]: ArgumentValue<Def['type']>;
    }
  > {
    this.arguments.push(argDef);
    return this;
  }

  /**
   * Strip the binary name from the command-line arguments.
   * Refactored variant of yargs hideBin.
   */
  public hideBin(argv = process.argv): string[] {
    return ArgParser.hideBin(argv);
  }

  /**
   * Parse an array of command-line arguments into a ParsedArgs object.
   * @param {string[]} args - An array of command-line arguments.
   * @returns {ParsedArgs} - The parsed arguments as key-value pairs.
   */
  public parse<ParseType extends ParsedArgsAnyGeneric = ObjParseType>(
    args: string[],
  ): ParsedArgs<ParseType> {
    const parsedArgs: ParsedArgs = {
      _: [],
    };
    let currentArgName: string | null = null;
    let wasValueUsed = false;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        currentArgName = arg.slice(2);
        parsedArgs[currentArgName] = true;
      } else if (arg.startsWith('-')) {
        const aliases = arg.slice(1).split('');
        for (const alias of aliases) {
          const foundArg = this.findArgumentByAlias(alias);
          if (foundArg) {
            if (foundArg.type === 'boolean') {
              parsedArgs[foundArg.name] = true;
            } else {
              currentArgName = foundArg.name;
            }
          }
        }
      } else if (currentArgName) {
        [parsedArgs[currentArgName], wasValueUsed] = this.parseArgValue(
          arg,
          currentArgName,
        );
        currentArgName = null;
        if (!wasValueUsed) i--;
      } else {
        parsedArgs['_'].push(arg);
      }
    }

    // Insert default values
    for (const argDef of this.arguments) {
      if (
        !parsedArgs.hasOwnProperty(argDef.name) &&
        argDef.default !== undefined
      ) {
        parsedArgs[argDef.name] = argDef.default;
      }
    }

    return parsedArgs as ParsedArgs<ParseType>;
  }

  /**
   * Generate a help message for the defined arguments.
   * @param {string} programName - The name of the program.
   * @param {string} options - The options string.
   * @param {boolean} useAnsi - Whether to use ANSI formatting.
   * @returns {string} - The help message.
   */
  public help(
    programName: string = 'Program',
    options: string = '[options]',
    useAnsi: boolean = true,
  ): string {
    let helpMessage = `Usage: ${programName} ${options}\n\nOptions:\n`;

    const messagesShort: string[] = [];
    const messagesLong: string[] = [];

    let isLong = false;

    for (const argDef of this.arguments) {
      const argUsage = this.formatArgumentUsage(argDef);
      const argDescription = argDef.description;
      const lineLength = 4 + argUsage.length + argDescription.length;

      messagesShort.push(
        `  ${argUsage}${useAnsi ? '\x1B[0;37m' : ''} - ${argDescription}${
          useAnsi ? '\x1B[0m' : ''
        }\n`,
      );
      isLong = isLong || lineLength <= 70;
      let m = '';
      m += `  ${argUsage}\n`;
      const wrappedDescription = this.wrapText(argDescription, 68, 4);
      m +=
        `${useAnsi ? '\x1B[0;37m' : ''}${wrappedDescription.join('\n')}${
          useAnsi ? '\x1B[0m' : ''
        }` + '\n';
      messagesLong.push(m);
    }

    if (isLong) {
      helpMessage += messagesLong.join('');
    } else {
      helpMessage += messagesShort.join('');
    }

    return helpMessage;
  }

  private wrapText(text: string, maxLength: number, indent: number): string[] {
    const lines: string[] = [];
    let currentLine = '';

    for (const word of text.split(' ')) {
      if (currentLine.length + word.length + 1 <= maxLength) {
        currentLine += (currentLine.length > 0 ? ' ' : '') + word;
      } else {
        lines.push(' '.repeat(indent) + currentLine);
        currentLine = word;
      }
    }

    if (currentLine.length > 0) {
      lines.push(' '.repeat(indent) + currentLine);
    }

    return lines;
  }

  /**
   * Find an argument definition by its alias.
   * @private
   * @param {string} alias - The alias of the argument.
   * @returns {ArgumentDefinition | undefined} - The matching argument definition.
   */
  private findArgumentByAlias(alias: string): ArgumentDefinition | undefined {
    return this.arguments.find(argDef =>
      (argDef.aliases ?? []).includes(alias),
    );
  }

  private parseArgValue(value: string, argName: string): [any, boolean] {
    const argDef = this.arguments.find(
      argDef => argDef.name === argName || argDef.aliases?.includes(argName),
    );
    if (!argDef) return [value, true];

    const truthyValues = ['true', 'yes', '1', 'on', 't', 'y'];
    const falsyValues = ['false', 'no', '0', 'off', 'f', 'n'];

    switch (argDef.type) {
      case 'string':
      case 'number':
        return [this.parseSingleValue(value, argDef.type), true];
      case 'boolean':
        const lowercasedValue = value.toLowerCase();
        const falsyValuesHas = falsyValues.includes(lowercasedValue);
        const truthyValuesHas = truthyValues.includes(lowercasedValue);
        const eitherHas = falsyValuesHas || truthyValuesHas;
        return [!falsyValuesHas, eitherHas];
      case 'string[]':
      case 'number[]':
      case 'boolean[]':
        return [this.parseArrayValue(value, argDef.type.slice(0, -2)), true];
      case 'json':
        return [JSON.parse(value), true];
      default:
        throw new Error(`Unsupported argument type: ${argDef.type}`);
    }
  }

  private parseSingleValue(value: string, type: string): any {
    if (type === 'number') return parseFloat(value);
    return value;
  }

  private parseArrayValue(value: string, itemType: string): any[] {
    const items = value.split(',');
    switch (itemType) {
      case 'string':
        return items;
      case 'number':
        return items.map(parseFloat);
      case 'boolean':
        return items.map(item => item.toLowerCase() === 'true');
      default:
        throw new Error(`Unsupported array item type: ${itemType}`);
    }
  }

  private formatArgumentUsage(argDef: ArgumentDefinition): string {
    const aliases = [argDef.name, ...(argDef.aliases ?? [])].map(alias =>
      alias.length === 1 ? `-${alias}` : `--${alias}`,
    );
    const usage = aliases.join(', ');
    if (argDef.type !== 'boolean') {
      return `${usage} <${argDef.usageVariableName ?? 'Value'}>`;
    }
    return usage;
  }
}
