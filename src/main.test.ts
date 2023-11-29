import ArgParser, { ArgumentType, ArgumentDefinition } from './main';

describe('ArgParser', () => {
  let argParser: ArgParser;

  beforeEach(() => {
    argParser = new ArgParser();
  });

  it('should define arguments correctly', () => {
    const argDef: ArgumentDefinition = {
      type: 'string',
      name: 'name',
      aliases: ['n'],
      description: 'Name argument',
    };

    argParser.defineArgument(argDef);
    expect(argParser['arguments']).toContain(argDef);
  });

  it('should parse arguments correctly', () => {
    const args = [
      '--name',
      'John',
      '-a',
      '42',
      '--existsTrueAlt',
      'true',
      '--existsTrue',
      'extra',
      '--existsFalse',
      'false',
      '--jsonObject',
      '{"hi":true}',
      '--number',
      '420',
    ];

    const parser = argParser
      .defineArgument({
        type: 'string',
        name: 'name',
        aliases: ['n'],
        description: 'Name argument',
      })
      .defineArgument({
        type: 'number',
        name: 'age',
        aliases: ['a'],
        description: 'Age argument',
      })
      .defineArgument({
        type: 'boolean',
        name: 'existsTrue',
        aliases: ['c'],
        description: 'Should be true',
      })
      .defineArgument({
        type: 'boolean',
        name: 'existsTrueAlt',
        aliases: [],
        description: 'Should be true',
      })
      .defineArgument({
        type: 'boolean',
        name: 'existsFalse',
        aliases: ['d'],
        description: 'Should be false',
      })
      .defineArgument({
        type: 'boolean',
        name: 'defaultTrue',
        aliases: [],
        description: 'Should be true',
        default: true,
      })
      .defineArgument({
        type: 'boolean',
        name: 'defaultFalse',
        aliases: [],
        description: 'Should be false',
        default: false,
      })
      .defineArgument({
        type: 'json',
        name: 'jsonObject',
        aliases: [],
        description: 'Should be an array with hi:true',
      })
      .defineArgument({
        type: 'number',
        name: 'number',
        aliases: [],
        description: 'Should be 420',
      });

    const parsedArgs = parser.parse(args);

    expect(parsedArgs.name).toBe('John');
    expect(parsedArgs.age).toBe(42);
    expect(parsedArgs.existsTrue).toBe(true);
    expect(parsedArgs.existsTrueAlt).toBe(true);
    expect(parsedArgs.existsFalse).toBe(false);
    expect(parsedArgs.defaultTrue).toBe(true);
    expect(parsedArgs.defaultFalse).toBe(false);
    expect(parsedArgs.jsonObject).toEqual({ hi: true });
    expect(parsedArgs.number).toEqual(420);
    expect(parsedArgs._).toEqual(['extra']);
  });

  it('should parse arrays correctly', () => {
    const args = [
      '--strArray',
      'a,b,c,d',
      '--numArray',
      '42,69,20',
      '--boolArray',
      'true,false,true,false',
    ];

    const parsedArgs = argParser
      .defineArgument({
        type: 'string[]',
        name: 'strArray',
        aliases: ['s'],
        description: 'String array argument',
      })
      .defineArgument({
        type: 'number[]',
        name: 'numArray',
        aliases: ['n'],
        description: 'Number array argument',
      })
      .defineArgument({
        type: 'boolean[]',
        name: 'boolArray',
        aliases: ['b'],
        description: 'Boolean array argument',
      })
      .parse(args);

    expect(parsedArgs['strArray']).toEqual(['a', 'b', 'c', 'd']);
    expect(parsedArgs['numArray']).toEqual([42, 69, 20]);
    expect(parsedArgs['boolArray']).toEqual([true, false, true, false]);
  });

  it('should parse arrays via shorthands', () => {
    const args = [
      '-s',
      'a,b,c,d',
      '-n',
      '42,69,20',
      '-b',
      'true,false,true,false',
    ];

    const parsedArgs = argParser
      .defineArgument({
        type: 'string[]',
        name: 'strArray',
        aliases: ['s'],
        description: 'String array argument',
      })
      .defineArgument({
        type: 'number[]',
        name: 'numArray',
        aliases: ['n'],
        description: 'Number array argument',
      })
      .defineArgument({
        type: 'boolean[]',
        name: 'boolArray',
        aliases: ['b'],
        description: 'Boolean array argument',
      })
      .parse(args);

    expect(parsedArgs['strArray']).toEqual(['a', 'b', 'c', 'd']);
    expect(parsedArgs['numArray']).toEqual([42, 69, 20]);
    expect(parsedArgs['boolArray']).toEqual([true, false, true, false]);
  });

  it('should generate help message correctly', () => {
    argParser
      .defineArgument({
        type: 'string',
        name: 'name',
        aliases: ['n'],
        description: 'Name argument',
      })
      .defineArgument({
        type: 'number',
        name: 'age',
        aliases: ['a'],
        description: 'Age argument',
        usageVariableName: 'age',
      });

    const helpMessage = argParser.help('MyProgram', '[options]', false);

    expect(helpMessage).toContain('Usage: MyProgram [options]');
    expect(helpMessage).toContain('--name, -n <Value>');
    expect(helpMessage).toContain('Name argument');
    expect(helpMessage).toContain('--age, -a <age>');
    expect(helpMessage).toContain('Age argument');
  });

  it('should correctly hide binary name', () => {
    const argv = ['node', 'script.js', '--name', 'Alice'];

    const hiddenArgs = argParser.hideBin(argv);

    expect(hiddenArgs).toEqual(['--name', 'Alice']);
  });
});
