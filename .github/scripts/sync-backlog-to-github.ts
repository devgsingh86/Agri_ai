import { graphql } from '@octokit/graphql';
import { config } from 'dotenv';
import fs from 'fs';

config();

const manifest = JSON.parse(fs.readFileSync('.github/scripts/backlog-github-mapping-manifest.json', 'utf-8'));
const backlog = fs.readFileSync('docs/backlog.md', 'utf-8');

interface BacklogItem {
  type: 'theme' | 'epic' | 'story' | 'task';
  title: string;
  description: string;
  status: string;
  priority: string;
  storyPoints?: number;
  dependencies?: string[];
  aiAgent?: string;
  parent?: string;
  labels: string[];
  deploymentScope?: string;
}

/**
 * Parse backlog.md into structured BacklogItem[]
 */
function parseBacklogMarkdown(md: string): BacklogItem[] {
  const lines = md.split('\n');
  const items: BacklogItem[] = [];
  let currentTheme = '';
  let currentEpic = '';
  let status = 'Backlog';
  let priority = 'P2';
  let deploymentScope = '';
  let aiAgent = '';
  let storyPoints = undefined;
  let parent = '';
  let description = '';
  let type: BacklogItem['type'] = 'theme';
  let labels: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# Theme')) {
      currentTheme = line.replace('# Theme', '').trim();
      type = 'theme';
      labels = ['theme'];
      parent = '';
      description = '';
      items.push({
        type,
        title: currentTheme,
        description: '',
        status,
        priority,
        labels: [...labels],
      });
    } else if (line.startsWith('## Epic')) {
      currentEpic = line.replace('## Epic', '').trim();
      type = 'epic';
      labels = ['epic'];
      parent = currentTheme;
      description = '';
      items.push({
        type,
        title: currentEpic,
        description: '',
        status,
        priority,
        parent,
        labels: [...labels],
      });
    } else if (line.startsWith('- **Story')) {
      // Story line: - **Story 1.1.1**: As a user, ...
      const storyTitleMatch = line.match(/- \*\*Story ([^*]+)\*\*: (.+)/);
      if (storyTitleMatch) {
        const storyId = storyTitleMatch[1].trim();
        const storyTitle = storyTitleMatch[2].trim();
        type = 'story';
        labels = ['story'];
        parent = currentEpic;
        description = '';
        // Look ahead for Acceptance, Story points, etc.
        let j = i + 1;
        let acceptance = '';
        let points = undefined;
        while (j < lines.length && lines[j].startsWith('  -')) {
          const subLine = lines[j].trim();
          if (subLine.startsWith('- Acceptance:')) {
            acceptance = subLine.replace('- Acceptance:', '').trim();
          } else if (subLine.startsWith('- Story points:')) {
            points = parseInt(subLine.replace('- Story points:', '').trim(), 10);
          }
          j++;
        }
        i = j - 1;
        items.push({
          type,
          title: `${storyId}: ${storyTitle}`,
          description: acceptance,
          status,
          priority,
          storyPoints: points,
          parent,
          labels: [...labels],
        });
      }
    }
    // TODO: Add parsing for tasks if present
  }
  return items;
}

/**
 * Map BacklogItem fields to GitHub Project fields using manifest
 */
function mapToGitHubFields(item: BacklogItem, manifest: any): any {
  const mapped: any = {
    title: `${manifest.fieldMapping[item.type.charAt(0).toUpperCase() + item.type.slice(1)]?.titlePrefix || ''} ${item.title}`,
    body: item.description,
    labels: item.labels.map(l => manifest.labelingConvention[l] || l),
    status: item.status,
    priority: item.priority,
    storyPoints: item.storyPoints,
    parent: item.parent,
    aiAgent: manifest.aiAgentLabel,
    deploymentScope: item.deploymentScope,
  };
  return mapped;
}

/**
 * Create or update a GitHub Project item via GraphQL API
 */
async function syncToGitHubProject(item: BacklogItem, mappedFields: any) {
  try {
    const owner = manifest.owner;
    const repo = 'jira_dashboard';
    const projectNumber = manifest.projectNumber;

    // Log the prepared sync data
    console.log(`Prepared for sync: [${mappedFields.status}] ${mappedFields.title}`);
    console.log(`  Labels: ${mappedFields.labels.join(', ')}`);
    console.log(`  Priority: ${mappedFields.priority} | Story Points: ${mappedFields.storyPoints || 'N/A'}`);
    if (mappedFields.parent) {
      console.log(`  Parent: ${mappedFields.parent}`);
    }
    console.log('');
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
  }
}

async function main() {
  console.log(`\n🚀 Starting backlog sync to GitHub Project...\n`);
  const items = parseBacklogMarkdown(backlog);
  console.log(`📊 Parsed ${items.length} items from backlog.md\n`);
  
  for (const item of items) {
    const mapped = mapToGitHubFields(item, manifest);
    await syncToGitHubProject(item, mapped);
  }
  
  console.log(`✅ Backlog sync preview complete.\n`);
  console.log(`📝 Next steps:`);
  console.log(`   1. Review the items listed above`);
  console.log(`   2. Run 'gh auth status' to verify GitHub CLI authentication`);
  console.log(`   3. Run GitHub Project setup: '.github/scripts/setup-project-fields.sh'`);
  console.log(`   4. Update this script to implement full GraphQL API sync when ready\n`);
}

main().catch(console.error);
