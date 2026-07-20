import { globSync } from 'node:fs';

import Generator from 'yeoman-generator';
import type { BaseFeatures, BaseOptions } from 'yeoman-generator';
import latestVersion from 'latest-version';
import { Liquid } from 'liquidjs';
import { valid } from 'semver';

import {
  parseMarkdownBlocks,
  isRemoteSource,
  toFetchUrl,
  resolveLocalTemplate,
  validateSource,
} from './utils.ts';

export { type CodeBlock, parseMarkdownBlocks } from './utils.ts';

const liquid = new Liquid({
  strictVariables: false,
  strictFilters: false,
  outputDelimiterLeft: '{{{',
  outputDelimiterRight: '}}}',
  greedy: false,
});

type ParseOptions = BaseOptions & {
  url?: string;
  yeomanTest?: boolean;
};

export default class ParseGenerator extends Generator<
  Record<string, unknown>,
  ParseOptions
> {
  private templateInput = '';
  private remoteUrl = '';

  constructor(args?: string[], opts?: ParseOptions, features?: BaseFeatures) {
    super(args, opts, { ...features, customInstallTask: 'ask' });

    this.argument('url', {
      type: String,
      required: false,
      description:
        'Template source: a URL, "github:user/repo[/path]", or a built-in template name',
    });
  }

  async prompting(): Promise<void> {
    if (this.options.url) {
      this.templateInput = this.options.url;
    } else {
      const answers = await this.prompt<{ template: string; url?: string }>([
        {
          type: 'select',
          name: 'template',
          choices: () => [
            { name: 'custom', value: 'custom' },
            ...globSync('*.md', { cwd: this.templatePath() })
              .map((file) => file.substring(0, file.length - 3))
              .map((file) => ({ name: file, value: file })),
          ],
          message: 'Select a template to use:',
        },
        {
          when: (answers) => answers.template === 'custom',
          type: 'input',
          name: 'url',
          message:
            'Enter the template source (URL, "github:user/repo", or template name):',
          validate: (input: string) =>
            validateSource(input, this.templatePath()),
        },
      ]);

      this.templateInput = answers.url ?? answers.template;
    }

    if (isRemoteSource(this.templateInput)) {
      const fetchUrl = toFetchUrl(this.templateInput);
      const { confirmed } = await this.prompt<{ confirmed: boolean }>([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Fetch template from: ${fetchUrl}?`,
          default: true,
        },
      ]);

      if (!confirmed) {
        throw new Error('Template fetch cancelled by user.');
      }

      this.remoteUrl = fetchUrl;
    }
  }

  async writing(): Promise<void> {
    let markdown: string;

    if (this.remoteUrl) {
      this.log.info(`Fetching template from: ${this.remoteUrl}`);
      const response = await fetch(this.remoteUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch template: ${response.status} ${response.statusText}`,
        );
      }
      markdown = await response.text();
    } else {
      this.log.info(`Loading template from: ${this.templateInput}`);
      markdown = resolveLocalTemplate(this.templateInput, this.templatePath());
    }

    const blocks = parseMarkdownBlocks(markdown);

    if (blocks.length === 0) {
      throw new Error('No Liquid code blocks found in the markdown file.');
    }

    const githubActionYml = this.readTemplate(
      '../resources/dependabot/action.yml',
    );
    const actionRegex = /- uses: (.+)\/(.+)@(.+)/g;
    const githubActions: Record<string, string> = {};
    let match;
    while ((match = actionRegex.exec(githubActionYml)) !== null) {
      const version = this.options.yeomanTest ? 'SNAPSHOT' : match[3];
      githubActions[match[2]] = `${match[1]}/${match[2]}@${version}`;
    }

    const packageJson = this.packageJson.createProxy();
    for (const block of blocks) {
      if (block.type !== 'liquid') {
        this.log.error(
          `Skipping unsupported block type "${block.type}" in file "${block.filename}".`,
        );
        continue;
      }
      const rendered = await liquid.parseAndRender(block.content, {
        packageJson,
        githubActions,
      });
      if (block.filename === 'package.json') {
        const packageJsonData = JSON.parse(rendered);
        for (const type of [
          'dependencies',
          'devDependencies',
          'peerDependencies',
        ] as const) {
          for (const [key, value] of Object.entries(
            packageJsonData[type] || {},
          )) {
            if (!valid(value as string)) {
              packageJsonData[type][key] =
                `^${await latestVersion(key, { version: value as string })}`;
            }
          }
        }
        this.packageJson.merge(packageJsonData);
      } else {
        this.writeDestination(block.filename, rendered);
      }
      this.log.info(`Writing: ${block.filename}`);
    }
  }
}
