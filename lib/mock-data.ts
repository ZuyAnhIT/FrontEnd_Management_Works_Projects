export interface SubTask {
  id: string
  title: string
  completed: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: {
    id: string
    name: string
    avatar: string
  }
  sprint?: string
  dueDate?: string
  subtasks: SubTask[]
  comments?: number
  attachments?: number
}

export interface Sprint {
  id: string
  name: string
  status: 'backlog' | 'active' | 'completed'
  startDate: string
  endDate: string
  tasks: Task[]
  goal: string
}

export interface Project {
  id: string
  name: string
  description: string
  sprints: Sprint[]
  allTasks: Task[]
}

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Mobile App Redesign',
    description: 'Complete redesign of mobile application UI/UX',
    sprints: [
      {
        id: 'sprint-1',
        name: 'Sprint 1 - Foundation',
        status: 'completed',
        startDate: '2024-11-01',
        endDate: '2024-11-14',
        goal: 'Setup design system and core components',
        tasks: [
          {
            id: 'task-1',
            title: 'Design system setup',
            description: 'Create design tokens and component library',
            status: 'done',
            priority: 'high',
            assignee: { id: 'u1', name: 'Alice Johnson', avatar: '👩‍💼' },
            sprint: 'sprint-1',
            dueDate: '2024-11-10',
            subtasks: [
              { id: 'st-1', title: 'Define color palette', completed: true },
              { id: 'st-2', title: 'Create typography scale', completed: true },
              { id: 'st-3', title: 'Build component library', completed: true },
            ],
            comments: 5,
          },
          {
            id: 'task-2',
            title: 'Figma project setup',
            description: 'Setup project structure in Figma',
            status: 'done',
            priority: 'medium',
            assignee: { id: 'u2', name: 'Bob Smith', avatar: '👨‍🎨' },
            sprint: 'sprint-1',
            dueDate: '2024-11-08',
            subtasks: [
              { id: 'st-4', title: 'Create file structure', completed: true },
              { id: 'st-5', title: 'Setup shared library', completed: true },
            ],
          },
        ],
      },
      {
        id: 'sprint-2',
        name: 'Sprint 2 - Auth & Dashboard',
        status: 'active',
        startDate: '2024-11-15',
        endDate: '2024-11-29',
        goal: 'Implement authentication flow and main dashboard',
        tasks: [
          {
            id: 'task-3',
            title: 'Login page design',
            description: 'Design and implement login screen',
            status: 'in-progress',
            priority: 'critical',
            assignee: { id: 'u2', name: 'Bob Smith', avatar: '👨‍🎨' },
            sprint: 'sprint-2',
            dueDate: '2024-11-20',
            subtasks: [
              { id: 'st-6', title: 'Design mockups', completed: true },
              { id: 'st-7', title: 'Implement in React', completed: true },
              { id: 'st-8', title: 'Add validation', completed: false },
              { id: 'st-9', title: 'Test on mobile', completed: false },
            ],
            comments: 3,
          },
          {
            id: 'task-4',
            title: 'Dashboard layout',
            description: 'Create main dashboard layout',
            status: 'todo',
            priority: 'high',
            sprint: 'sprint-2',
            dueDate: '2024-11-25',
            subtasks: [
              { id: 'st-10', title: 'Design layout', completed: false },
              { id: 'st-11', title: 'Implement grid', completed: false },
            ],
          },
          {
            id: 'task-5',
            title: 'API integration',
            description: 'Setup API client and services',
            status: 'review',
            priority: 'high',
            assignee: { id: 'u1', name: 'Alice Johnson', avatar: '👩‍💼' },
            sprint: 'sprint-2',
            dueDate: '2024-11-22',
            subtasks: [
              { id: 'st-12', title: 'Setup axios', completed: true },
              { id: 'st-13', title: 'Create API services', completed: true },
              { id: 'st-14', title: 'Add error handling', completed: false },
            ],
          },
        ],
      },
    ],
    allTasks: [
      {
        id: 'task-1',
        title: 'Design system setup',
        description: 'Create design tokens and component library',
        status: 'done',
        priority: 'high',
        assignee: { id: 'u1', name: 'Alice Johnson', avatar: '👩‍💼' },
        sprint: 'sprint-1',
        dueDate: '2024-11-10',
        subtasks: [
          { id: 'st-1', title: 'Define color palette', completed: true },
          { id: 'st-2', title: 'Create typography scale', completed: true },
          { id: 'st-3', title: 'Build component library', completed: true },
        ],
        comments: 5,
      },
      {
        id: 'task-2',
        title: 'Figma project setup',
        description: 'Setup project structure in Figma',
        status: 'done',
        priority: 'medium',
        assignee: { id: 'u2', name: 'Bob Smith', avatar: '👨‍🎨' },
        sprint: 'sprint-1',
        dueDate: '2024-11-08',
        subtasks: [
          { id: 'st-4', title: 'Create file structure', completed: true },
          { id: 'st-5', title: 'Setup shared library', completed: true },
        ],
      },
      {
        id: 'task-3',
        title: 'Login page design',
        description: 'Design and implement login screen',
        status: 'in-progress',
        priority: 'critical',
        assignee: { id: 'u2', name: 'Bob Smith', avatar: '👨‍🎨' },
        sprint: 'sprint-2',
        dueDate: '2024-11-20',
        subtasks: [
          { id: 'st-6', title: 'Design mockups', completed: true },
          { id: 'st-7', title: 'Implement in React', completed: true },
          { id: 'st-8', title: 'Add validation', completed: false },
          { id: 'st-9', title: 'Test on mobile', completed: false },
        ],
        comments: 3,
      },
      {
        id: 'task-4',
        title: 'Dashboard layout',
        description: 'Create main dashboard layout',
        status: 'todo',
        priority: 'high',
        sprint: 'sprint-2',
        dueDate: '2024-11-25',
        subtasks: [
          { id: 'st-10', title: 'Design layout', completed: false },
          { id: 'st-11', title: 'Implement grid', completed: false },
        ],
      },
      {
        id: 'task-5',
        title: 'API integration',
        description: 'Setup API client and services',
        status: 'review',
        priority: 'high',
        assignee: { id: 'u1', name: 'Alice Johnson', avatar: '👩‍💼' },
        sprint: 'sprint-2',
        dueDate: '2024-11-22',
        subtasks: [
          { id: 'st-12', title: 'Setup axios', completed: true },
          { id: 'st-13', title: 'Create API services', completed: true },
          { id: 'st-14', title: 'Add error handling', completed: false },
        ],
      },
    ],
  },
]
