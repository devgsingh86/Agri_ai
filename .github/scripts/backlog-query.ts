import { graphql } from '@octokit/graphql';
import { config } from 'dotenv';

config();

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

interface BacklogTask {
  id: string;
  number: number;
  title: string;
  body: string;
  labels: string[];
  status: string;
  priority: string;
  storyPoints: number;
  dependencies: string[];
  aiAgent: string;
}

/**
 * Get next available task for an AI agent
 */
export async function getNextTask(
  agentType: string,
  owner: string,
  repo: string,
  projectNumber: number
): Promise<BacklogTask | null> {
  const query = `
    query($owner: String!, $repo: String!, $projectNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        projectV2(number: $projectNumber) {
          items(first: 50) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                  title
                  body
                  labels(first: 10) {
                    nodes {
                      name
                    }
                  }
                }
              }
              fieldValues(first: 20) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field {
                      ... on ProjectV2SingleSelectField {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldNumberValue {
                    number
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                  }
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field {
                      ... on ProjectV2Field {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const result: any = await graphqlWithAuth(query, {
      owner,
      repo,
      projectNumber,
    });

    const items = result.repository.projectV2.items.nodes;

    // Filter for sprint-ready, unblocked tasks assigned to this agent
    const availableTasks = items
      .map((item: any) => parseTaskFromProject(item))
      .filter((task: BacklogTask) => {
        return (
          task.status === 'Sprint Ready' &&
          task.aiAgent === agentType &&
          task.dependencies.length === 0
        );
      })
      .sort((a: BacklogTask, b: BacklogTask) => {
        // Sort by priority then story points
        const priorityOrder: any = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return priorityDiff !== 0 ? priorityDiff : a.storyPoints - b.storyPoints;
      });

    return availableTasks[0] || null;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
}

/**
 * Update task status when work begins
 */
export async function updateTaskStatus(
  projectId: string,
  itemId: string,
  fieldId: string,
  optionId: string
): Promise<void> {
  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item {
          id
        }
      }
    }
  `;

  await graphqlWithAuth(mutation, {
    projectId,
    itemId,
    fieldId,
    optionId,
  });
}

/**
 * Parse task data from GraphQL response
 */
function parseTaskFromProject(item: any): BacklogTask {
  const issue = item.content;
  const fields = item.fieldValues.nodes;

  const task: BacklogTask = {
    id: item.id,
    number: issue.number,
    title: issue.title,
    body: issue.body || '',
    labels: issue.labels.nodes.map((l: any) => l.name),
    status: '',
    priority: '',
    storyPoints: 0,
    dependencies: [],
    aiAgent: '',
  };

  // Extract custom fields
  fields.forEach((field: any) => {
    if (field.field.name === 'Status') {
      task.status = field.name;
    } else if (field.field.name === 'Priority') {
      task.priority = field.name;
    } else if (field.field.name === 'Story Points') {
      task.storyPoints = field.number || 0;
    } else if (field.field.name === 'AI Agent') {
      task.aiAgent = field.name || '';
    } else if (field.field.name === 'Blocked By') {
      task.dependencies = field.text ? field.text.split(',').map((d: string) => d.trim()) : [];
    }
  });

  return task;
}

/**
 * Get epic rollup summary
 */
export async function getEpicRollup(
  owner: string,
  repo: string,
  epicNumber: number
): Promise<any> {
  const query = `
    query($owner: String!, $repo: String!, $epicNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        issue(number: $epicNumber) {
          title
          body
          timelineItems(itemTypes: CROSS_REFERENCED_EVENT, first: 100) {
            nodes {
              ... on CrossReferencedEvent {
                source {
                  ... on Issue {
                    number
                    title
                    state
                    labels(first: 10) {
                      nodes {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const result: any = await graphqlWithAuth(query, {
    owner,
    repo,
    epicNumber,
  });

  const epic = result.repository.issue;
  const childIssues = epic.timelineItems.nodes
    .filter((node: any) => node.source && node.source.labels.nodes.some((l: any) => l.name === 'story'))
    .map((node: any) => node.source);

  return {
    epic: {
      number: epicNumber,
      title: epic.title,
      description: epic.body,
    },
    stories: childIssues.map((issue: any) => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
    })),
    totalStories: childIssues.length,
    completedStories: childIssues.filter((i: any) => i.state === 'CLOSED').length,
  };
}

// CLI Interface
if (require.main === module) {
  const command = process.argv[2];
  const owner = process.env.GITHUB_OWNER || '';
  const repo = process.env.GITHUB_REPO || '';
  const projectNumber = parseInt(process.env.PROJECT_NUMBER || '1');

  if (command === 'next-task') {
    const agentType = process.argv[3] || 'backend-agent';
    getNextTask(agentType, owner, repo, projectNumber).then((task) => {
      console.log(JSON.stringify(task, null, 2));
    });
  } else if (command === 'epic-rollup') {
    const epicNumber = parseInt(process.argv[3]);
    getEpicRollup(owner, repo, epicNumber).then((rollup) => {
      console.log(JSON.stringify(rollup, null, 2));
    });
  } else {
    console.log('Usage: ts-node backlog-query.ts [next-task|epic-rollup] [args]');
  }
}
