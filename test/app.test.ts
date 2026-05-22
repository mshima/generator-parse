import { describe, it, expect, vi, afterEach } from 'vitest';
import { result, createHelpers } from 'yeoman-test';

const helpers = createHelpers({
  environmentOptions: { dryRun: true },
  defaultGenerator: import.meta.resolve('../generators/app/index.ts'),
});

const MARKDOWN = [
  '# My Template',
  '',
  '```liquid src/index.ts',
  "export const hello = 'world';",
  '```',
  '',
  '```liquid README.md',
  '# Project',
  '```',
  '',
  '```liquid package.json',
  '{ "name": "my-project" }',
  '```',
  '',
  '```liquid package.json',
  '{ "dpendencies": { "foo": "latest" } }',
  '```',
].join('\n');

describe('ParseGenerator', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves non-semver dependency versions with latest-version', async () => {
    const markdown = [
      '# My Template',
      '',
      '```liquid package.json',
      JSON.stringify(
        {
          dependencies: {
            foo: 'latest',
            bar: 'next',
            baz: '1.2.3',
          },
          devDependencies: {
            qux: 'latest',
          },
        },
        null,
        2,
      ),
      '```',
    ].join('\n');

    const fetchMock = vi.fn(async (input: string | URL | Request) => {
      const url = input instanceof Request ? input.url : String(input);

      if (url === 'https://example.com/template.md') {
        return new Response(markdown, { status: 200 });
      }
      if (url === 'https://registry.npmjs.org/bar') {
        return new Response(
          JSON.stringify({
            'dist-tags': {
              latest: '1.9.0',
              next: '2.0.0-beta.1',
            },
            versions: {
              '1.9.0': { version: '1.9.0' },
              '2.0.0-beta.1': { version: '2.0.0-beta.1' },
            },
            time: {},
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        );
      }
      if (url === 'https://registry.npmjs.org/qux') {
        return new Response(
          JSON.stringify({
            'dist-tags': {
              latest: '5.4.3',
            },
            versions: {
              '5.4.3': { version: '5.4.3' },
            },
            time: {},
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        );
      }
      if (url === 'https://registry.npmjs.org/foo') {
        return new Response(
          JSON.stringify({
            'dist-tags': {
              latest: '9.0.0',
            },
            versions: {
              '9.0.0': { version: '9.0.0' },
            },
            time: {},
          }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        );
      }

      throw new Error(`Unexpected fetch URL in test: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    await helpers
      .runDefault()
      .withArguments(['https://example.com/template.md'])
      .withAnswers({ confirmed: true });

    const calledUrls = fetchMock.mock.calls.map(([input]) =>
      input instanceof Request ? input.url : String(input),
    );

    expect(calledUrls).toContain('https://example.com/template.md');
    expect(calledUrls).toContain('https://registry.npmjs.org/foo');
    expect(calledUrls).toContain('https://registry.npmjs.org/bar');
    expect(calledUrls).toContain('https://registry.npmjs.org/qux');

    result.assertJsonFileContent('package.json', {
      dependencies: {
        foo: '^9.0.0',
        bar: '^2.0.0-beta.1',
        baz: '1.2.3',
      },
      devDependencies: {
        qux: '^5.4.3',
      },
    });
  });

  it('writes files from Liquid blocks when a URL is provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => MARKDOWN,
      }),
    );

    await helpers
      .runDefault()
      .withArguments(['https://example.com/template.md'])
      .withAnswers({ confirmed: true });

    result.assertFile('src/index.ts');
    result.assertFileContent('src/index.ts', "export const hello = 'world';");
    result.assertFile('README.md');
    result.assertFileContent('README.md', '# Project');
  });

  it('merges package.json contents', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => MARKDOWN,
      }),
    );

    await helpers
      .runDefault()
      .withArguments(['https://example.com/template.md'])
      .withAnswers({ confirmed: true });

    result.assertJsonFileContent('package.json', {
      name: 'my-project',
      dpendencies: { foo: 'latest' },
    });
  });

  it('writes files when a github: shorthand is provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => MARKDOWN,
      }),
    );

    await helpers
      .runDefault()
      .withArguments(['github:example/repo'])
      .withAnswers({ confirmed: true });

    expect(fetch).toHaveBeenCalledWith(
      'https://raw.githubusercontent.com/example/repo/HEAD/README.md',
    );
    result.assertFile('src/index.ts');
    result.assertFile('README.md');
  });

  it('writes files from the built-in example template', async () => {
    await helpers.runDefault().withArguments(['example']);

    result.assertFile('package.json');
    result.assertFile('src/index.js');
    result.assertFile('README.md');
  });

  it('throws when the fetch response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }),
    );

    await expect(
      helpers
        .runDefault()
        .withArguments(['https://example.com/missing.md'])
        .withAnswers({ confirmed: true }),
    ).rejects.toThrow('Failed to fetch template: 404 Not Found');
  });

  it('throws when the user declines the fetch confirmation', async () => {
    await expect(
      helpers
        .runDefault()
        .withArguments(['https://example.com/template.md'])
        .withAnswers({ confirmed: false }),
    ).rejects.toThrow('Template fetch cancelled by user.');
  });

  it('throws when the markdown has no Liquid blocks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '# No code blocks here\n',
      }),
    );

    await expect(
      helpers
        .runDefault()
        .withArguments(['https://example.com/empty.md'])
        .withAnswers({ confirmed: true }),
    ).rejects.toThrow('No Liquid code blocks found in the markdown file.');
  });
});
